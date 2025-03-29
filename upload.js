import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { file, filename } = req.body;
  const { data, error } = await supabase.storage
    .from("legal-docs")
    .upload(filename, Buffer.from(file, "base64"));

  if (error) return res.status(500).json({ error });

  res.status(200).json({ url: data.path });
}
