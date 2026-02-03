import { UxAuditLog } from './uxAudit.history.types';

const KEY = 'ux_audit_history';

export function saveUxAudit(log: UxAuditLog) {
  if (typeof window === 'undefined') return;
  
  const history = loadUxAuditHistory();
  // Simple limit to avoid localstorage explosion
  if (history.length > 50) history.shift();
  
  history.push(log);
  localStorage.setItem(KEY, JSON.stringify(history));
}

export function loadUxAuditHistory(): UxAuditLog[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function clearUxAuditHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
