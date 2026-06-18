# Advanced Systems Programming - Exercise 3

## Overview
This project implements a complete, scalable food delivery backend system (similar to Wolt) using a microservices architecture based on the specifications in Ex3 (4)_3.pdf[cite: 1]. 
It combines a modern **Node.js/Express Web Server** (built using the **MVC pattern**) for core business logic[cite: 1] with a high-performance **C++ Recommendation Engine Server**[cite: 1]. 

The Node.js API handles user management, orders, and restaurants, while seamlessly communicating with the C++ server via a dedicated TCP Socket Gateway to synchronize user interactions and recommendation data[cite: 1]. All data managed by the Express server is stored in-memory as volatile collections and resets upon server restart[cite: 1].

The system now includes an interactive React.js Frontend Web Application that delivers a smooth, single-page application (SPA) experience using asynchronous data fetching, dynamic component rendering, and custom state management. All data is now persistently managed using a local MongoDB Database container instead of volatile collections.

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

- **`wolt-frontend/src/` (Frontend Portion):**
  - `components/` — Modular, isolated UI building blocks (e.g., Navbar, ProductCard, SearchOverlay).
  - `context/` — Global state providers (e.g., Cart context handling item actions and quantities).
  - `App.js` — Core router initializing public paths, protected feeds, and global layouts.

---

## Tech Stack
- Web Server: Node.js + Express (JavaScript)[cite: 1]
- Recommendation Backend: C++17[cite: 1]
- Testing Suite: CMake + GoogleTest (C++)[cite: 1]
- Containerization: Docker & Docker-Compose[cite: 1]

---
## Key App Features & Frontend UX
- **Authentic Wolt Style UX:** Designed with a clean modern interface matching premium product standards, complete with dynamic product displays, full-screen interactive overlay search bars, and an absolute tracking side-cart.
- **Bulletproof Asset Fallbacks:** Seamless image protection. If any asset fails to load, background error boundary listeners (`onError`) intercept the failure and replace the broken image with a clean local `icon.svg` vector placeholder automatically.
- **Interactive Search Navigation:** Clicking any relative search-result item instantly resolves its owning restaurant context, guiding users fluidly to the targeted restaurant menu view.
- **Global Theme Support (Dark & Light Mode):** Fully integrated dynamic theme switching. Toggling the theme navbar switcher changes the application's global design layout tokens dynamically across all cards, modals, and containers.

## Client Validation & Security Workflows
- **Form Validation:** Registration and Login views contain strictly enforced client-side validation logic. Fields provide dynamic error feedback ensuring minimum password criteria (at least 8 alphanumeric characters), email formatting patterns, and required photo inputs before hitting network routes.
- **Session Protection via JWT:** Upon verified credentials login, the user receives a unique **JSON Web Token (JWT)** from the server token service endpoint (`POST /api/tokens`). 
- **Protected Actions:** Public routes are open to guest visitors. However, sensitive application interactions (such as viewing personal profile feeds or triggering order submissions) require appending the saved JWT string inside the HTTP request authentication headers to verify current identity records.
---

## Quick Start (Running the Integrated System)

### Option 1: Running via Docker (Recommended)
To build and spin up both the Node.js API and the C++ backend inside a shared network layer, run[cite: 1]:
```bash
docker-compose up --build
```

### Option 2: Local Execution (Using 3 Separate Terminals)
To run the entire system locally without Docker, open **3 separate terminal windows** and run the following commands in parallel:

Terminal 1: C++ Recommendation Server
Run the compiled C++ TCP backend server:
```bash
./my_program.exe ./app.out 5005
```
Terminal 2: Node.js Backend API Server
Navigate to the root folder (or backend directory), install dependencies, and start the Express server:
```bash
    npm install
    node app.js
```
Terminal 3: React Frontend Client
Navigate into the frontend directory, install web client dependencies, and start the React application:
```bash
    cd wolt-frontend
    npm install
    npm start
```
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