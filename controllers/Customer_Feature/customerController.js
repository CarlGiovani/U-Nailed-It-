import * as Customer from "../../models/Customer_Feature/customerModel.js";

// PUBLIC: Create or get customer by email
export const createOrGetCustomer = async (req, res) => {
  try {
    const customer = await Customer.getOrCreateCustomer(req.body);
    const wasCreated = !customer.id;
    res.status(wasCreated ? 201 : 200).json({ customer, created: wasCreated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC: Get customer by email
export const getCustomerByEmail = async (req, res) => {
  const { email } = req.query;
  try {
    const customer = await Customer.getCustomerByEmail(email);
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAllCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
