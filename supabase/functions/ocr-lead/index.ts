import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      throw new Error("Aucune image fournie");
    }

    // Convertir en base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    let extractedText = "";

    // Essayer d'abord API-Ninjas
    try {
      const ninjaResponse = await fetch("https://api.api-ninjas.com/v1/imagetotext", {
        method: "POST",
        headers: {
          "X-Api-Key": "ANYUTmVE8qKrUUU7K8lGPs8lu5kDh7ROJiHKwVJG",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64,
        }),
      });

      if (ninjaResponse.ok) {
        const ninjaData = await ninjaResponse.json();
        if (ninjaData && ninjaData.length > 0) {
          extractedText = ninjaData.map((item: any) => item.text).join("\n");
        }
      }
    } catch (error) {
      console.log("API-Ninjas failed, fallback to OCR.space");
    }

    // Fallback : OCR.space
    if (!extractedText) {
      const ocrFormData = new FormData();
      ocrFormData.append("base64Image", `data:image/jpeg;base64,${base64}`);
      ocrFormData.append("language", "fre");
      ocrFormData.append("OCREngine", "2");
      ocrFormData.append("scale", "true");
      ocrFormData.append("isTable", "true");

      const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          apikey: "K87899142388957",
        },
        body: ocrFormData,
      });

      const ocrData = await ocrResponse.json();

      if (!ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
        throw new Error("Aucun texte détecté");
      }

      extractedText = ocrData.ParsedResults[0].ParsedText;
    }

    // Extraction des données
    const civiliteMatch = extractedText.match(/\b(Monsieur|Madame|Mademoiselle|M\.|Mme)\b/i);
    const civilite = civiliteMatch ? civiliteMatch[0] : null;

    // Email avec nettoyage des espaces
    const emailMatch = extractedText.match(/[a-zA-Z0-9._-]+\s*@\s*[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0].replace(/\s+/g, "") : null;

    // Téléphone
    const telMatch = extractedText.match(/(?:0|\+33)[1-9](?:[\s.-]?\d{2}){4}/);
    const telephone = telMatch ? telMatch[0].replace(/[\s.-]/g, "") : null;

    // Nom (cherche après civilité ou en majuscules)
    let nom = null;
    if (civilite) {
      const nomMatch = extractedText.match(new RegExp(`${civilite}\\s+([A-ZÀ-Ü][A-ZÀ-Ü\\s-]+)`, "i"));
      nom = nomMatch ? nomMatch[1].trim() : null;
    }
    if (!nom) {
      const nomMajMatch = extractedText.match(/\b([A-ZÀ-Ü]{2,}(?:\s+[A-ZÀ-Ü]{2,})?)\b/);
      nom = nomMajMatch ? nomMajMatch[1] : null;
    }

    // Adresse
    const adresseMatch = extractedText.match(/\d+\s+[A-Za-zÀ-ÿ\s]+\d{5}\s+[A-Za-zÀ-ÿ]+/);
    const adresse = adresseMatch ? adresseMatch[0] : null;

    return new Response(
      JSON.stringify({
        civilite,
        nom,
        email,
        telephone,
        adresse,
        rawText: extractedText,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
