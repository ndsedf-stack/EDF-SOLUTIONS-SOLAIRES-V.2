import React, { useState } from "react";
import { Download, Loader2, X, FileText } from "lucide-react";

export const PDFExport = ({
  data,
  calculationResult,
  projectionYears,
  customStyled,
}: any) => {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);

    // ✅ CORRECTION 1 : EXTRACTION INTELLIGENTE AVEC LES BONS NOMS
    const params = data?.params || data || {};
    const res = calculationResult || {};

    console.log("📊 PDF Export - Data reçue:", {
      data,
      params,
      calculationResult,
    });

    // ✅ STRUCTURE EXACTEMENT COMME GuestView.tsx
    const safeData = {
      // Données de base (mêmes noms que GuestView)
      n: params.n || params.clientName || params.name || "Client",
      e: params.e || res.totalSavingsProjected || res.gain || 0,
      a: params.a || res.savingsRatePercent || res.autonomie || 0,
      m: params.m || params.creditMonthlyPayment || params.mensualite || 0,
      t: params.t || params.interestRate || params.creditInterestRate || 3.89,
      d: params.d || params.creditDurationMonths || params.duree || 180,

      // Données techniques (mêmes noms que GuestView)
      prod: params.prod || params.yearlyProduction || params.production || 7000,
      conso:
        params.conso || params.yearlyConsumption || params.consumption || 14000,
      selfCons:
        params.selfCons || params.selfConsumptionRate || params.autoconso || 70,
      installCost:
        params.installCost || params.totalCost || params.cost || 18799,
      cashApport: params.cashApport || params.apport || params.downPayment || 0,
      elecPrice:
        params.elecPrice || params.electricityPrice || params.priceKwh || 0.25,
      mode: params.mode || "performance", // ✅ CHANGE "financement" -> "performance"
    };

    const safeCalc = {
      gain: res.totalSavingsProjected || res.gain || res.totalGain || 0,
      gainCash: res.totalSavingsProjectedCash || res.gainCash || 0,
      autonomy: res.savingsRatePercent || res.autonomy || res.autonomie || 0,
      monthly: res.monthlyEffortYear1 || res.monthly || res.mensualite || 0,
      breakeven: res.breakEvenPoint || res.breakeven || res.pointMort || 0,
      breakevenCash: res.breakEvenPointCash || res.breakevenCash || 0,
      roi: res.roiPercentage || res.roi || 0,
      roiCash: res.roiPercentageCash || res.roiCash || 0,
      yearlyAvg: Math.round(
        (res.totalSavingsProjected || res.gain || 0) / (projectionYears || 20)
      ),
      equivalent: res.bankEquivalentCapital || res.equivalent || 0,
    };

    console.log("✅ PDF Export - Données extraites:", { safeData, safeCalc });

    const f = (n: number) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n || 0);

    // ✅ CORRECTION 2 : GÉNÉRATION AMORTISSEMENT IDENTIQUE À GuestView.tsx
    const generateAmortissement = () => {
      const result = [];
      const monthlyPayment = safeData.m; // ✅ Utilise safeData.m comme GuestView
      const annualRate = safeData.t / 100; // ✅ safeData.t est déjà le taux
      const monthlyRate = annualRate / 12;
      let remainingCapital = safeData.installCost - safeData.cashApport;

      for (
        let month = 1;
        month <= safeData.d && remainingCapital > 0;
        month++
      ) {
        const interest = remainingCapital * monthlyRate;
        const principal = Math.min(monthlyPayment - interest, remainingCapital);
        remainingCapital -= principal;

        // ✅ LOGIQUE IDENTIQUE À GuestView.tsx
        const year = Math.floor(month / 12);
        const isMonth1 = month === 1;
        const isYear1 = month === 12;
        const isYear5 = month === 60;
        const isYear10 = month === 120;
        const isYear15 = month === 180;
        const isLastMonth = month === safeData.d;

        if (
          isMonth1 ||
          isYear1 ||
          isYear5 ||
          isYear10 ||
          isYear15 ||
          isLastMonth
        ) {
          result.push({
            month,
            year: Math.ceil(month / 12),
            payment: monthlyPayment,
            principal,
            interest,
            remaining: Math.max(0, remainingCapital),
          });
        }
      }
      return result;
    };

    const amortissementData = generateAmortissement();

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Étude Solaire - ${safeData.n}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            @page {
              size: A4;
              margin: 0;
            }
            
            @media print {
              .no-print { display: none; }
              .page-break { page-break-after: always; }
            }
            
            .gradient-blue {
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            }
            
            .gradient-green {
              background: linear-gradient(135deg, #064e3b 0%, #10b981 100%);
            }
            
            .text-shadow {
              text-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }

            table {
              border-collapse: collapse;
              width: 100%;
            }
            
            th, td {
              text-align: left;
              padding: 12px;
            }
          </style>
        </head>
        <body class="bg-white">
          
          <!-- PAGE 1 : COUVERTURE + RÉSUMÉ EXÉCUTIF -->
          <div class="min-h-screen p-16 relative overflow-hidden">
            <!-- Background pattern -->
            <div class="absolute inset-0 opacity-5" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, #3b82f6 35px, #3b82f6 36px);"></div>
            
            <!-- Header EDF -->
            <div class="relative z-10 border-b-4 border-blue-600 pb-8 mb-12">
              <div class="flex justify-between items-start">
                <div>
                  <h1 class="text-7xl font-black italic uppercase tracking-tighter text-gray-900">
                    ÉTUDE<br/>SOLAIRE
                  </h1>
                  <div class="h-2 w-24 bg-blue-600 mt-4"></div>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-black text-blue-600 uppercase italic">EDF</div>
                  <div class="text-sm text-gray-500 font-bold uppercase">Solutions Pro</div>
                </div>
              </div>
            </div>

            <!-- Info client -->
            <div class="relative z-10 mb-12">
              <div class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/10 border-2 border-blue-600/20 rounded-xl">
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span class="text-lg font-black uppercase tracking-widest text-gray-700">
                  Bénéficiaire : ${safeData.n}
                </span>
              </div>
              <div class="mt-4 text-sm text-gray-500 font-medium">
                Document confidentiel - ${new Date().toLocaleDateString(
                  "fr-FR",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </div>
            </div>

            <!-- BLOC PRINCIPAL : GAIN NET -->
            <div class="relative z-10 gradient-blue p-12 rounded-[48px] mb-10 shadow-2xl">
              <div class="text-white/70 text-xs font-black uppercase tracking-[0.3em] mb-3">
                GAIN NET PROJETÉ (${projectionYears} ANS)
              </div>
              <div class="text-8xl font-black text-white text-shadow mb-6 italic">
                +${f(safeCalc.gain)}
              </div>
              <div class="flex gap-8">
                <div class="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                  <div class="text-white/60 text-[10px] font-bold uppercase mb-1">Autonomie</div>
                  <div class="text-3xl font-black text-white">${
                    safeCalc.autonomy
                  }%</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                  <div class="text-white/60 text-[10px] font-bold uppercase mb-1">Point Mort</div>
                  <div class="text-3xl font-black text-white">${
                    safeCalc.breakeven
                  } ans</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                  <div class="text-white/60 text-[10px] font-bold uppercase mb-1">ROI Moyen</div>
                  <div class="text-3xl font-black text-white">${
                    safeCalc.roi
                  }%/an</div>
                </div>
              </div>
            </div>

            <!-- GRID MÉTRIQUES CLÉS -->
            <div class="relative z-10 grid grid-cols-3 gap-6 mb-10">
              <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl border-2 border-gray-200">
                <div class="text-xs font-black uppercase text-gray-500 mb-3">Production Annuelle</div>
                <div class="text-4xl font-black text-gray-900">${Math.round(
                  safeData.prod
                ).toLocaleString()} kWh</div>
                <div class="text-sm text-gray-600 mt-2">Installation ${
                  Math.round((safeData.prod / 1100) * 10) / 10
                } kWp</div>
              </div>
              <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl border-2 border-gray-200">
                <div class="text-xs font-black uppercase text-gray-500 mb-3">Effort Année 1</div>
                <div class="text-4xl font-black text-orange-600">+${f(
                  Math.abs(safeCalc.monthly)
                )}</div>
                <div class="text-sm text-gray-600 mt-2">Puis décroissant</div>
              </div>
              <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl border-2 border-gray-200">
                <div class="text-xs font-black uppercase text-gray-500 mb-3">Équivalent Livret A</div>
                <div class="text-4xl font-black text-yellow-600">${f(
                  safeCalc.equivalent
                )}</div>
                <div class="text-sm text-gray-600 mt-2">À bloquer</div>
              </div>
            </div>

            <!-- Footer page 1 -->
            <div class="relative z-10 border-t-2 border-gray-200 pt-8 mt-12 text-center">
              <div class="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Document confidentiel EDF Solutions Pro - Page 1/4
              </div>
            </div>
          </div>

          <!-- PAGE 2 : DÉTAILS TECHNIQUES -->
          <div class="page-break"></div>
          <div class="min-h-screen p-16 relative">
            <div class="absolute inset-0 opacity-5" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, #10b981 35px, #10b981 36px);"></div>
            
            <div class="relative z-10">
              <h2 class="text-5xl font-black italic uppercase mb-12 text-gray-900">
                DÉTAILS TECHNIQUES
              </h2>

              <!-- Caractéristiques Installation -->
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-10 rounded-3xl mb-10 border-2 border-blue-200">
                <h3 class="text-2xl font-black uppercase mb-6 text-blue-900">Installation Solaire</h3>
                <div class="grid grid-cols-2 gap-6">
                  <div class="bg-white p-6 rounded-2xl">
                    <div class="text-xs font-bold text-gray-500 uppercase mb-2">Puissance Installée</div>
                    <div class="text-3xl font-black text-gray-900">${
                      Math.round((safeData.prod / 1100) * 10) / 10
                    } kWp</div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl">
                    <div class="text-xs font-bold text-gray-500 uppercase mb-2">Production Annuelle</div>
                    <div class="text-3xl font-black text-blue-600">${Math.round(
                      safeData.prod
                    ).toLocaleString()} kWh</div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl">
                    <div class="text-xs font-bold text-gray-500 uppercase mb-2">Taux Autoconsommation</div>
                    <div class="text-3xl font-black text-emerald-600">${
                      safeData.selfCons
                    }%</div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl">
                    <div class="text-xs font-bold text-gray-500 uppercase mb-2">Consommation Foyer</div>
                    <div class="text-3xl font-black text-gray-900">${Math.round(
                      safeData.conso
                    ).toLocaleString()} kWh</div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl">
                    <div class="text-xs font-bold text-gray-500 uppercase mb-2">Prix Électricité</div>
                    <div class="text-3xl font-black text-purple-600">${safeData.elecPrice.toFixed(
                      2
                    )}€/kWh</div>
                  </div>
                  <div class="bg-white p-6 rounded-2xl">
                    <div class="text-xs font-bold text-gray-500 uppercase mb-2">Rachat Surplus</div>
                    <div class="text-3xl font-black text-yellow-600">0.04€/kWh</div>
                  </div>
                </div>
              </div>

              <!-- Comparaison Financement vs Cash -->
              <div class="grid grid-cols-2 gap-6 mb-10">
                <div class="bg-gradient-to-br from-blue-950 to-blue-900 p-8 rounded-3xl text-white">
                  <h3 class="text-lg font-black uppercase mb-6 text-blue-300">Avec Financement</h3>
                  <div class="space-y-4">
                    <div class="border-b border-white/10 pb-3">
                      <div class="text-xs text-white/60 uppercase mb-1">Capital Immobilisé</div>
                      <div class="text-3xl font-black">0€</div>
                    </div>
                    <div class="border-b border-white/10 pb-3">
                      <div class="text-xs text-white/60 uppercase mb-1">Mensualité</div>
                      <div class="text-3xl font-black">${f(safeData.m)}</div>
                    </div>
                    <div class="border-b border-white/10 pb-3">
                      <div class="text-xs text-white/60 uppercase mb-1">Point Mort</div>
                      <div class="text-3xl font-black">${
                        safeCalc.breakeven
                      } ans</div>
                    </div>
                    <div class="pt-2">
                      <div class="text-xs text-white/60 uppercase mb-1">Gain ${projectionYears} ans</div>
                      <div class="text-4xl font-black text-blue-300">${f(
                        safeCalc.gain
                      )}</div>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-emerald-950 to-emerald-900 p-8 rounded-3xl text-white">
                  <h3 class="text-lg font-black uppercase mb-6 text-emerald-300">Paiement Cash</h3>
                  <div class="space-y-4">
                    <div class="border-b border-white/10 pb-3">
                      <div class="text-xs text-white/60 uppercase mb-1">Capital Investi</div>
                      <div class="text-3xl font-black">${f(
                        safeData.installCost
                      )}</div>
                    </div>
                    <div class="border-b border-white/10 pb-3">
                      <div class="text-xs text-white/60 uppercase mb-1">ROI Annuel</div>
                      <div class="text-3xl font-black">${
                        safeCalc.roiCash
                      }%</div>
                    </div>
                    <div class="border-b border-white/10 pb-3">
                      <div class="text-xs text-white/60 uppercase mb-1">Point Mort</div>
                      <div class="text-3xl font-black">${
                        safeCalc.breakevenCash
                      } ans</div>
                    </div>
                    <div class="pt-2">
                      <div class="text-xs text-white/60 uppercase mb-1">Gain ${projectionYears} ans</div>
                      <div class="text-4xl font-black text-emerald-300">${f(
                        safeCalc.gainCash
                      )}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Garanties -->
              <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-10 rounded-3xl border-2 border-orange-200">
  <h3 class="text-2xl font-black uppercase mb-6 text-orange-900">
    Garanties EDF ${
      safeData.mode === "essentielle"
        ? "Essentielle (TVA 5.5%)"
        : "Performance (TVA 20%)"
    }
  </h3>
  <div class="grid grid-cols-2 gap-4">
    ${
      safeData.mode === "essentielle"
        ? `
          <!-- ESSENTIELLE : 4 garanties -->
          <div class="flex items-center gap-3 bg-white p-4 rounded-xl">
            <div class="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-black">25</div>
            <div>
              <div class="font-black text-gray-900">PANNEAUX</div>
              <div class="text-xs text-gray-600">Performance standard</div>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-white p-4 rounded-xl">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">25</div>
            <div>
              <div class="font-black text-gray-900">ONDULEURS</div>
              <div class="text-xs text-gray-600">Pièces + M.O. + Déplacement</div>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-white p-4 rounded-xl">
            <div class="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black">10</div>
            <div>
              <div class="font-black text-gray-900">STRUCTURE</div>
              <div class="text-xs text-gray-600">Matériel + M.O. + Déplacement</div>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-white p-4 rounded-xl">
            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-black">25</div>
            <div>
              <div class="font-black text-gray-900">MATÉRIEL</div>
              <div class="text-xs text-gray-600">Garantie défauts fabrication</div>
            </div>
          </div>
        `
        : `
          <!-- PERFORMANCE : 4 garanties -->
          <div class="flex items-center gap-3 bg-white p-4 rounded-xl">
            <div class="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-black">À VIE</div>
            <div>
              <div class="font-black text-gray-900">PANNEAUX</div>
              <div class="text-xs text-gray-600">Pièces + M.O. + Déplacement</div>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-white p-4 rounded-xl">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">À VIE</div>
            <div>
              <div class="font-black text-gray-900">ONDULEURS</div>
              <div class="text-xs text-gray-600">Pièces + M.O. + Déplacement</div>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-white p-4 rounded-xl">
            <div class="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black">À VIE</div>
            <div>
              <div class="font-black text-gray-900">STRUCTURE</div>
              <div class="text-xs text-gray-600">Pièces + M.O. + Déplacement</div>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-white p-4 rounded-xl">
            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-black">À VIE</div>
            <div>
              <div class="font-black text-gray-900">MATÉRIEL</div>
              <div class="text-xs text-gray-600">Remplacement à neuf</div>
            </div>
          </div>
        `
    }
  </div>
</div>

              <!-- Footer page 2 -->
              <div class="border-t-2 border-gray-200 pt-8 mt-12 text-center">
                <div class="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Document confidentiel EDF Solutions Pro - Page 2/4
                </div>
              </div>
            </div>
          </div>

          <!-- PAGE 3 : TABLEAU AMORTISSEMENT -->
          <div class="page-break"></div>
          <div class="min-h-screen p-16 relative">
            <div class="absolute inset-0 opacity-5" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, #8b5cf6 35px, #8b5cf6 36px);"></div>
            
            <div class="relative z-10">
              <h2 class="text-5xl font-black italic uppercase mb-12 text-gray-900">
                PLAN DE FINANCEMENT
              </h2>

              <!-- Résumé financement -->
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-10 rounded-3xl mb-10 border-2 border-purple-200">
                <div class="grid grid-cols-3 gap-6 mb-8">
                  <div>
                    <div class="text-xs font-bold text-purple-700 uppercase mb-2">Coût Total</div>
                    <div class="text-3xl font-black text-gray-900">${f(
                      safeData.installCost
                    )}</div>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-purple-700 uppercase mb-2">Apport</div>
                    <div class="text-3xl font-black text-emerald-600">${f(
                      safeData.cashApport
                    )}</div>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-purple-700 uppercase mb-2">Financé</div>
                    <div class="text-3xl font-black text-blue-600">${f(
                      safeData.installCost - safeData.cashApport
                    )}</div>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-6">
                  <div>
                    <div class="text-xs font-bold text-purple-700 uppercase mb-2">Taux</div>
                    <div class="text-3xl font-black text-gray-900">${
                      safeData.t
                    }%</div>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-purple-700 uppercase mb-2">Durée</div>
                    <div class="text-3xl font-black text-gray-900">${
                      safeData.d / 12
                    } ans</div>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-purple-700 uppercase mb-2">Mensualité</div>
                    <div class="text-3xl font-black text-blue-600">${f(
                      safeData.m
                    )}</div>
                  </div>
                </div>
              </div>

              <!-- Tableau amortissement -->
              <div class="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                  <h3 class="text-xl font-black uppercase">Tableau d'Amortissement</h3>
                  <p class="text-sm mt-1 text-purple-100">Détail du remboursement sur ${
                    safeData.d / 12
                  } ans</p>
                </div>
                <table class="w-full">
                  <thead class="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th class="text-left text-xs font-black uppercase text-gray-700">Période</th>
                      <th class="text-right text-xs font-black uppercase text-gray-700">Mensualité</th>
                      <th class="text-right text-xs font-black uppercase text-gray-700">Capital</th>
                      <th class="text-right text-xs font-black uppercase text-gray-700">Intérêts</th>
                      <th class="text-right text-xs font-black uppercase text-gray-700">Reste Dû</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${amortissementData
                      .map(
                        (row, i) => `
                      <tr class="${
                        i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } border-b border-gray-100">
                        <td class="py-4 text-sm font-bold text-gray-900">
                          ${row.month === 1 ? "Mois 1" : `An ${row.year}`}
                        </td>
                        <td class="py-4 text-right text-sm font-bold text-gray-900">${f(
                          row.payment
                        )}</td>
                        <td class="py-4 text-right text-sm font-bold text-blue-600">${f(
                          row.principal
                        )}</td>
                        <td class="py-4 text-right text-sm font-bold text-orange-600">${f(
                          row.interest
                        )}</td>
                        <td class="py-4 text-right text-sm font-bold text-gray-700">${f(
                          row.remaining
                        )}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>

              <!-- Footer page 3 -->
              <div class="border-t-2 border-gray-200 pt-8 mt-12 text-center">
                <div class="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Document confidentiel EDF Solutions Pro - Page 3/4
                </div>
              </div>
            </div>
          </div>

          <!-- PAGE 4 : PROJECTION + MENTIONS LÉGALES -->
          <div class="page-break"></div>
          <div class="min-h-screen p-16 relative">
            <div class="absolute inset-0 opacity-5" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, #10b981 35px, #10b981 36px);"></div>
            
            <div class="relative z-10">
              <h2 class="text-5xl font-black italic uppercase mb-12 text-gray-900">
                PROJECTION ${projectionYears} ANS
              </h2>

              <!-- Évolution gains -->
              <div class="bg-gradient-to-br from-emerald-950 to-emerald-900 p-10 rounded-3xl mb-10 text-white">
                <h3 class="text-2xl font-black uppercase mb-8">Évolution du Patrimoine Énergétique</h3>
                <div class="grid grid-cols-4 gap-4">
                  <div class="text-center">
                    <div class="text-xs text-emerald-300 uppercase mb-2">Année 5</div>
                    <div class="text-3xl font-black">${f(
                      safeCalc.yearlyAvg * 5
                    )}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs text-emerald-300 uppercase mb-2">Année 10</div>
                    <div class="text-3xl font-black">${f(
                      safeCalc.yearlyAvg * 10
                    )}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs text-emerald-300 uppercase mb-2">Année 15</div>
                    <div class="text-3xl font-black">${f(
                      safeCalc.yearlyAvg * 15
                    )}</div>
                  </div>
                  <div class="text-center border-l-2 border-emerald-700">
                    <div class="text-xs text-emerald-300 uppercase mb-2">Année ${projectionYears}</div>
                    <div class="text-4xl font-black text-emerald-300">${f(
                      safeCalc.gain
                    )}</div>
                  </div>
                </div>
              </div>

              <!-- Message final -->
              <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 p-10 rounded-3xl border-2 border-emerald-200 mb-10">
                <h3 class="text-3xl font-black italic uppercase mb-6 text-emerald-900">
                  SYNTHÈSE DÉCISIONNELLE
                </h3>
                <div class="space-y-4 text-gray-700 leading-relaxed">
                  <p class="text-lg">
                    <strong class="text-gray-900">Après ${projectionYears} ans</strong>, votre installation solaire aura généré 
                    <strong class="text-emerald-600">${f(
                      safeCalc.gain
                    )}</strong> d'écart économique par rapport au scénario sans solaire.
                  </p>
                  <p class="text-lg">
                    Cet écart correspond à l'équivalent d'un capital de <strong class="text-yellow-600">${f(
                      safeCalc.equivalent
                    )}</strong> 
                    placé sur un Livret A à 2,7%. <strong class="text-gray-900">Avec le solaire, vous ne bloquez aucun capital</strong>.
                  </p>
                  <p class="text-lg font-bold text-gray-900">
                    La question n'est plus "Est-ce que je dois le faire ?", mais 
                    "Combien vais-je encore perdre avant de me décider ?"
                  </p>
                </div>
              </div>

              <!-- Mentions légales -->
              <div class="bg-gray-100 rounded-2xl p-8 border-2 border-gray-200">
                <h4 class="text-sm font-black uppercase mb-4 text-gray-900">Mentions Légales</h4>
                <div class="text-[10px] text-gray-600 leading-relaxed space-y-2">
                  <p>
                    <strong>Document confidentiel</strong> établi par EDF Solutions Pro le ${new Date().toLocaleDateString(
                      "fr-FR"
                    )}. 
                    Les données présentées sont des projections basées sur les informations fournies par le client et des hypothèses d'évolution prudentes.
                  </p>
                  <p>
                    <strong>Hypothèses de calcul :</strong> Inflation énergétique 5% par an, dégradation panneaux 0,4% par an, 
                    taux d'autoconsommation ${
                      safeData.selfCons
                    }%, rachat surplus 0.04€/kWh.
                  </p>
                  <p>
                   <p>
  <strong>Garanties :</strong> ${
    safeData.mode === "essentielle"
      ? "Panneaux 25 ans performance (indemnisation si production < 80%), Onduleurs 25 ans pièces + M.O. + Déplacement, Structure 10 ans matériel + M.O. + Déplacement, Matériel 25 ans défauts fabrication. TVA réduite 5.5%."
      : "Panneaux à vie (performance 30 ans avec indemnisation), Onduleurs à vie (pièces + M.O. + Déplacement), Structure à vie, Matériel à vie (remplacement à neuf). TVA 20%."
  }
</p>
                  <p>
                    <strong>Financement :</strong> Sous réserve d'acceptation par l'organisme prêteur. TAEG ${
                      safeData.t
                    }%, 
                    durée ${safeData.d} mois, montant emprunté ${f(
      safeData.installCost - safeData.cashApport
    )}.
                  </p>
                  <p>
                    <strong>Attestation :</strong> Je soussigné(e) ${
                      safeData.n
                    }, atteste avoir pris connaissance de l'ensemble des éléments 
                    présentés dans ce document et confirme l'exactitude des informations fournies.
                  </p>
                </div>
                <div class="mt-6 pt-6 border-t-2 border-gray-300 flex justify-between items-end">
                  <div>
                    <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Signature Client</div>
                    <div class="w-48 h-16 border-b-2 border-gray-400"></div>
                  </div>
                  <div>
                    <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Signature EDF Solutions Pro</div>
                    <div class="w-48 h-16 border-b-2 border-gray-400"></div>
                  </div>
                </div>
              </div>

              <!-- Footer page 4 -->
              <div class="border-t-2 border-gray-200 pt-8 mt-12 text-center">
                <div class="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Document confidentiel EDF Solutions Pro - Page 4/4
                </div>
              </div>
            </div>
          </div>

          <script>
            window.onload = () => setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      setIsGenerating(false);
      setShowModal(false);
    }, 1500);
  };

  // Si customStyled = true, bouton intégré dashboard
  if (customStyled) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center gap-4 group"
        >
          <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-500/30 text-blue-400 group-hover:scale-110 transition-transform duration-500">
            <FileText size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-white font-black text-lg uppercase italic leading-none tracking-tighter">
              Exporter PDF
            </h3>
            <p className="text-blue-400 text-[10px] font-bold uppercase mt-1 tracking-widest opacity-80">
              Dossier Complet + Amortissement
            </p>
          </div>
        </button>

        {showModal && (
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-zinc-900 p-12 rounded-[40px] border border-white/10 text-center max-w-md w-full relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <div className="inline-block p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20 mb-6">
                  <FileText className="text-blue-400" size={48} />
                </div>
                <h2 className="text-white text-3xl font-black uppercase italic mb-4">
                  Export PDF Complet
                </h2>
                <p className="text-slate-400 text-sm">
                  Dossier technique professionnel sur 4 pages avec tableau
                  d'amortissement détaillé
                </p>
              </div>

              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Lancer l'impression
                  </>
                )}
              </button>

              <div className="mt-6 text-xs text-slate-500 italic">
                💡 Le PDF s'ouvrira dans un nouvel onglet
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Affichage standalone
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center gap-4 bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20 hover:bg-blue-600/20 transition-all"
      >
        <Download className="text-blue-400" />
        <div className="text-left">
          <p className="text-white font-black uppercase italic leading-none">
            Exporter PDF
          </p>
          <p className="text-blue-400 text-[10px] font-bold uppercase mt-1">
            Dossier Complet
          </p>
        </div>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-6">
          <div className="bg-zinc-900 p-12 rounded-[40px] border border-white/10 text-center max-w-sm w-full">
            <FileText className="mx-auto text-blue-400 mb-6" size={60} />
            <h2 className="text-white text-2xl font-black uppercase italic mb-8">
              Prêt pour export ?
            </h2>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full py-5 bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-white"
            >
              {isGenerating ? "Génération..." : "Lancer l'impression"}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-slate-500 font-bold uppercase text-xs"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
};
