# Advanced Systems Programming - Exercise 5 Food Delivery Ecosystem

## Application Overview and System Architecture
Our application simulates a full-scale food delivery ecosystem inspired by the visual appearance and functionality of the real Wolt application. The system follows a decoupled microservices architecture where independent components manage specialized tasks to process, synchronize, and showcase data.

The technical stack consists of the following architectural components:
1. Mobile Client (React Native): The primary cross-platform application that fetches real and dynamic data from the backend server.
2. Web Client (React.js): The web-based deployment platform allowing simultaneous operation alongside the mobile application.
3. API Gateway / Backend (Node.js & Express): Manages incoming REST requests, handles data validation routines, and routes queries.
4. Core Recommendation Engine (C++): A high-performance background computing engine handling structural data operations.
5. Database Instance (MongoDB): A persistent NoSQL database managing collections for accounts, menus, dishes, and orders.

---

## Exercise 5 Modifications and Technologies Used
In this exercise, the system infrastructure has migrated to a production-grade backend setup with a completely new client experience:
* Server-Side Database Persistence: The Node.js backend application has been refactored to transition completely from managing entities inside transient in-memory arrays. All application states are now saved and dynamically accessed via a MongoDB database using the Mongoose Object Data Modeling (ODM) library.
* Mobile Interface Architecture: Developed a native application layout utilizing React Native. This includes creating tailored mobile design paradigms, such as swipeable components or overlay side menus, rather than wide-screen top navigation bars.
* Input Handling and Field Validations: Integrated strict input validation schemas on authentication screens. Registration forms enforce mandatory parameters, evaluate format rules (such as email structures and specific password conditions), and render immediate visual feedback before allowing database account creation.

---

## Technical Documentation Wiki
To ensure an efficient review process, all environmental setups, compilation guidelines, input validation schemas, database designs, and dynamic CRUD system flows have been thoroughly documented in our local project Wiki.

Please navigate to the dedicated wiki directory to review the step-by-step documentation modules:
* **Module 1 - Environment Setup:** `./wiki/01-environment-setup.md`
* **Module 2 - Authentication & Validations:** `./wiki/02-authentication.md`
* **Module 3 - Data CRUD Management:** `./wiki/03-crud-management.md`

---

## Infrastructure Quick Start
To immediately instantiate the core backend components and database orchestration layer using default container configurations, execute the following command from this root directory:

```bash
docker-compose up --build