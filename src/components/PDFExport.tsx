import React, { useState } from "react";
import { SimulationResult, YearlyDetail } from "../types";
import { Download, X, FileText, CheckCircle2, Loader2 } from "lucide-react";

interface PDFExportProps {
  data: SimulationResult;
  calculationResult: SimulationResult;
  projectionYears: number;
}

const formatMoney = (val: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(val);

const formatNum = (val: number) => new Intl.NumberFormat("fr-FR").format(val);

export const PDFExport: React.FC<PDFExportProps> = ({
  data,
  calculationResult,
  projectionYears,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);

    // Create print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Veuillez autoriser les pop-ups pour générer le PDF");
      setIsGenerating(false);
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Étude Solaire - ${data.params.clientName || "Client"}</title>
  <style>
    @page { 
      size: A4; 
      margin: 10mm; 
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      background: white;
      line-height: 1.2;
    }
    
    .page {
      page-break-after: always;
      padding: 8px;
      position: relative;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 3px solid #0ea5e9;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .logo {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #f97316, #ea580c);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(249, 115, 22, 0.4);
    }
    
    .logo svg {
      width: 40px;
      height: 40px;
      fill: white;
    }
    
    .company-info h1 {
      font-size: 28px;
      font-weight: 900;
      background: linear-gradient(135deg, #0ea5e9, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 2px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    
    .company-info p {
      font-size: 9px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }
    
    .client-info {
      text-align: right;
    }
    
    .client-info p {
      font-size: 9px;
      color: #475569;
      margin: 1px 0;
    }
    
    .client-info .name {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      margin: 8px 0 5px 0;
      padding: 5px 10px;
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
      border-left: 4px solid #0ea5e9;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
    
    .highlight-box {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      border: 2px solid #3b82f6;
      border-radius: 10px;
      padding: 10px;
      margin: 6px 0;
      box-shadow: 0 3px 8px rgba(59, 130, 246, 0.2);
    }
    
    .highlight-box.success {
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      border-color: #10b981;
      box-shadow: 0 3px 8px rgba(16, 185, 129, 0.2);
    }
    
    .highlight-box.warning {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-color: #f59e0b;
      box-shadow: 0 3px 8px rgba(245, 158, 11, 0.2);
    }
    
    .highlight-box h3 {
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 5px;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    
    .value-highlight {
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    
    .value-highlight.glow {
      text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin: 6px 0;
    }
    
    .metric-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }
    
    .metric-label {
      font-size: 8px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 3px;
      letter-spacing: 0.4px;
    }
    
    .metric-value {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
    }
    
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0;
      font-size: 9px;
    }
    
    .comparison-table th {
      background: linear-gradient(135deg, #1e293b, #334155);
      color: white;
      padding: 5px;
      text-align: left;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-size: 8px;
    }
    
    .comparison-table td {
      padding: 5px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .comparison-table tr:hover {
      background: #f8fafc;
    }
    
    .warning-banner {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 8px;
      margin: 6px 0;
      box-shadow: 0 3px 6px rgba(239, 68, 68, 0.2);
    }
    
    .warning-banner strong {
      color: #dc2626;
      font-size: 11px;
      display: block;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    
    .warranty-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin: 6px 0;
    }
    
    .warranty-card {
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      border: 2px solid #0ea5e9;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 2px 4px rgba(14, 165, 233, 0.15);
    }
    
    .warranty-card h4 {
      font-size: 12px;
      font-weight: 900;
      color: #0c4a6e;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    
    .warranty-card .years {
      font-size: 22px;
      font-weight: 900;
      color: #0369a1;
      margin: 3px 0;
    }
    
    .footer {
      position: absolute;
      bottom: 8px;
      left: 8px;
      right: 8px;
      padding-top: 6px;
      border-top: 2px solid #e2e8f0;
      font-size: 8px;
      color: #64748b;
      text-align: center;
    }
    
    .page-number {
      position: absolute;
      bottom: 8px;
      right: 8px;
      font-size: 9px;
      color: #94a3b8;
      font-weight: 600;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>

<!-- PAGE 1: COUVERTURE & SYNTHÈSE -->
<div class="page">
  <div class="header">
    <div class="logo-section">
      <div class="logo">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5" fill="white"/>
          <path d="M12 1v6m0 6v6m8.66-11L17 12l3.66 4M6.34 8L3 12l3.34 4" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="company-info">
        <h1>SOLUTIONS SOLAIRES</h1>
        <p>EDF - ANALYSE PREMIUM</p>
      </div>
    </div>
    <div class="client-info">
      <p class="name">${data.params.clientName || "Client"}</p>
      <p>${new Date().toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
    </div>
  </div>

  <div class="highlight-box success">
    <h3>🎯 VOTRE GAIN TOTAL SUR ${projectionYears} ANS</h3>
    <div class="value-highlight glow">${formatMoney(
      calculationResult.totalSavingsProjected
    )}</div>
    <p style="margin-top: 4px; font-size: 9px; color: #065f46;">
      Économies nettes après remboursement du crédit
    </p>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-label">ROI ANNUEL</div>
      <div class="metric-value" style="color: #10b981;">
        ${calculationResult.roiPercentage}%
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-label">POINT MORT</div>
      <div class="metric-value" style="color: #3b82f6;">
        ${calculationResult.breakEvenPoint} ans
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-label">AUTONOMIE</div>
      <div class="metric-value" style="color: #f59e0b;">
        ${calculationResult.savingsRatePercent.toFixed(0)}%
      </div>
    </div>
  </div>

  <h2 class="section-title">📊 VOTRE INSTALLATION</h2>
  
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-label">PUISSANCE</div>
      <div class="metric-value">${data.params.power || 0} kWc</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">PRODUCTION ANNUELLE</div>
      <div class="metric-value">${formatNum(
        data.params.yearlyProduction
      )} kWh</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">AUTOCONSOMMATION</div>
      <div class="metric-value">${data.params.selfConsumptionRate}%</div>
    </div>
  </div>

  <h2 class="section-title">💰 FINANCEMENT</h2>
  
  <div class="highlight-box">
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
      <div>
        <p style="font-size: 9px; color: #475569; font-weight: 600; margin-bottom: 2px;">
          COÛT INSTALLATION
        </p>
        <p style="font-size: 20px; font-weight: 900;">
          ${formatMoney(data.params.installCost)}
        </p>
      </div>
      <div>
        <p style="font-size: 9px; color: #475569; font-weight: 600; margin-bottom: 2px;">
          MENSUALITÉ
        </p>
        <p style="font-size: 20px; font-weight: 900;">
          ${formatMoney(
            data.params.creditMonthlyPayment +
              data.params.insuranceMonthlyPayment
          )}/mois
        </p>
      </div>
    </div>
  </div>

  <div class="warning-banner">
    <strong>⚠️ COÛT DE L'INACTION</strong>
    <p style="font-size: 9px; color: #7f1d1d; margin-top: 3px;">
      Si vous attendez 1 an : vous perdez <strong>${formatMoney(
        calculationResult.lossIfWait1Year
      )}</strong> de facture électrique + <strong>${formatMoney(
      calculationResult.savingsLostIfWait1Year
    )}</strong> d'économies non réalisées.
    </p>
  </div>

  <div class="footer">
    Étude réalisée le ${new Date().toLocaleDateString(
      "fr-FR"
    )} • Document confidentiel
  </div>
  <div class="page-number">Page 1/${projectionYears >= 20 ? 4 : 3}</div>
</div>

<!-- PAGE 2: COMPARAISON DÉTAILLÉE -->
<div class="page">
  <div class="header">
    <div class="logo-section">
      <div class="logo">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5" fill="white"/>
          <path d="M12 1v6m0 6v6m8.66-11L17 12l3.66 4M6.34 8L3 12l3.34 4" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="company-info">
        <h1>SOLUTIONS SOLAIRES</h1>
        <p>EDF - ANALYSE PREMIUM</p>
      </div>
    </div>
    <div class="client-info">
      <p class="name">${data.params.clientName || "Client"}</p>
    </div>
  </div>

  <h2 class="section-title">⚡ COMPARAISON FINANCEMENT VS CASH</h2>

  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin: 6px 0;">
    <div class="highlight-box">
      <h3 style="color: #1e40af;">💳 AVEC FINANCEMENT</h3>
      <div class="value-highlight" style="color: #3b82f6;">
        ${formatMoney(calculationResult.totalSavingsProjected)}
      </div>
      <p style="font-size: 9px; margin-top: 4px; color: #475569;">
        Point mort : ${calculationResult.breakEvenPoint} ans
      </p>
    </div>
    
    <div class="highlight-box success">
      <h3 style="color: #065f46;">💵 PAIEMENT CASH</h3>
      <div class="value-highlight" style="color: #10b981;">
        ${formatMoney(calculationResult.totalSavingsProjectedCash)}
      </div>
      <p style="font-size: 9px; margin-top: 4px; color: #065f46;">
        Point mort : ${calculationResult.breakEvenPointCash} ans
      </p>
    </div>
  </div>

  <h2 class="section-title">📈 ÉVOLUTION SUR ${projectionYears} ANS (FINANCEMENT)</h2>

  <table class="comparison-table">
    <thead>
      <tr>
        <th>ANNÉE</th>
        <th>SANS SOLAIRE</th>
        <th>AVEC SOLAIRE</th>
        <th>ÉCONOMIES</th>
        <th>CUMUL</th>
      </tr>
    </thead>
    <tbody>
      ${calculationResult.details
        .slice(0, Math.min(30, projectionYears))
        .map(
          (row: YearlyDetail) => `
        <tr>
          <td style="font-weight: 700;">${row.year}</td>
          <td style="color: #dc2626;">${formatMoney(
            row.edfBillWithoutSolar
          )}</td>
          <td style="color: #3b82f6;">${formatMoney(row.totalWithSolar)}</td>
          <td style="color: ${
            row.cashflowDiff > 0 ? "#10b981" : "#f59e0b"
          }; font-weight: 700;">
            ${row.cashflowDiff > 0 ? "+" : ""}${formatMoney(row.cashflowDiff)}
          </td>
          <td style="color: ${
            row.cumulativeSavings >= 0 ? "#10b981" : "#dc2626"
          }; font-weight: 700;">
            ${formatMoney(row.cumulativeSavings)}
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    Étude réalisée le ${new Date().toLocaleDateString(
      "fr-FR"
    )} • Document confidentiel
  </div>
  <div class="page-number">Page 2/${projectionYears >= 20 ? 4 : 3}</div>
</div>

<!-- PAGE 3: GARANTIES -->
<div class="page">
  <div class="header">
    <div class="logo-section">
      <div class="logo">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5" fill="white"/>
          <path d="M12 1v6m0 6v6m8.66-11L17 12l3.66 4M6.34 8L3 12l3.34 4" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="company-info">
        <h1>SOLUTIONS SOLAIRES</h1>
        <p>EDF - ANALYSE PREMIUM</p>
      </div>
    </div>
    <div class="client-info">
      <p class="name">${data.params.clientName || "Client"}</p>
    </div>
  </div>

  <h2 class="section-title">🛡️ GARANTIES & SÉCURITÉ</h2>

  <div class="warranty-grid">
    <div class="warranty-card">
      <h4>☀️ PANNEAUX</h4>
      <div class="years">25 ANS</div>
      <p style="font-size: 10px; color: #0c4a6e; margin-top: 4px;">
        Production garantie • Pièces + M.O. + Déplacement
      </p>
    </div>
    
    <div class="warranty-card">
      <h4>⚡ ONDULEURS</h4>
      <div class="years">25 ANS</div>
      <p style="font-size: 10px; color: #0c4a6e; margin-top: 4px;">
        Remplacement à neuf • Pièces + M.O. + Déplacement
      </p>
    </div>
    
    <div class="warranty-card">
      <h4>🔧 STRUCTURE</h4>
      <div class="years">10 ANS</div>
      <p style="font-size: 10px; color: #0c4a6e; margin-top: 4px;">
        Fixation & étanchéité • Pièces + M.O. + Déplacement
      </p>
    </div>
    
    <div class="warranty-card">
      <h4>✅ MATÉRIEL</h4>
      <div class="years">25 ANS</div>
      <p style="font-size: 10px; color: #0c4a6e; margin-top: 4px;">
        Défauts de fabrication • Panneaux français
      </p>
    </div>
  </div>

  <h2 class="section-title">🤖 SURVEILLANCE INTELLIGENTE</h2>

  <div class="highlight-box">
    <h3>AUTOPILOTE IA 24/7</h3>
    <ul style="margin-top: 5px; padding-left: 16px; font-size: 9px; color: #1e293b; line-height: 1.4;">
      <li>✅ Détection automatique des pannes avant que vous les remarquiez</li>
      <li>✅ Optimisation continue de la production</li>
      <li>✅ Alertes en temps réel sur votre smartphone</li>
      <li>✅ Intervention gratuite en cas de problème</li>
    </ul>
  </div>

  <div class="highlight-box warning">
    <h3>📱 AFFICHEUR CONNECTÉ</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-top: 5px;">
      <div style="background: white; padding: 5px; border-radius: 6px; text-align: center;">
        <p style="font-size: 8px; color: #64748b; font-weight: 700;">PRODUCTION</p>
        <p style="font-size: 14px; font-weight: 900; color: #f59e0b;">Live</p>
      </div>
      <div style="background: white; padding: 5px; border-radius: 6px; text-align: center;">
        <p style="font-size: 8px; color: #64748b; font-weight: 700;">CONSOMMATION</p>
        <p style="font-size: 14px; font-weight: 900; color: #3b82f6;">Temps réel</p>
      </div>
      <div style="background: white; padding: 5px; border-radius: 6px; text-align: center;">
        <p style="font-size: 8px; color: #64748b; font-weight: 700;">ÉCONOMIES</p>
        <p style="font-size: 14px; font-weight: 900; color: #10b981;">€ jour</p>
      </div>
    </div>
  </div>

  <h2 class="section-title">🏦 COMPARAISON PLACEMENTS</h2>

  <table class="comparison-table">
    <thead>
      <tr>
        <th>PLACEMENT</th>
        <th>RENDEMENT</th>
        <th>GAIN ${projectionYears} ANS</th>
        <th>LIQUIDITÉ</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-weight: 700;">Livret A</td>
        <td>2.7%/an</td>
        <td>${formatMoney(
          data.params.installCost * Math.pow(1.027, projectionYears) -
            data.params.installCost
        )}</td>
        <td>✅ Immédiate</td>
      </tr>
      <tr>
        <td style="font-weight: 700;">Assurance Vie</td>
        <td>3.5%/an</td>
        <td>${formatMoney(
          data.params.installCost * Math.pow(1.035, projectionYears) -
            data.params.installCost
        )}</td>
        <td>⚠️ Frais de rachat</td>
      </tr>
      <tr>
        <td style="font-weight: 700;">SCPI</td>
        <td>4.5%/an</td>
        <td>${formatMoney(
          data.params.installCost * Math.pow(1.045, projectionYears) -
            data.params.installCost
        )}</td>
        <td>❌ Illiquide</td>
      </tr>
      <tr style="background: #d1fae5;">
        <td style="font-weight: 900;">☀️ SOLAIRE</td>
        <td style="font-weight: 900; color: #10b981;">${
          calculationResult.roiPercentage
        }%/an</td>
        <td style="font-weight: 900; color: #10b981;">${formatMoney(
          calculationResult.totalSavingsProjected
        )}</td>
        <td style="font-weight: 900;">✅ Capital libre</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Étude réalisée le ${new Date().toLocaleDateString(
      "fr-FR"
    )} • Document confidentiel
  </div>
  <div class="page-number">Page 3/${projectionYears >= 20 ? 4 : 3}</div>
</div>

${
  projectionYears >= 20
    ? `
<!-- PAGE 4: PROJECTION LONG TERME -->
<div class="page">
  <div class="header">
    <div class="logo-section">
      <div class="logo">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5" fill="white"/>
          <path d="M12 1v6m0 6v6m8.66-11L17 12l3.66 4M6.34 8L3 12l3.34 4" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="company-info">
        <h1>SOLUTIONS SOLAIRES</h1>
        <p>EDF - ANALYSE PREMIUM</p>
      </div>
    </div>
    <div class="client-info">
      <p class="name">${data.params.clientName || "Client"}</p>
    </div>
  </div>

  <h2 class="section-title">🎯 PROJECTION ${projectionYears} ANS</h2>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-label">ANNÉE 5</div>
      <div class="metric-value" style="color: #f59e0b;">
        ${formatMoney(calculationResult.details[4]?.cumulativeSavings || 0)}
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-label">ANNÉE 10</div>
      <div class="metric-value" style="color: #3b82f6;">
        ${formatMoney(calculationResult.details[9]?.cumulativeSavings || 0)}
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-label">ANNÉE ${projectionYears}</div>
      <div class="metric-value" style="color: #10b981;">
        ${formatMoney(
          calculationResult.details[projectionYears - 1]?.cumulativeSavings || 0
        )}
      </div>
    </div>
  </div>

  <div class="highlight-box success">
    <h3>💎 CAPITAL PATRIMONIAL CRÉÉ</h3>
    <div class="value-highlight glow">${formatMoney(
      calculationResult.totalSavingsProjected
    )}</div>
    <p style="font-size: 9px; margin-top: 4px; color: #065f46;">
      Ce capital est transmissible et continue de produire pendant 25+ ans
    </p>
  </div>

  <h2 class="section-title">🔮 ANALYSE PRÉVISIONNELLE</h2>

  <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 2px solid #0ea5e9; border-radius: 8px; padding: 8px; margin: 6px 0;">
    <p style="font-size: 9px; color: #0c4a6e; line-height: 1.4;">
      <strong style="display: block; margin-bottom: 4px; font-size: 10px;">SCÉNARIOS D'INFLATION :</strong>
      Avec une inflation de ${
        data.params.inflationRate
      }% par an, votre facture sans solaire aurait atteint 
      <strong>${formatMoney(
        calculationResult.details[projectionYears - 1]?.edfBillWithoutSolar || 0
      )}/an</strong> en année ${projectionYears}.
      <br/><br/>
      Grâce à votre installation, vous ne payez que 
      <strong>${formatMoney(
        calculationResult.details[projectionYears - 1]?.edfResidue || 0
      )}/an</strong>, soit une économie de 
      <strong style="color: #10b981;">${(
        ((calculationResult.details[projectionYears - 1]?.edfBillWithoutSolar -
          calculationResult.details[projectionYears - 1]?.edfResidue) /
          calculationResult.details[projectionYears - 1]?.edfBillWithoutSolar) *
        100
      ).toFixed(0)}%</strong> sur votre budget énergie.
    </p>
  </div>

  <h2 class="section-title">📊 BILAN FINANCIER FINAL</h2>

  <table class="comparison-table">
    <thead>
      <tr>
        <th>MÉTRIQUE</th>
        <th>VALEUR</th>
        <th>COMMENTAIRE</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-weight: 700;">Investissement initial</td>
        <td>${formatMoney(data.params.installCost)}</td>
        <td style="font-size: 9px; color: #64748b;">Financé sur ${Math.round(
          data.params.creditDurationMonths / 12
        )} ans</td>
      </tr>
      <tr>
        <td style="font-weight: 700;">Coût total du crédit</td>
        <td>${formatMoney(
          (data.params.creditMonthlyPayment +
            data.params.insuranceMonthlyPayment) *
            data.params.creditDurationMonths
        )}</td>
        <td style="font-size: 9px; color: #64748b;">
          Mensualité : ${formatMoney(
            data.params.creditMonthlyPayment +
              data.params.insuranceMonthlyPayment
          )}/mois
        </td>
      </tr>
      <tr style="background: #d1fae5;">
        <td style="font-weight: 900;">Gain net sur ${projectionYears} ans</td>
        <td style="font-weight: 900; color: #10b981; font-size: 14px;">
          ${formatMoney(calculationResult.totalSavingsProjected)}
        </td>
        <td style="font-size: 9px; color: #065f46; font-weight: 700;">
          ROI ${calculationResult.roiPercentage}%/an
        </td>
      </tr>
    </tbody>
  </table>

  <div class="warning-banner">
    <strong>🎯 CONCLUSION DE L'ANALYSE IA</strong>
    <p style="font-size: 9px; color: #7f1d1d; margin-top: 3px;">
      Avec un ROI de <strong>${
        calculationResult.roiPercentage
      }%/an</strong> et un point mort à <strong>${
        calculationResult.breakEvenPoint
      } ans</strong>, 
      votre projet solaire surperforme tous les placements financiers classiques. Vous créez un patrimoine 
      énergétique qui continuera de produire pendant 25+ ans.
    </p>
  </div>

  <div class="footer">
    Étude réalisée le ${new Date().toLocaleDateString(
      "fr-FR"
    )} • Document confidentiel
  </div>
  <div class="page-number">Page 4/4</div>
</div>
`
    : ""
}

</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setIsGenerating(false);
        setShowModal(false);
      }, 500);
    };
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 px-8 rounded-xl uppercase tracking-wider text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-900/50 transition-all active:scale-95"
      >
        <Download size={20} />
        Télécharger le Rapport PDF
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-black/90 backdrop-blur-xl border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-blue-500/10 text-blue-500">
                  <FileText size={24} />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Générer Mon Étude PDF
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">
                    VOTRE ÉTUDE COMPREND :
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Synthèse complète de votre projet solaire
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Comparaison financement vs paiement cash
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Projection sur {projectionYears} ans détaillée
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Garanties et surveillance intelligente
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Comparaison avec placements traditionnels
                  </li>
                </ul>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6 text-xs text-slate-400">
                💡 <strong className="text-white">Astuce :</strong> Une fois le
                PDF généré, utilisez l'option "Enregistrer en PDF" de votre
                navigateur pour sauvegarder le document.
              </div>

              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 px-8 rounded-xl uppercase tracking-wider text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Générer Mon Étude PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
