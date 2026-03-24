import supabase from "../../utils/supabaseClient.js";

export const getSingleAdmin = async () => {
  const {data , error} = await supabase
  .from('admins')
  .select('email')
  .limit(1)
  .single();

  if (error) throw new Error;
  return data?.email;
}