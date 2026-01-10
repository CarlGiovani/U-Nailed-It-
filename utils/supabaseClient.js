import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Palitan ang SUPABASE_KEY ng SUPABASE_SERVICE_ROLE_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// Ang client na ito ay may "Master Access" na sa lahat ng files mo
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;