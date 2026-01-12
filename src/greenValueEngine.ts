// ===============================
// GREEN VALUE ENGINE V2 — EDF
// Positionnement patrimonial
// ===============================

// Référentiel prix (inchangé)
export const PRIX_M2_PAR_DEPT: Record<string, number> = {
  "75": 9500,
  "92": 5200,
  "93": 3400,
  "94": 3800,
  "91": 3200,
  "95": 2900,
  "77": 2600,
  "78": 3500,
  "69": 4200,
  "13": 3600,
  "33": 3800,
  "31": 3200,
  "44": 3100,
  "59": 2400,
  "67": 2800,
  "34": 2900,
  "06": 4500,
  default: 2200,
};

export type PropertyClass =
  | "standard"
  | "confort"
  | "haut_de_gamme"
  | "patrimonial";

export interface GreenPositioningResult {
  city: string;
  dept: string;
  pricePerSqm: number;
  estimatedValue: number;
  propertyClass: PropertyClass;

  impactProfile: string; // ce que tu montres au client
  impactNarrative: string; // phrase EDF prête à l’emploi

  greenValueIndicative?: number; // seulement si pertinent
  impactPercentRange?: string; // ex: "1 à 3 %"
}

export const calculateGreenPositioningFromAddress = async (
  address: string,
  houseSize: number
): Promise<GreenPositioningResult> => {
  const response = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
      address
    )}&limit=1`
  );
  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error("Adresse introuvable");
  }

  const feature = data.features[0];
  const dept = feature.properties.postcode.substring(0, 2);
  const city = feature.properties.city;
  const pricePerSqm = PRIX_M2_PAR_DEPT[dept] || PRIX_M2_PAR_DEPT["default"];

  const estimatedValue = Math.round(houseSize * pricePerSqm);

  // -----------------------------
  // 1️⃣ CLASSIFICATION DU BIEN
  // -----------------------------

  let propertyClass: PropertyClass = "standard";

  if (estimatedValue < 300000) propertyClass = "standard";
  else if (estimatedValue < 800000) propertyClass = "confort";
  else if (estimatedValue < 1500000) propertyClass = "haut_de_gamme";
  else propertyClass = "patrimonial";

  // -----------------------------
  // 2️⃣ PROFIL D’IMPACT
  // -----------------------------

  let impactProfile = "";
  let impactNarrative = "";
  let greenValueIndicative: number | undefined;
  let impactPercentRange: string | undefined;

  switch (propertyClass) {
    case "standard":
      impactPercentRange = "4 à 8 %";
      greenValueIndicative = Math.round(estimatedValue * 0.05);
      impactProfile = "Valorisation et attractivité renforcée";
      impactNarrative =
        "Sur ce type de bien, la performance énergétique joue directement sur l’attractivité et la valeur perçue. On est clairement sur un actif qui se renforce.";
      break;

    case "confort":
      impactPercentRange = "3 à 6 %";
      greenValueIndicative = Math.round(estimatedValue * 0.035);
      impactProfile = "Différenciation nette et protection de valeur";
      impactNarrative =
        "Ici, l’enjeu n’est pas uniquement l’économie. C’est le positionnement du bien sur son marché et la sécurisation de sa valeur dans le temps.";
      break;

    case "haut_de_gamme":
      impactPercentRange = "1 à 3 %";
      greenValueIndicative = Math.round(Math.min(estimatedValue * 0.02, 60000)); // plafond anti-absurde
      impactProfile = "Maintien d’attractivité et évitement de décote";
      impactNarrative =
        "Sur des biens de ce niveau, on ne parle plus de ‘plus-value mécanique’. On parle d’attractivité, de liquidité du bien, et d’évitement de décote énergétique.";
      break;

    case "patrimonial":
      impactProfile = "Protection patrimoniale et conformité long terme";
      impactNarrative =
        "À ce niveau de patrimoine, la performance énergétique n’est pas un levier de hausse. C’est un critère de maintien de valeur, de désirabilité et de conformité future.";
      break;
  }

  return {
    city,
    dept,
    pricePerSqm,
    estimatedValue,
    propertyClass,
    impactProfile,
    impactNarrative,
    greenValueIndicative,
    impactPercentRange,
  };
};
