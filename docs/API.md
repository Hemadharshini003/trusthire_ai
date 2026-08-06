# API Planning

This document defines the planned REST API endpoints for the TrustHire AI platform.

---

# Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /register | Register a new user (Client or Freelancer) |
| POST | /login | Authenticate user and return JWT token |
| GET | /profile | Retrieve logged-in user's profile |
| PUT | /profile | Update user profile information |

---

# Client APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /jobs | Create a new job posting |
| GET | /jobs | View all jobs posted by the client |
| PUT | /jobs/{id} | Update an existing job |
| DELETE | /jobs/{id} | Delete a job posting |
| GET | /proposals | View proposals received for posted jobs |
| POST | /hire | Hire a freelancer for a selected proposal |

---

# Freelancer APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /jobs | Browse available job postings |
| POST | /proposal | Submit a proposal for a job |
| GET | /projects | View assigned projects |
| PUT | /project/status | Update the current project status |

---

# Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users | View all registered users |
| PUT | /verify-user | Verify a user account |
| DELETE | /user | Remove a user from the platform |
| GET | /reports | View platform reports and analytics |

---

# HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Notes

- All protected APIs require JWT Authentication.
- Responses will be returned in JSON format.
- Role-based access control (RBAC) will be implemented for Client, Freelancer, and Admin.