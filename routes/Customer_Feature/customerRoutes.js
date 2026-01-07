import express from "express";
import * as CustomerController from "../../controllers/Customer_Feature/customerController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

// PUBLIC
router.post("/", CustomerController.createOrGetCustomer); // Create customer if not exists
router.get("/by-email", CustomerController.getCustomerByEmail); // Get customer info by email

// ADMIN
router.get("/", verifyAdmin, CustomerController.getAllCustomers); // Get all customers

export default router;
