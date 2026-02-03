import { Study, EmailLead, Metrics } from "../types";

export function calculateSystemMetrics(studies: Study[], leads: EmailLead[], metrics: Metrics | null) {
  const totalStudies = studies.length;
  const activeStudies = studies.filter(s => s.status !== 'cancelled').length;
  const signedStudies = studies.filter(s => s.status === 'signed').length;
  
  const securedStudies = metrics?.finance?.riskyDeposits 
      ? (signedStudies - metrics.finance.riskyDeposits.length) 
      : studies.filter(s => s.status === 'signed' && (s.deposit_paid || s.contract_secured)).length;
  
  const waitingStudies = metrics?.finance?.riskyDeposits?.length || 0;
  
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => !l.opted_out).length;
  const totalEmailsSent = leads.reduce((acc, l) => acc + (l.email_sequence_step || 0), 0);
  const pendingEmails = leads.filter(l => l.next_email_date).length;
  const unsubscribedCount = leads.filter(l => l.opted_out).length;
  const unsubscribeRate = totalLeads > 0 ? (unsubscribedCount / totalLeads) * 100 : 0;

  return {
      totalStudies,
      activeStudies,
      signedStudies,
      securedStudies,
      waitingStudies,
      totalLeads,
      activeLeads,
      totalEmailsSent,
      pendingEmails,
      unsubscribedCount,
      unsubscribeRate
  };
}
