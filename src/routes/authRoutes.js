import express from 'express';
import {
  registerCustomer,
  registerSeller,
  registerDeliverer,
  login
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register/customer', registerCustomer);
router.post('/register/seller', registerSeller);
router.post('/register/deliverer', registerDeliverer);
router.post('/login', login);

export default router;

