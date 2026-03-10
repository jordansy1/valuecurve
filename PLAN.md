# Value Curve App Enhancement Plan: User-Facing Competitive Analysis

## 1. Overview

### Current State
The app is a consultant-facing tool where an analyst manually creates projects by defining an industry, competitors, features, and value scores. All data is entered from scratch. The data model is simple: a project contains an industry, a user persona (text), features, and competitor value curves (0-5 scores per feature).

### Goal
Transform the app into a **user-facing product** that lets engineers and designers quickly understand their product's competitive position. Users navigate a guided flow - selecting a domain, persona, product categories, and competitors - with pre-filled catalog data available at each step. They can also create custom entries at every step. They then add their own product to see where they stand.

### Key Design Principles
1. **Domain-first navigation** using CISSP domains as the top-level organizing structure
2. **Select OR Create at every step** - pre-filled catalog data accelerates the flow, but users are never locked into it
3. **User Jobs are features, not navigation** - Jobs-to-be-done (user_jobs) remain as the competitive factors/features within the value curve data, not as a separate selection step
4. **Cross-category competition** - users can select multiple product categories to see competitors from different market segments compared side-by-side

---

## 2. New User Flow

```
┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐
│  Log In /    │───>│  Select a        │───>│  Select or Create  │
│  Landing     │    │  Domain          │    │  User Persona      │
└──────────────┘    │  (CISSP domains) │    │                    │
                    └──────────────────┘    └────────────────────┘
                                                      │
                    ┌──────────────────┐               │
                    │  Select or Create│<──────────────┘
                    │  Product         │
                    │  Categories      │
                    │  (one or more)   │
                    └──────────────────┘
                              │
                    ┌──────────────────┐
                    │  Select or Create│
                    │  Competitors     │
                    │  (from selected  │
                    │   categories)    │
                    └──────────────────┘
                              │
                    ┌──────────────────┐
                    │  View pre-filled │
                    │  value curves    │
                    │  for selected    │
                    │  competitors     │
                    └──────────────────┘
                              │
                    ┌──────────────────┐
                    │  "Add My Product"│
                    │  Score your own  │
                    │  solution on     │
                    │  each feature    │
                    └──────────────────┘
                              │
                    ┌──────────────────┐
                    │  Full Comparison │
                    │  Your product vs │
                    │  selected        │
                    │  competitors     │
                    └──────────────────┘
```

### Step-by-Step

1. **Landing Page** - User sees the CISSP domains as selectable cards. Each card shows the domain name, description, and counts of available personas/categories/competitors.

2. **Domain Selected → Persona Step** - User sees pre-built personas for this domain (e.g., "SOC Analyst (Tier 1-2)", "Detection Engineer", "CISO") as selectable cards. They can pick one OR create a custom persona by entering a name, description, and context.

3. **Persona Selected → Category Step** - User sees product categories relevant to this domain (e.g., "SIEM", "XDR", "SOAR", "Hyperautomation"). They can select **one or more** categories, and/or create custom categories. Selecting multiple categories enables cross-category comparison.

4. **Categories Selected → Competitor Step** - User sees competitors grouped by their selected categories, drawn from the catalog. They can toggle individual competitors on/off and/or create custom competitors. Each competitor shows its name, short description, and category badge.

5. **Competitors Confirmed → Value Curve View** - The app loads pre-filled value curve data: features are determined by the persona, scores are loaded per competitor. The existing `ValueCurveChart` renders the comparison. Users can toggle competitors, use highlight modes, etc.

6. **"Add My Product"** - User clicks a CTA to add their own product. A focused scoring interface appears where they rate their product on each feature (0-5 scale) with optional rationale.

7. **Full Comparison** - The chart shows "My Product" as the green solid line overlaid on the selected competitor curves. Advantage/disadvantage highlighting reveals where the user's product leads or trails.

---

## 3. Core Concepts & Data Model

### Conceptual Hierarchy

```
Domain (CISSP domain, e.g., "Security Operations")
  ├── Personas (who is doing the work)
  │     └── Features/User Jobs (what this persona needs to accomplish)
  ├── Product Categories (types of solutions)
  │     └── Competitors (specific products in each category)
  └── Scores (per persona × competitor → value per feature)
```

### Key Relationships
- **Domain → Personas**: One-to-many. Each domain has several relevant personas.
- **Domain → Product Categories**: One-to-many. Each domain has several relevant product categories.
- **Category → Competitors**: One-to-many. Each category contains specific products.
- **Persona → Features**: One-to-many. The persona determines which competitive factors (user jobs) matter. A SOC Analyst cares about "Assess Alert Severity" while a CISO cares about "Demonstrate Compliance Posture."
- **Persona × Competitor → Scores**: The value scores for each competitor on each feature, from the perspective of a specific persona.

### Why Features Are Persona-Dependent
The same product can score very differently depending on who is evaluating it. Splunk ES might score 4/5 on "Ad-hoc Investigation" for a Detection Engineer but 2/5 on "Board-Level Reporting" for a CISO. By tying features to the persona, we ensure the value curve reflects what actually matters to the user's target customer.

---

## 4. Catalog Schema

### Directory Structure

```
catalog/
├── domains.json                                  # The 8 CISSP domains
│
├── security-operations/                          # One directory per domain
│   ├── domain.json                               # Domain metadata
│   ├── personas/
│   │   ├── _index.json                           # List of available personas
│   │   ├── soc-analyst.json                      # Persona details + features
│   │   ├── detection-engineer.json
│   │   └── ciso.json
│   ├── categories/
│   │   ├── _index.json                           # List of categories for this domain
│   │   ├── siem/
│   │   │   ├── category.json                     # Category metadata
│   │   │   └── competitors.json                  # Competitors in this category
│   │   ├── xdr/
│   │   │   ├── category.json
│   │   │   └── competitors.json
│   │   ├── soar/
│   │   │   ├── category.json
│   │   │   └── competitors.json
│   │   └── hyperautomation/
│   │       ├── category.json
│   │       └── competitors.json
│   └── scores/
│       ├── soc-analyst/                          # Scores organized by persona
│       │   ├── siem.json                         # Scores for SIEM competitors on SOC Analyst features
│       │   ├── xdr.json                          # Scores for XDR competitors on SOC Analyst features
│       │   └── soar.json
│       ├── detection-engineer/
│       │   ├── siem.json
│       │   └── xdr.json
│       └── ciso/
│           ├── siem.json
│           └── soar.json
│
├── security-and-risk-management/                 # Another CISSP domain
│   ├── domain.json
│   ├── personas/
│   │   └── ...
│   └── ...
└── ...
```

### domains.json
```json
[
  {
    "id": "security-operations",
    "name": "Security Operations",
    "description": "Monitoring, detection, incident response, and operational security management",
    "cissp_domain_number": 7,
    "icon": "shield-alert",
    "persona_count": 3,
    "category_count": 4
  },
  {
    "id": "security-and-risk-management",
    "name": "Security and Risk Management",
    "description": "Governance, compliance, risk assessment, security policies, and business continuity",
    "cissp_domain_number": 1,
    "icon": "scale",
    "persona_count": 2,
    "category_count": 3
  },
  {
    "id": "asset-security",
    "name": "Asset Security",
    "description": "Classification, ownership, privacy, retention, and protection of data and assets",
    "cissp_domain_number": 2,
    "icon": "database"
  },
  {
    "id": "security-architecture-and-engineering",
    "name": "Security Architecture and Engineering",
    "description": "Security design principles, cryptography, and secure system architecture",
    "cissp_domain_number": 3,
    "icon": "building"
  },
  {
    "id": "communication-and-network-security",
    "name": "Communication and Network Security",
    "description": "Network architecture, protocols, secure channels, and network attack mitigation",
    "cissp_domain_number": 4,
    "icon": "network"
  },
  {
    "id": "identity-and-access-management",
    "name": "Identity and Access Management",
    "description": "Authentication, authorization, identity lifecycle, and access control mechanisms",
    "cissp_domain_number": 5,
    "icon": "fingerprint"
  },
  {
    "id": "security-assessment-and-testing",
    "name": "Security Assessment and Testing",
    "description": "Vulnerability assessment, penetration testing, audits, and security metrics",
    "cissp_domain_number": 6,
    "icon": "clipboard-check"
  },
  {
    "id": "software-development-security",
    "name": "Software Development Security",
    "description": "Secure coding, SDLC integration, application security testing, and DevSecOps",
    "cissp_domain_number": 8,
    "icon": "code"
  }
]
```

### personas/_index.json (per domain)
```json
[
  {
    "id": "soc-analyst",
    "name": "SOC Analyst (Tier 1-2)",
    "description": "Frontline analyst who triages alerts, performs initial investigation, and escalates confirmed incidents",
    "context": "Mid-sized enterprise SOC, handles 200-500 alerts per day",
    "feature_count": 6
  },
  {
    "id": "detection-engineer",
    "name": "Detection Engineer",
    "description": "Writes and maintains detection rules, tunes alert logic, and reduces false positives",
    "context": "Mid-sized enterprise with 5,000-20,000 employees",
    "feature_count": 6
  },
  {
    "id": "ciso",
    "name": "CISO",
    "description": "Chief Information Security Officer responsible for security strategy, risk management, and executive reporting",
    "context": "Mid-sized enterprise, reports to CEO/Board",
    "feature_count": 5
  }
]
```

### personas/soc-analyst.json (persona detail + features)
```json
{
  "id": "soc-analyst",
  "name": "SOC Analyst (Tier 1-2)",
  "description": "Frontline analyst who triages alerts, performs initial investigation, and escalates confirmed incidents",
  "context": "Mid-sized enterprise SOC, handles 200-500 alerts per day",
  "features": [
    {
      "name": "Assess Alert Severity",
      "description": "Quickly determine if an alert is critical, high, medium, or low priority based on available context"
    },
    {
      "name": "Gather Context",
      "description": "Pull together relevant information (asset details, user behavior, threat intel) to understand what triggered the alert"
    },
    {
      "name": "Reduce False Positives",
      "description": "Efficiently identify and dismiss benign alerts to focus time on real threats"
    },
    {
      "name": "Correlate Related Alerts",
      "description": "Group related alerts into incidents to see the full picture of an attack"
    },
    {
      "name": "Escalate with Context",
      "description": "Hand off confirmed incidents to Tier 2/3 with enough context for efficient investigation"
    },
    {
      "name": "Track Alert Throughput",
      "description": "Manage personal queue and maintain SLA compliance for alert response times"
    }
  ]
}
```

### categories/_index.json (per domain)
```json
[
  {
    "id": "siem",
    "name": "SIEM",
    "full_name": "Security Information and Event Management",
    "description": "Centralized log collection, correlation, and threat detection",
    "competitor_count": 4
  },
  {
    "id": "xdr",
    "name": "XDR",
    "full_name": "Extended Detection and Response",
    "description": "Cross-domain detection and response across endpoints, network, cloud, and email",
    "competitor_count": 3
  },
  {
    "id": "soar",
    "name": "SOAR",
    "full_name": "Security Orchestration, Automation and Response",
    "description": "Automated playbooks and case management for incident response",
    "competitor_count": 3
  },
  {
    "id": "hyperautomation",
    "name": "Hyperautomation",
    "full_name": "Hyperautomation Platforms",
    "description": "General-purpose automation platforms applied to security workflows",
    "competitor_count": 2
  }
]
```

### categories/siem/competitors.json
```json
[
  {
    "id": "splunk-es",
    "name": "Splunk Enterprise Security",
    "short_name": "Splunk ES",
    "description": "Industry-leading SIEM with risk-based alerting and powerful search"
  },
  {
    "id": "microsoft-sentinel",
    "name": "Microsoft Sentinel",
    "short_name": "Sentinel",
    "description": "Cloud-native SIEM with AI-driven incident correlation"
  },
  {
    "id": "elastic-security",
    "name": "Elastic Security",
    "short_name": "Elastic",
    "description": "Open-core SIEM built on the Elastic Stack"
  },
  {
    "id": "ibm-qradar",
    "name": "IBM QRadar",
    "short_name": "QRadar",
    "description": "Enterprise SIEM with offense-based correlation"
  }
]
```

### scores/soc-analyst/siem.json (the core scoring data)

This file contains value scores for all SIEM competitors, evaluated against the SOC Analyst's features:

```json
{
  "persona_id": "soc-analyst",
  "category_id": "siem",
  "curves": [
    {
      "customer_profile": "Splunk ES",
      "relative_customer_value": [3, 4, 2, 3, 2, 3]
    },
    {
      "customer_profile": "Sentinel",
      "relative_customer_value": [3, 3, 3, 4, 3, 3]
    },
    {
      "customer_profile": "Elastic",
      "relative_customer_value": [2, 3, 2, 2, 2, 3]
    },
    {
      "customer_profile": "QRadar",
      "relative_customer_value": [3, 3, 2, 3, 2, 2]
    }
  ],
  "rationale": {
    "Splunk ES": {
      "Assess Alert Severity": "Risk-based alerting assigns risk scores, but requires significant tuning...",
      "Gather Context": "SPL search is extremely powerful for ad-hoc context gathering..."
    }
  }
}
```

### How the Data Merges at Runtime

When the user selects:
- **Domain**: Security Operations
- **Persona**: SOC Analyst → loads `personas/soc-analyst.json` (features)
- **Categories**: SIEM + XDR → loads competitors from both
- **Competitors**: Splunk ES, Sentinel, CrowdStrike, XSIAM (subset of available)

The backend merges into a standard `ValueCurveData` object:

```json
{
  "industry": "Security Operations",
  "user_persona": "SOC Analyst (Tier 1-2)",
  "features": ["Assess Alert Severity", "Gather Context", ...],
  "user_jobs": [{"name": "Assess Alert Severity", "description": "..."}, ...],
  "curves": [
    {"customer_profile": "Splunk ES (SIEM)", "relative_customer_value": [3, 4, 2, 3, 2, 3]},
    {"customer_profile": "Sentinel (SIEM)", "relative_customer_value": [3, 3, 3, 4, 3, 3]},
    {"customer_profile": "CrowdStrike (XDR)", "relative_customer_value": [4, 3, 4, 4, 3, 2]},
    {"customer_profile": "XSIAM (XDR)", "relative_customer_value": [4, 4, 3, 4, 2, 2]}
  ]
}
```

This is the same shape the existing `ValueCurveChart` already consumes. **No chart code changes needed.**

---

## 5. Project Data Model

A **project** is the unit of saved work. It captures everything a user selected during the guided flow, plus any custom entries and their own product scores. Projects are named, saved, and returnable — a consultant can build an analysis on Monday and come back to it on Friday.

### How Projects Relate to the Guided Flow

The guided flow (Domain → Persona → Categories → Competitors) is the **creation** path. At any point after reaching the value curve view, the user can **save** their work as a named project. The project stores:
- All selections made during the flow (which catalog entries were chosen)
- Any custom entries created (custom persona, categories, competitors)
- The user's own product scores (if they've added "My Product")
- The fully resolved `ValueCurveData` snapshot (so the project is self-contained)

When a user returns to a saved project, they land directly on the value curve view with everything restored — no need to re-walk the flow.

### Project Structure

```json
{
  "id": "project-uuid",
  "name": "Acme SOC Platform Analysis",
  "description": "Competitive analysis for Acme's alert triage product",
  "created_at": "2026-03-10T...",
  "updated_at": "2026-03-10T...",

  "selections": {
    "domain_id": "security-operations",
    "persona_id": "soc-analyst",
    "category_ids": ["siem", "xdr"],
    "competitor_ids": ["splunk-es", "microsoft-sentinel", "crowdstrike-falcon", "palo-alto-xsiam"]
  },

  "custom_entries": {
    "persona": null,
    "categories": [],
    "competitors": [
      {
        "id": "custom-acme-siem",
        "name": "Acme Legacy SIEM",
        "short_name": "Acme SIEM",
        "category_id": "siem",
        "description": "Client's existing in-house SIEM",
        "scores": [1, 2, 1, 1, 2, 2]
      }
    ]
  },

  "my_product": {
    "name": "Acme NextGen Platform",
    "scores": [3, 4, 2, 5, 3, 4],
    "rationale": {
      "Assess Alert Severity": "Our ML-based scoring is best-in-class...",
      "Correlate Related Alerts": "Automatic attack chain visualization..."
    }
  },

  "snapshot": {
    "industry": "Security Operations",
    "user_persona": "SOC Analyst (Tier 1-2)",
    "features": ["Assess Alert Severity", "Gather Context", "..."],
    "user_jobs": [{"name": "Assess Alert Severity", "description": "..."}],
    "curves": [
      {"customer_profile": "Splunk ES (SIEM)", "relative_customer_value": [3, 4, 2, 3, 2, 3]},
      {"customer_profile": "Acme NextGen Platform", "relative_customer_value": [3, 4, 2, 5, 3, 4]}
    ]
  }
}
```

### Why Store a Snapshot?

The `snapshot` field contains the fully resolved `ValueCurveData` at save time. This means:
- **Instant load**: Opening a saved project doesn't require re-composing from catalog pieces
- **Stability**: If catalog scores are updated later, the user's saved analysis doesn't silently change
- **Offline-friendly**: The project file is self-contained
- **Backward compatible**: The snapshot is the same shape the existing chart consumes

The `selections` and `custom_entries` fields are kept alongside the snapshot so the user can **re-compose** if they want to pick up catalog updates, add/remove competitors, or modify their flow choices.

### Storage

Projects are stored as JSON files under `projects/{project-id}/data.json` — the same pattern the app already uses. The existing project CRUD infrastructure (`GET/POST/PUT/DELETE /api/projects`) is extended to support the new structure. Old-format projects (manually created via admin) continue to work as-is.

---

## 6. Backend API Changes

### New Endpoints

```
# Catalog endpoints (read-only)
GET  /api/catalog/domains                             → List all CISSP domains
GET  /api/catalog/domains/{domain_id}                 → Domain detail
GET  /api/catalog/domains/{domain_id}/personas        → List personas for domain
GET  /api/catalog/domains/{domain_id}/personas/{id}   → Persona detail + features
GET  /api/catalog/domains/{domain_id}/categories      → List categories for domain
GET  /api/catalog/domains/{domain_id}/categories/{id}/competitors
                                                      → List competitors in a category
GET  /api/catalog/domains/{domain_id}/scores/{persona_id}/{category_id}
                                                      → Pre-filled scores for persona × category

# Compose (preview before saving — returns ValueCurveData without persisting)
POST /api/catalog/compose                             → Takes selections, returns merged ValueCurveData
  Body: { domain_id, persona_id, category_ids[], competitor_ids[] }
```

### Extended Project Endpoints

The existing `/api/projects` endpoints are extended to support the new project structure. Projects created via the guided flow and projects created via the admin editor coexist — they're both projects, just with different shapes.

```
# Existing (unchanged)
GET    /api/projects                                  → List all projects
POST   /api/projects                                  → Create project
GET    /api/projects/{id}/data                        → Get project data
PUT    /api/projects/{id}/data                        → Update project data
DELETE /api/projects/{id}                             → Delete project

# New: save from guided flow (creates a project with selections + snapshot)
POST   /api/projects/from-flow                        → Create project from guided flow selections
  Body: { name, description, selections, custom_entries, my_product? }
  → Composes ValueCurveData, saves as snapshot, returns project

# New: re-compose (update snapshot from current catalog data)
POST   /api/projects/{id}/recompose                   → Re-merge from catalog using stored selections
  → Updates the snapshot field with latest catalog scores
```

### Why Unify Under `/api/projects`

A project is a project whether it was built through the guided flow or the admin editor. The consultant sees one list of their work, not two parallel systems. The `selections` field being present (or null) is what distinguishes a catalog-backed project from a manually-created one.

---

## 7. Frontend Changes

### New Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | `LandingPage` | CISSP domain selector grid + saved projects list |
| `/domain/:domainId` | `DomainFlowPage` | Multi-step guided flow: Persona → Categories → Competitors |
| `/domain/:domainId/view` | `CatalogViewPage` | Pre-filled value curves for selections (pre-save preview) |
| `/domain/:domainId/score` | `ScoreMyProductPage` | Focused scoring interface |
| `/projects/:projectId` | `ProjectViewPage` | Saved project view (loads snapshot, renders chart) |

### Preserved Routes (admin/consultant mode)
| Route | Page | Status |
|-------|------|--------|
| `/admin` | `ProjectListPage` | Unchanged (manual project creation) |
| `/admin/:projectId` | `ProjectEditorPage` | Unchanged |

### Landing Page: Two Entry Points

The landing page serves both new and returning users:
- **"Start New Analysis"** section: CISSP domain cards → begins the guided flow
- **"My Projects"** section: List of saved projects → click to open directly in chart view

This means a consultant's workflow is: guided flow → save as project → return to project list → reopen anytime.

### New Components

**`DomainCard`** - Card for each CISSP domain. Shows domain name, number, description, icon, and counts of available data. Used on LandingPage.

**`GuidedFlowStepper`** - Step indicator showing progress through the Domain → Persona → Categories → Competitors flow. Allows going back to previous steps.

**`PersonaSelector`** - Grid of `PersonaCard` components for pre-built personas + a "Create Custom Persona" card. Selected state is visually distinct.

**`PersonaCard`** - Card displaying persona name, description, context, and feature count.

**`CategorySelector`** - Grid of `CategoryCard` components with multi-select support + "Create Custom Category" option. Shows competitor count per category.

**`CategoryBadge`** - Small colored pill showing category abbreviation (e.g., "SIEM", "SOAR"). Used throughout the UI to label competitors.

**`CompetitorSelector`** - List of competitors grouped by selected categories, with checkboxes. Includes "Add Custom Competitor" option per category. Shows competitor description on hover.

**`ProductScorer`** - Focused scoring interface (see Section 8).

**`ComparisonBanner`** - Insight summary banner on the comparison view.

### Modified Components

**`Header`** - Add navigation breadcrumbs showing the flow path.

**`ValueCurveChart`** - No changes needed. Same data shape.

**`CompetitorSidebar`** - Show `CategoryBadge` next to each competitor name.

---

## 8. Scoring Interface Design

### Recommendation: Streamlined List with Competitor Context

Show all features as a compact vertical list. For each feature:
- Feature name and description
- Slider (0-5)
- Small dot-plot or mini bar chart showing where selected competitors score on this feature (provides context)
- Optional expandable rationale textarea
- Progress indicator (e.g., "4 of 6 features scored")

Fast for power users, provides enough context for first-time users.

---

## 9. Authentication Approach

**Recommendation for v1**: Anonymous UUID approach.
- Browser generates a UUID on first visit, stored in localStorage
- Analyses are stored on the server keyed by this UUID
- User gets a shareable link to their analysis
- Zero friction - users can start analyzing immediately
- Real auth (OAuth/email) added later when needed

---

## 10. Initial Seed Data Scope

### Phase 1: Security Operations Domain

**Personas (3):**
1. SOC Analyst (Tier 1-2)
2. Detection Engineer
3. CISO

**Product Categories (4):**
1. SIEM - Splunk ES, Microsoft Sentinel, Elastic Security, IBM QRadar
2. XDR - CrowdStrike Falcon, Palo Alto XSIAM, Microsoft Defender XDR
3. SOAR - Cortex XSOAR, Swimlane, Splunk SOAR
4. Hyperautomation - Tines, Torq

**Features per Persona: 5-8**
Curated to be the most meaningful competitive differentiators.

**Score Files Needed:**
- 3 personas × 4 categories = up to 12 score files
- Not all combinations are needed (e.g., CISO may not need hyperautomation scores)
- Start with SOC Analyst × SIEM + XDR as the minimum viable dataset

### Scoring Approach
Initial scores based on publicly available analyst reports, product documentation, and industry knowledge. Each score includes rationale text for transparency.

### Future Domains
- Identity and Access Management (IAM)
- Software Development Security (DevSecOps)
- Others based on user demand

---

## 11. Implementation Checklist

Each step is a concrete, completable unit of work. Check off as you go.

---

### Phase 1: TypeScript Types & Catalog Data Structure

**1.1 Define catalog types** (`frontend/src/types/catalog.ts`)
- [ ] `CatalogDomain` type (id, name, description, cissp_domain_number, icon, persona_count, category_count)
- [ ] `CatalogPersonaSummary` type (id, name, description, context, feature_count) — for index listings
- [ ] `CatalogPersona` type (extends summary with features: {name, description}[]) — full persona detail
- [ ] `CatalogCategorySummary` type (id, name, full_name, description, competitor_count) — for index listings
- [ ] `CatalogCompetitor` type (id, name, short_name, description)
- [ ] `CatalogScoreSet` type (persona_id, category_id, curves: ValueCurve[], rationale)
- [ ] `FlowSelections` type (domain_id, persona_id, category_ids[], competitor_ids[])

**1.2 Define project types** (`frontend/src/types/index.ts` — extend existing)
- [ ] `ProjectData` type — extends existing `ValueCurveDataExtended` with selections, custom_entries, my_product, snapshot fields
- [ ] `CustomEntries` type (persona, categories[], competitors[])
- [ ] `MyProduct` type (name, scores[], rationale)
- [ ] Ensure backward compatibility — old projects without `selections` field still load

**1.3 Create catalog directory structure**
- [ ] Create `catalog/` root directory
- [ ] Create `catalog/domains.json` with all 8 CISSP domains
- [ ] Create `catalog/security-operations/domain.json`
- [ ] Create `catalog/security-operations/personas/_index.json`
- [ ] Create `catalog/security-operations/categories/_index.json`

**1.4 Seed data: Security Operations — SOC Analyst persona**
- [ ] Create `catalog/security-operations/personas/soc-analyst.json` (persona + 6 features)
- [ ] Create `catalog/security-operations/categories/siem/category.json`
- [ ] Create `catalog/security-operations/categories/siem/competitors.json` (Splunk ES, Sentinel, Elastic, QRadar)
- [ ] Create `catalog/security-operations/categories/xdr/category.json`
- [ ] Create `catalog/security-operations/categories/xdr/competitors.json` (CrowdStrike, XSIAM, Defender XDR)
- [ ] Create `catalog/security-operations/scores/soc-analyst/siem.json` (scores + rationale)
- [ ] Create `catalog/security-operations/scores/soc-analyst/xdr.json` (scores + rationale)

**1.5 Seed data: Security Operations — Detection Engineer persona**
- [ ] Create `catalog/security-operations/personas/detection-engineer.json` (persona + 6 features)
- [ ] Create `catalog/security-operations/scores/detection-engineer/siem.json`
- [ ] Create `catalog/security-operations/scores/detection-engineer/xdr.json`

**Milestone: Catalog data files exist and are valid JSON. Types compile.**

---

### Phase 2: Catalog API (Flask Backend)

**2.1 Catalog read endpoints**
- [ ] `GET /api/catalog/domains` — reads `catalog/domains.json`, returns domain list
- [ ] `GET /api/catalog/domains/{domain_id}` — reads `catalog/{domain_id}/domain.json`
- [ ] `GET /api/catalog/domains/{domain_id}/personas` — reads `personas/_index.json`
- [ ] `GET /api/catalog/domains/{domain_id}/personas/{id}` — reads `personas/{id}.json`
- [ ] `GET /api/catalog/domains/{domain_id}/categories` — reads `categories/_index.json`
- [ ] `GET /api/catalog/domains/{domain_id}/categories/{id}/competitors` — reads `categories/{id}/competitors.json`
- [ ] `GET /api/catalog/domains/{domain_id}/scores/{persona_id}/{category_id}` — reads score file

**2.2 Compose endpoint**
- [ ] `POST /api/catalog/compose` — accepts `{domain_id, persona_id, category_ids[], competitor_ids[]}`
- [ ] Load persona features from `personas/{persona_id}.json`
- [ ] Load scores from each `scores/{persona_id}/{category_id}.json`
- [ ] Filter curves to only the selected competitor_ids
- [ ] Append category name to competitor labels (e.g., "Splunk ES (SIEM)")
- [ ] Return merged `ValueCurveData` object matching existing chart shape
- [ ] Handle missing score files gracefully (skip category, don't error)

**2.3 Validation & error handling**
- [ ] Return 404 for unknown domain/persona/category IDs
- [ ] Validate compose request body (required fields, non-empty arrays)
- [ ] Test compose endpoint with SOC Analyst + SIEM + XDR selection

**Milestone: All catalog endpoints return correct data. Compose returns valid ValueCurveData.**

---

### Phase 3: Landing Page & Domain Selection

**3.1 Landing page**
- [ ] Create `LandingPage.tsx` component
- [ ] Fetch domains from `GET /api/catalog/domains`
- [ ] Render domain cards in a responsive grid
- [ ] Create `DomainCard.tsx` — shows name, CISSP domain number, description, icon, persona/category counts
- [ ] Click on domain card navigates to `/domain/:domainId`

**3.2 "My Projects" section on landing page**
- [ ] Fetch saved projects from `GET /api/projects`
- [ ] Render project list below domain grid (or in a tab)
- [ ] Each project shows name, description, domain, persona, last updated
- [ ] Click on project navigates to `/projects/:projectId`

**3.3 Routing updates**
- [ ] Add `/` route → `LandingPage`
- [ ] Add `/domain/:domainId` route → `DomainFlowPage` (placeholder for now)
- [ ] Add `/projects/:projectId` route → `ProjectViewPage` (placeholder for now)
- [ ] Keep existing `/admin` and `/admin/:projectId` routes unchanged
- [ ] Update `App.tsx` layout/outlet as needed

**Milestone: Landing page renders domain cards from catalog API. Project list shows saved projects.**

---

### Phase 4: Guided Flow — Persona Selection

**4.1 Flow page shell**
- [ ] Create `DomainFlowPage.tsx` with step state management (current step, selections so far)
- [ ] Create `GuidedFlowStepper.tsx` — visual step indicator (Domain ✓ → Persona → Categories → Competitors)
- [ ] Wire step navigation: next, back, step clicking

**4.2 Persona step**
- [ ] Create `PersonaSelector.tsx` — grid of persona cards for the selected domain
- [ ] Create `PersonaCard.tsx` — name, description, context, feature count, selected state
- [ ] Fetch personas from `GET /api/catalog/domains/{domainId}/personas`
- [ ] Single-select: clicking a card selects it, deselects others
- [ ] Add "Create Custom Persona" card at end of grid
- [ ] Create `CustomPersonaForm.tsx` — inline form with name, description, context, features list
- [ ] Store selection in flow state: `persona_id` or `custom_persona` object
- [ ] "Next" button enabled when a persona is selected or custom form is valid

**Milestone: User can select a domain, see personas, pick one (or create custom), and advance.**

---

### Phase 5: Guided Flow — Category & Competitor Selection

**5.1 Category step**
- [ ] Create `CategorySelector.tsx` — grid of category cards with multi-select
- [ ] Create `CategoryCard.tsx` — name, full name, description, competitor count, selected/unselected state
- [ ] Fetch categories from `GET /api/catalog/domains/{domainId}/categories`
- [ ] Multi-select: clicking toggles selection, visual badge shows count selected
- [ ] Add "Create Custom Category" card
- [ ] Create `CustomCategoryForm.tsx` — name, full name, description
- [ ] Store selections in flow state: `category_ids[]` and `custom_categories[]`
- [ ] "Next" button enabled when at least one category is selected

**5.2 Competitor step**
- [ ] Create `CompetitorSelector.tsx` — competitors grouped by selected category
- [ ] Fetch competitors per category from `GET /api/catalog/domains/{domainId}/categories/{id}/competitors`
- [ ] Render category sections with competitor checkboxes (all checked by default)
- [ ] Create `CategoryBadge.tsx` — colored pill component for category labels
- [ ] Allow unchecking individual competitors
- [ ] Add "Add Custom Competitor" button per category section
- [ ] Create `CustomCompetitorForm.tsx` — name, short name, description
- [ ] Store selections in flow state: `competitor_ids[]` and `custom_competitors[]`
- [ ] "View Analysis" button enabled when at least one competitor is selected

**Milestone: Full guided flow works end-to-end: Domain → Persona → Categories → Competitors.**

---

### Phase 6: Pre-filled Value Curve View

**6.1 Catalog view page**
- [ ] Create `CatalogViewPage.tsx`
- [ ] On mount, call `POST /api/catalog/compose` with flow selections
- [ ] Pass returned `ValueCurveData` to existing `ValueCurveChart` component
- [ ] Show domain name and persona info in a context header above the chart
- [ ] Show `CategoryBadge` next to each competitor name in `CompetitorSidebar`
- [ ] All existing chart interactions work (hover, highlight modes, toggle competitors)

**6.2 Handle custom entries in the view**
- [ ] If custom persona was created, use its features (pass custom features to compose or handle client-side)
- [ ] If custom competitors were created, add them to the curves array (with placeholder scores of 0)
- [ ] Custom competitors render on the chart with a distinct visual indicator (e.g., dashed line)

**6.3 "Add My Product" CTA**
- [ ] Add prominent button below or beside the chart: "Add My Product"
- [ ] Clicking navigates to scoring page (or opens a modal/drawer)

**Milestone: User sees a real value curve chart populated from catalog data after completing the flow.**

---

### Phase 7: Project Save & Return

**7.1 Save from flow**
- [ ] Add "Save as Project" button on `CatalogViewPage`
- [ ] Create `SaveProjectDialog.tsx` — modal with project name (required) and description (optional)
- [ ] Implement `POST /api/projects/from-flow` on backend:
  - Accept: name, description, selections, custom_entries
  - Call compose logic to generate ValueCurveData
  - Save as `projects/{id}/data.json` with full project structure (selections + snapshot)
  - Return project ID
- [ ] After save, redirect to `/projects/:projectId`

**7.2 Project view page**
- [ ] Create `ProjectViewPage.tsx`
- [ ] Load project from `GET /api/projects/{id}/data`
- [ ] If project has `snapshot`, render it directly with `ValueCurveChart`
- [ ] If project is old-format (no snapshot), render using existing `ValueCurveData` fields
- [ ] Show project name, description, domain, persona in header
- [ ] Add "Edit Selections" button → navigates back to flow with selections pre-filled
- [ ] Add "Delete Project" with confirmation

**7.3 Recompose**
- [ ] Implement `POST /api/projects/{id}/recompose` on backend:
  - Load project's stored selections
  - Re-run compose logic against current catalog data
  - Update the snapshot field
  - Save and return updated project
- [ ] Add "Refresh from Catalog" button on `ProjectViewPage` (with confirmation: "This will update competitor scores to latest catalog data")

**7.4 Project list on landing page**
- [ ] Wire up "My Projects" section to show projects with the new structure
- [ ] Show project type indicator (catalog-backed vs. manually created)
- [ ] Sort by last updated

**Milestone: User can save an analysis as a named project, return to it from the landing page, and optionally refresh scores from catalog.**

---

### Phase 8: Product Scoring & Comparison

**8.1 Scoring interface**
- [ ] Create `ProductScorer.tsx` component
- [ ] Display each feature as a row: feature name, description, slider (0-5)
- [ ] Show competitor scores as small dots/markers alongside each slider for context
- [ ] Add optional expandable rationale textarea per feature
- [ ] Add progress indicator ("4 of 6 features scored")
- [ ] "Save Scores" button

**8.2 Wire scoring into project**
- [ ] Create `ScoreMyProductPage.tsx` (or modal/drawer from project view)
- [ ] Prompt user for product name before scoring
- [ ] Save `my_product` (name, scores, rationale) into project data via `PUT /api/projects/{id}/data`
- [ ] Update project snapshot to include "My Product" curve

**8.3 Comparison view**
- [ ] On `ProjectViewPage`, if `my_product` exists, render it as the highlighted curve (green solid line)
- [ ] Existing `OUR_SOLUTION_STYLE` logic applies — ensure "My Product" name triggers highlight
- [ ] Add `ComparisonBanner.tsx` — summary of where user's product leads/trails vs. competitors
- [ ] Banner shows: number of features where user leads, trails, and ties

**Milestone: User can score their own product and see it overlaid on the competitor value curves.**

---

### Phase 9: Breadcrumbs & Navigation Polish

- [ ] Update `Header.tsx` with breadcrumb navigation: Home > Domain > Flow Step / Project Name
- [ ] Breadcrumbs are context-aware (different for flow vs. saved project)
- [ ] Add "Back to Home" / "Back to Project" navigation from all sub-pages
- [ ] Ensure browser back button works correctly through the flow

---

### Phase 10: Additional Seed Data

- [ ] Create CISO persona + features for Security Operations
- [ ] Create SOAR category with competitors (Cortex XSOAR, Swimlane, Splunk SOAR)
- [ ] Create Hyperautomation category with competitors (Tines, Torq)
- [ ] Create score files: SOC Analyst × SOAR, SOC Analyst × Hyperautomation
- [ ] Create score files: Detection Engineer × SOAR
- [ ] Create score files: CISO × SIEM, CISO × XDR
- [ ] Review and refine all score rationale text

---

### Phase 11: Edge Cases, Loading States & Error Handling

- [ ] Loading spinners/skeletons for all API calls (domain list, persona list, compose, project load)
- [ ] Error states: failed API calls show retry option, not blank pages
- [ ] Empty states: no projects yet, no competitors selected, etc.
- [ ] Handle persona×category combinations with no pre-filled scores (show message, allow proceeding with custom data only)
- [ ] Responsive design pass: flow and chart pages work on tablet widths

---

### Future Phases (out of scope for v1)

- Authentication (OAuth/email)
- Anonymous UUID sessions
- User-submitted competitor data or score overrides
- Export/share analysis (PDF, link sharing)
- Admin interface for managing catalog data
- All 8 CISSP domains populated with seed data
- API for programmatic access
- SQLite/Postgres migration when project volume warrants it

---

## 12. Open Questions for Discussion

1. **Score range**: Standardize on 0-5 for the catalog? The current app uses this range.

2. **Catalog editability**: Should users ever be able to "override" a catalog competitor's score if they disagree? Or is the catalog purely read-only with the user only scoring their own product?

3. **Product naming**: The current app detects "Our Solution" by name. Should the user-facing version let users name their product freely, with a separate flag marking it as the user's product?

4. **Category labeling on chart**: Should competitor names on the chart include the category (e.g., "Splunk ES (SIEM)")? This makes cross-category comparison visible but makes labels longer.

5. **Custom entry validation**: When users create custom personas, categories, or competitors, what's the minimum required data? Just a name, or do we require descriptions too?

6. **Persona × Category coverage**: Not every persona needs scores for every category. How do we handle it when a user selects a persona+category combination that has no pre-filled scores? Options: (a) show empty chart with just their product, (b) disable that combination, (c) show a message encouraging them to use the admin flow for full manual entry.

---

## 13. Technical Risks & Considerations

- **Catalog data quality**: The product's value hinges on accurate, well-reasoned competitive scores. Bad seed data undermines trust. Domain experts should review initial catalog data.

- **Catalog staleness**: Product capabilities change. Need a process (even if manual) for updating catalog scores over time. Consider adding a `last_reviewed` date to score files.

- **Composability complexity**: The multi-selection model (multiple categories, multiple competitors) means the compose endpoint needs to merge data cleanly. Edge cases: what if a competitor appears in multiple categories? What if features differ slightly between score files?

- **Data model compatibility**: The final composed output matches the current `ValueCurveData` shape, so the existing chart, sidebar, and highlight logic work without modification. This is a deliberate, risk-reducing design choice.

- **File-based storage is sufficient for v1**: Catalog data is read-only JSON. Projects are stored as `projects/{id}/data.json`, same as today. The API layer abstracts storage so a future migration to SQLite or Postgres is straightforward. The inflection point for a database is when you need cross-project queries (e.g., "which competitors appear most across all projects") or when project volume exceeds what directory scanning handles well (hundreds+).

- **Custom entries live inside the project**: Custom personas, categories, and competitors are embedded in the project JSON (`custom_entries` field). This keeps them self-contained and avoids needing a shared registry. If reuse across projects becomes important later, that's a natural trigger for a database migration.

- **Snapshot + selections duality**: Projects store both the resolved `snapshot` (for instant load) and the `selections` (for re-composition). This creates a minor data duplication, but the benefits — instant project load, stability against catalog changes, and the ability to explicitly opt-in to catalog updates — outweigh the cost.
