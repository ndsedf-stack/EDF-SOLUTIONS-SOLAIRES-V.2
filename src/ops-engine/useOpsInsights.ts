import { useMemo } from 'react';
import { OpsSnapshotRow, OpsScoringResult } from './ops.types';
import { scoreOpsRow } from './ops.scoring';

export function useOpsInsights(rows: OpsSnapshotRow[]) {
  return useMemo<OpsScoringResult[]>(() => {
    return rows.map(scoreOpsRow);
  }, [rows]);
}
