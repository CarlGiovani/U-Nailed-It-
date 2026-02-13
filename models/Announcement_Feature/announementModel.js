import supabase from "../../utils/supabaseClient.js";


/* ==========================================
   PUBLIC: fetch active announcements
========================================== */
export const getActiveAnnouncements = async () => {
    const today = new Date().toISOString().split("T")[0];

    const {data , error} = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("created_at", { ascending: false });
    
    if(error) throw new Error(error.message);
    return data;
}


/* ==========================================
   ADMIN: getAllAnnouncement
========================================== */
export const getAllAnnouncements = async () => {
  const {data , error} = await supabase
  .from("announcements")
  .select("*")
  .order("created_at", {ascending: false});

  if(error) throw new Error(error.message);
  return data;
}


/* ==========================================
   ADMIN: createAnnouncement
========================================== */
export const createAnnouncement = async (payload) => {
  const {data , error} = await supabase
  .from("announcements")
  .insert([payload])
  .select()
  .single()

  if(error) throw new Error(error.message);
  return data;
}

/* ==========================================
   ADMIN: Update Announcemtn
========================================== */
export const updateAnnouncement = async (id , payload) => {
  const { data, error } = await supabase
  .from("announcements")
  .update(payload)
  .eq("id" , id)
  .select()
  .single();

  if(error) throw new Error(error.message);
  return data;
}


/* ==========================================
   ADMIN:   Delete announcemtn
========================================== */
export const deleteAnnouncement = async (id) => {
  const {data , error} = await supabase
  .from("announcements")
  .delete()
  .eq("id" ,id);
  
  if(error) throw new Error(error.message);
};