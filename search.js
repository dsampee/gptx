import { OpenAI } from "openai";
import weaviate from "weaviate-client";

const weaviateClient = weaviate.client({ url: process.env.WEAVIATE_URL });

const openai = new OpenAI(process.env.OPENAI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { query } = req.body;

  // Search Weaviate for relevant legal text
  const results = await weaviateClient.graphql
    .get()
    .withClassName("LegalDocs")
    .withNearText({ concepts: [query] })
    .withLimit(3)
    .do();

  const relevantText = results.data.Get.LegalDocs.map((doc) => doc.text).join("\n\n");

  // Get GPT-4 response
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "system", content: "You're a legal assistant." }, { role: "user", content: relevantText }],
  });

  res.status(200).json({ response: completion.choices[0].message.content });
}
