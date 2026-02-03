import { useState, useEffect } from "react";

/**
 * Système d'alertes graduées pour détecter les 3 erreurs mortelles
 */
export function useAlertSystem({
  activeModule,
  visitedModules,
  securityTime,
  currentStep,
  profile,
}) {
  // Alerte active (null ou objet alerte)
  const [activeAlert, setActiveAlert] = useState(null);

  /**
   * Détecte les 3 erreurs mortelles
   */
  useEffect(() => {
    if (!activeModule) return;

    // 🔴 ERREUR 1 : Garanties AVANT Répartition
    if (
      activeModule === "garanties" &&
      !visitedModules.includes("repartition")
    ) {
      triggerAlert({
        level: "RED",
        title: "⚠️ STOP - Séquence cassée",
        message: "Tu as ouvert Garanties sans faire Répartition Énergie",
        impact:
          "Le client ne ressent pas la douleur → pas d'urgence de changer",
        action: {
          type: "CLOSE_AND_OPEN",
          close: "garanties",
          open: "repartition",
          label: "Fermer Garanties et ouvrir Répartition",
        },
      });
      return;
    }

    // 🔴 ERREUR 2 : Garanties AVANT Locataire/Propriétaire
    if (
      activeModule === "garanties" &&
      !visitedModules.includes("locataire-proprietaire")
    ) {
      triggerAlert({
        level: "RED",
        title: "⚠️ STOP - Pivot manquant",
        message: "Tu as ouvert Garanties sans faire le Pivot identitaire",
        impact: "Le client reste en mode 'locataire' → mental passif",
        action: {
          type: "CLOSE_AND_OPEN",
          close: "garanties",
          open: "locataire-proprietaire",
          label: "Fermer Garanties et ouvrir Locataire VS Propriétaire",
        },
      });
      return;
    }
  }, [activeModule, visitedModules]);

  /**
   * Détecte ERREUR 3 : Fermeture Garanties avant 90s
   * (sera appelé manuellement lors de la fermeture)
   */
  const checkSecurityTime = () => {
    if (securityTime < 90) {
      triggerAlert({
        level: "RED",
        title: "⚠️ STOP - Temps minimum non respecté",
        message: `Tu vas fermer Garanties après seulement ${securityTime}s`,
        impact: "Le client n'est pas rassuré → le doute persiste",
        detail: `Temps minimum requis : 90s | Temps actuel : ${securityTime}s`,
        action: {
          type: "CANCEL_CLOSE",
          label: "Rester sur Garanties",
        },
      });
      return false; // Empêche la fermeture
    }
    return true; // Autorise la fermeture
  };

  /**
   * Déclenche une alerte
   */
  const triggerAlert = (alert) => {
    setActiveAlert(alert);
  };

  /**
   * Ferme l'alerte
   */
  const dismissAlert = () => {
    setActiveAlert(null);
  };

  return {
    activeAlert,
    dismissAlert,
    checkSecurityTime,
  };
}
