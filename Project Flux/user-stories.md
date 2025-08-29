## Project Flux User Stories

---

**Jira Key:** `[FLUX-101]`
**Jira Title:** Assess Impact of Wireless EV Charging Infrastructure

**1. Core User Story**
> **As a** city planner,
> **I want to** assess the impact of wireless EV charging infrastructure,
> **so that** I can make informed decisions about urban mobility.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Impact assessment
> **Given** new wireless charging infrastructure is proposed,
> **When** assessment is performed,
> **Then** the system provides data on mobility, energy use, and urban impact.

> **Scenario 2:** Data reporting
> **Given** assessment data is available,
> **When** the planner reviews it,
> **Then** the system generates actionable reports.

**3. Stakeholder Perspectives & Requirements**
*   **City Planner:**
	*   *UX Requirement:* Data and reports must be clear and actionable.
	*   *Value Requirement:* Enables informed urban planning.

*   **Technical Team:**
	*   *Functional Requirement:* Must support data collection and analysis.
	*   *Technical Constraint:* Must comply with city data standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Support city adoption of EV infrastructure.
	*   *Priority:* High for urban mobility.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Infrastructure must not compromise public safety.
	*   *Regulatory Requirement:* Must comply with city and environmental standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Assessment results within 1 week of proposal.
*   **Reliability:** 99.9% uptime for assessment system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all city sizes.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[FLUX-EPIC-01] Urban Mobility Planning`
*   **Parent Project:** `Project: Flux`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize Urban EV Adoption"

**6. Definition of Done (DoD)**
*   [ ] Impact assessment system implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[FLUX-102]`
**Jira Title:** Seamless Charging Experiences at Public Locations

**1. Core User Story**
> **As an** EV owner,
> **I want** seamless charging experiences at public locations,
> **so that** I can reduce range anxiety.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Successful public charging
> **Given** an EV owner arrives at a public charging location,
> **When** charging is initiated,
> **Then** the system provides a seamless experience and confirms connection.

> **Scenario 2:** Charging failure
> **Given** a charging attempt,
> **When** the system fails,
> **Then** the user is notified and troubleshooting steps are provided.

**3. Stakeholder Perspectives & Requirements**
*   **EV Owner:**
	*   *UX Requirement:* Charging process must be intuitive and reliable.
	*   *Value Requirement:* Reduces range anxiety and increases satisfaction.

*   **Technical Team:**
	*   *Functional Requirement:* Must support all public charging locations.
	*   *Technical Constraint:* Must comply with charging standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Increase public EV adoption.
	*   *Priority:* High for user experience.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Charging must not compromise safety.
	*   *Regulatory Requirement:* Must comply with public safety standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Charging initiation within 1 minute.
*   **Reliability:** 99.9% uptime for public charging system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all public locations.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[FLUX-EPIC-02] Public Charging Experience`
*   **Parent Project:** `Project: Flux`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Charging Convenience"

**6. Definition of Done (DoD)**
*   [ ] Public charging system implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[FLUX-103]`
**Jira Title:** Alerts for Charging Station Faults

**1. Core User Story**
> **As a** maintenance crew member,
> **I want** alerts for charging station faults,
> **so that** I can ensure high uptime.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Fault detected
> **Given** a charging station is operational,
> **When** a fault occurs,
> **Then** the system sends an alert and logs the event.

> **Scenario 2:** Fault resolution
> **Given** a fault alert is received,
> **When** the crew responds,
> **Then** the system tracks resolution and confirms uptime.

**3. Stakeholder Perspectives & Requirements**
*   **Maintenance Crew Member:**
	*   *UX Requirement:* Alerts must be timely and actionable.
	*   *Value Requirement:* Maximizes uptime and reliability.

*   **Technical Team:**
	*   *Functional Requirement:* Must support fault detection and alerting.
	*   *Technical Constraint:* Must comply with station standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Improve reliability and reduce downtime.
	*   *Priority:* High for operational excellence.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Alerts must not compromise safety.
	*   *Regulatory Requirement:* Must comply with public safety standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Fault alerts within 2 minutes of detection.
*   **Reliability:** 99.95% uptime for alerting system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all station types.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[FLUX-EPIC-03] Charging Station Reliability`
*   **Parent Project:** `Project: Flux`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize Charging Station Uptime"

**6. Definition of Done (DoD)**
*   [ ] Fault alerting system implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

---

**Epic:** Automatic Wireless Charging at Home
> **As a** vehicle owner,
> **I want** my car to start charging automatically the moment I park in my garage,
> **so that** I never have to remember to plug it in.

**Jira Key:** `[FLUX-104]`
**Jira Title:** In-Car Display Guidance for Charging Pad Position

**1. Core User Story**
> **As a** driver,
> **I want** the in-car display to guide me to the correct parking position over the charging pad for a successful connection,
> **so that** I can easily initiate wireless charging at home.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Parking guidance
> **Given** a vehicle is approaching the charging pad,
> **When** the driver uses the in-car display,
> **Then** the system provides real-time guidance and confirms correct position.

> **Scenario 2:** Connection failure
> **Given** a parking attempt,
> **When** the connection fails,
> **Then** the system notifies the driver and suggests corrective actions.

**3. Stakeholder Perspectives & Requirements**
*   **Driver:**
	*   *UX Requirement:* Guidance must be clear and responsive.
	*   *Value Requirement:* Simplifies charging initiation.

*   **Technical Team:**
	*   *Functional Requirement:* Must support real-time display and feedback.
	*   *Technical Constraint:* Must comply with vehicle UI standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Improve user experience and charging convenience.
	*   *Priority:* High for home charging adoption.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Guidance must not distract or compromise safety.
	*   *Regulatory Requirement:* Must comply with automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Guidance updates within 1 second.
*   **Reliability:** 99.9% uptime for display system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all vehicle models.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[FLUX-EPIC-04] Home Charging Experience`
*   **Parent Project:** `Project: Flux`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize Home Charging Convenience"

**6. Definition of Done (DoD)**
*   [ ] Parking guidance system implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[FLUX-105]`
**Jira Title:** Wireless Charging Session Monitoring via Mobile App

**1. Core User Story**
> **As a** vehicle owner,
> **I want** to monitor the status of the wireless charging session (e.g., power rate, time to full) from my mobile app,
> **so that** I can stay informed about charging progress.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Session monitoring
> **Given** a wireless charging session is active,
> **When** the owner opens the mobile app,
> **Then** the system displays real-time status and estimated time to full charge.

> **Scenario 2:** App failure
> **Given** a charging session is active,
> **When** the app fails to display status,
> **Then** the system logs the event and provides troubleshooting steps.

**3. Stakeholder Perspectives & Requirements**
*   **Vehicle Owner:**
	*   *UX Requirement:* Status must be clear and accessible.
	*   *Value Requirement:* Increases confidence and convenience.

*   **Technical Team:**
	*   *Functional Requirement:* Must support real-time data display.
	*   *Technical Constraint:* Must comply with mobile app standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Improve user experience and charging transparency.
	*   *Priority:* High for mobile integration.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Status display must not compromise safety.
	*   *Regulatory Requirement:* Must comply with app and automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Status updates within 2 seconds.
*   **Reliability:** 99.9% uptime for app and charging system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all vehicle models and app platforms.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[FLUX-EPIC-05] Mobile Charging Experience`
*   **Parent Project:** `Project: Flux`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize Mobile Charging Transparency"

**6. Definition of Done (DoD)**
*   [ ] Mobile app charging session monitoring implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[FLUX-106]`
**Jira Title:** Safety for People and Pets Near Charging Vehicle

**1. Core User Story**
> **As an** engineer,
> **I need to** design the system to be safe for people and pets who may be near the vehicle while it is charging,
> **so that** the charging process does not pose any health or safety risks.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Safety features implemented
> **Given** a vehicle is charging wirelessly,
> **When** people or pets are detected nearby,
> **Then** the system activates safety features and logs the event.

> **Scenario 2:** Safety failure
> **Given** a charging session is active,
> **When** safety features fail,
> **Then** the system logs the event and provides troubleshooting steps.

**3. Stakeholder Perspectives & Requirements**
*   **Engineer:**
	*   *UX Requirement:* Safety features must be reliable and unobtrusive.
	*   *Value Requirement:* Ensures public trust and safety.

*   **Technical Team:**
	*   *Functional Requirement:* Must support detection and safety activation.
	*   *Technical Constraint:* Must comply with safety standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Ensure safety and regulatory compliance.
	*   *Priority:* High for public acceptance.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Safety features must not compromise charging efficiency.
	*   *Regulatory Requirement:* Must comply with health and safety standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Safety activation within 1 second of detection.
*   **Reliability:** 99.95% uptime for safety system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all vehicle models and environments.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[FLUX-EPIC-06] Charging Safety`
*   **Parent Project:** `Project: Flux`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize Charging Safety"

**6. Definition of Done (DoD)**
*   [ ] Safety system implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[FLUX-107]`
**Jira Title:** Achieve Over 94% Grid-to-Battery Efficiency

**1. Core User Story**
> **As an** engineer,
> **I need to** ensure the wireless charging system achieves over 94% grid-to-battery efficiency to minimize energy waste,
> **so that** the system is environmentally and economically sustainable.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Efficiency achieved
> **Given** a wireless charging session is active,
> **When** energy is transferred,
> **Then** the system achieves >94% efficiency and logs results.

> **Scenario 2:** Efficiency failure
> **Given** a charging session is active,
> **When** efficiency drops below target,
> **Then** the system logs the event and provides troubleshooting steps.

**3. Stakeholder Perspectives & Requirements**
*   **Engineer:**
	*   *UX Requirement:* Efficiency data must be accessible and clear.
	*   *Value Requirement:* Minimizes energy waste and cost.

*   **Technical Team:**
	*   *Functional Requirement:* Must support real-time efficiency monitoring.
	*   *Technical Constraint:* Must comply with energy standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Improve sustainability and cost-effectiveness.
	*   *Priority:* High for market adoption.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Efficiency must not compromise safety.
	*   *Regulatory Requirement:* Must comply with energy and safety standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Efficiency monitoring within 2 seconds.
*   **Reliability:** 99.9% uptime for efficiency system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all vehicle models and charging stations.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[FLUX-EPIC-07] Charging Efficiency`
*   **Parent Project:** `Project: Flux`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize Charging Efficiency"

**6. Definition of Done (DoD)**
*   [ ] Efficiency system implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Epic:** Bi-Directional Wireless Charging & Vehicle-to-Home Backup
> **As a** homeowner and EV owner,
> **I want** my vehicle's wireless charging system to support bi-directional energy flow, enabling vehicle-to-home backup for up to three days,
> **so that** excess battery capacity can power my home during outages or peak demand.

**Jira Key:** `[FLUX-108]`
**Jira Title:** Bi-Directional Wireless Charging & Vehicle-to-Home Backup

**1. Core User Story**
> **As a** homeowner and EV owner,
> **I want** my vehicle's wireless charging system to support bi-directional energy flow, enabling vehicle-to-home backup for up to three days,
> **so that** excess battery capacity can power my home during outages or peak demand.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Vehicle-to-home backup activation
> **Given** the vehicle battery is fully charged and connected to the home via wireless charging,
> **When** the home requests backup power,
> **Then** the system supplies energy from the vehicle battery to the home for up to three days, within safe operating limits.

> **Scenario 2:** Overcapacity management
> **Given** the vehicle battery has excess capacity,
> **When** the system detects overcapacity,
> **Then** the surplus energy is made available for home backup or grid support.

> **Scenario 3:** Safety and compliance
> **Given** bi-directional charging is active,
> **When** a fault or unsafe condition is detected,
> **Then** the system isolates the vehicle and home, logs the event, and notifies the user.

**3. Stakeholder Perspectives & Requirements**
*   **Homeowner/EV Owner:**
    *   *UX Requirement:* Backup activation must be simple and status clearly displayed.
    *   *Value Requirement:* Reliable home backup during outages or peak demand.

*   **Technical Team:**
    *   *Functional Requirement:* Must support bi-directional wireless energy transfer and safe isolation.
    *   *Technical Constraint:* Must comply with home electrical codes and vehicle standards.

*   **Business/Product Owner:**
    *   *Business Goal:* Enhance value proposition of EV ownership and home energy resilience.
    *   *Priority:* High for market differentiation.

*   **Safety & Compliance:**
    *   *Safety Requirement:* System must prevent unsafe energy transfer and comply with all regulations.
    *   *Regulatory Requirement:* Must meet local grid interconnection and home backup standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Backup power activation within 30 seconds of request.
*   **Reliability:** 99.95% uptime for bi-directional charging system.
*   **Security:** Data and energy transfer must be protected from unauthorized access.
*   **Scalability:** Must support various home sizes and vehicle models.
*   **Durability:** Must operate in all climates and withstand repeated cycles.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[FLUX-EPIC-08] Vehicle-to-Home Energy Backup`
*   **Parent Project:** `Project: Flux`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize Home Energy Resilience and EV Value"

**6. Definition of Done (DoD)**
*   [ ] Bi-directional wireless charging and vehicle-to-home backup system implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.