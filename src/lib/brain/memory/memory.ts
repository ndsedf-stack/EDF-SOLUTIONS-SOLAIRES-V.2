import { SystemSnapshot } from "../synthesis/types";

// ==========================================
// MEMORY INTERFACE
// ==========================================

export interface MemoryEntry {
  id: string;
  timestamp: string;
  type: "SNAPSHOT" | "DECISION";
  payload: any;
}

// In-memory store for MVP (would be Supabase in prod)
// We use a simple array to act as a session memory
const SHORT_TERM_MEMORY: MemoryEntry[] = [];

export const MemoryEngine = {
  // 1. Log a system snapshot
  logSnapshot: (snapshot: SystemSnapshot) => {
    const entry: MemoryEntry = {
      id: `MEM-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "SNAPSHOT",
      payload: snapshot
    };
    SHORT_TERM_MEMORY.push(entry);
    // Keep only last 50 snapshots to avoid spill
    if (SHORT_TERM_MEMORY.length > 50) SHORT_TERM_MEMORY.shift();
    
    console.log(`[BRAIN MEMORY] Snapshot logged. Total memories: ${SHORT_TERM_MEMORY.length}`);
  },

  // 2. Retrieve history for an entity
  getEntityHistory: (entityId: string): { timestamp: string, score: number }[] => {
    return SHORT_TERM_MEMORY
      .filter(m => m.type === "SNAPSHOT")
      .map(m => {
        const snap = m.payload as SystemSnapshot;
        const analysis = snap.analysis.find(a => a.entityId === entityId);
        if (!analysis) return null;
        return {
          timestamp: snap.timestamp,
          score: analysis.cvi.cviScore
        };
      })
      .filter(item => item !== null) as { timestamp: string, score: number }[];
  },

  // 3. Retrieve recalibration dataset (decisions vs outcomes)
  // Placeholder for future Learning Loop
  getTrainingSet: () => {
    return SHORT_TERM_MEMORY.filter(m => m.type === "DECISION");
  }
};
