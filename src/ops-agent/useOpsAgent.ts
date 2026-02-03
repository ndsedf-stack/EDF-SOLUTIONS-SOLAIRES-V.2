import { useMemo } from "react";
import { OpsSnapshotRow } from "../ops-engine/ops.types";
import { evaluateOpsAgent, OpsDecision } from "./opsAgent.engine";

export function useOpsAgent(rows: OpsSnapshotRow[]) {
  return useMemo<OpsDecision[]>(() => {
    return rows.map((row) => evaluateOpsAgent(row));
  }, [rows]);
}
