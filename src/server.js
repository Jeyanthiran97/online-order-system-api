import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.json({ message: 'Online Order System API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

