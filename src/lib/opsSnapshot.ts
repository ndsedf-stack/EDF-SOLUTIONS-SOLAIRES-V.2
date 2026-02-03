import { supabase } from "./supabase";

export async function fetchOpsSnapshot() {
  const { data, error } = await supabase
    .from("ops_snapshot")
    .select("*");

  if (error) {
    console.error("[OPS_SNAPSHOT]", error);
    throw error;
  }

  return data;
}
