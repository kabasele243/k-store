# Clothing Inventory Backend

A serverless backend for managing a clothing store's inventory, built with AWS Lambda, API Gateway, and Supabase.

## Architecture

- **Compute**: AWS Lambda (Node.js/TypeScript)
- **API Layer**: AWS API Gateway (HTTP API)
- **Framework**: Serverless Framework
- **Database & Auth**: Supabase (PostgreSQL + JWT Authentication)

## Features

- Product management (CRUD operations)
- Variant tracking (size, color, etc.)
- Stock level management with locations
- Stock movement audit trail
- Low stock alerts
- JWT-based authentication
- RESTful API

## Prerequisites

- Node.js 20.x or higher
- AWS Account with CLI configured
- Supabase Account
- Serverless Framework CLI (`npm install -g serverless`)

## Setup

### 1. Clone and Install Dependencies

```bash
cd backend/inventory-backend
npm install
```

### 2. Supabase Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Run the database schema:
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `database/schema.sql`
   - Execute the SQL

3. Get your credentials:
   - Go to Settings > API
   - Copy `URL` (Project URL)
   - Copy `service_role` key (Service Role Key - **keep this secret!**)
   - Copy `JWT Secret` from Settings > API > JWT Settings

### 3. AWS Configuration

#### For Local Development

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

#### For AWS Deployment

Store secrets in AWS Systems Manager Parameter Store:

```bash
# For dev stage
aws ssm put-parameter \
  --name "/inventory/dev/supabase-url" \
  --value "https://your-project.supabase.co" \
  --type "String"

aws ssm put-parameter \
  --name "/inventory/dev/supabase-service-role-key" \
  --value "your-service-role-key" \
  --type "SecureString"

aws ssm put-parameter \
  --name "/inventory/dev/supabase-jwt-secret" \
  --value "your-jwt-secret" \
  --type "SecureString"

# For prod stage, replace 'dev' with 'prod'
```

### 4. Local Development

Run the API locally using serverless-offline:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### 5. Deployment

Deploy to AWS:

```bash
# Deploy to dev stage (default)
npm run deploy

# Deploy to production
npm run deploy:prod
```

## API Endpoints

All endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List all products with variants and stock |
| `POST` | `/products` | Create a new product |
| `GET` | `/products/{productId}` | Get a single product |
| `PUT` | `/products/{productId}` | Update a product |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/inventory/add-stock` | Add stock for a variant |
| `POST` | `/inventory/remove-stock` | Remove stock (sale, damage, etc.) |
| `GET` | `/inventory/low-stock?threshold=5` | Get variants below threshold |

## Request/Response Examples

### Create Product

```bash
POST /products
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "brand": "Your Brand",
  "category": "Tops"
}
```

### Add Stock

```bash
POST /inventory/add-stock
Content-Type: application/json
Authorization: Bearer <token>

{
  "variant_id": "uuid-here",
  "quantity": 50,
  "location": "Warehouse",
  "reason": "new_shipment"
}
```

### Remove Stock

```bash
POST /inventory/remove-stock
Content-Type: application/json
Authorization: Bearer <token>

{
  "variant_id": "uuid-here",
  "quantity": 2,
  "location": "Storefront",
  "reason": "customer_sale"
}
```

### Get Low Stock

```bash
GET /inventory/low-stock?threshold=10
Authorization: Bearer <token>
```

## Authentication

Users authenticate through Supabase Auth:

1. Sign up/login using Supabase client library in your frontend
2. Supabase returns a JWT token
3. Include the token in the `Authorization` header for all API requests
4. The Lambda Authorizer validates the token before allowing access

## Database Schema

- **products**: Product information (name, brand, category)
- **variants**: Product variants (SKU, attributes like size/color, price)
- **inventory_items**: Stock levels by variant and location
- **stock_movements**: Audit trail of all stock changes

## Project Structure

```
inventory-backend/
├── src/
│   ├── functions/          # Lambda function handlers
│   │   ├── getProducts.ts
│   │   ├── createProduct.ts
│   │   ├── getProduct.ts
│   │   ├── updateProduct.ts
│   │   ├── addStock.ts
│   │   ├── removeStock.ts
│   │   └── getLowStock.ts
│   ├── authorizers/        # JWT validation
│   │   └── jwtAuthorizer.ts
│   └── libs/               # Shared utilities
│       ├── supabaseClient.ts
│       ├── errorHandler.ts
│       └── types.ts
├── database/
│   └── schema.sql          # Database schema
├── serverless.yml          # Serverless config
├── package.json
└── tsconfig.json
```

## Scripts

- `npm run dev` - Run API locally with serverless-offline
- `npm run deploy` - Deploy to AWS (dev stage)
- `npm run deploy:prod` - Deploy to production
- `npm run remove` - Remove deployed stack
- `npm run logs` - View Lambda logs (requires function name)

## Security Notes

- Never commit `.env` file or secrets to version control
- Use AWS SSM Parameter Store for production secrets
- Service role key has admin access - keep it secure
- Implement Row Level Security (RLS) in Supabase for additional protection
- Consider implementing role-based access control for admin operations

## Monitoring and Logs

View logs in AWS CloudWatch or use:

```bash
serverless logs -f getProducts --tail
```

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure SSM parameters are set in the correct region
- Check parameter names match those in `serverless.yml`

### "Authorization error"
- Verify JWT secret matches Supabase project settings
- Check token is being sent in Authorization header
- Ensure token hasn't expired

### Local development not working
- Check `.env` file exists and has correct values
- Ensure Node.js version is 20.x or higher
- Run `npm install` to ensure all dependencies are installed

## License

ISC
