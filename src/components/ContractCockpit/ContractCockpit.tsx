
import React, { useMemo } from 'react';
import { Study } from '@/brain/types';
import { 
  transformStudyToContract, 
  calculateContractKPIs, 
  SecuredContract 
} from './contractEngine';
import { ContractFinancialSummary } from './ContractFinancialSummary';
import { SignedSalesHealthField } from './SignedSalesHealthField';
import { ContractRegistry } from './ContractRegistry';
import { SignedContractsRiskAreaChart } from './SignedContractsRiskAreaChart';

interface Props {
  studies: Study[];
}

export function ContractCockpit({ studies }: Props) {
  // 1. Filter and Transform Data
  const { contracts, kpis } = useMemo(() => {
    // Keep only signed contracts
    const signedStudies = studies.filter(s => 
      s.status === 'signed' || 
      s.signed_at !== null
    );

    // Calculate total CA for weighting
    const totalCA = signedStudies.reduce((sum, s) => {
        // Handle different price fields preference (install_cost vs total_price)
        // contractEngine usually expects just a number, here we normalize
        const amount = s.total_price || (typeof s.install_cost === 'number' ? s.install_cost : 0) || 0;
        return sum + amount;
    }, 0);

    // Transform to SecuredContract
    const contracts: SecuredContract[] = signedStudies.map(s => 
      transformStudyToContract(s, totalCA)
    );

    // Compute KPIs
    const kpis = calculateContractKPIs(contracts);

    return { contracts, kpis };
  }, [studies]);

  if (contracts.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900/50 border border-white/5 mx-6">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-xl font-bold text-white mb-2">Aucun contrat signé</h3>
        <p className="text-slate-400">Le cockpit contractuel s'activera dès la première signature.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Kpi Summary */}
      <ContractFinancialSummary kpis={kpis} />

      {/* 2. Visualizations - Full Width Stack for integrity */}
      <SignedSalesHealthField contracts={contracts} />
      <SignedContractsRiskAreaChart contracts={contracts} />

      {/* 3. Registry List */}
      <ContractRegistry contracts={contracts} />
    </div>
  );
}
