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

## 5. User Analysis Data Model

When a user adds "My Product," we create a **user analysis** that references their selections and overlays their scores.

### User Analysis Structure

```json
{
  "id": "analysis-uuid",
  "name": "My SOC Triage Analysis",
  "domain_id": "security-operations",
  "persona_id": "soc-analyst",
  "selected_categories": ["siem", "xdr"],
  "selected_competitors": ["splunk-es", "microsoft-sentinel", "crowdstrike-falcon"],
  "custom_persona": null,
  "custom_categories": [],
  "custom_competitors": [],
  "my_product": {
    "name": "Our Platform",
    "scores": [3, 4, 2, 5, 3, 4],
    "rationale": {
      "Assess Alert Severity": "Our ML-based scoring is best-in-class...",
      "Correlate Related Alerts": "Automatic attack chain visualization..."
    }
  },
  "created_at": "2026-03-10T...",
  "updated_at": "2026-03-10T..."
}
```

At render time, the app merges catalog data + user selections + user scores into a `ValueCurveData` object, exactly as described above.

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

# Merged view (composes selections into ValueCurveData)
POST /api/catalog/compose                             → Takes selections, returns merged ValueCurveData
  Body: { domain_id, persona_id, category_ids[], competitor_ids[] }

# User analysis endpoints
GET    /api/analyses                                  → List user's saved analyses
POST   /api/analyses                                  → Create new analysis
GET    /api/analyses/{id}                             → Get analysis
PUT    /api/analyses/{id}                             → Update analysis
DELETE /api/analyses/{id}                             → Delete analysis
GET    /api/analyses/{id}/view                        → Returns full ValueCurveData with user's product merged in
```

### Existing Endpoints
All existing `/api/projects` and `/api/data` endpoints remain unchanged. The consultant workflow continues to work.

---

## 7. Frontend Changes

### New Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | `LandingPage` | CISSP domain selector grid |
| `/domain/:domainId` | `DomainFlowPage` | Multi-step guided flow: Persona → Categories → Competitors |
| `/domain/:domainId/view` | `CatalogViewPage` | Pre-filled value curves for selections |
| `/domain/:domainId/score` | `ScoreMyProductPage` | Focused scoring interface |
| `/analysis/:id` | `AnalysisViewPage` | Full comparison view with user's product |
| `/analyses` | `AnalysesListPage` | Saved analyses list |

### Preserved Routes (consultant mode)
| Route | Page | Status |
|-------|------|--------|
| `/admin` | `ProjectListPage` | Unchanged |
| `/admin/:projectId` | `ProjectEditorPage` | Unchanged |
| `/projects/:projectId` | `VisualizationPage` | Unchanged |

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

## 11. Phased Implementation Plan

### Phase 1: Catalog Infrastructure (Backend + Seed Data)
- [ ] Define TypeScript types for catalog entities (Domain, Persona, Category, Competitor, ScoreSet)
- [ ] Create `catalog/` directory structure for Security Operations domain
- [ ] Create seed data: 1 domain, 2 personas, 2 categories, ~6 competitors, 2-4 score files
- [ ] Implement catalog API endpoints on Flask backend
- [ ] Implement `/api/catalog/compose` endpoint that merges selections into ValueCurveData
- [ ] Write basic validation for catalog data format

### Phase 2: Domain Landing & Guided Flow UI
- [ ] Build `LandingPage` with domain cards
- [ ] Build `GuidedFlowStepper` component
- [ ] Build `PersonaSelector` with pre-built personas + create-custom option
- [ ] Build `CategorySelector` with multi-select + create-custom option
- [ ] Build `CompetitorSelector` with per-category grouping + create-custom option
- [ ] Update routing in `main.tsx`
- [ ] Update `Header` with breadcrumb navigation

### Phase 3: Pre-filled Value Curve View
- [ ] Build `CatalogViewPage` that loads composed data and renders existing `ValueCurveChart`
- [ ] Add "Add My Product" CTA button
- [ ] Add `CategoryBadge` to competitor sidebar
- [ ] Show persona/domain context in header area

### Phase 4: Product Scoring & Comparison
- [ ] Build `ProductScorer` component (streamlined list with sliders + competitor context)
- [ ] Implement user analysis API endpoints (CRUD under `/api/analyses`)
- [ ] Implement merge logic: catalog data + user selections + user scores → full ValueCurveData
- [ ] Build `AnalysisViewPage` showing full comparison chart
- [ ] Add `ComparisonBanner` with insight summary

### Phase 5: Polish & Expand
- [ ] Add remaining personas and score files for Security Operations
- [ ] Anonymous user sessions (UUID-based)
- [ ] `AnalysesListPage` for saved analyses
- [ ] Responsive design pass for new pages
- [ ] Loading states, error handling, empty states
- [ ] Expand seed data to a second domain

### Future Phases (out of scope for v1)
- Authentication (OAuth/email)
- User-submitted competitor data or score overrides
- Export/share analysis (PDF, link sharing)
- Admin interface for managing catalog data
- All 8 CISSP domains populated
- API for programmatic access

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

- **No database yet**: File-based storage is fine for the catalog (read-only) and a small number of user analyses. API layer abstracts storage for future migration.

- **Custom entries**: Users creating custom personas/categories/competitors need somewhere to store that data. This could be embedded in the analysis JSON or stored separately. Keeping it in the analysis keeps things simple.
