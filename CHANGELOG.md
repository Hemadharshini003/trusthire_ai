# Changelog

All notable changes to TrustHire AI are documented in this file.

## [1.0.0] - 2026-09-11

### Added

- User registration and login
- JWT authentication
- bcrypt password hashing
- Client and Freelancer roles
- Role-based authorization
- Job creation
- Job listing
- Job update
- Job cancellation
- Job completion workflow
- Freelancer proposal submission
- Proposal listing
- Proposal acceptance
- Proposal rejection
- Automatic rejection of other pending proposals after acceptance
- Freelancer trust score
- Trust level classification
- Client reviews
- Review-based trust score update
- AI cyber risk engine
- Job risk assessment
- Proposal risk assessment
- Risk score classification
- Risk explanation
- MySQL database integration
- SQLAlchemy ORM
- FastAPI Swagger/OpenAPI documentation
- Health endpoint
- CORS configuration
- Environment variable configuration
- Pytest test suite
- Test coverage reporting
- Ruff linting
- GitHub Actions CI pipeline

### Security

- Passwords are stored using bcrypt hashing.
- JWT tokens protect authenticated endpoints.
- Role-based authorization is enforced on protected operations.
- Database access is implemented using SQLAlchemy ORM.
- Environment secrets are excluded from Git.
- `.env.example` added for safe configuration sharing.

### Testing

- 9 automated tests implemented.
- All 9 tests passing.
- Overall backend coverage: 52%.
- Ruff checks passing successfully.

### Documentation

- README updated with project overview, setup, API modules, security, testing, and architecture information.
- CHANGELOG added.
- Architecture, ER, Class/Module, and API documentation planned under `docs/diagrams/`.