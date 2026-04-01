# Value Curve Visualization App v2.0

> **This project has been archived.** The Value Curve / Strategy Canvas functionality has been migrated to [evy-portal](https://github.com/jordansy1/evy-portal), the unified EverettYoung consulting tools platform. This repository is preserved as read-only for reference.

A modern React + Flask web application for creating interactive Strategy Canvas visualizations based on the Blue Ocean Strategy framework. Built for EverettYoung LLC consultants to deliver professional value curve analyses to clients.

## Features

- **Modern React UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Interactive Recharts Visualizations**: Smooth, responsive line charts with real-time updates
- **Advantage/Disadvantage Highlighting**: Visual analysis of competitive positioning
- **Multi-Project Support**: Organize different datasets in separate project folders
- **Responsive Design**: Mobile-first design that works on all screen sizes (375px, 1024px, 1440px)
- **EverettYoung Branding**: Professional branded interface with company design system
- **Loading & Error States**: Polished user experience with skeleton screens and helpful error messages

## Architecture

This is a **hybrid application**:
- **Backend**: Flask (Python) API server on port 5000
- **Frontend**: React + Vite development server on port 5173
- **Communication**: REST API with CORS enabled for development

## Installation

### Backend Setup

```bash
# Navigate to project root
cd value_curve

# Create and activate virtual environment (if not already done)
python -m venv venv

# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
```

## Running the Application

### Quick Start (Recommended)

Use the provided scripts to run both servers simultaneously:

**Windows (PowerShell):**
```powershell
.\run-dev.ps1
```

**Windows (Command Prompt):**
```batch
run-dev.bat
```

This will:
1. Start the Flask backend on http://localhost:5000
2. Start the React frontend on http://localhost:5173
3. Open both in separate terminal windows

**Access the app at: http://localhost:5173**

### Manual Start (Alternative)

If you prefer to run servers manually:

**Terminal 1 - Backend:**
```bash
# From project root
python app.py projects/testing1/data.json
```

**Terminal 2 - Frontend:**
```bash
# From project root
cd frontend
npm run dev
```

## Project Structure

```
value_curve/
├── app.py                  # Flask API server
├── requirements.txt        # Python dependencies
├── run-dev.ps1            # Dev launcher (PowerShell)
├── run-dev.bat            # Dev launcher (CMD)
├── projects/              # Data file organization
│   └── testing1/
│       └── data.json
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Header.tsx
│   │   │   ├── ValueCurveChart.tsx
│   │   │   └── CompetitorSidebar.tsx
│   │   ├── types/         # TypeScript interfaces
│   │   ├── assets/        # Images, logos
│   │   ├── App.tsx        # Main application
│   │   └── index.css      # Global styles (Tailwind)
│   ├── tailwind.config.js # Design system configuration
│   └── package.json       # Node dependencies
└── templates/ (legacy)    # Old HTML templates (not used in v2.0)
```

## JSON Data Format

The data format remains the same as v1.0:

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

## Using the Application

### Competitor Filtering
- **Select All / Clear All**: Quick buttons to toggle all competitors
- **Individual Checkboxes**: Click any competitor to show/hide their curve
- Visual feedback with checkmark icons

### Highlight Modes
1. **No Highlighting**: Standard view showing all visible curves
2. **Areas of Advantage**: Highlights features where your solution outperforms (green shading)
3. **Areas of Disadvantage**: Highlights features where competitors lead (red shading)

The threshold for "significant" difference is 1.0 points (configurable in `ValueCurveChart.tsx`).

## Development

### Frontend Development
```bash
cd frontend
npm run dev       # Start dev server with hot reload
npm run build     # Build for production
npm run preview   # Preview production build
```

### Backend Development
The Flask API runs in debug mode by default, auto-reloading on file changes.

### Environment Variables
Create `frontend/.env.development` to customize:
```
VITE_API_URL=http://localhost:5000
```

## Design System

This application follows the **EverettYoung LLC Design System**:

- **Colors**:
  - Primary: #8484E6 (purple), #A2C799 (green)
  - Accent: #587553
  - Background: #1E222B
- **Typography**: Liter/system-ui font family
- **Spacing**: 4px base unit system
- **Components**: Card patterns with 8px border radius, subtle shadows

See `.claude/design-system.md` for full specifications.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds and HMR
- **Tailwind CSS** for utility-first styling
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Flask 3.1.x** (Python web framework)
- **Flask-CORS** for cross-origin requests

## Troubleshooting

### Frontend can't connect to backend
- Ensure Flask is running on port 5000
- Check CORS settings in `app.py`
- Verify `VITE_API_URL` in `.env.development`

### TypeScript errors
```bash
cd frontend
npm run build  # Will show all type errors
```

### Port already in use
- Frontend (5173): Change in `frontend/vite.config.ts`
- Backend (5000): Change in `app.py` and update `VITE_API_URL`

## Deployment

### Building for Production
```bash
cd frontend
npm run build
```

The `dist/` folder can be served by Flask or any static hosting service.

### Production Flask Setup
Update `app.py` to serve the built React app as static files.

## Version History

- **v2.0** (2026-01): Complete rewrite with React + TypeScript + Tailwind CSS. Added EverettYoung branding, responsive design, modern component architecture.
- **v1.0** (2024): Initial Flask app with Chart.js and vanilla HTML/CSS.

## License

MIT

---

**Built with ❤️ by EverettYoung LLC**
