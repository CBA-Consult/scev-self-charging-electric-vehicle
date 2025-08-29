## Project Dynamo User Stories

---

**Jira Key:** `[DYNAMO-101]`
**Jira Title:** Monitor Energy Usage of Self-Charging EVs

**1. Core User Story**
> **As a** fleet manager,
> **I want to** monitor the energy usage of self-charging electric vehicles,
> **so that** I can optimize operational costs and improve sustainability.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Energy usage monitoring
> **Given** a fleet of self-charging EVs is operational,
> **When** the manager accesses the dashboard,
> **Then** the system displays real-time and historical energy usage data for each vehicle.

> **Scenario 2:** Cost optimization
> **Given** energy usage data is available,
> **When** the manager reviews the data,
> **Then** the system provides actionable insights for cost reduction and sustainability improvements.

**3. Stakeholder Perspectives & Requirements**
*   **Fleet Manager:**
    *   *UX Requirement:* Dashboard must be intuitive and data easily exportable.
    *   *Value Requirement:* Enables cost and sustainability optimization.
*   **Technical Team:**
    *   *Functional Requirement:* Must support real-time and historical data collection.
    *   *Technical Constraint:* Must comply with fleet management standards.
*   **Business/Product Owner:**
    *   *Business Goal:* Reduce operational costs and improve sustainability.
    *   *Priority:* High for fleet operations.
*   **Safety & Compliance:**
    *   *Safety Requirement:* Data access must not compromise vehicle safety.
    *   *Regulatory Requirement:* Must comply with data privacy standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Data updates within 2 seconds.
*   **Reliability:** 99.9% uptime for monitoring system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support fleets of all sizes.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[DYNAMO-EPIC-01] Fleet Energy Optimization`
*   **Parent Project:** `Project: Dynamo`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize Fleet Sustainability"

**6. Definition of Done (DoD)**
*   [ ] Monitoring system implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[DYNAMO-102]`
**Jira Title:** Real-Time Charging Status Feedback for Drivers

**1. Core User Story**
> **As a** driver,
> **I want** real-time feedback on vehicle charging status,
> **so that** I can plan routes efficiently.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Charging status feedback
> **Given** a driver is operating a self-charging EV,
> **When** charging status changes,
> **Then** the system provides real-time feedback via the vehicle display.

> **Scenario 2:** Route planning
> **Given** charging status is available,
> **When** the driver plans a route,
> **Then** the system suggests optimal routes based on charging status and energy availability.

**3. Stakeholder Perspectives & Requirements**
*   **Driver:**
    *   *UX Requirement:* Feedback must be clear and timely.
    *   *Value Requirement:* Enables efficient route planning.
*   **Technical Team:**
    *   *Functional Requirement:* Must support real-time status updates.
    *   *Technical Constraint:* Must comply with vehicle UI standards.
*   **Business/Product Owner:**
    *   *Business Goal:* Improve driver experience and efficiency.
    *   *Priority:* High for user satisfaction.
*   **Safety & Compliance:**
    *   *Safety Requirement:* Feedback must not distract the driver.
    *   *Regulatory Requirement:* Must comply with automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Status updates within 1 second.
*   **Reliability:** 99.9% uptime for feedback system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all vehicle models.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[DYNAMO-EPIC-02] Driver Experience Enhancement`
*   **Parent Project:** `Project: Dynamo`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize Driver Efficiency"

**6. Definition of Done (DoD)**
*   [ ] Feedback system implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[DYNAMO-103]`
**Jira Title:** Diagnostic Data for Proactive Maintenance

**1. Core User Story**
> **As a** technician,
> **I want** diagnostic data from the vehicle,
> **so that** I can perform proactive maintenance.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Diagnostic data access
> **Given** a vehicle is in operation,
> **When** a technician requests diagnostic data,
> **Then** the system provides comprehensive diagnostic information in real-time.

> **Scenario 2:** Maintenance planning
> **Given** diagnostic data is available,
> **When** the technician reviews the data,
> **Then** the system suggests proactive maintenance actions based on detected issues.

**3. Stakeholder Perspectives & Requirements**
*   **Technician:**
    *   *UX Requirement:* Data must be accessible and actionable.
    *   *Value Requirement:* Enables proactive maintenance.
*   **Technical Team:**
    *   *Functional Requirement:* Must support real-time diagnostic data.
    *   *Technical Constraint:* Must comply with vehicle diagnostic standards.
*   **Business/Product Owner:**
    *   *Business Goal:* Reduce downtime and maintenance costs.
    *   *Priority:* High for operational excellence.
*   **Safety & Compliance:**
    *   *Safety Requirement:* Data access must not compromise safety.
    *   *Regulatory Requirement:* Must comply with automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Data access within 2 seconds.
*   **Reliability:** 99.95% uptime for diagnostic system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all vehicle models.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[DYNAMO-EPIC-03] Maintenance Optimization`
*   **Parent Project:** `Project: Dynamo`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Maximize Vehicle Uptime"

**6. Definition of Done (DoD)**
*   [ ] Diagnostic system implemented and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

### Project Mission
To research and develop novel methods for generating and capturing energy from rotational and magnetic forces within the vehicle system, supporting advanced self-charging capabilities.

### Epic
As an R&D engineer, I need to explore and validate unconventional energy harvesting technologies beyond standard KERS, so that we can create a significant competitive advantage and unlock new pathways to energy autonomy.

#### User Stories
- **Electromagnetic Suspension:**
	- As an R&D engineer, I want to design and build a prototype of an electromagnetic suspension damper, so that I can measure its ability to generate electrical energy from road vibrations and suspension travel.
- **Exhaust Heat Thermoelectric Generation (Future Application):**
	- As an R&D engineer, I want to research the feasibility of using thermoelectric generators (TEGs) to capture waste heat from power electronics or other high-temperature components, so that we can convert this waste heat into usable electrical energy.
- **Rotational Drivetrain Harvesting:**
	- As an R&D engineer, I want to model and simulate the potential for placing an inductive harvesting coil around the vehicle's driveshaft, so that we can determine if energy can be efficiently captured from its rotational magnetic field without physical contact.
- **Airflow Energy Harvesting:**
	- As an R&D engineer, I want to investigate the viability of placing small, high-efficiency micro-turbines in areas of high airflow (like the brake cooling ducts or radiator intake), so that we can generate supplemental power at highway speeds.
- **System Integration Feasibility:**
	- As a systems engineer, I need to analyze the power output, weight, and complexity of each experimental harvesting method, so that I can provide a recommendation to the Autonomy Program on which technologies are most promising for future product integration.
- **Proof-of-Concept Benchmarking:**
	- As an R&D engineer, I need to build a standardized test rig to benchmark the power output (watts per kilogram) of each experimental harvesting technology, so that we can make objective, data-driven comparisons.

---

**Jira Key:** `[DYNAMO-104]`
**Jira Title:** Electromagnetic Suspension Energy Harvesting

**1. Core User Story**
> **As an** R&D engineer,
> **I want to** design and build a prototype of an electromagnetic suspension damper,
> **so that** I can measure its ability to generate electrical energy from road vibrations and suspension travel.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Prototype construction
> **Given** design specifications are complete,
> **When** the prototype is built,
> **Then** the system can measure energy output from suspension travel.

> **Scenario 2:** Data collection
> **Given** the prototype is operational,
> **When** road vibrations occur,
> **Then** the system records electrical energy generated.

**3. Stakeholder Perspectives & Requirements**
*   **R&D Engineer:**
    *   *UX Requirement:* Measurement system must be accurate and easy to use.
    *   *Value Requirement:* Enables assessment of energy harvesting potential.
*   **Technical Team:**
    *   *Functional Requirement:* Must support real-time data logging.
    *   *Technical Constraint:* Must comply with vehicle safety standards.
*   **Business/Product Owner:**
    *   *Business Goal:* Explore new energy harvesting methods.
    *   *Priority:* Medium for innovation.
*   **Safety & Compliance:**
    *   *Safety Requirement:* Prototype must not compromise vehicle safety.
    *   *Regulatory Requirement:* Must comply with automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Data logging within 1 second of event.
*   **Reliability:** 99% uptime for measurement system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support different vehicle models.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[DYNAMO-EPIC-04] Suspension Energy Harvesting`
*   **Parent Project:** `Project: Dynamo`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Unlock New Energy Pathways"

**6. Definition of Done (DoD)**
*   [ ] Prototype built and tested.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[DYNAMO-105]`
**Jira Title:** EV Power Electronics Thermoelectric Generation Feasibility

**1. Core User Story**
> **As an** R&D engineer,
> **I want to** research the feasibility of using thermoelectric generators (TEGs) as sensors to monitor and secure EV power electronics (inverters, converters, battery packs, motors) and other high-temperature EV components from overheating,
> **so that** we can ensure system safety and reliability, with the added benefit of recovering waste heat as usable electrical energy to improve overall vehicle efficiency.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Feasibility study
> **Given** access to EV power electronics and high-temperature EV components,
> **When** TEGs are installed and tested as thermal protection sensors,
> **Then** the system monitors component temperatures, triggers safety alerts for overheating, and reports energy conversion efficiency as a secondary outcome.

> **Scenario 2:** Data analysis
> **Given** temperature and energy conversion data are available,
> **When** the engineer reviews the data,
> **Then** the system provides recommendations for optimal sensor placement, safety integration, and future energy recovery applications in EV architectures.

**3. Stakeholder Perspectives & Requirements**
*   **R&D Engineer:**
    *   *UX Requirement:* Temperature and energy data must be clear and actionable.
    *   *Value Requirement:* Enables assessment of TEGs for both safety and energy recovery.
*   **Technical Team:**
    *   *Functional Requirement:* Must support accurate temperature monitoring and energy measurement.
    *   *Technical Constraint:* Must comply with thermal safety and sensor integration standards.
*   **Business/Product Owner:**
    *   *Business Goal:* Enhance system safety and reliability; identify new energy sources as a byproduct.
    *   *Priority:* High for safety, medium for energy innovation.
*   **Safety & Compliance:**
    *   *Safety Requirement:* TEG sensors must actively prevent overheating and not compromise system safety.
    *   *Regulatory Requirement:* Must comply with automotive and sensor safety standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Measurement and alerting within 2 seconds.
*   **Reliability:** 99% uptime for monitoring and measurement system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support different vehicle models.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[DYNAMO-EPIC-05] Thermoelectric Energy Harvesting`
*   **Parent Project:** `Project: Dynamo`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Unlock New Energy Pathways; Enhance System Safety"

**6. Definition of Done (DoD)**
*   [ ] Feasibility study completed and documented.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[DYNAMO-106]`
**Jira Title:** Rotational Drivetrain Inductive Harvesting

**1. Core User Story**
> **As an** R&D engineer,
> **I want to** model and simulate the potential for placing an inductive harvesting coil around the vehicle's driveshaft,
> **so that** we can determine if energy can be efficiently captured from its rotational magnetic field without physical contact.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Simulation and modeling
> **Given** access to drivetrain specifications,
> **When** the simulation is run,
> **Then** the system reports potential energy output and efficiency.

> **Scenario 2:** Prototype recommendation
> **Given** simulation results are available,
> **When** the engineer reviews the data,
> **Then** the system provides recommendations for prototype development.

**3. Stakeholder Perspectives & Requirements**
*   **R&D Engineer:**
    *   *UX Requirement:* Simulation tools must be accurate and user-friendly.
    *   *Value Requirement:* Enables assessment of inductive harvesting feasibility.
*   **Technical Team:**
    *   *Functional Requirement:* Must support accurate modeling.
    *   *Technical Constraint:* Must comply with drivetrain safety standards.
*   **Business/Product Owner:**
    *   *Business Goal:* Identify new energy harvesting opportunities.
    *   *Priority:* Medium for innovation.
*   **Safety & Compliance:**
    *   *Safety Requirement:* Modeling must not compromise system safety.
    *   *Regulatory Requirement:* Must comply with automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Simulation within 2 seconds.
*   **Reliability:** 99% uptime for simulation system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support different vehicle models.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[DYNAMO-EPIC-06] Drivetrain Energy Harvesting`
*   **Parent Project:** `Project: Dynamo`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Unlock New Energy Pathways"

**6. Definition of Done (DoD)**
*   [ ] Simulation completed and documented.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[DYNAMO-107]`
**Jira Title:** Airflow Micro-Turbine Energy Harvesting

**1. Core User Story**
> **As an** R&D engineer,
> **I want to** investigate the viability of placing small, high-efficiency micro-turbines in areas of high airflow (like the brake cooling ducts or radiator intake),
> **so that** we can generate supplemental power at highway speeds.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Viability study
> **Given** access to high airflow areas,
> **When** micro-turbines are installed and tested,
> **Then** the system measures and reports supplemental power generated.

> **Scenario 2:** Data analysis
> **Given** supplemental power data is available,
> **When** the engineer reviews the data,
> **Then** the system provides recommendations for future application.

**3. Stakeholder Perspectives & Requirements**
*   **R&D Engineer:**
    *   *UX Requirement:* Data must be clear and actionable.
    *   *Value Requirement:* Enables assessment of micro-turbine feasibility.
*   **Technical Team:**
    *   *Functional Requirement:* Must support accurate measurement.
    *   *Technical Constraint:* Must comply with airflow safety standards.
*   **Business/Product Owner:**
    *   *Business Goal:* Identify new energy sources.
    *   *Priority:* Medium for future innovation.
*   **Safety & Compliance:**
    *   *Safety Requirement:* Micro-turbines must not compromise system safety.
    *   *Regulatory Requirement:* Must comply with automotive standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Measurement within 2 seconds.
*   **Reliability:** 99% uptime for measurement system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support different vehicle models.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[DYNAMO-EPIC-07] Airflow Energy Harvesting`
*   **Parent Project:** `Project: Dynamo`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Unlock New Energy Pathways"

**6. Definition of Done (DoD)**
*   [ ] Viability study completed and documented.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[DYNAMO-108]`
**Jira Title:** System Integration Feasibility Analysis

**1. Core User Story**
> **As a** systems engineer,
> **I need to** analyze the power output, weight, and complexity of each experimental harvesting method,
> **so that** I can provide a recommendation to the Autonomy Program on which technologies are most promising for future product integration.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Feasibility analysis
> **Given** experimental data is available,
> **When** the analysis is performed,
> **Then** the system provides a recommendation report for product integration.

> **Scenario 2:** Stakeholder review
> **Given** the recommendation report is available,
> **When** stakeholders review the report,
> **Then** the system incorporates feedback and finalizes recommendations.

**3. Stakeholder Perspectives & Requirements**
*   **Systems Engineer:**
    *   *UX Requirement:* Analysis tools must be comprehensive and user-friendly.
    *   *Value Requirement:* Enables informed recommendations.
*   **Technical Team:**
    *   *Functional Requirement:* Must support multi-factor analysis.
    *   *Technical Constraint:* Must comply with integration standards.
*   **Business/Product Owner:**
    *   *Business Goal:* Guide future product development.
    *   *Priority:* High for strategic planning.
*   **Safety & Compliance:**
    *   *Safety Requirement:* Analysis must not compromise safety.
    *   *Regulatory Requirement:* Must comply with product standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Analysis completed within 1 week.
*   **Reliability:** 99% uptime for analysis system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all experimental methods.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[DYNAMO-EPIC-08] Integration Feasibility`
*   **Parent Project:** `Project: Dynamo`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Guide Strategic Product Development"

**6. Definition of Done (DoD)**
*   [ ] Feasibility analysis completed and documented.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

**Jira Key:** `[DYNAMO-109]`
**Jira Title:** Proof-of-Concept Benchmarking

**1. Core User Story**
> **As an** R&D engineer,
> **I need to** build a standardized test rig to benchmark the power output (watts per kilogram) of each experimental harvesting technology,
> **so that** we can make objective, data-driven comparisons.

**2. Acceptance Criteria (Gherkin Format)**
> **Scenario 1:** Test rig construction
> **Given** design specifications are complete,
> **When** the test rig is built,
> **Then** the system can measure and record power output for each technology.

> **Scenario 2:** Benchmarking
> **Given** the test rig is operational,
> **When** benchmarking is performed,
> **Then** the system provides comparative data for all technologies.

**3. Stakeholder Perspectives & Requirements**
*   **R&D Engineer:**
    *   *UX Requirement:* Benchmarking tools must be accurate and easy to use.
    *   *Value Requirement:* Enables objective technology comparison.
*   **Technical Team:**
    *   *Functional Requirement:* Must support multi-technology benchmarking.
    *   *Technical Constraint:* Must comply with measurement standards.
*   **Business/Product Owner:**
    *   *Business Goal:* Inform future technology selection.
    *   *Priority:* Medium for innovation planning.
*   **Safety & Compliance:**
    *   *Safety Requirement:* Test rig must not compromise safety.
    *   *Regulatory Requirement:* Must comply with lab standards.

**4. Non-Functional Requirements (NFRs)**
*   **Performance:** Benchmarking completed within 1 week.
*   **Reliability:** 99% uptime for benchmarking system.
*   **Security:** Data must be protected.
*   **Scalability:** Must support all experimental technologies.
*   **Durability:** Must operate in all climates.

**5. Traceability & Strategic Alignment**
*   **Parent Epic:** `[DYNAMO-EPIC-09] Technology Benchmarking`
*   **Parent Project:** `Project: Dynamo`
*   **Parent Program:** `Autonomy Program`
*   **Portfolio Goal:** "Enable Data-Driven Technology Selection"

**6. Definition of Done (DoD)**
*   [ ] Test rig built and operational.
*   [ ] All Acceptance Criteria are met.
*   [ ] NFRs have been tested and verified.
*   [ ] Results are published in technical documentation.
*   [ ] Product Owner has reviewed and accepted the results.

---

#### Key Characteristics of Dynamo Stories
- Exploratory: Focused on research, modeling, and prototyping, not immediate product features.
- Feasibility-Driven: The goal is to answer the question, "Is this a viable technology for us to pursue?"
- Internal Personas: The primary "user" is the company's own engineering and strategy teams. The output of these stories is data and recommendations that inform future program roadmaps.
