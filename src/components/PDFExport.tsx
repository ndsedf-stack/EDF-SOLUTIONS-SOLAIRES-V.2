import React, { useState } from "react";
import { SimulationResult, YearlyDetail } from "../types";
import {
  Download,
  X,
  FileText,
  CheckCircle2,
  Loader2,
  Eye,
  Lock,
} from "lucide-react";

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

// Fonction pour arrondir les chiffres (version client)
const arrondirChiffre = (montant: number, pas: number = 100) => {
  return Math.round(montant / pas) * pas;
};

export const PDFExport: React.FC<PDFExportProps> = ({
  data,
  calculationResult,
  projectionYears,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfVersion, setPdfVersion] = useState<"full" | "client">("client");

  // ====================================================================
  // VERSION CLIENT OPTIMISÉE - COMPACT & DENSE (CORRIGÉE)
  // ====================================================================
  const generateClientPDF = () => {
    setIsGenerating(true);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Veuillez autoriser les pop-ups pour générer le PDF");
      setIsGenerating(false);
      return;
    }

    // CHIFFRES arrondis pour le client avec vérifications
    const montantArrondi = arrondirChiffre(
      data.params.installCost || 19000,
      1000
    );
    const mensualiteCredit = data.params.creditMonthlyPayment || 0;
    const mensualiteAssurance = data.params.insuranceMonthlyPayment || 0;
    const mensualiteArrondie = arrondirChiffre(
      mensualiteCredit + mensualiteAssurance,
      50
    );

    // TAUX RÉEL - FONCTION SIMPLIFIÉE
    const calculerTauxReel = () => {
      // Vérifie si le taux est déjà dans les params
      if (data.params.interestRate !== undefined)
        return data.params.interestRate;
      if (data.params.TAEG !== undefined) return data.params.TAEG;
      if (data.params.annualRate !== undefined) return data.params.annualRate;

      // Sinon calcul approximatif (sécurité)
      const totalLoan =
        (data.params.installCost || 19000) - (data.params.cashApport || 0);
      const monthlyPayment = data.params.creditMonthlyPayment || 138.01;
      const months = data.params.creditDurationMonths || 180;

      if (totalLoan <= 0 || monthlyPayment <= 0 || months <= 0) return 4.7;

      const totalPaid = monthlyPayment * months;
      const interest = totalPaid - totalLoan;
      const annualRate = (interest / totalLoan / (months / 12)) * 100;

      return Math.round(annualRate * 10) / 10;
    };

    const tauxReel = calculerTauxReel();
    const tauxAffichage = tauxReel.toFixed(1).replace(".", ",");

    // CALCUL ÉCONOMIES avec vérifications de sécurité
    const details = calculationResult?.details || [];
    const detailsAn5 = details[4];
    const detailsAn10 = details[9];
    const detailsAn20 =
      details[projectionYears - 1] || details[details.length - 1] || {};

    let economieAn5Texte = "En cours";
    let economieAn5Montant = 0;
    let economieAn5Width = 25;

    if (detailsAn5 && detailsAn5.cumulativeSavings > 0) {
      economieAn5Montant = arrondirChiffre(detailsAn5.cumulativeSavings, 1000);
      economieAn5Texte = `+${formatMoney(economieAn5Montant)}`;
      economieAn5Width = 25;
    } else if (detailsAn5 && detailsAn5.cumulativeSavings < 0) {
      economieAn5Montant = Math.abs(
        arrondirChiffre(detailsAn5.cumulativeSavings, 1000)
      );
      economieAn5Texte = `Amortissement`;
      economieAn5Width = 15;
    }

    const economieAn10 =
      detailsAn10?.cumulativeSavings > 0
        ? arrondirChiffre(detailsAn10.cumulativeSavings, 2000)
        : arrondirChiffre(Math.abs(detailsAn10?.cumulativeSavings || 0), 1000);

    const economieAn20 = arrondirChiffre(
      calculationResult?.totalSavingsProjected || 15000,
      5000
    );

    const autonomieArrondie = calculationResult?.savingsRatePercent
      ? Math.round(calculationResult.savingsRatePercent / 5) * 5
      : 50;

    const productionAnnuelle = formatNum(data.params.yearlyProduction || 7000);
    const roiEstime = calculationResult?.roiPercentage || 4.4;
    const pointMort = calculationResult?.breakEvenPoint || 12;

    const clientName = data.params.clientName || "Client";
    const dateStr = new Date().toLocaleDateString("fr-FR");

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Projet Solaire - ${clientName}</title>
  <style>
    @page { 
      size: A4; 
      margin: 8mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1a1a1a;
      line-height: 1.3;
      background: white;
      font-size: 11px;
    }
    
    /* WATERMARKS */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 50px;
      color: rgba(14, 165, 233, 0.03);
      z-index: 9999;
      pointer-events: none;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 6px;
    }
    
    /* HEADER */
    .hero-header {
      background: linear-gradient(135deg, #1e40af, #0ea5e9);
      color: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.25);
    }
    
    .hero-header h1 {
      font-size: 28px;
      font-weight: 900;
      margin-bottom: 8px;
    }
    
    .hero-header .subtitle {
      font-size: 13px;
      opacity: 0.9;
    }
    
    /* ALERTE */
    .alert-banner {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border: 3px solid #f59e0b;
      border-radius: 10px;
      padding: 12px;
      margin: 12px 0;
      font-size: 10px;
      line-height: 1.4;
    }
    
    .alert-title {
      color: #92400e;
      font-size: 13px;
      font-weight: 900;
      margin-bottom: 8px;
    }
    
    /* TAUX BOX */
    .taux-box {
      background: white;
      border: 3px solid #3b82f6;
      border-radius: 12px;
      padding: 15px;
      margin: 15px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }
    
    .taux-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    
    .taux-value {
      font-size: 32px;
      font-weight: 900;
      color: #1e40af;
      margin: 8px 0;
    }
    
    .taux-note {
      font-size: 10px;
      color: #64748b;
      margin-top: 8px;
    }
    
    /* GRID 2x2 */
    .key-values-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin: 15px 0;
    }
    
    .key-value-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .key-value-card.primary {
      border-color: #3b82f6;
      background: linear-gradient(135deg, #ffffff, #eff6ff);
    }
    
    .key-value-card.success {
      border-color: #10b981;
      background: linear-gradient(135deg, #ffffff, #ecfdf5);
    }
    
    .key-value-card .label {
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    
    .key-value-card .value {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      margin: 8px 0;
    }
    
    .key-value-card .value.success {
      color: #065f46;
    }
    
    .key-value-card .value.primary {
      color: #1e40af;
    }
    
    .key-value-card .note {
      font-size: 9px;
      color: #64748b;
      margin-top: 5px;
    }
    
    /* JOURNEY */
    .journey-section {
      margin: 15px 0;
    }
    
    .journey-title {
      font-size: 18px;
      font-weight: 900;
      text-align: center;
      margin: 12px 0;
      color: #0f172a;
    }
    
    .journey-steps {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin: 15px 0;
    }
    
    .journey-step {
      flex: 1;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 15px 10px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .step-number {
      width: 35px;
      height: 35px;
      background: linear-gradient(135deg, #0ea5e9, #3b82f6);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 900;
      margin: 0 auto 10px;
      border: 3px solid white;
      box-shadow: 0 3px 8px rgba(14, 165, 233, 0.3);
    }
    
    .step-title {
      font-size: 14px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 8px;
    }
    
    .step-description {
      font-size: 11px;
      color: #475569;
      line-height: 1.4;
    }
    
    /* COMPARAISON */
    .comparison-section {
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-radius: 12px;
      padding: 15px;
      margin: 15px 0;
      border: 2px solid #0ea5e9;
    }
    
    .comparison-title {
      font-size: 16px;
      font-weight: 900;
      text-align: center;
      margin-bottom: 12px;
      color: #0f172a;
    }
    
    .comparison-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .comparison-column {
      padding: 12px;
      border-radius: 10px;
    }
    
    .comparison-column.before {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border: 2px solid #ef4444;
    }
    
    .comparison-column.after {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border: 2px solid #10b981;
    }
    
    .comparison-column h3 {
      font-size: 14px;
      font-weight: 900;
      margin-bottom: 10px;
    }
    
    .comparison-column.before h3 {
      color: #dc2626;
    }
    
    .comparison-column.after h3 {
      color: #065f46;
    }
    
    .comparison-list {
      list-style: none;
      padding: 0;
    }
    
    .comparison-list li {
      padding: 5px 0;
      font-size: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .comparison-list.before li:before {
      content: "❌";
      font-size: 11px;
    }
    
    .comparison-list.after li:before {
      content: "✅";
      font-size: 11px;
    }
    
    /* GRAPHIQUE */
    .chart-section {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 15px;
      margin: 15px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .chart-title {
      font-size: 16px;
      font-weight: 900;
      text-align: center;
      margin-bottom: 12px;
      color: #0f172a;
    }
    
    .chart-item {
      margin-bottom: 12px;
    }
    
    .chart-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 11px;
      font-weight: 700;
    }
    
    .chart-bar-container {
      height: 25px;
      background: #f1f5f9;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .chart-bar-fill {
      height: 100%;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      font-weight: 900;
      color: white;
      font-size: 10px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }
    
    /* CTA */
    .cta-section {
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: white;
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
      text-align: center;
      border: 3px solid #0ea5e9;
    }
    
    .cta-title {
      font-size: 20px;
      font-weight: 900;
      margin-bottom: 10px;
      color: #0ea5e9;
    }
    
    .advisor-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 15px;
      margin: 15px auto;
      max-width: 400px;
      backdrop-filter: blur(10px);
    }
    
    .advisor-name {
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 5px;
    }
    
    .advisor-title {
      font-size: 11px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    
    .email {
      font-size: 11px;
      margin: 8px 0;
    }
    
    .phone-number {
      font-size: 24px;
      font-weight: 900;
      color: #0ea5e9;
      margin: 10px 0;
    }
    
    .contact-notes {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px;
      margin-top: 12px;
      font-size: 10px;
    }
    
    .contact-notes p {
      padding: 3px 0;
    }
    
    /* FOOTER */
    .footer {
      text-align: center;
      margin-top: 15px;
      padding-top: 12px;
      border-top: 2px solid #e2e8f0;
      font-size: 9px;
      color: #64748b;
      line-height: 1.4;
    }
    
    .footer-note {
      background: #fef2f2;
      border: 2px solid #fecaca;
      border-radius: 8px;
      padding: 8px;
      margin: 10px auto;
      max-width: 500px;
      color: #7f1d1d;
      font-weight: 700;
      font-size: 9px;
    }
    
    /* RESPONSIVE PRINT */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .watermark {
        display: block !important;
      }
      
      .no-break {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>

  <div class="watermark">PRÉVISUALISATION</div>

  <!-- PAGE 1 -->
  <div class="no-break">
    
    <!-- HERO -->
    <div class="hero-header">
      <h1>🌞 VOTRE PROJET SOLAIRE</h1>
      <p class="subtitle">${clientName} • ${dateStr}</p>
    </div>

    <!-- TAUX BOX -->
    <div class="taux-box">
      <div class="taux-label">TAUX DE FINANCEMENT CONFIRMÉ</div>
      <div class="taux-value">${tauxAffichage}% TAEG</div>
      <div class="taux-note">
        Taux fixe garanti ${Math.round(
          data.params.creditDurationMonths / 12
        )} ans • 
        Sous réserve d'acceptation finale par notre partenaire financier
      </div>
    </div>

    <!-- ALERTE -->
    <div class="alert-banner">
      <div class="alert-title">📋 DOCUMENT INDICATIF</div>
      <div>
        Chiffres arrondis à titre indicatif. Votre conseiller EDF dispose de l'étude complète avec le taux ${tauxAffichage}% TAEG.
        <strong> Ce document n'est pas contractuel.</strong>
      </div>
    </div>

    <!-- GRID CHIFFRES CLÉS -->
    <div class="key-values-grid">
      <div class="key-value-card primary">
        <div class="label">💰 INVESTISSEMENT</div>
        <div class="value primary">${formatMoney(montantArrondi)}</div>
        <div class="note">Taux ${tauxAffichage}% • ${Math.round(
      data.params.creditDurationMonths / 12
    )} ans</div>
      </div>
      
      <div class="key-value-card success">
        <div class="label">📉 MENSUALITÉ</div>
        <div class="value success">${formatMoney(mensualiteArrondie)}</div>
        <div class="note">/mois tout compris</div>
      </div>
      
      <div class="key-value-card">
        <div class="label">⚡ PRODUCTION</div>
        <div class="value">${productionAnnuelle} kWh</div>
        <div class="note">${Math.round(
          data.params.yearlyProduction / 1000
        )} MWh/an</div>
      </div>
      
      <div class="key-value-card success">
        <div class="label">🏠 AUTONOMIE</div>
        <div class="value success">${autonomieArrondie}%</div>
        <div class="note">De votre consommation</div>
      </div>
    </div>

    <!-- JOURNEY -->
    <div class="journey-section">
      <h2 class="journey-title">📈 ÉVOLUTION DE VOS ÉCONOMIES</h2>
      
      <div class="journey-steps">
        <div class="journey-step">
          <div class="step-number">1</div>
          <div class="step-title">ANNÉE 1</div>
          <div class="step-description">Facture EDF réduite de <strong>${autonomieArrondie}%</strong></div>
        </div>
        
        <div class="journey-step">
          <div class="step-number">2</div>
          <div class="step-title">ANNÉE ${pointMort}</div>
          <div class="step-description"><strong>Point mort</strong> atteint</div>
        </div>
        
        <div class="journey-step">
          <div class="step-number">3</div>
          <div class="step-title">ANNÉE ${projectionYears}</div>
          <div class="step-description"><strong>${formatMoney(
            economieAn20
          )}</strong> de gain net</div>
        </div>
      </div>
    </div>

    <!-- COMPARAISON -->
    <div class="comparison-section">
      <h2 class="comparison-title">⚖️ AVANT vs APRÈS</h2>
      
      <div class="comparison-grid">
        <div class="comparison-column before">
          <h3>🔴 SANS SOLAIRE</h3>
          <ul class="comparison-list before">
            <li>Facture qui augmente</li>
            <li>Dépendance totale</li>
            <li>Pas de contrôle prix</li>
            <li>Budget imprévisible</li>
          </ul>
        </div>
        
        <div class="comparison-column after">
          <h3>🟢 AVEC SOLAIRE</h3>
          <ul class="comparison-list after">
            <li>Facture réduite ${autonomieArrondie}%</li>
            <li>Financement ${tauxAffichage}% TAEG</li>
            <li>ROI ${roiEstime}%/an</li>
            <li>+5 à 10% valeur maison</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- GRAPHIQUE -->
    <div class="chart-section">
      <h2 class="chart-title">💰 ÉCONOMIES PROGRESSIVES</h2>
      
      <div class="chart-item">
        <div class="chart-label">
          <span>ANNÉE 5</span>
          <span>${economieAn5Texte}</span>
        </div>
        <div class="chart-bar-container">
          <div class="chart-bar-fill" style="width: ${economieAn5Width}%; background: linear-gradient(135deg, #f59e0b, #fb923c);">
            ${economieAn5Width > 20 ? economieAn5Texte : ""}
          </div>
        </div>
      </div>
      
      <div class="chart-item">
        <div class="chart-label">
          <span>ANNÉE 10</span>
          <span>+${formatMoney(economieAn10)}</span>
        </div>
        <div class="chart-bar-container">
          <div class="chart-bar-fill" style="width: 50%; background: linear-gradient(135deg, #3b82f6, #0ea5e9);">
            +${formatMoney(economieAn10)}
          </div>
        </div>
      </div>
      
      <div class="chart-item">
        <div class="chart-label">
          <span>ANNÉE ${projectionYears}</span>
          <span>+${formatMoney(economieAn20)}</span>
        </div>
        <div class="chart-bar-container">
          <div class="chart-bar-fill" style="width: 100%; background: linear-gradient(135deg, #10b981, #059669);">
            +${formatMoney(economieAn20)}
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="cta-section">
      <div class="cta-title">🚀 PROJET PRÊT À DÉMARRER</div>
      
      <div class="advisor-card">
        <div class="advisor-name">${
          data.params.advisorName || "Nicolas DI STEFANO"
        }</div>
        <div class="advisor-title">Expert Photovoltaïque EDF</div>
        <div class="email">📧 ${
          data.params.advisorEmail || "ndi-stefano@edf-solutions-solaires.com"
        }</div>
        <div class="phone-number">📱 ${
          data.params.advisorPhone || "06 83 62 33 29"
        }</div>
        <div style="font-size: 11px; margin-top: 10px; opacity: 0.9;">
          <strong>Disponible cette semaine pour finaliser votre projet</strong>
        </div>
      </div>
      
      <div class="contact-notes">
        <p>✅ RDV gratuit domicile/visio</p>
        <p>✅ Étude complète avec taux ${tauxAffichage}%</p>
        <p>✅ Accompagnement A à Z</p>
        <p>✅ Signature sous 48h possible</p>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p><strong>Document ${dateStr} • Prévisualisation client • Taux ${tauxAffichage}% TAEG</strong></p>
      <div class="footer-note">
        ⚠️ Document indicatif. Seule l'étude complète avec le taux ${tauxAffichage}% TAEG fait foi.
      </div>
      <p>EDF Solutions Solaires • Doc n°${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}</p>
    </div>

  </div>

</body>
</html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setIsGenerating(false);
        setShowModal(false);
      }, 500);
    };
  };

  // ====================================================================
  // RENDU DU COMPOSANT
  // ====================================================================
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 px-8 rounded-xl uppercase tracking-wider text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-900/50 transition-all active:scale-95"
      >
        <Download size={20} />
        Exporter l'Étude
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
                  Exporter l'Étude
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
            <div className="p-6">
              {/* Sélecteur de version */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setPdfVersion("client")}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    pdfVersion === "client"
                      ? "bg-blue-600 text-white border-2 border-blue-500"
                      : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Eye size={20} />
                  <div className="text-left">
                    <div className="font-bold">Version Client</div>
                    <div className="text-xs">À montrer uniquement</div>
                  </div>
                </button>

                <button
                  onClick={() => setPdfVersion("full")}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    pdfVersion === "full"
                      ? "bg-emerald-600 text-white border-2 border-emerald-500"
                      : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Lock size={20} />
                  <div className="text-left">
                    <div className="font-bold">Version Complète</div>
                    <div className="text-xs">Pour ton dossier</div>
                  </div>
                </button>
              </div>

              {/* Description */}
              <div
                className={`rounded-xl p-4 mb-6 ${
                  pdfVersion === "client"
                    ? "bg-blue-950/20 border border-blue-500/30"
                    : "bg-emerald-950/20 border border-emerald-500/30"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {pdfVersion === "client" ? (
                    <>
                      <Eye className="text-blue-500 w-5 h-5" />
                      <h3 className="font-bold text-white">
                        VERSION CLIENT (À montrer)
                      </h3>
                    </>
                  ) : (
                    <>
                      <Lock className="text-emerald-500 w-5 h-5" />
                      <h3 className="font-bold text-white">
                        VERSION COMPLÈTE (Pour toi)
                      </h3>
                    </>
                  )}
                </div>

                {pdfVersion === "client" ? (
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Chiffres arrondis et indicatifs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Watermark de protection
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Pas de tableaux détaillés
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Appel à l'action pour signer
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Tous les calculs détaillés
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Tableaux d'amortissement complets
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Chiffres exacts pour signature
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      À conserver dans ton dossier client
                    </li>
                  </ul>
                )}
              </div>

              {/* Recommandation */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6 text-sm text-slate-400">
                {pdfVersion === "client" ? (
                  <>
                    💡 <strong className="text-white">Recommandation :</strong>{" "}
                    Montre cette version à l'écran au client. Tu peux l'imprimer
                    si nécessaire, mais les chiffres exacts restent avec toi
                    pour la signature.
                  </>
                ) : (
                  <>
                    🔒 <strong className="text-white">Attention :</strong> Cette
                    version contient toutes les données. Ne la montre pas au
                    client et ne la partage pas. Conserve-la dans ton dossier.
                  </>
                )}
              </div>

              {/* Bouton de génération */}
              <button
                onClick={
                  pdfVersion === "client" ? generateClientPDF : generateFullPDF
                }
                disabled={isGenerating}
                className={`w-full ${
                  pdfVersion === "client"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                } text-white font-black py-4 px-8 rounded-xl uppercase tracking-wider text-sm flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Génération en cours...
                  </>
                ) : pdfVersion === "client" ? (
                  <>
                    <Eye size={20} />
                    Générer la Prévisualisation Client
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Télécharger la Version Complète
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
