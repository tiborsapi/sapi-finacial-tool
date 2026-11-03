# Software Development Plan

## 1. Project overview

This document defines the software development plan for the Finance Management web application. It covers the full project lifecycle, from requirement management and task planning through development, testing, deployment, operations, risk management, security controls, and cost planning.

The project will be developed as a single-user personal finance management web application with a React frontend and a Rust backend, using PostgreSQL as the primary database. The plan is designed to support a controlled MVP delivery and a clear path to future iterations.

## 2. Project goals

- Develop a secure and reliable personal finance web application.
- Support basic tracking of income, expenses, and invoice-related entries.
- Provide a clear, maintainable, testable architecture.
- Deliver a usable MVP with a defined release scope.
- Keep development, testing, and deployment processes structured and measurable.
- Ensure compliance with security and privacy expectations for a European market.

## 3. Scope of the plan

This plan covers:

- requirement management;
- backlog and task management;
- development environment setup;
- test environment setup;
- production/operational environment setup;
- risk management;
- security management;
- operational cost estimation;
- IT service tools and software;
- test tools and software.

## 4. Development lifecycle

The project will follow an iterative software development lifecycle with clear stages:

1. Requirements definition
2. Architecture and design
3. Sprint planning and backlog creation
4. Development environment setup
5. Implementation of frontend and backend features
6. Unit, integration, and end-to-end testing
7. Deployment to staging and production
8. Monitoring, issue tracking, and support
9. Continuous improvement and future enhancements

## 5. Requirement management

### 5.1 Requirement sources

Requirements will come from:

- business and user needs;
- product goals and MVP scope;
- technical constraints;
- compliance, security, and privacy requirements;
- stakeholder feedback.

### 5.2 Requirement documentation

All requirements must be recorded in a structured repository and linked to implementation tasks.

Recommended artifacts:

- user requirements document;
- technical requirements document;
- architecture documents;
- backlog items and user stories;
- acceptance criteria for each feature.

### 5.3 Requirement review process

Requirements will be reviewed by the project team before implementation. Each requirement must include:

- unique identifier;
- description;
- priority level;
- source;
- acceptance criteria;
- dependencies;
- owner.

### 5.4 Change management

Requested changes will be evaluated based on:

- business value;
- impact on scope, cost, and timeline;
- technical complexity;
- risk to existing functionality.

A change log should be maintained for all requirement updates.

## 6. Task management and project execution

### 6.1 Agile delivery model

The project should use an iterative approach based on short delivery cycles, such as sprints of 1 to 2 weeks.

### 6.2 Backlog structure

The backlog should be organized into the following categories:

- epics;
- user stories;
- technical tasks;
- bugs and defects;
- non-functional requirements.

### 6.3 Task tracking tools

Recommended tools:

- GitHub Projects, GitHub Issues, or Azure DevOps for task management;
- GitHub for source control and pull requests;
- project boards for sprint tracking and status reporting.

### 6.4 Definition of done

A task is only complete when:

- code is implemented and reviewed;
- tests are written and passing;
- acceptance criteria are checked;
- bug fixes are validated;
- documentation is updated when needed.

## 7. Development environment definition

### 7.1 Development environment goals

The development environment must support:

- local feature development;
- isolated code changes;
- integration of frontend and backend components;
- code quality checks;
- easy reproduction of issues.

### 7.2 Recommended development stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- Playwright for frontend validation

Backend:

- Rust
- Axum
- SQLx
- PostgreSQL
- Serde

Tooling:

- Git
- GitHub or GitLab
- Docker
- rustfmt
- Clippy
- ESLint
- Prettier

### 7.3 Local environment setup

Each developer should have:

- a local code checkout;
- a configured editor or IDE;
- Node.js and package manager tools;
- Rust toolchain installed;
- PostgreSQL or SQLite for local testing;
- Docker for service orchestration if needed;
- environment configuration files for local settings.

### 7.4 Environment configuration management

The project must separate:

- development configuration;
- testing configuration;
- staging configuration;
- production configuration.

Sensitive values such as API keys, database credentials, and secrets must be stored in environment variables or a secure secret manager.

## 8. Test environment definition

### 8.1 Purpose of the test environment

The test environment should verify that the product is working as expected before release. It should be as close as possible to production, while still safe for validation and debugging.

### 8.2 Test environment components

- frontend application instance;
- backend API instance;
- test database instance;
- test user accounts or fixtures;
- automated test runner;
- CI pipeline for deploy validation.

### 8.3 Test types

The project should include:

- unit tests;
- integration tests;
- end-to-end tests;
- API contract validation;
- performance checks;
- security checks.

### 8.4 Test tools and software

Recommended tools:

- cargo-nextest for Rust backend tests;
- Vitest for frontend unit tests;
- Playwright for end-to-end browser testing;
- Postman or Insomnia for API validation;
- k6 for performance testing;
- Lighthouse for frontend quality checks;
- CI automation via GitHub Actions.

## 9. Operational environment definition

### 9.1 Production environment targets

The operational environment must support:

- secure web hosting;
- backend execution;
- database storage;
- monitoring and logging;
- automated deployment;
- rollback capability.

### 9.2 Recommended environment structure

- Frontend: Vercel or Netlify
- Backend: Render, Railway, Azure App Service, or Docker-based hosting
- Database: managed PostgreSQL service
- Monitoring: Sentry, structured logging, uptime checks
- CI/CD: GitHub Actions

### 9.3 Production responsibilities

The operational environment must provide:

- stable service availability;
- secure access control;
- deployment automation;
- monitoring and error tracking;
- backup and restore practices;
- alerting for degradation or outage.

## 10. Risk management

### 10.1 Risk categories

The main risks include:

- requirement ambiguity;
- scope creep;
- delayed integration between frontend and backend;
- database schema changes causing rework;
- security vulnerabilities;
- poor handling of financial data;
- deployment errors;
- weak testing coverage.

### 10.2 Risk management process

For every identified risk, the team should record:

- risk description;
- impact;
- probability;
- mitigation action;
- owner;
- contingency plan.

### 10.3 Risk response strategy

- avoid: reduce unnecessary features in the MVP;
- mitigate: add validation, testing, and secure defaults;
- transfer: use managed hosting and managed database services;
- accept: document low-probability risks with monitoring in place.

## 11. Security management

### 11.1 Security principles

The application must be developed with security as a primary requirement.

Core priorities:

- secure access control;
- minimal data handling;
- strong password storage;
- secure API integration;
- secure environment variable management;
- logging without exposing sensitive information.

### 11.2 Security controls

The project must implement:

- HTTPS in production;
- password hashing with a modern algorithm;
- validation on both frontend and backend;
- SQL injection prevention through parameterized queries and ORM usage;
- rate limiting for public endpoints;
- CORS restrictions;
- secure session or token management;
- CSRF protection where necessary;
- secure database access and secret protection.

### 11.3 Security reviews

The project should include:

- dependency reviews;
- security scanning of code and libraries;
- review of third-party SDKs and tooling;
- periodic review of authentication and access rules.

## 12. Privacy and compliance

The application will process personal and financial information and should therefore be designed with privacy by default.

The project should consider:

- GDPR principles;
- transparent user notices;
- least-privilege access;
- data minimization;
- secure storage of personal records;
- clear consent and privacy policy requirements where applicable.

## 13. Operational cost planning

### 13.1 Cost categories

Operational costs may include:

- development tools and licenses;
- hosting for frontend, backend, and database;
- monitoring and log aggregation;
- CI/CD services;
- security scanning tools;
- backups and storage;
- project management tools;
- support and maintenance.

### 13.2 Cost estimation approach

The team should estimate costs based on:

- hosting size and traffic assumptions;
- number of users expected in MVP;
- storage needs;
- team tool subscriptions;
- support and maintenance requirements.

### 13.3 Cost optimization strategy

- use managed cloud services instead of custom hosting;
- keep the MVP lean and avoid unnecessary features;
- use affordable and scalable infrastructure;
- reduce operational overhead through automation.

## 14. IT service tools and software for a student project using GitHub and free-tier tools

For a student project, the preferred approach is to use free or low-cost tools that are easy to adopt, common in academic projects, and compatible with GitHub. The following tools are recommended and should be used consistently across the project lifecycle.

### 14.1 GitHub

GitHub is the core platform for the project.

Use GitHub for:

- source code hosting;
- version control with Git;
- branch-based development workflow;
- pull request reviews;
- issue tracking and backlog management;
- project boards for planning;
- creating a public or private repository depending on project requirements.

Recommended GitHub features for a student project:

- repository with README and license;
- protected default branch;
- feature branches for each task;
- pull requests to review code before merge;
- GitHub Issues for requirements, bugs, and tasks;
- GitHub Projects for Kanban planning;
- GitHub Actions for basic CI.

### 14.2 GitHub Issues

GitHub Issues should be used to manage tasks, bugs, and requirements.

Example usage:

- create an issue for each user story or requirement;
- assign labels such as backend, frontend, bug, documentation, or ui;
- track acceptance criteria in each issue;
- link implementation PRs to the related issue.

This gives a clear record of development progress and supports traceability from requirement to implementation.

### 14.3 GitHub Projects

GitHub Projects should be used to manage the sprint board and task flow.

Recommended columns:

- Backlog
- To do
- In progress
- In review
- Done

This makes it simple to see project progress and ensures daily work stays visible.

### 14.4 GitHub Actions

GitHub Actions provides free CI for student projects.

Use it to automate:

- dependency installation;
- linting;
- unit tests;
- build verification;
- deployment to a staging environment;
- smoke testing.

Example workflows:

- run Rust tests on every push and pull request;
- run frontend build checks;
- run Playwright tests on pull requests.

### 14.5 Visual Studio Code

Visual Studio Code is the recommended IDE for the project.

Use it for:

- editing code in multiple languages;
- working with Git and GitHub integrations;
- JavaScript, TypeScript, Rust, and Markdown editing;
- debugging and extension-based tooling.

Useful free extensions:

- Rust Analyzer for Rust development;
- Prettier for formatting;
- ESLint for JavaScript/TypeScript linting;
- GitHub Pull Requests extension;
- Markdown extensions for documentation.

### 14.6 Rust toolchain

The Rust toolchain is needed for the backend.

Use it for:

- building the API server;
- static analysis with Clippy;
- formatting with rustfmt;
- running unit and integration tests.

This is free and suitable for student projects because it is open source and widely supported.

### 14.7 Node.js and npm

Node.js and npm are required for the frontend development environment.

Use them for:

- installing React, Vite, and frontend dependencies;
- running the development server;
- building the production frontend bundle;
- executing frontend tests with Vitest or Playwright.

### 14.8 Docker (free tier / local use)

Docker is useful for local environment consistency, especially for PostgreSQL and backend services.

Use Docker for:

- running PostgreSQL locally;
- creating reproducible environments;
- testing the app in a controlled setup;
- containerizing backend and frontend for easier deployments.

Docker Desktop is free for student use in supported development setups.

### 14.9 PostgreSQL (free local or hosted option)

PostgreSQL can be used locally in development and in a managed service in production.

Use it for:

- storing users, categories, transactions, and invoice records;
- running relational queries for finance reports;
- validating schema and migrations.

For a student project, PostgreSQL can be run locally with Docker or via a free managed tier for small deployments.

### 14.10 PostgreSQL client tools

Use a free database client such as DBeaver or pgAdmin.

Use it for:

- reviewing schema structure;
- executing SQL queries;
- validating migrations;
- debugging stored data and relationship issues.

### 14.11 Vercel or Netlify (free tier)

These are good free deployment options for the frontend.

Use Vercel or Netlify for:

- hosting the React frontend;
- automatic deployments from GitHub;
- preview deployments for pull requests;
- checking UI changes before merge.

These platforms are especially valuable for student projects because deployment is easy and free for low-traffic use.

### 14.12 Render, Railway, or Fly.io (free / low-cost tier)

These platforms can host the Rust backend and database services.

Use them for:

- deploying the backend API;
- hosting a PostgreSQL database in a low-cost environment;
- testing a deployed version of the app;
- verifying integration between frontend and backend.

These services are ideal for student projects because they provide a practical deployment workflow without requiring a complex infrastructure setup.

### 14.13 Postman / Insomnia (free tier)

These tools are useful for testing API behavior.

Use them for:

- testing endpoints before frontend integration;
- validating request payloads;
- checking error responses;
- documenting backend behavior.

### 14.14 Sentry (free tier or student-friendly usage)

Sentry is useful for application monitoring and error tracking.

Use it for:

- tracking runtime errors;
- seeing failed requests and crashes;
- understanding production issues in a browser or API service;
- validating whether the app is behaving as expected in real usage.

### 14.15 Cloudflare (free tier)

Cloudflare can help with web security and deployment improvements.

Use it for:

- DNS configuration;
- custom domain support;
- SSL certificate management;
- protection against abuse and bot traffic.

For a student project, the free tier is generally enough for small deployment needs.

### 14.16 GitHub Pages or static preview hosting

GitHub Pages can be used for documentation or lightweight static previews.

Use it for:

- project documentation pages;
- static release notes;
- a simple project website or landing page.

## 15. Test tools and software for a student project

The following free tools are suitable for testing the project.

### 15.1 cargo-nextest

Use cargo-nextest for Rust backend test execution.

It provides:

- clearer test output;
- faster execution than basic cargo test;
- better reporting for complex backend logic.

### 15.2 Vitest

Use Vitest for frontend unit tests.

It is suitable for:

- testing utility functions;
- checking validation logic;
- validating UI logic in a JavaScript/TypeScript codebase.

### 15.3 Playwright

Use Playwright for end-to-end tests.

It is valuable for verifying:

- login flows;
- form validation;
- transaction creation;
- summary calculations;
- browser-based user journeys.

### 15.4 Lighthouse

Use Lighthouse to check frontend quality.

It helps evaluate:

- performance;
- accessibility;
- best practices;
- SEO-related web quality.

### 15.5 k6

Use k6 for performance and API load tests.

It helps measure:

- response time under load;
- API stability;
- backend behavior under concurrent requests.

### 15.6 GitHub Actions for automated validation

Use GitHub Actions to automate these checks:

- npm install and frontend build;
- Rust build and test;
- Playwright smoke tests on pull requests;
- fail fast when code quality or tests break.

This is the most practical free CI platform for student work.

## 16. Recommended student project toolchain

The recommended free GitHub-based toolchain for this project is:

- GitHub for repository hosting and project management;
- GitHub Issues for requirement and task tracking;
- GitHub Projects for sprint board management;
- GitHub Actions for build and test automation;
- Visual Studio Code for development;
- Rust + Axum + SQLx for backend;
- React + TypeScript + Vite for frontend;
- PostgreSQL via Docker or a free managed database;
- Vercel or Netlify for frontend hosting;
- Render, Railway, Fly.io, or similar for backend hosting;
- Postman or Insomnia for API testing;
- Playwright and Vitest for testing;
- Sentry for issue monitoring;
- Docker for local environment consistency.

## 17. Practical usage workflow for the student team

### Step 1: Create the repository

Create a GitHub repository for the project.

Use:

- main branch for stable code;
- feature branches for each development task;
- pull requests for review and merge.

### Step 2: Create project tracking board

Create a GitHub Project board with columns such as:

- Backlog
- Ready
- In progress
- Review
- Done

This makes progress visible and keeps work organized.

### Step 3: Define requirements as issues

Each requirement should become an issue with:

- title;
- description;
- acceptance criteria;
- labels;
- estimated priority.

### Step 4: Create tasks from each issue

Break large features into small tasks such as:

- database schema migration;
- backend endpoint for transactions;
- frontend transaction form;
- summary calculation logic;
- UI styling and validation.

### Step 5: Use GitHub Actions for verification

Every push or pull request should trigger:

- frontend build;
- Rust build;
- unit tests;
- integration tests;
- basic syntax and formatting checks.

### Step 6: Deploy previews

Use free hosting services to deploy preview versions of the app.

Benefits:

- testers can validate changes without using a local environment;
- review comments can be collected before final merge;
- the project gains a realistic development workflow.

### Step 7: Keep documentation in the repository

Use the repository README, docs folder, and issue descriptions to capture:

- project purpose;
- architecture overview;
- setup instructions;
- testing commands;
- deployment notes;
- risk and security notes.

## 18. Risks in using free tools for student projects

Although free tools are suitable, the project should still be aware of the following:

- free tiers may have usage quotas;
- some free services may limit compute time or database storage;
- preview build environments may be turned off automatically;
- third-party services may change their free plans over time;
- data privacy requirements must still be respected even with free tools.

Mitigation:

- keep the MVP lightweight;
- prefer open-source and widely supported tools;
- document the deployment stack in the repository;
- maintain a fallback local environment for development and testing.

## 19. Summary

For a student project, GitHub and free-tier tools provide a practical and professional software development workflow without requiring paid licenses. The recommended setup includes GitHub for version control and planning, GitHub Actions for CI, VS Code for development, Docker and PostgreSQL for local environment support, Vercel/Netlify for frontend hosting, and a free backend hosting service for deployment. This combination is ideal for a small student team building a secure, maintainable finance management app while staying within budget and following realistic software engineering practices.

### Product owner / stakeholder

- defines scope and priorities;
- reviews requirements and acceptance criteria;
- confirms business value and release readiness.

### Developers

- implement frontend and backend features;
- write tests;
- review code and maintain quality.

### QA and test engineer

- define validation strategies;
- execute tests;
- track defects and regression issues.

### DevOps / platform support

- maintain deployment pipeline;
- configure environments;
- support monitoring and operational health.

## 17. Delivery milestones

Recommended delivery milestones:

1. Requirements and planning approved
2. Architecture and database design approved
3. Development environment ready
4. Backend MVP implemented
5. Frontend MVP implemented
6. Testing and bug fixing complete
7. Staging deployment ready
8. Production release prepared
9. Monitoring and support process active

## 18. Exit criteria for MVP

The project may move to release when:

- all critical user requirements are implemented;
- acceptance criteria are satisfied;
- automated tests pass;
- security checks are completed;
- deployment to staging succeeds;
- core user journeys are validated;
- operations, monitoring, and support procedures are in place.

## 19. Summary

This software development plan establishes a structured approach for building the Finance Management web application from requirements through deployment and operations. It covers all major project dimensions: requirement management, task planning, development environment, testing, production environment, risk and security management, cost control, toolchain selection, and operational support. The result is a realistic plan for a controlled MVP delivery using modern, maintainable, secure technology.
