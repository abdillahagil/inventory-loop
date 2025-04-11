import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { syncDatabase } from './models/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import inventoryRoutes from './routes/inventory.js';
import activitiesRoutes from './routes/activities.js';
import godownsRoutes from './routes/godowns.js';
import shopsRoutes from './routes/shops.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/godowns', godownsRoutes);
app.use('/api/shops', shopsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to StockMaster API' });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database and sync models
    // Set force to true only in development to reset the database
    const forceSync = process.env.NODE_ENV === 'development' && process.env.RESET_DB === 'true';
    const dbInitialized = await syncDatabase(forceSync);
    
    if (dbInitialized) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
      });
    } else {
      console.error('Server startup failed due to database initialization issues');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer(); 