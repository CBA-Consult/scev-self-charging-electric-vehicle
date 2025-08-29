## Project Guardian User Stories
---

**Jira Key:** `[GUARDIAN-110]`
**Jira Title:** TEG Sensors-Initiated Component Shutdown for Overheating Prevention

**1. Core User Story**
> **As a** system safety engineer,
> **I want** TEG sensors to inform the right vehicle components to shut down to prevent overheating,
> **so that** the vehicle remains safe and critical systems are protected from heat damage.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Overheating detected and shutdown triggered
> **Given** TEG sensors are installed and monitoring,
> **When** a component's temperature exceeds safety limits,
> **Then** the sensor signals the system to shut down the affected component and logs the event.

> **Scenario 2:** Multiple components at risk
> **Given** TEG sensors are installed and monitoring,
> **When** multiple components exceed safety limits,
> **Then** the system prioritizes shutdowns based on criticality and notifies the user.

> **Scenario 3:** Shutdown failure
> **Given** TEG sensors are installed,
> **When** a shutdown signal fails,
> **Then** the system logs the failure and provides troubleshooting steps.

**3. Stakeholder Perspectives & Requirements**
*   **System Safety Engineer:**
	*   *UX Requirement:* Shutdown actions and logs must be accessible and clear.
	*   *Value Requirement:* Maximizes vehicle safety and component longevity.

*   **Technical Team:**
	*   *Functional Requirement:* Must support automated shutdown and prioritization logic.
	*   *Technical Constraint:* Must comply with automotive safety and control standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Reduce risk of heat-related failures and warranty claims.
	*   *Priority:* High for safety and reliability.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Shutdowns must not compromise overall vehicle safety or user control.
	*   *Regulatory Requirement:* Must comply with automotive safety regulations.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Shutdown actions executed within 2 seconds of threshold breach.
*   **Reliability:** 99.95% success rate for shutdown signals.
*   **Security:** Shutdown logic must be protected from unauthorized access.
*   **Scalability:** Must support all vehicle models and component types.
*   **Durability:** Must operate in all climates and withstand repeated cycles.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[GUARDIAN-EPIC-01] Vehicle Safety Monitoring`
*   **Parent Project:** `Project: Guardian`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Safety and Component Protection"

**6. Definition of Done (DoD)**
*   [ ] TEG sensor shutdown logic implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[GUARDIAN-109]`
**Jira Title:** End User Visibility of TEG Sensor Safety Guarantees and Energy Production

**1. Core User Story**
> **As an** end user,
> **I would like to** see TEG sensors provide additional safety guarantees whilst also secondarily producing some energy,
> **so that** I am confident in the safety of my vehicle and aware of its energy recovery features.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Safety guarantee visibility
> **Given** TEG sensors are installed and operational,
> **When** the system detects heat or potential overheating,
> **Then** the user is notified of safety actions taken and current safety status.

> **Scenario 2:** Energy production visibility
> **Given** TEG sensors are installed and operational,
> **When** energy is generated from heat sources,
> **Then** the user can view the amount of energy produced via the vehicle interface.

> **Scenario 3:** System failure or alert
> **Given** TEG sensors are installed,
> **When** a sensor fails or cannot guarantee safety,
> **Then** the user receives a warning and recommended actions.

**3. Stakeholder Perspectives & Requirements**
*   **End User:**
	*   *UX Requirement:* Safety and energy data must be easy to access and understand.
	*   *Value Requirement:* Increases user confidence and engagement.

*   **Technical Team:**
	*   *Functional Requirement:* Must support real-time data display and notifications.
	*   *Technical Constraint:* Must comply with automotive UI and safety standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Enhance perceived safety and innovation.
	*   *Priority:* High for user satisfaction and product differentiation.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Data must be accurate and not misleading.
	*   *Regulatory Requirement:* Must comply with automotive and consumer information standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Safety and energy data updates within 2 seconds.
*   **Reliability:** 99.9% uptime for data display and notifications.
*   **Security:** User data and notifications must be protected.
*   **Scalability:** Must support all vehicle models and user profiles.
*   **Durability:** Must operate in all climates and withstand repeated use.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[GUARDIAN-EPIC-01] Vehicle Safety Monitoring`
*   **Parent Project:** `Project: Guardian`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Safety and Energy Recovery"

**6. Definition of Done (DoD)**
*   [ ] TEG sensor data is visible to end users.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[GUARDIAN-108]`
**Jira Title:** Install TEG Sensors for Temperature Monitoring, Energy Generation, and Safety Alerts

**1. Core User Story**
> **As the** project owner,
> **I wish to** have TEGs installed as sensors which monitor the temperature for all electronics and elements within the vehicle that produce heat and could potentially be used as a power source. The TEG sensors should be capable of producing energy and trigger as a sensor to provide indications to the system's heat and overheating capacities. The TEG sensors should be ranged at safety levels and ensure the heat produced within the car remains within safety limits, whilst producing energy for the vehicle's battery system.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Temperature monitoring and safety alert
> **Given** TEG sensors are installed,
> **When** temperature readings exceed safety thresholds,
> **Then** the system triggers an alert and logs the event.

> **Scenario 2:** Energy generation from TEGs
> **Given** TEG sensors are installed,
> **When** heat is detected,
> **Then** the sensors generate measurable energy and contribute to the battery system.

> **Scenario 3:** System failure
> **Given** TEG sensors are installed,
> **When** monitoring or energy generation fails,
> **Then** the issue is logged and troubleshooting steps are provided.

**3. Stakeholder Perspectives & Requirements**
*   **Project Owner:**
	*   *UX Requirement:* Monitoring and alert controls must be intuitive and reliable.
	*   *Value Requirement:* Enhances safety and energy efficiency.

*   **Technical Team:**
	*   *Functional Requirement:* Must support dual-mode operation (monitoring and energy generation).
	*   *Technical Constraint:* Must comply with automotive sensor and safety standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Differentiate product and improve safety and energy recovery.
	*   *Priority:* High for innovation and safety.

*   **Safety & Compliance:**
	*   *Safety Requirement:* TEG sensors must not compromise vehicle safety or electronics.
	*   *Regulatory Requirement:* Must comply with automotive and environmental standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Safety alerts triggered within 1 second of threshold breach; energy generation efficiency >5%.
*   **Reliability:** 99.9% success rate for both functions.
*   **Security:** Data and controls must be protected.
*   **Scalability:** Must support various vehicle models and sensor locations.
*   **Durability:** Must operate in all climates and withstand repeated cycles.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[GUARDIAN-EPIC-01] Vehicle Safety Monitoring`
*   **Parent Project:** `Project: Guardian`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Safety and Energy Recovery"

**6. Definition of Done (DoD)**
*   [ ] TEG sensors are installed and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.



---

**Jira Key:** `[GUARDIAN-101]`
**Jira Title:** Automated Alerts for Vehicle Anomalies

**1. Core User Story**
> **As a** safety officer,
> **I want to** receive automated alerts for vehicle anomalies,
> **so that** I can respond quickly to potential hazards.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Anomaly detected
> **Given** a vehicle anomaly is detected,
> **When** the system identifies the issue,
> **Then** an alert is sent to the safety officer with details and recommended actions.

> **Scenario 2:** False positive
> **Given** an alert is sent,
> **When** the anomaly is not confirmed,
> **Then** the system logs the event and refines detection algorithms.

**3. Stakeholder Perspectives & Requirements**
*   **Safety Officer:**
	*   *UX Requirement:* Alerts must be timely, actionable, and easy to understand.
	*   *Value Requirement:* Enables rapid response to hazards.

*   **Technical Team:**
	*   *Functional Requirement:* System must monitor vehicle metrics and trigger alerts.
	*   *Technical Constraint:* Must integrate with vehicle telemetry systems.

*   **Business/Product Owner:**
	*   *Business Goal:* Improve safety and reduce liability.
	*   *Priority:* High for regulatory compliance.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Alerts must not distract drivers or compromise safety.
	*   *Regulatory Requirement:* Must comply with automotive safety standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Alerts delivered within 1 minute of detection.
*   **Reliability:** 99.95% uptime for alerting system.
*   **Security:** Alert data must be encrypted.
*   **Scalability:** Must support fleets of 1 to 10,000 vehicles.
*   **Durability:** Must operate in all supported regions.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[GUARDIAN-EPIC-01] Vehicle Safety Monitoring`
*   **Parent Project:** `Project: Guardian`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Safety"

**6. Definition of Done (DoD)**
*   [ ] Alerting system is implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[GUARDIAN-102]`
**Jira Title:** Assurance of EV Safety Standards

**1. Core User Story**
> **As a** vehicle owner,
> **I want to** be assured that my EV meets safety standards,
> **so that** I can drive with confidence.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Safety standards met
> **Given** the EV is inspected,
> **When** all safety checks pass,
> **Then** the owner receives confirmation and documentation.

> **Scenario 2:** Safety issue detected
> **Given** the EV is inspected,
> **When** a safety issue is found,
> **Then** the owner is notified and corrective actions are scheduled.

**3. Stakeholder Perspectives & Requirements**
*   **Vehicle Owner:**
	*   *UX Requirement:* Safety status must be easy to access and understand.
	*   *Value Requirement:* Enables confident driving and peace of mind.

*   **Technical Team:**
	*   *Functional Requirement:* System must support safety checks and reporting.
	*   *Technical Constraint:* Must comply with automotive safety standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Improve customer trust and satisfaction.
	*   *Priority:* High for market adoption.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Safety checks must be thorough and accurate.
	*   *Regulatory Requirement:* Must comply with automotive safety regulations.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Safety check results available within 5 minutes.
*   **Reliability:** 99.95% uptime for safety reporting system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support various vehicle models.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[GUARDIAN-EPIC-01] Vehicle Safety Monitoring`
*   **Parent Project:** `Project: Guardian`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Safety"

**6. Definition of Done (DoD)**
*   [ ] Safety reporting system is implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[GUARDIAN-103]`
**Jira Title:** Access to Safety Data APIs for Custom Monitoring

**1. Core User Story**
> **As a** developer,
> **I want to** access safety data APIs,
> **so that** I can build custom monitoring solutions.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** API access granted
> **Given** the developer requests access,
> **When** access is approved,
> **Then** the developer can retrieve safety data via APIs.

> **Scenario 2:** API failure
> **Given** the developer uses the API,
> **When** an error occurs,
> **Then** the system provides error details and troubleshooting steps.

**3. Stakeholder Perspectives & Requirements**
*   **Developer:**
	*   *UX Requirement:* API documentation must be clear and comprehensive.
	*   *Value Requirement:* Enables rapid development of monitoring solutions.

*   **Technical Team:**
	*   *Functional Requirement:* APIs must support all relevant safety data endpoints.
	*   *Technical Constraint:* Must comply with data privacy and security standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Expand ecosystem and enable third-party solutions.
	*   *Priority:* Medium for developer adoption.

*   **Safety & Compliance:**
	*   *Safety Requirement:* APIs must not expose sensitive or unsafe operations.
	*   *Regulatory Requirement:* Must comply with software distribution standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** API calls complete within 500ms.
*   **Reliability:** 99.9% success rate for API calls.
*   **Security:** APIs must use secure authentication and encryption.
*   **Scalability:** Must support integrations for fleets of 1 to 10,000 vehicles.
*   **Durability:** Must operate in all supported regions.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[GUARDIAN-EPIC-01] Vehicle Safety Monitoring`
*   **Parent Project:** `Project: Guardian`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Safety"

**6. Definition of Done (DoD)**
*   [ ] APIs are implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

### Epic
As a vehicle owner, I want to be confident that my battery is always safe, healthy, and operating at peak efficiency, so that my vehicle's range and lifespan are maximized.

#### User Stories

**Jira Key:** `[GUARDIAN-104]`
**Jira Title:** Accurate Monitoring of State of Charge and State of Health

**1. Core User Story**
> **As an** engineer,
> **I need to** accurately monitor the state of charge (SoC) and state of health (SoH) of every cell in the battery pack,
> **so that** battery safety and performance are maximized.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Accurate monitoring
> **Given** the BMS is operational,
> **When** SoC and SoH are measured,
> **Then** results are logged and available for review.

> **Scenario 2:** Monitoring failure
> **Given** the BMS is operational,
> **When** monitoring fails,
> **Then** the issue is logged and troubleshooting steps are provided.

**3. Stakeholder Perspectives & Requirements**
*   **Engineer:**
	*   *UX Requirement:* Monitoring interface must be intuitive and reliable.
	*   *Value Requirement:* Maximizes battery safety and performance.

*   **Technical Team:**
	*   *Functional Requirement:* Must support real-time monitoring and logging.
	*   *Technical Constraint:* Must comply with battery management standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Extend battery lifespan and reliability.
	*   *Priority:* High for product quality.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Monitoring must not compromise safety.
	*   *Regulatory Requirement:* Must comply with automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Monitoring updates within 1 second.
*   **Reliability:** 99.95% uptime for monitoring system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support various battery pack sizes.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[GUARDIAN-EPIC-01] Vehicle Safety Monitoring`
*   **Parent Project:** `Project: Guardian`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Safety"

**6. Definition of Done (DoD)**
*   [ ] Monitoring system is implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[GUARDIAN-105]`
**Jira Title:** Manage Inputs from Multiple Charging Sources Safely

**1. Core User Story**
> **As an** engineer,
> **I need to** manage inputs from multiple charging sources simultaneously (solar, kinetic, grid),
> **so that** the battery is charged safely and efficiently.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Safe charging management
> **Given** multiple charging sources are available,
> **When** the BMS manages inputs,
> **Then** the battery is charged safely and efficiently.

> **Scenario 2:** Charging failure
> **Given** multiple charging sources are available,
> **When** charging fails,
> **Then** the issue is logged and troubleshooting steps are provided.

**3. Stakeholder Perspectives & Requirements**
*   **Engineer:**
	*   *UX Requirement:* Charging management interface must be intuitive.
	*   *Value Requirement:* Maximizes safety and efficiency.

*   **Technical Team:**
	*   *Functional Requirement:* Must support simultaneous input management.
	*   *Technical Constraint:* Must comply with charging standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Improve battery performance and safety.
	*   *Priority:* High for product reliability.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Charging management must not compromise safety.
	*   *Regulatory Requirement:* Must comply with automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Charging management updates within 1 second.
*   **Reliability:** 99.95% uptime for charging system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support various charging source combinations.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[GUARDIAN-EPIC-01] Vehicle Safety Monitoring`
*   **Parent Project:** `Project: Guardian`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Safety"

**6. Definition of Done (DoD)**
*   [ ] Charging management system is implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[GUARDIAN-106]`
**Jira Title:** Proactive Alerts for Battery Issues

**1. Core User Story**
> **As a** vehicle owner,
> **I want to** be proactively alerted if the BMS detects any potential battery issues,
> **so that** I can schedule service before a problem occurs.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Proactive alert sent
> **Given** the BMS detects a potential issue,
> **When** the issue is identified,
> **Then** the owner receives an alert and service recommendation.

> **Scenario 2:** False alert
> **Given** the BMS detects a potential issue,
> **When** the issue is not confirmed,
> **Then** the system logs the event and refines detection algorithms.

**3. Stakeholder Perspectives & Requirements**
*   **Vehicle Owner:**
	*   *UX Requirement:* Alerts must be timely and actionable.
	*   *Value Requirement:* Enables preventive maintenance and peace of mind.

*   **Technical Team:**
	*   *Functional Requirement:* Must support real-time issue detection and alerting.
	*   *Technical Constraint:* Must comply with battery management standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Reduce warranty claims and improve reliability.
	*   *Priority:* High for customer satisfaction.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Alerts must not distract drivers or compromise safety.
	*   *Regulatory Requirement:* Must comply with automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Alerts delivered within 1 minute of detection.
*   **Reliability:** 99.95% uptime for alerting system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support various battery pack sizes.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[GUARDIAN-EPIC-01] Vehicle Safety Monitoring`
*   **Parent Project:** `Project: Guardian`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Safety"

**6. Definition of Done (DoD)**
*   [ ] Alerting system is implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[GUARDIAN-107]`
**Jira Title:** Advanced Cell Conditioning and Balancing Algorithms

**1. Core User Story**
> **As an** engineer,
> **I need to** execute advanced cell conditioning and balancing algorithms,
> **so that** the battery's overall lifespan is extended beyond 300,000 km.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Successful conditioning and balancing
> **Given** the BMS is operational,
> **When** conditioning and balancing algorithms are executed,
> **Then** battery lifespan is extended and results are logged.

> **Scenario 2:** Algorithm failure
> **Given** the BMS is operational,
> **When** algorithms fail,
> **Then** the issue is logged and troubleshooting steps are provided.

**3. Stakeholder Perspectives & Requirements**
*   **Engineer:**
	*   *UX Requirement:* Algorithm interface must be intuitive and reliable.
	*   *Value Requirement:* Maximizes battery lifespan and performance.

*   **Technical Team:**
	*   *Functional Requirement:* Must support advanced algorithms and logging.
	*   *Technical Constraint:* Must comply with battery management standards.

*   **Business/Product Owner:**
	*   *Business Goal:* Extend battery lifespan and reliability.
	*   *Priority:* High for product quality.

*   **Safety & Compliance:**
	*   *Safety Requirement:* Algorithms must not compromise safety.
	*   *Regulatory Requirement:* Must comply with automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Conditioning and balancing updates within 1 second.
*   **Reliability:** 99.95% uptime for conditioning system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support various battery pack sizes.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[GUARDIAN-EPIC-01] Vehicle Safety Monitoring`
*   **Parent Project:** `Project: Guardian`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize EV Safety"

**6. Definition of Done (DoD)**
*   [ ] Conditioning system is implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.
