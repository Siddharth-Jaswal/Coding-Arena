# Coding Arena: Backend API Integration Guide

==================================================
## 1. DOCUMENT PURPOSE
==================================================
This document serves as the primary integration contract and reference guide for Frontend Developers working on Coding Arena. It explains what backend functionality currently exists, how to connect to it, and how to format requests and handle responses.

At a high level, standard API requests flow synchronously:
`Frontend ➔ HTTP ➔ Express API ➔ PostgreSQL (Neon)`

However, code submissions follow an **asynchronous** workflow:
`Frontend ➔ Express API ➔ PostgreSQL ➔ BullMQ ➔ Redis ➔ Worker`

The API responds immediately after saving the submission to PostgreSQL (synchronous), while the heavy lifting of judging the code happens in the background (asynchronous).

==================================================
## 2. CURRENT BACKEND ARCHITECTURE
==================================================
The current backend consists of the following components:

- **Node.js / Express**: The core web server handling HTTP requests and routing.
- **PostgreSQL / Neon**: The primary, permanent relational database for the application.
- **pg**: The Node.js PostgreSQL client used for database queries.
- **Redis (Dockerized)**: An in-memory data store used locally for queue management.
- **BullMQ**: A robust queue system built on top of Redis.
- **Worker Process**: A standalone Node.js process dedicated to consuming jobs from BullMQ.

```text
       [ Frontend ]
            │ (HTTP)
            ▼
    [ Express API ] ─────────┐
            │                │
      (Read/Write)       (Add Job)
            │                │
            ▼                ▼
     [ PostgreSQL ]     [ BullMQ ]
                             │
                        (Queue State)
                             │
                             ▼
                         [ Redis ]
                             │
                         (Consume)
                             │
                             ▼
                    [ Worker Process ]
```

==================================================
## 3. PROJECT STRUCTURE
==================================================
The relevant backend folder structure is organized as follows:

```text
backend/
├── src/
│   ├── config/       # Database and Redis connection configurations
│   ├── controllers/  # Request handling and business logic for APIs
│   ├── routes/       # Express route definitions mapped to controllers
│   ├── queues/       # BullMQ queue instantiations
│   ├── workers/      # BullMQ worker process logic
│   └── db/
│       └── migrations/ # PostgreSQL schema definitions
├── package.json      # Dependencies and npm scripts
└── .env.example      # Environment variable templates
problem_bank/
├── problems/         # Problem test cases and configurations
```

==================================================
## 4. LOCAL DEVELOPMENT SETUP
==================================================
To run the backend locally, you need the following prerequisites:
- Node.js (v18+)
- npm
- Docker (for Redis)
- Access to the Neon PostgreSQL database (Connection string)

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and fill in your details:
```env
DATABASE_URL=postgres://user:pass@host/dbname?sslmode=require
PORT=5000
REDIS_URL=redis://localhost:6379
```
*Note: Never commit real credentials to version control.*

### Local Redis Setup
The backend requires a local Redis container for the BullMQ queue:
```bash
docker run -d --name coding-arena-redis -p 6379:6379 redis:7-alpine
```

Useful Docker commands:
- Start existing container: `docker start coding-arena-redis`
- View running containers: `docker ps`
- Verify Redis is reachable (Should return `PONG`): 
  `docker exec coding-arena-redis redis-cli ping`

==================================================
## 5. STARTING THE BACKEND
==================================================
The backend is split into two separate processes that must run concurrently.

**Terminal 1 (Start the API Server):**
```bash
cd backend
npm start
```

**Terminal 2 (Start the Worker):**
```bash
cd backend
npm run worker
```

**Why two processes?**
The API server is responsible for responding to frontend HTTP requests as fast as possible. The worker process handles the asynchronous queue. 
*Note: The worker is NOT required to test the basic `GET` and `POST` APIs for Problems and Users. However, if the worker is not running, newly created submissions will simply sit in the Redis queue forever.*

==================================================
## 6. BASE URL
==================================================
The local API base URL is:
`http://localhost:5000`

*Important: Frontend code should use an environment variable (e.g., `process.env.NEXT_PUBLIC_API_URL` or `import.meta.env.VITE_API_URL`) rather than hardcoding localhost, to allow seamless production deployments.*

==================================================
## 7. HEALTH ENDPOINT
==================================================
**METHOD:** `GET`
**PATH:** `/health`
**PURPOSE:** Verifies that the Express API is running.
**REQUEST BODY:** None
**SUCCESS STATUS:** `200 OK`
**SUCCESS RESPONSE:**
```json
{
  "status": "ok"
}
```

==================================================
## 8. PROBLEMS API
==================================================

### Create Problem
- **Method:** `POST`
- **Route:** `/api/problems`
- **Purpose:** Creates a new coding problem.
- **Request Body (JSON):**
  ```json
  {
    "title": "Two Sum",
    "description": "Given an array of integers...",
    "difficulty": "easy"
  }
  ```
- **Validation:** All fields are required. `difficulty` must be exactly `"easy"`, `"medium"`, or `"hard"`.
- **Success Status:** `201 Created`
- **Success Response:**
  ```json
  {
    "id": "1",
    "title": "Two Sum",
    "description": "Given an array of integers...",
    "difficulty": "easy",
    "created_at": "2023-10-01T12:00:00.000Z"
  }
  ```
- **Error Status:** `400 Bad Request`
- **Error Response:**
  ```json
  {
    "error": "difficulty must be easy, medium, or hard"
  }
  ```

### Get All Problems
- **Method:** `GET`
- **Route:** `/api/problems`
- **Purpose:** Fetches a list of all problems, ordered by newest first.
- **Success Status:** `200 OK`
- **Success Response:**
  ```json
  [
    {
      "id": "1",
      "title": "Two Sum",
      "description": "...",
      "difficulty": "easy",
      "created_at": "2023-10-01T12:00:00.000Z"
    }
  ]
  ```

### Get Problem by ID
- **Method:** `GET`
- **Route:** `/api/problems/:id`
- **Purpose:** Fetches a specific problem by its ID.
- **Path Parameters:** `id` (The problem ID)
- **Success Status:** `200 OK`
- **Error Status:** `404 Not Found`
- **Error Response:**
  ```json
  {
    "error": "Problem not found"
  }
  ```

==================================================
## 9. USERS API
==================================================
*WARNING: This API does NOT represent a secure authentication/login system. Passwords and JWTs are not currently implemented. Creating or fetching a user is currently a placeholder mechanism for tying submissions to a user profile.*

### Create User
- **Method:** `POST`
- **Route:** `/api/users`
- **Purpose:** Registers a new user.
- **Request Body (JSON):**
  ```json
  {
    "username": "frontend_dev",
    "email": "dev@example.com"
  }
  ```
- **Validation:** `username` and `email` are required, must be strings, and cannot be empty after trimming.
- **Success Status:** `201 Created`
- **Success Response:**
  ```json
  {
    "id": "1",
    "username": "frontend_dev",
    "email": "dev@example.com",
    "created_at": "2023-10-01T12:00:00.000Z"
  }
  ```
- **Error Status:** `409 Conflict` (If username or email already exists)
- **Error Response:**
  ```json
  {
    "error": "Username or email already exists"
  }
  ```

### Get User by ID
- **Method:** `GET`
- **Route:** `/api/users/:id`
- **Purpose:** Fetches a specific user profile.
- **Success Status:** `200 OK`
- **Error Status:** `404 Not Found`

### Get User Submissions
- **Method:** `GET`
- **Route:** `/api/users/:userId/submissions`
- **Purpose:** Fetches all submissions made by a specific user, ordered by newest first.
- **Path Parameters:** `userId` (The user's ID)
- **Success Status:** `200 OK`
- **Error Status:** `404 Not Found` (If the user does not exist)

==================================================
## 10. SUBMISSIONS API
==================================================

### Create Submission
- **Method:** `POST`
- **Route:** `/api/submissions`
- **Purpose:** Submits source code for a specific problem.
- **Request Body (JSON):**
  ```json
  {
    "user_id": 1,
    "problem_id": 1,
    "language": "cpp",
    "source_code": "#include <iostream>\nint main() { return 0; }"
  }
  ```
- **Validation:** 
  - `user_id` and `problem_id` are required. 
  - `language` and `source_code` must be non-empty strings.
  - The API verifies that the User and Problem actually exist in the database.
- **Important:** THE FRONTEND MUST NOT SEND A `verdict` FIELD. The backend automatically forces the initial verdict to `"pending"`.
- **Success Status:** `201 Created`
- **Success Response:**
  ```json
  {
    "id": "1",
    "user_id": "1",
    "problem_id": "1",
    "language": "cpp",
    "source_code": "#include <iostream>\nint main() { return 0; }",
    "verdict": "pending",
    "created_at": "2023-10-01T12:00:00.000Z"
  }
  ```
- **Error Status:** `404 Not Found` (If user or problem doesn't exist).

### Get Submission by ID
- **Method:** `GET`
- **Route:** `/api/submissions/:id`
- **Purpose:** Fetches the details and current verdict of a submission.
- **Success Status:** `200 OK`
- **Error Status:** `404 Not Found`

==================================================
## 11. SUBMISSION ASYNC WORKFLOW
==================================================
When the frontend calls `POST /api/submissions`, the following lifecycle occurs:

```text
Frontend
   │
   │ POST /api/submissions
   ▼
Express API
   │
   │ INSERT (verdict: "pending")
   ▼
PostgreSQL
   │
   │ submission ID
   ▼
BullMQ Queue
   │
   ▼
Redis
   │
   ▼
Submission Worker
```

1. Frontend sends the source code.
2. Backend validates the request and verifies the user and problem exist.
3. PostgreSQL creates the submission row.
4. The initial verdict is forced to `"pending"`.
5. BullMQ receives a job payload containing the new submission ID.
6. Redis stores BullMQ's queue state.
7. The Worker picks up the job.

**VERY IMPORTANT:**
At the current stage, the worker only logs the receipt and completion of the submission job. 
It does **NOT** yet:
- Compile C++ code
- Execute code securely
- Run private test cases
- Calculate `accepted` or `wrong_answer`
- Update the database with a final verdict

Therefore, any submission created by the frontend currently remains **"pending"** indefinitely. Please do not expect the verdict to change automatically at this stage of development. Do not describe Judge v1 as implemented.

==================================================
## 12. FRONTEND SUBMISSION FLOW
==================================================
A practical user journey for the frontend developer to implement:

1. **User opens a problem:** Frontend calls `GET /api/problems/:id`
2. **User writes code:** Frontend captures code in a code editor component.
3. **User submits:** Frontend calls `POST /api/submissions` with `user_id`, `problem_id`, `language`, and `source_code`.
4. **Initial Response:** Backend returns the submission object with `verdict: "pending"`.
5. **Polling (PLANNED/FUTURE):** The frontend should store the returned submission ID and periodically poll `GET /api/submissions/:id` to check if the verdict has changed from `"pending"`. 

*(Note: WebSockets are not currently implemented, so HTTP polling will be required once final judging is active).*

==================================================
## 13. DATABASE MODEL
==================================================
The PostgreSQL database (Neon) uses the following schema:

### `users`
- `id`: BIGSERIAL (Primary Key)
- `username`: VARCHAR(50) (Unique, Not Null)
- `email`: VARCHAR(255) (Unique, Not Null)
- `created_at`: TIMESTAMPTZ (Default NOW)

### `problems`
- `id`: BIGSERIAL (Primary Key)
- `title`: VARCHAR(255) (Not Null)
- `description`: TEXT (Not Null)
- `difficulty`: VARCHAR(20) (Not Null, Checked)
- `created_at`: TIMESTAMPTZ (Default NOW)
- **Constraints:** `difficulty` MUST be `'easy'`, `'medium'`, or `'hard'`.

### `submissions`
- `id`: BIGSERIAL (Primary Key)
- `user_id`: BIGINT (Foreign Key to `users.id`, ON DELETE CASCADE)
- `problem_id`: BIGINT (Foreign Key to `problems.id`, ON DELETE CASCADE)
- `language`: VARCHAR(30) (Not Null)
- `source_code`: TEXT (Not Null)
- `verdict`: VARCHAR(30) (Not Null, Checked)
- `created_at`: TIMESTAMPTZ (Default NOW)
- **Constraints:** `verdict` MUST be one of `'pending'`, `'accepted'`, `'wrong_answer'`, `'runtime_error'`, `'time_limit_exceeded'`, `'compilation_error'`.

==================================================
## 14. FRONTEND DATA MODELS
==================================================
*IMPORTANT WARNING: PostgreSQL `BIGINT` values (like `id`, `user_id`, `problem_id`) are serialized as strings by the `pg` driver to prevent JavaScript precision loss. The frontend MUST treat all IDs as strings, not numbers!*

**User Object:**
```json
{
  "id": "1",
  "username": "sid",
  "email": "sid@example.com",
  "created_at": "2023-10-01T12:00:00.000Z"
}
```

**Problem Object:**
```json
{
  "id": "1",
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "easy",
  "created_at": "2023-10-01T12:00:00.000Z"
}
```

**Submission Object:**
```json
{
  "id": "1",
  "user_id": "1",
  "problem_id": "1",
  "language": "cpp",
  "source_code": "#include <iostream>...",
  "verdict": "pending",
  "created_at": "2023-10-01T12:00:00.000Z"
}
```

==================================================
## 15. HTTP STATUS CODE REFERENCE
==================================================
| Status Code | Meaning in this API |
|-------------|---------------------|
| `200` | OK. Request succeeded (e.g., fetching a problem). |
| `201` | Created. A resource was successfully created (e.g., a new submission). |
| `400` | Bad Request. Missing or invalid fields in the request body. |
| `404` | Not Found. The requested ID (User, Problem, Submission) does not exist. |
| `409` | Conflict. Attempted to create a user with an existing username or email. |
| `500` | Internal Server Error. The database or server encountered an unexpected failure. |

==================================================
## 16. ERROR FORMAT
==================================================
Whenever the backend returns a `400`, `404`, `409`, or `500` status code, the response body will always be a JSON object containing a single `error` key:

```json
{
  "error": "Problem not found"
}
```
Frontend code should parse this `error` property to display toast notifications or form errors to the user.

==================================================
## 17. CURL / REQUEST EXAMPLES
==================================================

**Check Health:**
```bash
curl http://localhost:5000/health
```

**Create a User:**
```bash
curl -X POST http://localhost:5000/api/users \
-H "Content-Type: application/json" \
-d "{\"username\":\"johndoe\", \"email\":\"john@example.com\"}"
```

**Fetch a Problem:**
```bash
curl http://localhost:5000/api/problems/1
```

**Submit Code:**
```bash
curl -X POST http://localhost:5000/api/submissions \
-H "Content-Type: application/json" \
-d "{\"user_id\":\"1\", \"problem_id\":\"1\", \"language\":\"cpp\", \"source_code\":\"int main() { return 0; }\"}"
```

==================================================
## 18. FRONTEND FETCH EXAMPLES
==================================================
```javascript
const API_BASE_URL = "http://localhost:5000";

// 1. Fetch all problems
async function loadProblems() {
  const response = await fetch(`${API_BASE_URL}/api/problems`);
  const problems = await response.json();
  return problems; // Array of problem objects
}

// 2. Create a submission
async function submitCode(userId, problemId, sourceCode) {
  const response = await fetch(`${API_BASE_URL}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      problem_id: problemId,
      language: 'cpp',
      source_code: sourceCode
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error); // Handle API error message
  }
  
  return data; // Returns the new submission object with verdict: "pending"
}
```

==================================================
## 19. REDIS / BULLMQ EXPLANATION
==================================================
Redis is **not** our primary database. Our permanent application data lives in PostgreSQL. Redis is used strictly for BullMQ (our asynchronous job queue).

BullMQ uses Redis to coordinate jobs between the Express API and the Worker process. Frontend developers should **never** attempt to read from or push to Redis directly. The Express API handles all queue additions.

- **Queue Name:** `submission-queue`
- **Job Name:** `judge-submission`
- **Job Payload:** `{ "submissionId": "1" }`

==================================================
## 20. PROBLEM BANK
==================================================
The repository contains a `problem_bank/` directory. This directory holds configurations (`problem.json`), solutions, and test cases for each coding challenge. 

Test cases are split into `public/` (examples shown to the user) and `private/` (hidden tests used for final grading). This structure is intended for the backend judge system and should not be accessed directly by the frontend application.

==================================================
## 21. CURRENTLY IMPLEMENTED VS PLANNED
==================================================
**CURRENTLY IMPLEMENTED:**
- [x] Node/Express API Foundation
- [x] Neon PostgreSQL Connection & Schema
- [x] Health Endpoint (`/health`)
- [x] Problems CRUD APIs
- [x] Users CRUD APIs
- [x] Submissions CRUD APIs (saving to database)
- [x] Local Docker Redis infrastructure
- [x] BullMQ asynchronous submission queue
- [x] Standalone worker process (listening for jobs)

**NOT IMPLEMENTED YET:**
- [ ] User authentication / JWT / Login system
- [ ] C++ Compilation
- [ ] Sandboxed submitted-code execution
- [ ] Test-case judging logic
- [ ] Final verdict generation (Updating "pending" to "accepted")
- [ ] WebSockets for real-time frontend updates

==================================================
## 22. FRONTEND INTEGRATION CHECKLIST
==================================================
As a frontend developer, you can use this checklist to guide your integration:

- [ ] Configure `API_BASE_URL` in your `.env.local` or environment config.
- [ ] Verify connectivity by calling `GET /health`.
- [ ] Fetch and display the list of problems using `GET /api/problems`.
- [ ] Create a placeholder user on application load via `POST /api/users` (or fetch an existing one) to obtain a valid `user_id`.
- [ ] Build the code editor interface and hook up the "Submit" button to `POST /api/submissions`.
- [ ] Save the returned submission ID in your frontend state.
- [ ] Display the `"pending"` status in the UI.
- [ ] Ensure your HTTP fetch wrappers elegantly catch and display `error` fields from 400/404/409 responses.
- [ ] (Future) Prepare your UI to poll the submission endpoint to watch for verdict changes once judging is implemented.
