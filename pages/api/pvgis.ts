// pages/api/pvgis.ts (ou api/pvgis.ts selon ton setup)
export default async function handler(req: any, res: any) {
  // ✅ Accepte seulement GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { lat, lon, peakpower, angle, aspect } = req.query;

  // ✅ Validation des paramètres
  if (!lat || !lon || !peakpower) {
    return res.status(400).json({
      error: "Paramètres manquants (lat, lon, peakpower requis)",
    });
  }

  // ✅ Construction de l'URL PVGIS
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    peakpower: peakpower.toString(),
    loss: "14",
    mountingplace: "free",
    usehorizon: "1",
    angle: angle?.toString() || "25",
    aspect: aspect?.toString() || "0",
    raddatabase: "PVGIS-SARAH2", // ✅ Bonne base de données
    pvtechchoice: "crystSi",
    outputformat: "json",
  });

  const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?${params.toString()}`;

  try {
    console.log("🔗 Appel PVGIS:", url);

    const response = await fetch(url);

    // ✅ Gestion des erreurs HTTP
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur PVGIS:", response.status, errorText);
      return res.status(response.status).json({
        error: `Erreur PVGIS: ${response.status}`,
        details: errorText.substring(0, 200), // Limite la taille de l'erreur
      });
    }

    const data = await response.json();

    console.log("✅ Données PVGIS reçues");

    // ✅ Ajoute des headers CORS si besoin
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate"); // Cache 1h

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("❌ Erreur API PVGIS:", error);
    return res.status(500).json({
      error: "Erreur lors de l'appel PVGIS",
      message: error.message,
    });
  }
}
