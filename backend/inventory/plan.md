### **Technical Design Document: Clothing Inventory Application Backend**

#### **1.0 Introduction & Goals**

This document outlines the architecture and implementation plan for a serverless backend designed to manage a clothing store's inventory.

  * **1.1. Purpose:** To create a scalable, secure, and cost-effective system for tracking products, variants (e.g., size/color), and stock levels.
  * **1.2. Core Technologies:**
      * **Compute:** AWS Lambda (Node.js/TypeScript)
      * **API Layer:** AWS API Gateway (HTTP API)
      * **Framework:** Serverless Framework
      * **Database & Auth:** Supabase (PostgreSQL & JWT-based Authentication)

#### **2.0 High-Level Architecture**

The system follows a modern serverless pattern, decoupling the client, authentication service, and business logic.

  * **2.1. Architectural Diagram:**

    ```
    +-----------+      1. Login       +-------------------+
    |           |-------------------->|                   |
    |  Client   |      2. Get JWT     |  Supabase Auth    |
    | (Web/App) |<--------------------|                   |
    +-----------+                     +-------------------+
          |
          | 3. API Call w/ JWT (Authorization: Bearer <token>)
          |
          v
    +-------------------+      4. Validate Token      +----------------------+
    | AWS API Gateway   |---------------------------->|  Lambda Authorizer   |
    +-------------------+                             +----------------------+
          |                                                       | 5. If valid,
          | 6. Invoke Function                                    | get user identity
          v
    +-------------------+      7. Query/Mutate Data   +--------------------+
    |                   |---------------------------->|                    |
    |  Business Logic   |                             | Supabase Database  |
    | (Lambda Function) |                             |     (Postgres)     |
    |                   |<----------------------------|                    |
    +-------------------+      8. Return Results      +--------------------+
    ```

  * **2.2. Component Responsibilities:**

      * **Client:** Manages the user interface. Integrates with `supabase-js` to handle user sign-up/login and obtain a JWT.
      * **Supabase:** Acts as the Backend-as-a-Service (BaaS) layer. It is the single source of truth for user data (authentication) and application data (database).
      * **API Gateway:** Provides a secure and scalable entry point for all API requests. Routes requests to the appropriate Lambda functions.
      * **Lambda Authorizer:** A specialized Lambda function that acts as a gatekeeper. It validates the Supabase JWT before a request is allowed to reach the main business logic.
      * **Business Logic Lambdas:** Individual functions containing the core application logic (e.g., adding a product, updating stock levels).

#### **3.0 Data Model (Supabase PostgreSQL Schema)**

The database schema is designed to be normalized and flexible.

  * **`products`**
      * `id` (uuid, Primary Key)
      * `name` (text, not null)
      * `description` (text)
      * `brand` (text)
      * `category` (text)
      * `created_at` (timestamp with time zone)
  * **`variants`**
      * `id` (uuid, Primary Key)
      * `product_id` (uuid, Foreign Key to `products.id`)
      * `sku` (text, unique, not null) - Stock Keeping Unit
      * `attributes` (jsonb) - e.g., `{ "size": "M", "color": "Blue" }`
      * `price` (numeric)
  * **`inventory_items`**
      * `id` (uuid, Primary Key)
      * `variant_id` (uuid, Foreign Key to `variants.id`)
      * `quantity` (integer, default 0)
      * `location` (text) - e.g., "Storefront", "Warehouse"
  * **`stock_movements`** (For Auditing)
      * `id` (uuid, Primary Key)
      * `variant_id` (uuid, Foreign Key to `variants.id`)
      * `quantity_change` (integer) - Positive for additions, negative for sales/removals.
      * `reason` (text) - e.g., "customer\_sale", "new\_shipment", "damaged\_item"
      * `user_id` (uuid, Foreign Key to `auth.users`) - Who made the change.
      * `created_at` (timestamp with time zone)

#### **4.0 API Endpoints**

All endpoints (except login/register which are handled by Supabase) will be exposed via API Gateway.

| Method | Path                               | Description                                     | Protected? |
| :----- | :--------------------------------- | :---------------------------------------------- | :--------- |
| `POST` | `/products`                        | Create a new product.                           | Yes (Admin)  |
| `GET`  | `/products`                        | List all products with variants and stock levels. | Yes        |
| `GET`  | `/products/{productId}`            | Get details of a single product.                | Yes        |
| `PUT`  | `/products/{productId}`            | Update a product's details.                     | Yes (Admin)  |
| `POST` | `/inventory/add-stock`             | Add stock for a specific variant (new shipment). | Yes        |
| `POST` | `/inventory/remove-stock`          | Remove stock for a variant (sale, damage).      | Yes        |
| `GET`  | `/inventory/low-stock?threshold=5` | Get all variants with quantity below a threshold. | Yes        |

-----

#### **5.0 Backend Implementation Details (Lambda & Serverless Framework)**

  * **5.1. Project Structure:**

    ```
    inventory-backend/
    ├── src/
    │   ├── functions/        # Business logic handlers
    │   ├── authorizers/      # JWT validation logic
    │   └── libs/             # Shared code (e.g., Supabase client)
    ├── serverless.yml        # Main configuration file
    ├── package.json
    └── tsconfig.json
    ```

  * **5.2. Function Strategy:** Adopt a **Single Function per Endpoint** approach for optimal performance, security (granular IAM roles), and scalability.

  * **5.3. Configuration & Secrets Management:**

      * Supabase URL and `service_role` key will be stored securely in **AWS Systems Manager (SSM) Parameter Store**.
      * The `serverless.yml` file will reference these secrets using the `${ssm:/path/to/secret}` syntax to inject them as environment variables into the Lambda functions.

  * **5.4. Essential Serverless Framework Plugins:**

      * `serverless-plugin-typescript`: For automatic TypeScript compilation.
      * `serverless-offline`: For local development and testing of the API.
      * `serverless-esbuild`: To bundle and optimize code, creating smaller packages for faster Lambda cold starts.

#### **6.0 Development & Deployment Plan**

1.  **Phase 1: Foundation Setup**

      * Set up Supabase project (DB & Auth).
      * Set up AWS account and configure IAM user for Serverless Framework.
      * Initialize a new Serverless Framework project using a TypeScript template.
      * Store Supabase credentials in AWS SSM Parameter Store.

2.  **Phase 2: Database Connection & First Endpoint**

      * Create the Supabase client library (`src/libs/supabaseClient.ts`), ensuring the client is instantiated outside the handler.
      * Implement the unprotected `GET /products` endpoint to verify the connection between Lambda and Supabase is working.

3.  **Phase 3: Authentication**

      * Implement the Lambda Authorizer to validate the Supabase JWT.
      * Apply the authorizer to the `GET /products` endpoint in `serverless.yml`.

4.  **Phase 4: Core Business Logic**

      * Build the remaining `Product` and `Inventory` management functions.
      * Implement robust transaction logic, especially for the `stock_movements` audit trail.

5.  **Phase 5: Advanced Features & Deployment**

      * Build the `GET /inventory/low-stock` endpoint.
      * Set up a scheduled Lambda (cron job) for nightly low-stock alerts.
      * Deploy the service to a staging environment in AWS for final testing.