# Value Curve Visualization App

A Python Flask web application for creating interactive Strategy Canvas visualizations based on the Blue Ocean Strategy framework.

## Features

- **Interactive Line Charts**: Dynamic value curve visualizations using Chart.js
- **Advantage/Disadvantage Highlighting**: Visual analysis of competitive positioning
- **Multi-Project Support**: Organize different datasets in separate project folders
- **Responsive Design**: Clean, modern UI with real-time interactivity

## Installation

```bash
# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Running with Default Data
```bash
python app.py
```
This will load `data.json` from the root directory.

### Running with a Specific Project
```bash
python app.py projects/testing1/data.json
```

### Organizing Your Projects
It's recommended to organize different use cases in separate folders:
```
value_curve/
├── app.py
├── projects/
│   ├── testing1/
│   │   └── data.json
│   ├── enterprise_saas/
│   │   └── data.json
│   └── retail_analysis/
│       └── data.json
├── static/
└── templates/
```

## JSON Data Format

```json
{
    "industry": "Your Industry Name",
    "features": [
        "Feature 1",
        "Feature 2",
        "Feature 3"
    ],
    "curves": [
        {
            "customer_profile": "Competitor Name",
            "relative_customer_value": [2, -1, 3]
        },
        {
            "customer_profile": "Our Solution (Blue Ocean)",
            "relative_customer_value": [4, 3, -2]
        }
    ]
}
```

### Schema Details

- **industry** (string): Name of the industry or market segment
- **features** (array): List of competitive factors (shown on X-axis as "Key User Jobs")
- **curves** (array): Competitor/solution profiles
  - **customer_profile** (string): Name of the competitor or solution
  - **relative_customer_value** (array): Values from -5 to 5 representing competitive position

**Note**: The app automatically detects "Our Solution" or "Blue Ocean" profiles for advantage/disadvantage analysis.

## Using the Highlight Features

Once the app is running, you'll see three options on the right sidebar:

1. **No Highlighting**: Standard view showing all curves
2. **Areas of Advantage**: Highlights features where your solution is significantly better (green)
3. **Areas of Disadvantage**: Highlights features where competitors have the advantage (red)

The threshold for "significant" is set to 1.0 point difference (configurable in `static/js/main.js`).

## Accessing the App

After starting the server, open your browser to:
```
http://localhost:5000
```

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: Chart.js with Annotation Plugin
- **Styling**: Vanilla CSS

## License

MIT
