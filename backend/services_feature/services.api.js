import api from "../../src/config/axios.js";

export const getAllServices = async () => {
  const res = await api.get("/services");
  return res.data; // JSON from backend
};
