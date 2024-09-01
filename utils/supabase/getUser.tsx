import { AuthError, User } from "@supabase/supabase-js";
import { createClient } from "./server";

export async function getUser(): Promise<User | AuthError> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return error;
  }

  return data.user;
}
