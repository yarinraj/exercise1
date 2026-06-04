# Advanced Systems Programming - Exercise 3

## Overview
This project implements a complete, scalable food delivery backend system (similar to Wolt) using a microservices architecture based on the specifications in Ex3 (4)_3.pdf[cite: 1]. 
It combines a modern **Node.js/Express Web Server** (built using the **MVC pattern**) for core business logic[cite: 1] with a high-performance **C++ Recommendation Engine Server**[cite: 1]. 

The Node.js API handles user management, orders, and restaurants, while seamlessly communicating with the C++ server via a dedicated TCP Socket Gateway to synchronize user interactions and recommendation data[cite: 1]. All data managed by the Express server is stored in-memory as volatile collections and resets upon server restart[cite: 1].

---

## Version Control and Branch Management
In strict accordance with the project guidelines specified in Ex3 (4)_3.pdf to protect prior submissions[cite: 1]:
- The complete and standalone C++ server code submitted for Exercise 2 has been locked and isolated into a dedicated branch to preserve its state for evaluation[cite: 1].
- All active development, integration layers, and Express server implementations for Exercise 3 are maintained and merged directly into the main branch[cite: 1].

---

## Project Structure (MVC Architecture)
The web server strictly follows the Model-View-Controller design pattern to ensure loose coupling and clean architectural separation[cite: 1]:
- `app.js` — Main Express service entry point[cite: 1].
- `src/routes/` — API route definitions mapping URLs to HTTP controllers[cite: 1].
- `src/controllers/` — Request handlers managing HTTP responses and status codes[cite: 1].
- `src/models/` — Data structures handling volatile in-memory storage arrays[cite: 1].
- `src/services/` — Business logic layer and the TCP Socket Gateway connection[cite: 1].
- `include/` & `src/` (C++ Portion) — Highly optimized recommendation engine core from Exercise 2[cite: 1].
- `data/` — Persistent files and evaluation data for the recommendation logic[cite: 1].

---

## Tech Stack
- Web Server: Node.js + Express (JavaScript)[cite: 1]
- Recommendation Backend: C++17[cite: 1]
- Testing Suite: CMake + GoogleTest (C++)[cite: 1]
- Containerization: Docker & Docker-Compose[cite: 1]

---

## Quick Start (Running the Integrated System)

### Option 1: Running via Docker (Recommended)
To build and spin up both the Node.js API and the C++ backend inside a shared network layer, run[cite: 1]:
```bash
docker-compose up --build
```

### Option 2: Local Execution
1) Start the C++ Recommendation Server: Ensure the C++ TCP server is compiled and running on port 8000[cite: 1].
2) Start the Node.js API Server:
```bash
npm install
npm start
```
The API server will run on port 3000 or port 8080 by default[cite: 1].

---

## Main RESTful API Endpoints

### Global Search
- GET /api/search/:query — Full-Text Search. Case-insensitively filters restaurants and products by matching name or description properties[cite: 1].

### Restaurant & Menu Management
- GET /api/restaurants — List all restaurants[cite: 1].
- POST /api/restaurants — Create a new restaurant[cite: 1].
- GET /api/restaurants/:id — Get specific restaurant details[cite: 1].
- PATCH /api/restaurants/:id — Update restaurant data[cite: 1].
- DELETE /api/restaurants/:id — Delete a restaurant[cite: 1].
- GET /api/restaurants/:id/products — List all products (menu) of a restaurant[cite: 1].
- POST /api/restaurants/:id/products — Add a new product to a restaurant's menu[cite: 1].
- GET /api/restaurants/:id/products/:pid — View a specific product (Triggers an active background sync to the C++ server over TCP)[cite: 1].
- PATCH /api/restaurants/:id/products/:pid — Update product data[cite: 1].
- DELETE /api/restaurants/:id/products/:pid — Delete a product from the menu[cite: 1].

### Users & Authentication
- POST /api/users — Register a new user (Sign-Up via JSON body)[cite: 1].
- GET /api/users/:id — Fetch user profile details[cite: 1].
- POST /api/tokens — Create an authentication token yielding the user identifier upon successful login[cite: 1].

### Orders Management
- POST /api/orders — Create a new order (requires User ID passed in the HTTP Headers)[cite: 1].
- GET /api/orders — List all orders associated with the active user session passed via headers[cite: 1].
- GET /api/orders/:id — Get specific order details[cite: 1].
- PATCH /api/orders/:id — Update an order[cite: 1].
- DELETE /api/orders/:id — Delete an order[cite: 1].

---

## Execution Example
As required by the assignment instructions in Ex3 (4)_3.pdf, here is a command example of creating a resource using curl and its expected response[cite: 1]:

```bash
curl -i -X POST http://localhost:3000/api/restaurants \
-H "Content-Type: application/json" \
-d '{"name": "aaa"}'
```

Expected Output:
```text
HTTP/1.1 201 Created
X-Powered-By: Express
Location: /api/restaurants/ffc76e45-2353-4265-9e6a-29760a01f408
Connection: keep-alive
Content-Length: 0
```

---

## Local C++ Compilation & Unit Tests
If you wish to test or develop the C++ standalone core locally[cite: 1]:
```bash
cmake -S . -B build
cmake --build build
```

---

## Notes
- This project strictly adheres to Agile methodologies (managed via JIRA workflows and sprint tracking)[cite: 1].
- Contains no sensitive credentials, keys, or private tokens in its history[cite: 1].
- All data managed by the Node.js server is volatile and will reset upon server restart[cite: 1].