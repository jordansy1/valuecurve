# Value Curve App Enhancement Plan: User-Facing Competitive Analysis

## 1. Overview

### Current State
The app is a consultant-facing tool where an analyst manually creates projects by defining an industry, competitors, features, and value scores. All data is entered from scratch. The data model is simple: a project contains an industry, a user persona (text), features, and competitor value curves (0-5 scores per feature).

### Goal
Transform the app into a **user-facing product** that lets engineers and designers quickly understand their product's competitive position. Instead of building everything from scratch, users select a **job to be done**, pick a **user persona**, and immediately see pre-filled competitive analysis from a curated catalog. They then add their own product to see where they stand.

### Key Design Insight: Jobs as the Top-Level Entity
The previous draft organized the catalog by **product category** (SIEM, EDR, etc.). This is the wrong entry point for users. Instead, the top-level concept is the **User Job** from the Jobs-To-Be-Done framework.

A job like "Triage Security Alerts" cuts across multiple product categories - SIEM, XDR, SOAR, and hyperautomation platforms all compete to fulfill this job. By starting with the job, we:
- Speak the user's language (they think about what they're trying to accomplish, not vendor categories)
- Surface **cross-category competition** (the most strategically interesting insight)
- Naturally align with value curve methodology, which measures how well solutions deliver value for a specific job

Product categories become metadata about *where a competitor comes from*, not the organizing principle.

---

## 2. New User Flow

```
┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐
│  Log In /    │───>│  Select a Job    │───>│  Select User       │
│  Landing     │    │  To Be Done      │    │  Persona           │
└──────────────┘    └──────────────────┘    └────────────────────┘
                    │ "Triage Security  │    │ "SOC Analyst at    │
                    │  Alerts"          │    │  a mid-sized bank" │
                    └──────────────────┘    └────────────────────┘
                                                      │
                    ┌──────────────────┐               │
                    │  Compare View:   │<──────────────┘
                    │  Pre-filled      │
                    │  competitor      │
                    │  value curves    │
                    │  (cross-category)│
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
                    │  Your product    │
                    │  overlaid on     │
                    │  competitors     │
                    └──────────────────┘
```

### Step-by-Step

1. **Landing Page** - User sees a curated list of user jobs, grouped by domain (e.g., "Security Operations" contains "Triage Security Alerts", "Investigate Incidents", "Hunt for Threats"). Each job card shows the job description and the number of competing solutions analyzed.
2. **Job Selected** - User picks a job (e.g., "Triage Security Alerts"). The app shows available user personas for this job, since the value of solutions depends on who is performing the job.
3. **Persona Selected** - User picks a persona (e.g., "SOC Analyst at a mid-sized enterprise"). The app loads pre-filled value curves for competitors across all relevant product categories (SIEM, XDR, SOAR, etc.), scored from that persona's perspective.
4. **Pre-filled View** - User sees the value curve chart with competitors drawn from multiple product categories. Competitors can be labeled with their category for context. Toggle, highlight, etc. all work as today.
5. **"Add My Product"** - User clicks a CTA to add their own product. A focused scoring interface appears where they rate their product on each feature (0-5 scale) with optional rationale.
6. **Full Comparison** - The chart now shows "My Product" as the green solid line overlaid on the cross-category competitor curves. Advantage/disadvantage highlighting reveals where the user's product leads or trails.

---

## 3. Core Concepts & Data Model

### Conceptual Hierarchy

```
Domain (e.g., "Security Operations")
  └── Job (e.g., "Triage Security Alerts")
        ├── related_categories: [SIEM, XDR, SOAR, Hyperautomation]
        ├── Personas: [SOC Analyst, Detection Engineer, SOC Manager]
        └── Per Persona:
              ├── Competitive Factors (features relevant to this job+persona)
              ├── Competitors (drawn from across related categories)
              └── Value scores per competitor × feature
```

### Key Relationships
- **Job → Product Categories**: Many-to-many. A job can be addressed by products from multiple categories. A category can be relevant to multiple jobs.
- **Job → Personas**: One-to-many. Each job has several personas who perform that job differently and value different things.
- **Job + Persona → Features**: The competitive factors are specific to a job+persona combination. A SOC Analyst triaging alerts cares about "Time to First Response" while a SOC Manager cares about "Team Workload Visibility."
- **Job + Persona → Competitors**: Competitors are drawn from across the related product categories. Each competitor is scored on the persona-specific features.

### Why This Works
The insight is that when a user says "I'm building a product that helps SOC Analysts triage alerts better," the competition isn't just other SIEM products. It's also SOAR platforms, XDR tools, and even hyperautomation platforms. Starting from the job naturally surfaces this cross-category competition.

---

## 4. Catalog Schema

### Directory Structure

```
catalog/
├── domains.json                              # Top-level groupings
├── jobs/
│   ├── jobs.json                             # Master list of all jobs
│   ├── triage-security-alerts/
│   │   ├── job.json                          # Job metadata + related categories
│   │   ├── competitors.json                  # All competitors for this job (cross-category)
│   │   └── personas/
│   │       ├── soc-analyst.json              # Full value curve data
│   │       ├── detection-engineer.json
│   │       └── soc-manager.json
│   ├── investigate-security-incidents/
│   │   ├── job.json
│   │   ├── competitors.json
│   │   └── personas/
│   │       ├── ir-analyst.json
│   │       └── ir-lead.json
│   └── hunt-for-threats/
│       ├── ...
├── categories/
│   └── categories.json                       # Reference list of product categories
```

### domains.json
```json
[
  {
    "id": "security-operations",
    "name": "Security Operations",
    "description": "Jobs related to detecting, triaging, investigating, and responding to security threats",
    "icon": "shield",
    "job_count": 5
  }
]
```

### jobs/jobs.json
```json
[
  {
    "id": "triage-security-alerts",
    "domain_id": "security-operations",
    "name": "Triage Security Alerts",
    "description": "Rapidly assess, prioritize, and route security alerts to determine which require investigation",
    "related_categories": ["siem", "xdr", "soar", "hyperautomation"],
    "persona_count": 3,
    "competitor_count": 8
  },
  {
    "id": "investigate-security-incidents",
    "domain_id": "security-operations",
    "name": "Investigate Security Incidents",
    "description": "Deep-dive into confirmed incidents to determine scope, impact, root cause, and remediation steps",
    "related_categories": ["siem", "xdr", "edr", "dfir"],
    "persona_count": 2,
    "competitor_count": 6
  }
]
```

### categories/categories.json (reference data)
```json
[
  {
    "id": "siem",
    "name": "SIEM",
    "full_name": "Security Information and Event Management",
    "description": "Centralized log collection, correlation, and threat detection"
  },
  {
    "id": "xdr",
    "name": "XDR",
    "full_name": "Extended Detection and Response",
    "description": "Cross-domain detection and response across endpoints, network, cloud, and email"
  },
  {
    "id": "soar",
    "name": "SOAR",
    "full_name": "Security Orchestration, Automation and Response",
    "description": "Automated playbooks and case management for incident response"
  },
  {
    "id": "hyperautomation",
    "name": "Hyperautomation",
    "full_name": "Hyperautomation Platforms",
    "description": "General-purpose automation platforms applied to security workflows"
  }
]
```

### jobs/triage-security-alerts/job.json
```json
{
  "id": "triage-security-alerts",
  "domain_id": "security-operations",
  "name": "Triage Security Alerts",
  "description": "Rapidly assess, prioritize, and route security alerts to determine which require investigation",
  "long_description": "Alert triage is one of the most time-consuming and critical functions in security operations. Analysts must quickly determine if an alert is a true positive, assess its severity, gather relevant context, and either escalate or close it. The explosion of alerts from multiple security tools makes this job increasingly difficult and a primary source of analyst burnout.",
  "related_categories": ["siem", "xdr", "soar", "hyperautomation"]
}
```

### jobs/triage-security-alerts/competitors.json
```json
[
  {
    "id": "splunk-es",
    "name": "Splunk Enterprise Security",
    "short_name": "Splunk ES",
    "category_id": "siem",
    "description": "Industry-leading SIEM with risk-based alerting and powerful search"
  },
  {
    "id": "microsoft-sentinel",
    "name": "Microsoft Sentinel",
    "short_name": "Sentinel",
    "category_id": "siem",
    "description": "Cloud-native SIEM with AI-driven incident correlation"
  },
  {
    "id": "crowdstrike-falcon",
    "name": "CrowdStrike Falcon",
    "short_name": "CrowdStrike",
    "category_id": "xdr",
    "description": "XDR platform with endpoint-first detection and response"
  },
  {
    "id": "palo-alto-xsiam",
    "name": "Palo Alto XSIAM",
    "short_name": "XSIAM",
    "category_id": "xdr",
    "description": "AI-driven security operations platform"
  },
  {
    "id": "cortex-xsoar",
    "name": "Cortex XSOAR",
    "short_name": "XSOAR",
    "category_id": "soar",
    "description": "SOAR platform with automated playbooks and case management"
  },
  {
    "id": "tines",
    "name": "Tines",
    "short_name": "Tines",
    "category_id": "hyperautomation",
    "description": "No-code security automation platform"
  }
]
```

### jobs/triage-security-alerts/personas/soc-analyst.json

This is the core data file. It matches the existing `ValueCurveData` shape so the chart renders it directly:

```json
{
  "persona": {
    "id": "soc-analyst",
    "name": "SOC Analyst (Tier 1-2)",
    "description": "Frontline analyst who triages alerts, performs initial investigation, and escalates confirmed incidents",
    "context": "Mid-sized enterprise SOC, handles 200-500 alerts per day"
  },
  "industry": "Security Alert Triage Solutions",
  "user_persona": "SOC Analyst (Tier 1-2) at a mid-sized enterprise",
  "user_jobs": [
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
  ],
  "features": [
    "Assess Alert Severity",
    "Gather Context",
    "Reduce False Positives",
    "Correlate Related Alerts",
    "Escalate with Context",
    "Track Alert Throughput"
  ],
  "curves": [
    {
      "customer_profile": "Splunk ES (SIEM)",
      "relative_customer_value": [3, 4, 2, 3, 2, 3]
    },
    {
      "customer_profile": "Sentinel (SIEM)",
      "relative_customer_value": [3, 3, 3, 4, 3, 3]
    },
    {
      "customer_profile": "CrowdStrike (XDR)",
      "relative_customer_value": [4, 3, 4, 4, 3, 2]
    },
    {
      "customer_profile": "XSOAR (SOAR)",
      "relative_customer_value": [2, 2, 3, 2, 4, 4]
    },
    {
      "customer_profile": "Tines (Hyperautomation)",
      "relative_customer_value": [1, 2, 3, 1, 3, 4]
    }
  ],
  "rationale": {
    "Splunk ES (SIEM)": {
      "Assess Alert Severity": "Risk-based alerting assigns risk scores, but requires significant tuning...",
      "Gather Context": "SPL search is extremely powerful for ad-hoc context gathering..."
    }
  }
}
```

**Note on competitor labels**: Competitor names include the category in parentheses (e.g., "Splunk ES (SIEM)") so users can see cross-category competition directly on the chart. This is a simple convention that works with the existing chart code.

---

## 5. User Analysis Data Model

When a user adds "My Product," we create a **user analysis** that references the catalog data and overlays the user's scores.

### User Analysis Structure

```json
{
  "id": "analysis-uuid",
  "name": "My Alert Triage Analysis",
  "job_id": "triage-security-alerts",
  "persona_id": "soc-analyst",
  "my_product": {
    "name": "Our Platform",
    "category_id": "xdr",
    "scores": [3, 4, 2, 5, 3, 4],
    "rationale": {
      "Assess Alert Severity": "Our ML-based scoring is best-in-class...",
      "Correlate Related Alerts": "Automatic attack chain visualization..."
    }
  },
  "created_at": "2026-03-03T...",
  "updated_at": "2026-03-03T..."
}
```

At render time, the app merges catalog data + user analysis to produce a full `ValueCurveData` object:
- `features` and `user_jobs` come from the catalog persona file
- `curves` = catalog competitor curves + user's "Our Solution" curve
- Highlight logic works as-is (detects "Our Solution" naming)

---

## 6. Backend API Changes

### New Endpoints

```
# Catalog endpoints (read-only)
GET  /api/catalog/domains                     → List all domains
GET  /api/catalog/jobs                        → List all jobs (optionally filter by domain)
GET  /api/catalog/jobs/{job_id}               → Job details + persona list + competitor list
GET  /api/catalog/jobs/{job_id}/personas/{persona_id}
                                              → Full pre-filled value curve data
GET  /api/catalog/categories                  → Reference list of product categories

# User analysis endpoints
GET  /api/analyses                            → List user's saved analyses
POST /api/analyses                            → Create new analysis
GET  /api/analyses/{id}                       → Get analysis (merged with catalog data)
PUT  /api/analyses/{id}                       → Update user's product scores
DELETE /api/analyses/{id}                     → Delete analysis

# Merged view endpoint (convenience)
GET  /api/analyses/{id}/view                  → Returns full ValueCurveData shape
                                                 with catalog + user data merged
```

### Catalog Loading
The catalog data lives as static JSON files under `catalog/`. The Flask backend reads them on-demand. No write endpoints for catalog data - seed data is managed via JSON files directly.

### Existing Endpoints
All existing `/api/projects` and `/api/data` endpoints remain unchanged. The consultant workflow (manual project creation) continues to work. The new catalog/analysis flow is additive.

---

## 7. Frontend Changes

### New Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | `LandingPage` | Job browser grouped by domain |
| `/job/:jobId` | `JobPage` | Job details + persona selector cards |
| `/job/:jobId/persona/:personaId` | `PersonaViewPage` | Pre-filled cross-category value curves + "Add My Product" CTA |
| `/job/:jobId/persona/:personaId/score` | `ScoreMyProductPage` | Focused scoring interface for user's product |
| `/analysis/:id` | `AnalysisViewPage` | Full comparison view (reuses VisualizationPage) |

### Preserved Routes (consultant mode)
| Route | Page | Status |
|-------|------|--------|
| `/admin` | `ProjectListPage` | Unchanged |
| `/admin/:projectId` | `ProjectEditorPage` | Unchanged |
| `/projects/:projectId` | `VisualizationPage` | Renamed from `/?project=` for clarity |

### New Components

**`DomainSection`** - A collapsible section for a domain (e.g., "Security Operations") containing `JobCard` components. Used on LandingPage.

**`JobCard`** - Card displaying a job with name, description, related category badges (e.g., "SIEM", "XDR", "SOAR" as colored pills), and competitor/persona counts. Clicking navigates to the job page.

**`PersonaCard`** - Card displaying a user persona with name, role description, context. Used on JobPage. Selecting a card navigates to the persona view.

**`CategoryBadge`** - Small colored pill/tag showing a product category name (e.g., "SIEM", "SOAR"). Used on job cards and potentially on the chart legend to show which category each competitor belongs to.

**`PersonaViewPage`** - Wraps the existing `ValueCurveChart` with catalog data. Adds a prominent "Add My Product" button. Shows persona details and job context in a header section.

**`ProductScorer`** - Focused scoring interface (see Section 8 for design details).

**`ComparisonBanner`** - Banner summarizing key insights on the comparison view.

### Modified Components

**`Header`** - Add navigation breadcrumbs: Home > Job > Persona > My Analysis

**`ValueCurveChart`** - No changes needed to the chart itself. Data shape is identical.

**`CompetitorSidebar`** - Minor: show category badge next to each competitor name so users can see which product category each competitor belongs to.

---

## 8. Scoring Interface Design

### Recommendation: Streamlined List with Competitor Context

Show all features as a compact vertical list. For each feature:
- Feature name and description
- Slider (0-5)
- Small dot-plot or mini bar chart showing where each competitor scores on this feature (provides context without requiring the user to memorize numbers)
- Optional expandable rationale textarea
- Progress indicator (e.g., "4 of 6 features scored")

This approach is fast for power users while providing enough context for first-time users to make informed scoring decisions.

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

Start with a narrow, high-quality set focused on Security Operations:

### Domain: Security Operations

**Jobs:**
1. **Triage Security Alerts** - Competitors from: SIEM, XDR, SOAR, Hyperautomation
2. **Investigate Security Incidents** - Competitors from: SIEM, XDR, EDR, DFIR
3. **Hunt for Threats** - Competitors from: SIEM, XDR, EDR, Threat Intel Platforms

**Personas per Job (2-3 each):**
- Triage: SOC Analyst (Tier 1-2), SOC Manager, Detection Engineer
- Investigate: IR Analyst, IR Lead
- Hunt: Threat Hunter, SOC Manager

**Competitors (across categories):**
- SIEM: Splunk ES, Microsoft Sentinel, Elastic Security, IBM QRadar
- XDR: CrowdStrike Falcon, Palo Alto XSIAM, Microsoft Defender XDR
- SOAR: Cortex XSOAR, Swimlane, Splunk SOAR
- Hyperautomation: Tines, Torq
- EDR: CrowdStrike, SentinelOne, Carbon Black

**Features per Job+Persona: 5-8**
Curated to be the most meaningful competitive differentiators for each combination.

### Scoring Approach
Initial scores based on publicly available analyst reports, product documentation, and industry knowledge. Each score includes rationale text for transparency.

---

## 11. Phased Implementation Plan

### Phase 1: Catalog Infrastructure (Backend + Seed Data)
- [ ] Define TypeScript types for new catalog entities (Domain, Job, Persona, CatalogView)
- [ ] Create `catalog/` directory structure
- [ ] Create seed data for 1 job ("Triage Security Alerts") with 2 personas and ~6 competitors
- [ ] Implement catalog API endpoints on Flask backend
- [ ] Write basic validation for catalog data format

### Phase 2: Job & Persona Selection UI
- [ ] Build `LandingPage` with domain sections and job cards
- [ ] Build `JobPage` with persona cards and job details
- [ ] Build `CategoryBadge` component
- [ ] Update routing in `main.tsx`
- [ ] Update `Header` with breadcrumb navigation

### Phase 3: Pre-filled Value Curve View
- [ ] Build `PersonaViewPage` that loads catalog persona data and renders existing `ValueCurveChart`
- [ ] Add "Add My Product" CTA button
- [ ] Show persona/job context in header
- [ ] Add category badges to competitor sidebar

### Phase 4: Product Scoring & Comparison
- [ ] Build `ProductScorer` component (streamlined list with sliders + competitor context)
- [ ] Implement user analysis API endpoints (CRUD under `/api/analyses`)
- [ ] Implement merge logic: catalog data + user scores → full `ValueCurveData`
- [ ] Build `AnalysisViewPage` showing full comparison chart
- [ ] Add `ComparisonBanner` with insight summary

### Phase 5: Polish & Expand
- [ ] Add remaining seed data jobs (Investigate, Hunt)
- [ ] Anonymous user sessions (UUID-based)
- [ ] Saved analyses list page
- [ ] Responsive design pass for new pages
- [ ] Loading states, error handling, empty states

### Future Phases (out of scope for v1)
- Authentication (OAuth/email)
- User-submitted competitor data or score overrides
- Export/share analysis (PDF, link sharing)
- Admin interface for managing catalog data
- Additional domains beyond Security Operations
- API for programmatic access

---

## 12. Open Questions for Discussion

1. **Job granularity**: How specific should jobs be? "Triage Security Alerts" is fairly specific. Should we also have broader jobs like "Run a Security Operations Center" that encompass multiple sub-jobs? Or keep jobs atomic and let users pick multiple?

2. **Competitor overlap across jobs**: Many competitors (e.g., Splunk ES) appear across multiple jobs. Should competitor metadata (name, description, category) be defined once and referenced, or duplicated per job? (The plan currently duplicates per job for simplicity, but a shared competitor registry might be cleaner.)

3. **Feature overlap across personas within a job**: For the same job, different personas may share some features but not all. Should we allow partial overlap, or require completely distinct feature sets per persona?

4. **Score range**: Standardize on 0-5 for the catalog? The current app uses this range.

5. **Catalog editability**: Should users ever be able to "override" a catalog competitor's score if they disagree? Or is the catalog purely read-only with the user only scoring their own product?

6. **Product naming**: The current app detects "Our Solution" by name. Should the user-facing version let users name their product freely, with a separate flag marking it as the user's product?

7. **Category as filter**: On the value curve view, should users be able to filter competitors by category? E.g., "Show me only SIEM competitors" vs "Show all." This would be a natural extension of the existing competitor sidebar.

---

## 13. Technical Risks & Considerations

- **Catalog data quality**: The product's value hinges on accurate, well-reasoned competitive scores. Bad seed data undermines trust. Domain experts should review initial catalog data.

- **Catalog staleness**: Product capabilities change. Need a process (even if manual) for updating catalog scores over time. Consider adding a `last_reviewed` date to catalog data.

- **Cross-category comparison validity**: Comparing products from different categories on the same features is conceptually valid (they all compete for the same job) but may require careful feature definition. A SOAR platform and a SIEM do fundamentally different things, so features should be framed as outcomes ("Reduce time to assess severity") rather than capabilities ("Run SPL queries").

- **Data model compatibility**: The persona-view JSON matches the current `ValueCurveData` shape, which means the existing chart, sidebar, and highlight logic work without modification. This is deliberate.

- **No database yet**: File-based storage is fine for the catalog (read-only) and a small number of user analyses. API layer abstracts storage for future migration.
