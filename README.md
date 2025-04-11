# StockMaster Inventory Management System

StockMaster is a complete inventory management system built with React, Node.js, and PostgreSQL.

## Features

- Multi-role access control (Super Admin, Godown Admin, Shop Admin)
- Inventory tracking across multiple locations
- Product management
- User management
- JWT-based authentication
- Location-based permissions

## Tech Stack

### Frontend
- React with TypeScript
- Vite
- Shadcn UI
- Zustand for state management
- React Router
- React Hook Form with Zod validation
- Axios for API communication

### Backend
- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT for authentication
- Bcrypt for password hashing

## Prerequisites

- Node.js (v16+)
- PostgreSQL
- npm or yarn

## Getting Started

### Database Setup

1. Install PostgreSQL and PgAdmin
2. Create a new database named `inventory_loop`
3. Use the default postgres user or create a new user and update the `.env` file accordingly

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables in `.env` file:
   ```
   PORT=5000
   NODE_ENV=development
   DB_NAME=inventory_loop
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRES_IN=1d
   ```

4. To initialize the database with sample data, add this environment variable:
   ```
   RESET_DB=true
   ```

5. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. From the project root, install dependencies:
   ```
   npm install
   ```

2. Configure the environment variables in `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```

4. Access the application at `http://localhost:5173`

## Demo Users

- Super Admin: `superadmin` / `password123`
- Godown Admin: `godown1` / `password123`
- Shop Admin: `shop1` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (Super Admin only)
- `POST /api/users` - Create new user (Super Admin only)
- `GET /api/users/:id` - Get user by ID (Super Admin only)
- `PUT /api/users/:id` - Update user (Super Admin only)
- `DELETE /api/users/:id` - Delete user (Super Admin only)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (Super Admin only)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product (Super Admin only)
- `DELETE /api/products/:id` - Delete product (Super Admin only)

### Inventory
- `GET /api/inventory` - Get all inventory (location-based)
- `POST /api/inventory` - Create new inventory (Super Admin, Godown Admin)
- `GET /api/inventory/:id` - Get inventory by ID (with location-based access)
- `PUT /api/inventory/:id` - Update inventory (with location-based access)
- `DELETE /api/inventory/:id` - Delete inventory (Super Admin only)

## License

MIT
