import json
import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

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
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    data_file = get_data_file()
    
    try:
        with open(data_file, 'r') as f:
            data = json.load(f)
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
