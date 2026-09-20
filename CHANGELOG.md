# Changelog

All notable changes to TrustHire AI are documented in this file.

## [1.1.0] - 2026-09-20

### Added

- Production frontend deployment using Vercel
- Production backend deployment using Railway
- Railway MySQL cloud database
- Production health endpoint
- Production CORS configuration
- VirusTotal threat intelligence integration
- AI cyber risk analysis for jobs
- AI cyber risk analysis for proposals
- Freelancer trust scoring
- Trust level classification
- Client proposal acceptance and rejection workflow
- Automatic rejection of other pending proposals after acceptance
- Job completion workflow
- Client-to-freelancer review workflow
- Completed-job review flow in the frontend
- Production API documentation through FastAPI Swagger/OpenAPI

### Security

- JWT-based authentication
- bcrypt password hashing
- Role-based authorization
- Protected API endpoints
- Server-side Pydantic validation
- SQLAlchemy ORM-based database access
- Environment-based secret configuration
- Environment files excluded from Git
- Production CORS configuration
- Basic backend application logging
- External URL threat intelligence through VirusTotal

### Testing

- Pytest unit test suite
- 9 automated tests
- All 9 tests passing
- 46% overall backend code coverage
- Ruff linting configured and passing
- CI validation verified successfully

### CI/CD

- GitHub Actions CI pipeline
- Automated Python environment setup
- Automated dependency installation
- Automated Ruff linting
- Automated Pytest execution
- CI configured for pushes to `main`
- CI configured for pull requests targeting `main`

### Deployment

- Frontend deployed to Vercel
- Backend deployed to Railway
- MySQL database deployed through Railway
- Production frontend connected to Railway backend
- Production Swagger documentation available
- Production health check available

### Documentation

- README updated with production deployment information
- Live frontend URL documented
- Live backend URL documented
- Swagger API URL documented
- Health endpoint documented
- Deployment architecture documented
- Technology stack documented
- Testing and CI/CD information documented
- Security implementation documented
- API modules documented
- Project structure documented
- Future enhancements documented
- CHANGELOG updated for Review-II

### Live URLs

- Frontend: https://trusthire-ai-eight.vercel.app
- Backend: https://trusthireai-production.up.railway.app
- Swagger: https://trusthireai-production.up.railway.app/docs
- Health: https://trusthireai-production.up.railway.app/health

---

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