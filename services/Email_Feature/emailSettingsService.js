import supabase from "../../utils/supabaseClient.js";

export const getCurrentEmailSettings = async () => {
  const { data, error } = await supabase
    .from("system_email_settings")
    .select(
      "id, provider, sender_name, email_user, is_active, created_at, updated_at",
    )
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch email settings: ${error.message}`);
  }

  return data;
};

export const getCurrentEmailSettingsWithPassword = async () => {
  const { data, error } = await supabase
    .from("system_email_settings")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch email settings: ${error.message}`);
  }

  return data;
};

export const updateEmailSettingsRecord = async ({
  sender_name,
  email_user,
  email_app_password,
}) => {
  const { data: existing, error: fetchError } = await supabase
    .from("system_email_settings")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw new Error(
      `Failed to load existing email settings: ${fetchError.message}`,
    );
  }

  if (existing) {
    const payload = {
      sender_name,
      email_user,
      updated_at: new Date().toISOString(),
    };

    if (email_app_password && email_app_password.trim() !== "") {
      payload.email_app_password = email_app_password;
    }

    const { data, error } = await supabase
      .from("system_email_settings")
      .update(payload)
      .eq("id", existing.id)
      .select(
        "id, provider, sender_name, email_user, is_active, created_at, updated_at",
      )
      .single();

    if (error) {
      throw new Error(`Failed to update email settings: ${error.message}`);
    }

    return data;
  }

  const { data, error } = await supabase
    .from("system_email_settings")
    .insert([
      {
        provider: "gmail",
        sender_name,
        email_user,
        email_app_password,
        is_active: true,
      },
    ])
    .select(
      "id, provider, sender_name, email_user, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(`Failed to create email settings: ${error.message}`);
  }

  return data;
};
