# Module 3: Dynamic Data Lifecycle & CRUD Management

This document outlines the implementation of Create, Read, Update, and Delete (CRUD) operations across the system entities. It details how structural data changes synchronize dynamically between the React Native mobile client, the React.js web application, and the persistent MongoDB database layer.

---

## Core System Entities
The application architecture orchestrates three primary data models managed via Mongoose schemas in the Express gateway backend:
1. **Restaurants:** Business profiles containing descriptive names, locations, classification categories, and associated menu arrays.
2. **Dishes / Menu Items:** Individual culinary entries nested under specific restaurant records, detailing names, descriptions, pricing matrices, and image assets.
3. **Orders:** Dynamic real-time transaction documents capturing buyer identity strings, ordered item arrays, quantity values, total pricing, and processing states.

---

## Data Operation Breakdown (CRUD Lifecycle)

### Restaurant Operations
Authorized web administrators or restaurant owners instantiate new business profiles within the ecosystem by dispatching a POST request to the `/api/restaurants` endpoint, which appends a new document to the database collection. To display the marketplace index, both the mobile client and the web platform perform Read operations via GET requests to retrieve the active restaurant list. Updates to metadata, location fields, or branding details are pushed through PUT requests directed at specific business identifiers (`/api/restaurants/:id`), while profile removal is handled by a DELETE request that completely purges the target document from the persistent storage layer.

### Dish and Menu Operations
Menu modifications are tightly coupled to their parent restaurant entities. A restaurant owner creates new culinary options by dispatching a POST request to the sub-route `/api/restaurants/:id/dishes`, which inserts the item details into the appropriate menu structure. Clients read these dishes dynamically whenever a user selects a specific food establishment, firing a targeted GET query that maps out the restaurant's embedded item array. Owners retain the ability to update item pricing, descriptions, or imagery via localized PUT requests, or permanently wipe deprecated items from the digital menu card using a targeted DELETE sequence.

### Order Operations
The transaction lifecycle begins when a mobile user or guest completes the checkout phase, launching a Create operation via a POST request to the `/api/orders` endpoint to establish a pending transaction document. These entities are read sequentially by mobile clients displaying personal order histories, and by administrative web dashboards tracking upcoming fulfillment feeds using filtered GET requests. To manage order tracking, kitchen managers update the transaction state dynamically by issuing PATCH requests that switch variables along progress timelines, such as moving a delivery from a pending state to a completed status.

---

## Cross-Client State Synchronization Flow
Because Exercise 5 mandates a transition away from localized, ephemeral client-side tracking, all user actions trigger immediate database-driven synchronization.

### Scenario: The Lifecycle of a Food Order
1. **State Mutation (Mobile Client):** An authenticated user or guest compiles a selection of items within their digital cart view and taps the checkout action. This issues an asymmetric asynchronous API request containing the serialized order payload to the Express server gateway.
2. **Database Integration (Backend Server):** The Node.js application executes structural data validation, generates a unique operational transaction ID, and writes the document to the active MongoDB collection.
3. **Instant UI Synchronization (Web & Mobile Portals):** The next time any administrative client or restaurant interface issues a data refresh or queries active feeds, the backend serves the newly committed database records. This guarantees that restaurant managers see order arrivals instantly on their service dashboards, reflecting changes made by mobile users seamlessly.

---

## Database Data Integrity Safeguards
To prevent data corruption, orphaned records, or broken dependencies, the backend controller architecture implements cascading restrictions:
* **Orphaned Items Prevention:** Deleting a primary restaurant entity automatically triggers a middleware hook that safely purges all associated menu items and records linked to that specific business ID.
* **Schema Validation Enforcement:** The database rejects any document updates or additions that omit mandatory parameters or violate specified data types, ensuring the client layer always renders standardized information models.
  
  