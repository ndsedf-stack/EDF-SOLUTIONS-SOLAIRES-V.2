import { v4 as uuidv4 } from 'uuid';

/**
 * Génère un UUID v4 sécurisé.
 * Utilise crypto.randomUUID si disponible (moderne), sinon fallback sur uuidv4.
 */
export const genId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return uuidv4();
};
