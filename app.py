import json
import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for development (React dev server on different port)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"]}})

# Config file to persist data file path
CONFIG_FILE = 'app_config.json'

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

@app.route('/')
def index():
    """Root endpoint - API information"""
    return jsonify({
        "name": "Value Curve API",
        "version": "2.0",
        "endpoints": {
            "/api/data": "Get value curve data"
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

if __name__ == '__main__':
    import sys
    
    # Get data file from command line argument
    data_file = sys.argv[1] if len(sys.argv) > 1 else 'data.json'
    
    # Save config to file
    with open(CONFIG_FILE, 'w') as f:
        json.dump({'data_file': data_file}, f)
    
    if not os.path.exists(data_file):
        print(f"Warning: Data file '{data_file}' not found.")
    else:
        print(f"Starting Value Curve App with data from: {data_file}")
    
    app.run(debug=True, port=5000)
