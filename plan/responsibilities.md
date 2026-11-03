# Responsibilities for the Finance Management project

## 1. Purpose

This document defines the responsibilities of each stakeholder, team role, and project participant involved in the development of the Finance Management web application. The goal is to ensure clear accountability, reduce ambiguity, and support a structured project workflow.

## 2. Project roles

### 2.1 Project owner / supervisor

The project owner is responsible for:

- defining the overall project vision and goals;
- approving the project scope and priorities;
- reviewing requirement changes and business decisions;
- confirming the delivery of milestones;
- validating whether the MVP meets the intended purpose.

### 2.2 Product lead / product manager

The product lead is responsible for:

- defining user requirements and acceptance criteria;
- prioritizing features and backlog items;
- ensuring the product stays aligned with the original objective;
- coordinating with stakeholders and project owner;
- validating business and usability priorities.

### 2.3 Software architect

The software architect is responsible for:

- defining the technical architecture;
- ensuring the chosen stack supports the project goals;
- maintaining system design consistency across frontend, backend, and database;
- approving design decisions and technical trade-offs;
- monitoring long-term maintainability and scalability.

### 2.4 Backend developer

The backend developer is responsible for:

- implementing the Rust backend and API services;
- designing and maintaining the database schema and migrations;
- implementing authentication, validation, and business logic;
- ensuring secure handling of user and financial data;
- writing backend tests and validating API behavior.

### 2.5 Frontend developer

The frontend developer is responsible for:

- implementing the React frontend and UI pages;
- creating forms, dashboards, and transaction views;
- integrating the frontend with the backend API;
- ensuring responsiveness and usability across supported browsers;
- validating the user experience and frontend quality.

### 2.6 Database / data engineer

The database/data engineer is responsible for:

- designing and maintaining the database schema;
- implementing migrations and data validation rules;
- optimizing indexes and query performance;
- supporting backup and recovery planning;
- managing data integrity and access constraints.

### 2.7 QA / test engineer

The QA/test engineer is responsible for:

- defining test plans and validation methods;
- writing and running unit, integration, and end-to-end tests;
- verifying acceptance criteria before release;
- documenting defects and regression issues;
- ensuring the release is stable and fit for use.

### 2.8 DevOps / deployment support

The DevOps or deployment support role is responsible for:

- setting up the development, staging, and production environments;
- configuring CI/CD workflows;
- deploying the application to hosting platforms;
- maintaining monitoring, backups, and project automation;
- ensuring environment consistency and rollback readiness.

### 2.9 Documentation owner

The documentation owner is responsible for:

- maintaining the requirement documents and technical documents;
- keeping architecture and project documentation current;
- ensuring that code and documentation remain aligned;
- validating that release documentation is complete.

### 2.10 Security reviewer

The security reviewer is responsible for:

- reviewing authentication and authorization logic;
- checking input validation and data protections;
- validating secret management and access control;
- ensuring compliance considerations are addressed;
- reviewing security risks before release.

## 3. Team working responsibilities

### 3.1 Requirement ownership

The product lead and architect are jointly responsible for ensuring that requirements are clear, realistic, and testable.

### 3.2 Implementation ownership

Developers are responsible for implementing features according to the approved requirements and design artefacts.

### 3.3 Quality ownership

QA and the development team share responsibility for ensuring the software meets acceptance criteria and that defects are addressed before release.

### 3.4 Operational ownership

The DevOps or deployment support role is responsible for operational stability, monitoring, and deployment readiness.

### 3.5 Documentation ownership

The project team is collectively responsible for maintaining clear documentation, but the documentation owner should coordinate updates.

## 4. Responsibilities by project phase

### Phase 1: Requirements and planning

- Product lead defines requirements and prioritization.
- Architect defines technology direction and constraints.
- Project owner approves scope and decisions.
- Documentation owner maintains the requirement documents.

### Phase 2: Architecture and design

- Architect defines the software structure and patterns.
- Backend developer defines backend interfaces and services.
- Frontend developer defines the UI structure and flow.
- Database engineer defines storage schema and relationships.

### Phase 3: Development

- Backend developer implements backend logic and APIs.
- Frontend developer implements interface and user interaction.
- QA engineer prepares test cases and validation checks.
- Security reviewer validates security-sensitive components.

### Phase 4: Testing and validation

- QA verifies functionality against requirements.
- Developers fix defects and update the implementation.
- Security reviewer checks security controls and data handling.
- Product lead confirms the feature quality.

### Phase 5: Release and operations

- DevOps configures deployment and monitoring.
- Project owner approves release readiness.
- Documentation owner ensures final documentation is up to date.
- Team handles post-release support and issues.

## 5. Shared responsibilities

All team members are responsible for:

- following the defined coding and documentation standards;
- using GitHub for version control and task management;
- keeping work visible in the project board;
- communicating blockers and risks early;
- ensuring quality and security are not compromised for speed.

## 6. Accountability model

Each responsibility must have an accountable owner. When a task or issue is created, it should clearly show:

- who is responsible;
- who is reviewing it;
- who approves it when required.

This ensures accountability and supports a more disciplined development process.

## 7. Summary

The project relies on a clear division of responsibilities among architecture, development, quality assurance, deployment, and documentation. Clear ownership is essential to keep the project moving, reduce ambiguity, and ensure a predictable and maintainable delivery process.
