import json
import os
import re
import tempfile
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for development (React dev server on different port)
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    "methods": ["GET", "POST", "PUT", "OPTIONS"],
}})

# Config file to persist data file path
CONFIG_FILE = 'app_config.json'
PROJECTS_DIR = 'projects'


def get_data_file():
    """Get the data file path from config file"""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                config = json.load(f)
                return config.get('data_file', 'data.json')
        except:
            pass
    return 'data.json'


def sanitize_project_name(name):
    """Sanitize project name for use as directory name"""
    # Lowercase, replace spaces/underscores with hyphens, strip non-alphanumeric
    name = name.lower().strip()
    name = re.sub(r'[\s_]+', '-', name)
    name = re.sub(r'[^a-z0-9\-]', '', name)
    name = re.sub(r'-+', '-', name).strip('-')
    return name


def validate_project_data(data):
    """Validate project data, return list of error strings"""
    errors = []

    if not isinstance(data, dict):
        return ["Data must be a JSON object"]

    if not data.get('industry'):
        errors.append("Industry is required")

    features = data.get('features', [])
    if not isinstance(features, list) or len(features) == 0:
        errors.append("At least one feature is required")

    curves = data.get('curves', [])
    if not isinstance(curves, list) or len(curves) == 0:
        errors.append("At least one competitor is required")

    for i, curve in enumerate(curves):
        if not curve.get('customer_profile'):
            errors.append(f"Curve {i} missing customer_profile")
            continue
        values = curve.get('relative_customer_value', [])
        if len(values) != len(features):
            errors.append(
                f"Curve '{curve['customer_profile']}' has {len(values)} values "
                f"but there are {len(features)} features"
            )
        for j, v in enumerate(values):
            if not isinstance(v, (int, float)) or v < 0 or v > 5:
                errors.append(
                    f"Curve '{curve['customer_profile']}' value at index {j} "
                    f"must be a number between 0 and 5"
                )

    return errors


@app.route('/')
def index():
    """Root endpoint - API information"""
    return jsonify({
        "name": "Value Curve API",
        "version": "2.0",
        "endpoints": {
            "/api/data": "Get value curve data (legacy)",
            "/api/projects": "List or create projects",
            "/api/projects/<name>/data": "Get or update project data",
        }
    })


@app.route('/api/data')
def get_data():
    data_file = get_data_file()

    try:
        with open(data_file, 'r') as f:
            data = json.load(f)

        # Transform data for frontend compatibility
        # Convert user_jobs (objects with name/description) to features (array of strings)
        if 'user_jobs' in data and 'features' not in data:
            data['features'] = [job['name'] for job in data['user_jobs']]

        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": f"Data file not found: {data_file}"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 500


@app.route('/api/projects', methods=['GET'])
def list_projects():
    """List all projects by scanning the projects/ directory"""
    projects = []

    if not os.path.isdir(PROJECTS_DIR):
        return jsonify(projects)

    for entry in sorted(os.listdir(PROJECTS_DIR)):
        project_dir = os.path.join(PROJECTS_DIR, entry)
        data_file = os.path.join(project_dir, 'data.json')

        if not os.path.isdir(project_dir) or not os.path.isfile(data_file):
            continue

        try:
            with open(data_file, 'r') as f:
                data = json.load(f)

            features = data.get('features', [])
            if not features and 'user_jobs' in data:
                features = [job['name'] for job in data['user_jobs']]

            projects.append({
                "name": entry,
                "industry": data.get('industry', ''),
                "feature_count": len(features),
                "competitor_count": len(data.get('curves', [])),
            })
        except (json.JSONDecodeError, KeyError):
            projects.append({
                "name": entry,
                "industry": "(invalid data)",
                "feature_count": 0,
                "competitor_count": 0,
            })

    return jsonify(projects)


@app.route('/api/projects', methods=['POST'])
def create_project():
    """Create a new project with scaffold JSON"""
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "Request body must be JSON"}), 400

    raw_name = body.get('name', '').strip()
    if not raw_name:
        return jsonify({"error": "Project name is required"}), 400

    name = sanitize_project_name(raw_name)
    if not name:
        return jsonify({"error": "Project name contains no valid characters"}), 400

    # Prevent path traversal
    if '..' in name or '/' in name or '\\' in name:
        return jsonify({"error": "Invalid project name"}), 400

    project_dir = os.path.join(PROJECTS_DIR, name)
    if os.path.exists(project_dir):
        return jsonify({"error": f"Project '{name}' already exists"}), 409

    industry = body.get('industry', '').strip()

    scaffold = {
        "industry": industry,
        "user_persona": "",
        "features": [],
        "user_jobs": [],
        "curves": [
            {"customer_profile": "Our Solution", "relative_customer_value": []},
        ],
        "rationale": {},
        "admin_metadata": {
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        },
    }

    os.makedirs(project_dir, exist_ok=True)
    data_file = os.path.join(project_dir, 'data.json')
    with open(data_file, 'w') as f:
        json.dump(scaffold, f, indent=4)

    return jsonify({"name": name, "message": "Project created"}), 201


@app.route('/api/projects/<name>/data', methods=['GET'])
def get_project_data(name):
    """Get a specific project's data"""
    name = sanitize_project_name(name)
    data_file = os.path.join(PROJECTS_DIR, name, 'data.json')

    if not os.path.isfile(data_file):
        return jsonify({"error": f"Project '{name}' not found"}), 404

    try:
        with open(data_file, 'r') as f:
            data = json.load(f)

        # Derive features from user_jobs if missing (backward compat)
        if 'user_jobs' in data and 'features' not in data:
            data['features'] = [job['name'] for job in data['user_jobs']]

        return jsonify(data)
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON in project data"}), 500


@app.route('/api/projects/<name>/data', methods=['PUT'])
def update_project_data(name):
    """Full replacement save of project data"""
    name = sanitize_project_name(name)
    project_dir = os.path.join(PROJECTS_DIR, name)
    data_file = os.path.join(project_dir, 'data.json')

    if not os.path.isdir(project_dir):
        return jsonify({"error": f"Project '{name}' not found"}), 404

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "Request body must be JSON"}), 400

    errors = validate_project_data(body)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    # Update timestamp
    if 'admin_metadata' not in body:
        body['admin_metadata'] = {}
    body['admin_metadata']['updated_at'] = _now_iso()

    # Atomic write: write to temp file then rename
    try:
        fd, tmp_path = tempfile.mkstemp(dir=project_dir, suffix='.json')
        with os.fdopen(fd, 'w') as f:
            json.dump(body, f, indent=4)
        os.replace(tmp_path, data_file)
    except Exception as e:
        # Clean up temp file if rename failed
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        return jsonify({"error": f"Failed to save: {str(e)}"}), 500

    return jsonify({"message": "Project data saved"})


def _now_iso():
    """Return current UTC time as ISO 8601 string"""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


if __name__ == '__main__':
    import sys

    # Get data file from command line argument
    data_file = sys.argv[1] if len(sys.argv) > 1 else 'data.json'

    # Save config to file
    with open(CONFIG_FILE, 'w') as f:
        json.dump({'data_file': data_file}, f)

    # Ensure projects directory exists
    os.makedirs(PROJECTS_DIR, exist_ok=True)

    if not os.path.exists(data_file):
        print(f"Warning: Data file '{data_file}' not found.")
    else:
        print(f"Starting Value Curve App with data from: {data_file}")

    app.run(debug=True, port=5000)
