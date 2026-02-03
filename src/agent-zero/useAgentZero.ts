import { useMemo } from "react";
import { agentZeroEngine } from "./agentZero.engine";
import { AgentZeroInput } from "./agentZero.types";

export function useAgentZero(input: AgentZeroInput) {
  const decision = useMemo(() => {
    return agentZeroEngine(input);
  }, [input]);

  return decision;
}
