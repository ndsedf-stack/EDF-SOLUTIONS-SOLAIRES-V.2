import { useState, useEffect, useRef } from "react";

/**
 * Machine à états pour tracker progression RDV
 * Basé sur SIGNAUX terrain (pas durées fixes)
 */
export function useRDVState() {
  // État actuel (0 = non démarré, 1-10 = états RDV)
  const [currentStep, setCurrentStep] = useState(0);

  // Historique modules visités
  const [visitedModules, setVisitedModules] = useState([]);

  // Temps passé sur module Sécurité (critique pour erreur 3)
  const [securityTime, setSecurityTime] = useState(0);
  const securityStartRef = useRef(null);

  // Notification d'étape à afficher
  const [stepNotification, setStepNotification] = useState(null);

  /**
   * Mapping modules → étapes (selon ordre validé)
   */
  const MODULE_TO_STEP = {
    protocole: 1,
    repartition: 2,
    "locataire-proprietaire": 3, // ✅ On ajoute le "-proprietaire" ici
    synthese: 4,
    realisations: 5,
    calendrier: 6,
    garanties: 7,
    securisation: 8,
    budget: 9,
    impact: 10,
  };

  /**
   * Détecte changement d'étape basé sur signaux
   */
  const detectStep = (signals) => {
    const { moduleOpen, moduleClosed } = signals;

    if (!moduleOpen) return;

    // Récupère numéro d'étape du module ouvert
    const targetStep = MODULE_TO_STEP[moduleOpen];

    if (!targetStep) return;

    // Détecte si module visité pour la première fois
    if (!visitedModules.includes(moduleOpen)) {
      suggestStep(targetStep, getStepMessage(targetStep));

      // Track module visité
      setVisitedModules([...visitedModules, moduleOpen]);
    }

    // 🔥 Démarre chrono si Garanties (étape 7)
    if (moduleOpen === "garanties" && !securityStartRef.current) {
      securityStartRef.current = Date.now();
    }

    // 🔥 Arrête chrono si on ferme Garanties
    if (moduleClosed === "garanties" && securityStartRef.current) {
      const elapsed = Math.floor(
        (Date.now() - securityStartRef.current) / 1000
      );
      setSecurityTime(elapsed);
      securityStartRef.current = null;
    }
  };

  /**
   * Messages par étape
   */
  const getStepMessage = (step) => {
    const messages = {
      1: "Protocole posé ?",
      2: "Perte ancrée ?",
      3: "Pivot mental validé ?",
      4: "Logique comprise ?",
      5: "Preuve sociale activée ?",
      6: "Projection faite ?",
      7: "Sécurité ancrée ?",
      8: "Verrou administratif posé ?",
      9: "Logique de paiement validée ?",
      10: "Impact final ancré ?",
    };
    return messages[step] || "Étape validée ?";
  };

  /**
   * Suggère nouvelle étape (notification 3 sec)
   */
  const suggestStep = (step, message) => {
    if (step > currentStep) {
      setStepNotification({ step, message });

      // Auto-disparition 3 sec
      setTimeout(() => setStepNotification(null), 3000);
    }
  };

  /**
   * Confirme étape (utilisateur clique OUI)
   */
  const confirmStep = (step) => {
    setCurrentStep(step);
    setStepNotification(null);
  };

  /**
   * Calcule temps Sécurité en temps réel
   */
  useEffect(() => {
    if (securityStartRef.current) {
      const interval = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - securityStartRef.current) / 1000
        );
        setSecurityTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [securityStartRef.current]);

  return {
    currentStep,
    stepNotification,
    confirmStep,
    detectStep,
    securityTime,
    visitedModules,
  };
}
