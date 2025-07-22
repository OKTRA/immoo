import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

serve(async (req) => {
  const { id } = await req.json();
  const supabase = createClient();
  const { error } = await supabase
    .from("contracts")
    .delete()
    .eq("id", id);
  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}); 