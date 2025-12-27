// API 100% GRATUITE - data.gouv.fr
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

export const calculateGreenValueFromAddress = async (
  address: string,
  houseSize: number
): Promise<{
  pricePerSqm: number;
  greenValue: number;
  city: string;
  dept: string;
}> => {
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
  const pricePerSqm = PRIX_M2_PAR_DEPT[dept] || PRIX_M2_PAR_DEPT["default"];
  const houseValue = houseSize * pricePerSqm;
  const greenValue = Math.round(houseValue * 0.08);

  return { pricePerSqm, greenValue, city: feature.properties.city, dept };
};
