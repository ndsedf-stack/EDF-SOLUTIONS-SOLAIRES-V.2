import { useState, useEffect, useRef } from "react";

/**
 * Timer qui détecte les silences prolongés (inactivité sur un module)
 */
export function useSilenceTimer({ activeModule }) {
  const [silenceTime, setSilenceTime] = useState(0);
  const [silenceAlert, setSilenceAlert] = useState(null);
  const lastActivityRef = useRef(Date.now());
  const silenceIntervalRef = useRef(null);
  const alertTriggeredRef = useRef({ orange: false, red: false });

  /**
   * Réinitialise le timer (appelé lors d'une activité réelle)
   */
  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    setSilenceTime(0);
    setSilenceAlert(null);
    alertTriggeredRef.current = { orange: false, red: false };
  };

  /**
   * Ferme l'alerte — mais NE RESET PLUS
   */
  const dismissSilenceAlert = () => {
    setSilenceAlert(null);
    // ❌ ne surtout pas reset ici → sinon 60s jamais atteints
  };

  /**
   * Démarre le chrono quand un module est ouvert
   */
  useEffect(() => {
    if (!activeModule) {
      if (silenceIntervalRef.current) {
        clearInterval(silenceIntervalRef.current);
        silenceIntervalRef.current = null;
      }
      setSilenceTime(0);
      setSilenceAlert(null);
      alertTriggeredRef.current = { orange: false, red: false };
      return;
    }

    lastActivityRef.current = Date.now();
    setSilenceTime(0);
    setSilenceAlert(null);
    alertTriggeredRef.current = { orange: false, red: false };

    silenceIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      setSilenceTime(elapsed);

      if (elapsed >= 30 && !alertTriggeredRef.current.orange) {
        alertTriggeredRef.current.orange = true;
        setSilenceAlert({
          level: "ORANGE",
          duration: elapsed,
          title: "⚠️ Silence prolongé détecté",
          message: "Tu es sur ce module depuis 30 secondes sans avancer",
          impact: "Le client pourrait perdre l'attention ou douter",
          action: {
            type: "ACKNOWLEDGE",
            label: "OK, je continue",
          },
        });
      }

      if (elapsed >= 60 && !alertTriggeredRef.current.red) {
        alertTriggeredRef.current.red = true;
        setSilenceAlert({
          level: "RED",
          duration: elapsed,
          title: "🚨 ZONE DE DANGER - Silence critique",
          message: "Tu es bloqué depuis 1 minute sur ce module",
          impact: "Le client décroche mentalement → risque d'abandon",
          action: {
            type: "ACKNOWLEDGE",
            label: "J'ai compris",
          },
        });
      }
    }, 1000);

    return () => {
      if (silenceIntervalRef.current) {
        clearInterval(silenceIntervalRef.current);
      }
    };
  }, [activeModule]);

  return {
    silenceTime,
    silenceAlert,
    resetTimer,
    dismissSilenceAlert,
  };
}
