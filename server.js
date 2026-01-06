import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

//ENDPOINTS IMPORT
import calendarRoutes from "./routes/Calendar_Feature/calendarRoutes.js";
import servicesRouter from "./routes/Services_Feature/serviceRoutes.js";
import authRoutes from "./routes/Authentication_Feature/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWALRE
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/api/services", servicesRouter);
app.use("/api/calendar", calendarRoutes);
app.use("/api/auth" ,authRoutes);



// db or supabaseclienr
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// TEST SERVER ROUTES
app.get("/", (req, res) => {
  res.send("YEHEY YOUR SERVER IS RUNNING!!!!!!");
});

// Example route to test Supabase connection
app.get("/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("services").select("*").limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
