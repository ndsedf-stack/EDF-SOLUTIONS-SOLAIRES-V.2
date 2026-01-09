import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    if (!imageFile) throw new Error("No image");

    const buffer = await imageFile.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    // OCR TABLE
    const ocrForm = new FormData();
    ocrForm.append("base64Image", `data:image/jpeg;base64,${base64}`);
    ocrForm.append("language", "fre");
    ocrForm.append("OCREngine", "2");
    ocrForm.append("isTable", "true");
    ocrForm.append("scale", "true");

    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: "K87899142388957" },
      body: ocrForm,
    });

    const ocrJson = await ocrRes.json();
    const raw = ocrJson.ParsedResults?.[0]?.ParsedText || "";

    const lines = raw
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 5);

    const rows: string[][] = [];

    for (const line of lines) {
      if (!line.includes("@")) continue; // on ne garde que les vraies lignes

      const emailMatch = line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      const telMatch = line.match(/(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}/);
      const cpMatch = line.match(/\b\d{5}\b/);

      const email = emailMatch ? emailMatch[0].replace(/\s/g, "") : "";
      const telephone = telMatch ? telMatch[0].replace(/\D/g, "") : "";
      const cp = cpMatch ? cpMatch[0] : "";

      let clean = line
        .replace(emailMatch?.[0] || "", "")
        .replace(telMatch?.[0] || "", "")
        .replace(cpMatch?.[0] || "", "")
        .replace(/cours/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      // NOM / PRENOM
      let nom = "";
      let prenom = "";

      const nameMatch = clean.match(
        /\b([A-ZÀ-ÖØ-Ý]{2,})\s+([A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'-]+)/,
      );

      if (nameMatch) {
        nom = nameMatch[1];
        prenom = nameMatch[2];
        clean = clean.replace(nameMatch[0], "").trim();
      }

      // VILLE / ADRESSE
      let ville = "";
      let adresse = "";

      const villeMatch = clean.match(/[A-ZÀ-ÖØ-Ý]{4,}(?:\s[A-ZÀ-ÖØ-Ý]{2,})*/);
      if (villeMatch) {
        ville = villeMatch[0].trim();
        adresse = clean.replace(ville, "").trim();
      } else {
        adresse = clean;
      }

      rows.push([nom, prenom, email, telephone, cp, ville, adresse]);
    }

    return new Response(
      JSON.stringify({
        headers: [
          "Nom",
          "Prénom",
          "Email",
          "Téléphone",
          "Code postal",
          "Ville",
          "Adresse",
        ],
        rows,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

