# Governing Sustainability Level: The Sustainability Golden Thread

This section documents the rationale for establishing a governing level above the program, ensuring core values—especially sustainability—are embedded at the heart of all programs and projects. This creates an unbroken line of traceability from the highest portfolio mandate down to every engineering decision.

---

## 1. Portfolio Level: The Sustainable Mandate

At this level, sustainability is a non-negotiable condition for existence. It defines the "why" and sets boundaries for the entire organization.

**How to Capture and Enforce It:**

1. **Sustainability Charter in Confluence:**
	- Foundational document in the "SCEV Strategic Portfolio" Confluence space.
	- Declares commitments: Lifecycle Principle, Net-Zero Commitment, Ethical Sourcing Mandate, Circular Economy Principles.
2. **Portfolio-Level Sustainability KPIs in Jira:**
	- Create a top-level Initiative/Theme (e.g., "Achieve Net-Zero Lifecycle & Circular Economy").
	- KPIs: Total Lifecycle Carbon Footprint, % Recycled/Sustainable Materials, Supplier Sustainability Score, Energy Return on Energy Invested (EROEI).
	- Make the Net-Zero theme a mandatory parent for all product initiatives.

---

## 2. Program Level: Sustainable by Design

Portfolio mandates are translated into engineering and design philosophy for the entire program.

**How to Capture and Enforce It:**

1. **Green Gate Review in Program Governance:**
	- Every major feature/component (Epic) must pass a "Green Gate" review before development is funded.
	- Checklist: Design for Disassembly, Material Selection Scorecard, Energy Efficiency Modeling, Software Bloat Analysis.
2. **Cascade KPIs to Program Level:**
	- Track: Projected Vehicle Energy Consumption, BOM Sustainability Score, Projected End-of-Life Recyclability %.
	- Link all technical Stories to a dedicated Epic (e.g., "Meet Program Sustainability Targets").
	- Use custom Jira fields for metrics (e.g., Recyclability %, Component Power Draw).

---

## 3. Project Level: Sustainable in Practice

Principles become reality in daily engineering decisions.

**How to Capture and Enforce It:**

1. **Sustainability Criteria in Definition of Done:**
	- Add checklist/sub-task to Jira story templates (e.g., "Sustainability Acceptance Criteria").
2. **Automate Compliance in GitHub:**
	- PR template includes "Sustainability Impact Review" section.
	- GitHub Actions enforce rules: BOM Checker, Power Consumption Linting.

**Integration:**
Sustainability discussions and compliance are enforced at every level, with traceability from code changes in GitHub to Jira Stories, Program Epics, and Portfolio Initiatives.

---

## The Result: A Future-Proof Vision

This structure ensures your vision for an energy-autonomous future is measurable, enforceable, and transparent. Every engineering decision can be traced to the overarching portfolio goal of a net-zero future, tracked in Jira and documented in Confluence.

---
# Guide: Structuring Portfolio, Program, and Project Management for the SCEV Initiative

This guide provides a comprehensive approach to integrating the Portfolio, Program, and Project hierarchy into Atlassian (Confluence, Jira) and GitHub, using the SCEV Initiative as a concrete example. The goal is to create a "golden thread" of traceability from strategic objectives down to code delivery.

---

## The Guiding Principle: The Golden Thread

- **Confluence:** For narrative and documentation (the "Why" and "How").
- **Jira:** For structured work tracking and status (the "What" and "When").
- **GitHub:** For code implementation and delivery (the "Build").

---

## 1. Portfolio Level ("The Why")

**Purpose:** Strategic direction and business goals.

**Tools:**
- Confluence Space (e.g., "SCEV Strategic Portfolio")
- Jira Align or Advanced Roadmaps Initiatives

**Artifacts:**
- Vision, Mission, Purpose Statements
- Program Business Case
- Core Values Analysis
- Market Analysis, Risk Register
- Jira Initiatives (e.g., `[SCEV-PORT] Establish Market Leadership in Energy Autonomy by 2030`)

---

## 2. Program Level ("The How")

**Purpose:** Orchestration of multiple projects to achieve portfolio goals.

**Tools:**
- Jira Software (dedicated Program Project, e.g., "SCEV Customer Experience Program")
- Advanced Roadmaps
- Confluence Space (e.g., "SCEV CX Program")

**Artifacts:**
- Program Charter
- Program Roadmap (visualized with Jira macro)
- Master Risk Register
- Stakeholder Communication Plan
- Program-level Epics (e.g., `[SCEV-2] Project Autonomy: Deliver the Energy Experience`)

---

## 3. Project Level ("The What & The Build")

**Purpose:** Execution and delivery of specific work packages.

**Tools:**
- Jira Software (Stories, Tasks, Bugs)
- GitHub (Branches, Commits, PRs)
- Confluence (Technical Documentation)

**Artifacts:**
- Jira Stories/Tasks (e.g., `[SCEV-101] Develop In-Wheel Motor Regeneration System`)
- GitHub Branches/PRs (e.g., `SCEV-101-in-wheel-regen-system`, `PR #55: feat(kinetix): SCEV-101 In-wheel regen system`)
- Technical Documentation (e.g., "In-Wheel Motor Regeneration System" page in Confluence)

**Integration Workflow:**
1. Jira story is created and linked to a program Epic and portfolio Initiative.
2. Developer creates a GitHub branch from the Jira story.
3. Commits reference the Jira key (e.g., `SCEV-101`).
4. Pull Request references the Jira key and links back to the story.
5. Jira ticket updates automatically with branch, commit, PR, and build status.
6. Technical documentation is maintained in Confluence and linked to Jira issues.

---

## Summary Table

| Level      | Purpose                  | Atlassian/GitHub Artifacts                                   | Example                                                      |
|------------|--------------------------|--------------------------------------------------------------|--------------------------------------------------------------|
| Portfolio  | Strategic Direction      | Confluence Space, Jira Initiative                            | `[SCEV-PORT] Lead in Energy Autonomy`                        |
| Program    | Orchestration            | Jira Project, Epics, Confluence Space, Roadmaps              | `[SCEV-2] Project Autonomy: The Energy Experience`            |
| Project    | Execution (What/Build)   | Stories, Tasks, GitHub Branches/PRs, Confluence Tech Docs    | `[SCEV-101] Develop In-Wheel Regen System`, `PR #55`          |

---

By following this structure, you ensure complete traceability and alignment from high-level business goals to code delivery, with all supporting documentation logically organized and accessible.
