# TrustHire AI

AI-Powered Cyber Trust Freelance Hiring Platform

## 1. Project Overview

TrustHire AI is a secure freelance hiring platform designed to connect clients and freelancers while adding cybersecurity-focused trust and risk intelligence.

The platform provides secure authentication, role-based hiring workflows, proposal management, freelancer trust scoring, reviews, and AI-based cyber risk assessment.

## 2. Problem Statement

Traditional freelance platforms mainly focus on connecting clients and freelancers. They provide limited visibility into freelancer trustworthiness and potential cybersecurity risks in job postings or proposals.

TrustHire AI addresses this problem by combining freelance hiring workflows with trust scoring and cyber risk assessment.

## 3. Key Features

### Authentication

- User registration
- Secure password hashing using bcrypt
- JWT-based authentication
- Role-based access control

### Client Features

- Create jobs
- View own jobs
- Update open jobs
- Cancel open jobs
- View proposals
- Accept proposals
- Reject proposals
- Complete assigned jobs
- Review freelancers
- View trust information
- Analyze job/proposal cyber risk

### Freelancer Features

- View available jobs
- Submit proposals
- View submitted proposals
- View trust score
- View reviews
- View cyber risk information

### Trust Intelligence

- Freelancer trust score
- Trust level classification
- Review-based score updates
- Job cyber risk assessment
- Proposal cyber risk assessment
- Risk score and explanation
- VirusTotal URL threat intelligence

## 4. User Roles

### Client

Can:

- Create and manage jobs
- Review proposals
- Accept or reject proposals
- Complete assigned jobs
- Review freelancers
- Analyze cyber risk

### Freelancer

Can:

- View open jobs
- Submit proposals
- Track proposal status
- View trust score
- View reviews
- Check job risk information

## 5. Technology Stack

### Frontend

- React
- Vite
- CSS
- JavaScript

### Backend

- FastAPI
- Python
- SQLAlchemy
- PyMySQL
- Pydantic

### Authentication & Security

- JWT authentication
- bcrypt password hashing
- Role-based access control
- Environment-based secrets
- CORS protection
- Server-side validation

### Database

- MySQL 8
- SQLAlchemy ORM

### AI & Cybersecurity

- TrustHire AI rule-based cyber risk engine
- Job risk assessment
- Proposal risk assessment
- VirusTotal threat intelligence integration
- Freelancer trust scoring

### Testing & Quality

- Pytest
- Pytest-Cov
- Ruff

### API Documentation

- FastAPI Swagger / OpenAPI

### CI/CD

- GitHub Actions

### Deployment

- Frontend: Vercel
- Backend: Railway
- Database: Railway MySQL

## 6. Database Schema

TrustHire AI contains five core entities:

1. Users
2. Jobs
3. Proposals
4. Reviews
5. Risk Assessments

### Relationships

- User → Jobs
- User → Proposals
- Job → Proposals
- User → Reviews
- Job → Reviews
- Job → Risk Assessment

## 7. Live Deployment

### Frontend

https://trusthire-ai-eight.vercel.app

### Backend API

https://trusthireai-production.up.railway.app

### Swagger API Documentation

https://trusthireai-production.up.railway.app/docs

### Health Check

https://trusthireai-production.up.railway.app/health

## 8. Deployment Architecture

```text
User Browser
     |
     v
React + Vite
Vercel
     |
     | HTTPS REST API
     v
FastAPI Backend
Railway
     |
     +------------------+
     |                  |
     v                  v
Railway MySQL       VirusTotal API
     |
     v
TrustHire AI Data