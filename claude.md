# Project Context
- This is an application to assist management and technology consultants at the company EverettYoung LLC in producing Value Curve analyses in a visual way for clients

## Design System
@~/.claude/design-system.md

## Tech Stack
- React 18 with functional components and hooks
- Tailwind CSS for styling (utility-first)
- Recharts for data visualization
- Lucide React for icons
- No external UI component libraries unless specified

## Code Patterns
- All components in single files (CSS-in-JS via Tailwind)
- Use TypeScript interfaces for props
- Extract reusable components to /components
- Mock data in /data with realistic consulting scenarios

## Development Commands

```powershell
# Quick start (both frontend + backend)
.\run-dev.ps1

# Manual start - Backend (Flask)
python app.py projects/testing1/data.json  # Port 5000

# Manual start - Frontend (Vite)
cd frontend && npm run dev  # Port 5173
```

## When Building Prototypes
1. Start with mobile-first responsive design
2. Use semantic HTML elements
3. Include realistic placeholder data (not lorem ipsum)
4. Add hover/focus states for interactive elements
5. Include empty and loading states
6. Test at 1440px, 1024px, and 375px widths