// serviceApi.js
import api from "../config/axios";

// Get all services
export const getAllServices = async () => {
  try {
    const res = await api.get("/services");
    return res.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Get single service by ID
export const getServiceById = async (id) => {
  try {
    const res = await api.get(`/services/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching service ${id}:`, error);
    throw error;
  }
};

// Get active services only
export const getActiveServices = async () => {
  try {
    const res = await api.get("/services?status=active");
    return res.data;
  } catch (error) {
    console.error('Error fetching active services:', error);
    throw error;
  }
};