import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import errorMiddleware from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://jey-shop.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) only in development
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Not allowed by CORS'));
      }
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.json({ message: 'Online Order System API' });
});

app.use('/api', routes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

