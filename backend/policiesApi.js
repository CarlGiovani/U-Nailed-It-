import api  from "../config/axios";

// GET ACTIVE POLICIES (Public)
export const getActivePolicies = async () => {
  const res =  await api.get("/policies")
  return res.data;
}