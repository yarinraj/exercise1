# Module 2: Authentication Protocols & Input Validation Schemas

This document provides a technical breakdown of the user onboarding, credential validation, security enforcement, and state management mechanisms implemented across the application clients and backend ecosystem.

---

## User Registration Schema and Requirements
The registration system enforces a structured data entry blueprint to ensure database integrity and establish account access scopes before storing documents inside the MongoDB database instance. 

Every new user profile record must contain the following structural fields:
* **Username:** A globally unique alphanumeric identifier used for account resolution during authentication.
* **Password:** A secured string following strict complexity profiles.
* **Display Name:** The visible user identity profile name displayed within the client applications.
* **Profile Picture:** A required graphical asset chosen or uploaded from the user device to personalize the interface.
* **User Identity Declaration (Role):** A explicit boolean or string value declaring whether the registrant is a **Customer** or a **Restaurant Owner**. This state determines the runtime UI theme, client routing, and operational permissions (such as accessing administration panels or placement menus).

### Password Complexity Rule
Passwords must be a minimum of **8 characters** in length and must consist of a combined alphanumeric mixture containing both **English alphabetical letters** and **numerical digits**. Simplistic numerical or purely alphabetical patterns are rejected.

---

## Client-Side Live Validation (On-Blur Dynamics)
To minimize redundant network requests while delivering an optimal user experience, registration screens employ **Live Validation** triggered specifically by field-focus shift (`onBlur` events) rather than postponing evaluations until form submission.

### 1. Username Availability Check
* **Trigger:** Occurs the moment the user leaves (blurs) the username input input field.
* **Logic:** The mobile or web client dispatches an asymmetric asynchronous query to the Node.js backend gateway to verify whether the typed string already exists in the MongoDB user collection.
* **Visual Response:** If the username is already registered to another account, an immediate localized error message is rendered directly below the field, disabling the primary submission button.

### 2. Password Strength Evaluation
* **Trigger:** Occurs when focus shifts away from the password entry container.
* **Logic:** Client-side regular expressions validate the string against length (>= 8 characters) and alphanumeric token requirements.
* **Visual Response:** Fails render structural hints detailing exactly which complexity metric was breached.

### 3. Password Confirmation Matching
* **Trigger:** Initiated upon leaving the "Confirm Password" input container.
* **Logic:** The evaluation engine compares the confirmation string value directly with the primary password variable state.
* **Visual Response:** If an identity mismatch is found, an inline warning informs the user that the passwords do not correlate.

---

## Secure Authentication and Token Generation Flow
The login protocol bridges client interface states with persistent database structures to authorize access to account profiles.

```text
[Client UI Form] ──(Credentials Passed)──> [Node.js Express Gateway]
                                                  │
                                          (Query & Match)
                                                  │
                                                  ▼
[Session Allowed App Entry] <──(Issue Token)── [MongoDB Records Verification]

Protocol Steps:
Credential Transmission: The client gathers the input username and password strings, shipping them over an encrypted network layer to the application server router.

MongoDB Data Matching: The Express backend leverages Mongoose queries to isolate the document corresponding to the supplied username. It then validates the password matching matrix against the stored record.

Session Token Issuance: Upon verified credential evaluation, the server flags the interaction as authorized and generates an operational session token.

App Entry Initialization: The client receives this authentication token, saves it within local storage wrapper states, alters the global app context to an authenticated user configuration, and routes the interface into the main food delivery marketplace layout.

Unauthenticated Guest State Constraints
To reduce user onboarding friction, the mobile application provides an optional guest operating mode. This state bypasses the login pipeline entirely, allowing unauthenticated guests to navigate the restaurant index lists, explore menus, configure shopping baskets, and place active delivery orders.

However, to incentivize formal account creation and protect specialized structural features, certain application interactions are restricted in the guest state such as rating restaurant and order history.
