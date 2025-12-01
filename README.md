Social Login + CRUD Application

A full-stack web application that implements Google/Facebook OAuth login, a Node.js/Express backend, a React frontend, CRUD operations, Jest testing, and JMeter performance testing (100/250/500 user load).

Features
Authentication

Google OAuth 2.0 login

Facebook OAuth login

User session support

Protected dashboard route


Frontend (React)

Modern UI (Login, Dashboard, Item list, Item form)

Item CRUD interface

Fully tested using React Testing Library + Jest


Backend (Node.js)

REST API (/api/items)

CRUD endpoints: GET, POST, PUT, DELETE

Passport.js OAuth integration

Session & cookie management

Validation & error handling

Full backend test suite with Jest + Supertest


Performance Testing

Apache JMeter load tests at:

100 users

250 users

500 users


Metrics collected:

Response time (avg, min, max)

Throughput

Received/sent KB per sec

Standard deviation

Error % (0% across all tests)

🛠️ Tech Stack
Frontend

React 19

React Router

CSS Modules

Jest + React Testing Library


Backend

Node.js / Express

Passport.js

Google OAuth 2.0

Facebook OAuth

Express-session

Jest + Supertest

Performance Tools

Apache JMeter

Project Structure
social-login-app/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── _tests_/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server.js
├── views/
├── tests/ (backend tests)
├── package.json
└── README.md

Getting Started
1. Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git
cd social-login-app

Backend Setup
Install dependencies
npm install

Create .env file
GOOGLE_CLIENT_ID=xxxx
GOOGLE_CLIENT_SECRET=xxxx
FACEBOOK_CLIENT_ID=xxxx
FACEBOOK_CLIENT_SECRET=xxxx
SESSION_SECRET=your-session-secret

Start backend server
node server.js


Backend runs at:
http://localhost:3000

Frontend Setup
cd frontend
npm install
npm start


Frontend runs at:
http://localhost:3001

Testing
Backend tests
npm test

Frontend tests
cd frontend
npm test --coverage


Produces interactive coverage report and HTML coverage.

Performance Testing (JMeter)


Files included:

100-user test summary

250-user test summary

500-user test summary

Full performance analysis included in report Software Testing Report for Social Login + CRUD Application.docx


Key observations:

No errors detected across all tests

Backend stable up to 500 users

Throughput increased linearly across loads

Average response times remained low

No bottlenecks detected for this scale


Authentication Flow

User clicks Login with Google/Facebook

Redirects to OAuth provider

User authorizes

Provider returns access token

Session stored in Express

User is redirected to Dashboard

CRUD API is available to authenticated users only

