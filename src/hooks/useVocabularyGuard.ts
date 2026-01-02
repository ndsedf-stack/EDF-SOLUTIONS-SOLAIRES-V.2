// src/hooks/useVocabularyGuard.ts
import { useState, useCallback } from "react";

const FORBIDDEN_WORDS = [
  "devis",
  "réfléchir",
  "comparer",
  "on verra",
  "rendez-vous",
  "plus tard",
  "envoyez-moi",
  "je vais voir",
  "je dois voir",
  "on en reparle",
];

type Alert = { message: string } | null;

export function useVocabularyGuard(
  profile: "senior" | "banquier" | "standard"
) {
  const [alert, setAlert] = useState<Alert>(null);
  const [signal, setSignal] = useState(false); // <- pour VocabularySignal

  const checkVocabulary = useCallback(
    (text: string) => {
      if (!text) return;

      const lower = text.toLowerCase();
      const match = FORBIDDEN_WORDS.find((w) => lower.includes(w));

      if (!match) return;

      // ⚡ Signal rapide (250ms) → coach boussole
      setSignal(true);
      setTimeout(() => setSignal(false), 250);

      setAlert({
        message:
          profile === "senior"
            ? "⚠️ STOP – vocabulaire anxiogène détecté (risque d'annulation)"
            : "⚠️ Mot interdit – cela fait perdre le closing net",
      });
    },
    [profile]
  );

  const dismissAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return {
    alert,
    dismissAlert,
    checkVocabulary,
    signal, // 💡 à envoyer dans VocabularySignal
  };
}
