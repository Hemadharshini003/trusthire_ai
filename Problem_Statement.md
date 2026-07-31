# Problem Statement

## 1. Title

TrustHire AI – Intelligent Freelancer Hiring Platform

---

## 2. Domain

Freelancer Hiring Platform

---

## 3. Who is the User?

### Client
- Registers and logs into the platform.
- Posts freelance jobs.
- Reviews proposals.
- Hires freelancers.
- Tracks project progress.
- Releases payments.
- Gives reviews.

### Freelancer
- Registers and creates a professional profile.
- Searches available jobs.
- Sends proposals.
- Completes assigned projects.
- Receives payments.
- Builds reputation through reviews.

### Admin
- Manages users.
- Verifies freelancer profiles.
- Monitors jobs and proposals.
- Handles reports and disputes.
- Maintains platform integrity.

---

## 4. What Problem are we Solving?

Many existing freelancing platforms face problems such as fake freelancer profiles, unverified skills, proposal spam, and difficulty in selecting the right freelancer. Clients spend significant time reviewing hundreds of proposals without knowing which freelancer is genuinely qualified. This leads to poor hiring decisions, project delays, and reduced trust between clients and freelancers.

---

## 5. Proposed Solution

TrustHire AI is a full-stack web application that helps clients hire verified freelancers efficiently. The platform allows clients to post jobs, freelancers to submit proposals, and administrators to verify profiles. It introduces profile verification, trust-based hiring, and intelligent proposal ranking to simplify freelancer selection and improve hiring quality.

---

## 6. Core Entities / Database Tables

- Users
- Roles
- Client Profiles
- Freelancer Profiles
- Jobs
- Skills
- Proposals
- Projects
- Milestones
- Payments
- Reviews
- Notifications
- Portfolio
- Certificates
- Trust Scores

---

## 7. User Roles & Permissions

### Client
- Register/Login
- Post Jobs
- View Proposals
- Hire Freelancer
- Track Projects
- Release Payments
- Give Reviews

### Freelancer
- Register/Login
- Create Profile
- Upload Portfolio
- Search Jobs
- Submit Proposals
- Manage Projects
- View Earnings

### Admin
- Manage Users
- Verify Freelancer Profiles
- Manage Jobs
- Handle Reports
- View Platform Analytics

---

## 8. Success Criteria

- Client can register and log in successfully.
- Freelancer can register and log in successfully.
- Client can post a job.
- Freelancer can search and apply for jobs.
- Client can view received proposals.
- Client can hire a freelancer.
- Project status can be tracked.
- Admin can manage users and jobs.

---

## 9. Out of Scope

The first version of the application will not include:
- Real payment gateway integration
- Live video meetings
- Real-time chat
- Mobile application
- Cryptocurrency payments
- AI-based recommendation engine (planned as future enhancement)

---

## 10. Chosen Track

**Python (FastAPI)**

Frontend:
- React.js
- Tailwind CSS

Backend:
- FastAPI

Database:
- MySQL

Authentication:
- JWT