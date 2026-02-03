import { assembleOpsAudit } from "@/ops-agent/audit/auditAssembler"
import { supabase } from "@/lib/supabase"
import { compareAudits } from "@/ops-agent/audit/audit.comparator"

// Simulated global decisions for demo purposes if not available
const MOCK_DECISIONS = [
  { study_id: 'S-29381', priority: 'WAR_ROOM', axis: 'A', justification: 'SRU Expiration in 2 days' },
  { study_id: 'S-93821', priority: 'WATCH', axis: 'B', justification: 'Silent for 10 days' }
];

export default async function handler(req: any, res: any) {
  // 1. GENERATE CURRENT REPORT
  const decisions = (globalThis as any).__OPS_DECISIONS__ || MOCK_DECISIONS;

  // Ideally, receiving uxScore and details from request body if generated on client/Edge
  // Or running audit here if we moved logic to server side.
  // For this architecture (Hybrid), we assume the CLIENT sends the Analysis data, 
  // or we accept it. But wait, this endpoint was returning MOCK data before.
  // The User Prompt implies this is a POST triggered by the button that "runs" the audit.
  
  // IF GET: Return history or latest
  if (req.method === 'GET') {
      const { data } = await supabase.from('ops_audit_history').select('*').order('generated_at', { ascending: false }).limit(5);
      return res.status(200).json(data);
  }

  // IF POST: Save report
  if (req.method === 'POST') {
      const body = req.body; // Expects { uxDetails, uxScore, dataBreaches, ... } or full report
      
      const report = assembleOpsAudit({
        decisions: decisions,
        uxScore: body.uxScore || 0,
        dataBreaches: body.dataBreaches || 0,
        uxDetails: body.uxDetails
      });

      // 2. FETCH PREVIOUS FOR COMPARISON
      const { data: history } = await supabase
        .from('ops_audit_history')
        .select('report')
        .order('generated_at', { ascending: false })
        .limit(1);
      
      const previousReport = history?.[0]?.report;
      
      // 3. PERSIST HISTORY
      const { error } = await supabase
        .from("ops_audit_history")
        .insert({
            generated_at: report.generatedAt,
            global_score: report.globalScore,
            ux_score: report.uxScore,
            data_breaches: report.dataIntegrityBreaches,
            report: report 
        });

      if (error) console.error("Supabase History Insert Error", error);

      // 4. ATTACH COMPARISON TO RESPONSE (Ephemeral)
      const comparison = compareAudits(previousReport, report);
      
      return res.status(200).json({
          ...report,
          comparison // { globalDelta, uxDelta, status... }
      });
  }
}
