import React, { useState } from 'react';
import { FileText, Loader2, X, User } from 'lucide-react';

interface PDFExportProps {
  data: any;
  calculationResult: any;
  projectionYears: number;
}

export const PDFExport: React.FC<PDFExportProps> = ({
  data,
  calculationResult,
  projectionYears
}) => {
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const generatePDF = async () => {
    if (!clientName.trim()) {
      alert('Veuillez entrer le nom du client');
      return;
    }

    setGenerating(true);
    setShowModal(false);
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Veuillez autoriser les pop-ups pour générer le PDF');
        return;
      }

      const today = new Date().toLocaleDateString('fr-FR');
      // Helper function for currency formatting
      const formatMoney = (val: number) => new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);

      const formattedCost = formatMoney(Number(data.params?.installCost || 0));
      const totalGain = calculationResult.totalSavingsProjected || 0;
      const formattedGain = formatMoney(totalGain);

      let roiYears = calculationResult.breakEvenPoint || 0;

      function generateTablePages(result: any, years: number, date: string) {
        const rowsPerPage = 18;
        const totalPages = Math.ceil(years / rowsPerPage);
        let html = '';

        for (let page = 0; page < totalPages; page++) {
          const startYear = page * rowsPerPage;
          const endYear = Math.min(startYear + rowsPerPage, years);
          const pageNumber = page + 3;
          const totalPagesCount = Math.ceil(years / 18) + 3;

          html += `
    <div class="page">
        <div class="header">
            <div class="header-logo">☀️</div>
            <div class="header-text">
                <h2>PLAN DE FINANCEMENT DÉTAILLÉ</h2>
                <p>Années ${startYear + 1} à ${endYear} • ${date}</p>
            </div>
        </div>
        <div class="content">
            <table>
                <thead>
                    <tr>
                        <th>AN</th>
                        <th>SANS SOLAIRE</th>
                        <th>CRÉDIT</th>
                        <th>RESTE FACTURE</th>
                        <th>TOTAL AVEC SOLAIRE</th>
                        <th>CUMUL ÉCONOMIES</th>
                    </tr>
                </thead>
                <tbody>
          `;

          for (let i = startYear; i < endYear; i++) {
            const detail = result.details[i];
            if (!detail) continue;

            const formatter = (val: number) => new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0
            }).format(val);

            const cashflowColor = detail.cumulativeSavings < 0 ? '#dc2626' : '#16a34a';
            const creditCost = (detail.creditPayment || 0);

            html += `
                    <tr>
                        <td><strong>${detail.year}</strong></td>
                        <td>${formatter(detail.edfBillWithoutSolar)}</td>
                        <td>${formatter(creditCost)}</td>
                        <td>${formatter(detail.edfResidue)}</td>
                        <td><strong>${formatter(detail.totalWithSolar)}</strong></td>
                        <td style="color: ${cashflowColor}; font-weight: bold;">${formatter(detail.cumulativeSavings)}</td>
                    </tr>
            `;
          }

          html += `
                </tbody>
            </table>
            <div class="table-note">
                📌 <strong>Note importante :</strong> Les valeurs incluent une inflation de ${data.params?.inflationRate || 5}% sur le prix de l'électricité. 
                Le crédit se termine à l'année ${Math.ceil(Number(data.params?.creditDurationMonths || 180)/12)}.
                Cette étude est non contractuelle et soumise aux fluctuations de consommation, production et d'inflation.
            </div>
        </div>
        <div class="footer">
            <div class="footer-left">
                <strong>EDF SOLUTIONS SOLAIRES</strong>
                Nicolas DI STEFANO - Expert Solaire EDF
            </div>
            <div class="footer-center">
                📧 ndi-stefano@edf-solutions-solaires.com | 📞 06 83 62 33 29
            </div>
            <div class="footer-right">
                Page ${pageNumber}/${totalPagesCount}
            </div>
        </div>
    </div>
          `;
        }

        return html;
      }

      const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Étude Financière - ${clientName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4; margin: 0; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: white;
            color: #1e293b;
        }
        .page {
            width: 210mm;
            height: 297mm;
            position: relative;
            page-break-after: always;
            overflow: hidden;
        }
        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: #f8fafc;
            border-top: 2px solid #e2e8f0;
            padding: 8px 20px;
            font-size: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .footer-left { color: #475569; }
        .footer-left strong { color: #1e293b; display: block; margin-bottom: 2px; }
        .footer-center { color: #3b82f6; font-weight: bold; }
        .footer-right { color: #94a3b8; }
        .cover {
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
            position: relative;
            padding: 30px;
        }
        .cover-accent {
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #f97316 0%, #fb923c 100%);
        }
        .cover-content {
            text-align: center;
            padding: 40px 30px;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #f97316, #fb923c);
            border-radius: 50%;
            margin: 0 auto 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            box-shadow: 0 8px 30px rgba(249,115,22,0.4);
        }
        .main-title {
            color: white;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 8px;
        }
        .subtitle {
            color: #94a3b8;
            font-size: 16px;
            margin-bottom: 40px;
            letter-spacing: 1px;
        }
        .client-box {
            background: rgba(30,41,59,0.8);
            border: 2px solid rgba(59,130,246,0.3);
            border-radius: 12px;
            padding: 20px;
            margin: 0 auto 30px;
            max-width: 450px;
        }
        .client-box h3 {
            color: #3b82f6;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 12px;
        }
        .client-name {
            color: white;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .client-contact {
            color: #94a3b8;
            font-size: 11px;
            line-height: 1.8;
        }
        .summary-box {
            background: rgba(37,99,235,0.1);
            border: 2px solid rgba(59,130,246,0.3);
            border-radius: 12px;
            padding: 20px;
            max-width: 450px;
            margin: 0 auto;
        }
        .summary-box h3 {
            color: white;
            font-size: 14px;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .summary-item {
            text-align: left;
        }
        .summary-label {
            font-size: 9px;
            color: #94a3b8;
            margin-bottom: 4px;
        }
        .summary-value {
            font-size: 14px;
            color: white;
            font-weight: bold;
        }
        .summary-value.highlight {
            color: #10b981;
            font-size: 16px;
        }
        .disclaimer {
            position: absolute;
            bottom: 70px;
            left: 30px;
            right: 30px;
            background: rgba(251,191,36,0.15);
            border: 1px solid rgba(251,191,36,0.3);
            border-radius: 8px;
            padding: 12px;
            font-size: 8px;
            color: #fbbf24;
            text-align: center;
            line-height: 1.5;
        }
        .header {
            background: #0f172a;
            padding: 15px 20px;
            border-bottom: 3px solid #f97316;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .header-logo {
            width: 35px;
            height: 35px;
            background: linear-gradient(135deg, #f97316, #fb923c);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        .header-text h2 {
            color: white;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .header-text p {
            color: #94a3b8;
            font-size: 9px;
        }
        .content {
            padding: 20px;
            height: calc(297mm - 120px);
            overflow: hidden;
        }
        .comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .scenario-card {
            border: 2px solid;
            border-radius: 12px;
            padding: 15px;
        }
        .scenario-card.financing {
            border-color: #3b82f6;
            background: rgba(59,130,246,0.05);
        }
        .scenario-card.cash {
            border-color: #10b981;
            background: rgba(16,185,129,0.05);
        }
        .badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 8px;
            font-weight: bold;
            color: white;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .badge.blue { background: #3b82f6; }
        .badge.green { background: #10b981; }
        .scenario-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
        }
        .financing .scenario-title { color: #3b82f6; }
        .cash .scenario-title { color: #10b981; }
        .scenario-data {
            font-size: 9px;
            line-height: 2;
            color: #475569;
        }
        .scenario-data .value {
            float: right;
            font-weight: bold;
            color: #1e293b;
        }
        .scenario-data .highlight {
            color: #10b981;
            font-weight: bold;
        }
        .recommendation {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 15px;
        }
        .recommendation h3 {
            color: #92400e;
            font-size: 12px;
            margin-bottom: 8px;
            font-weight: bold;
        }
        .recommendation p {
            color: #78350f;
            font-size: 9px;
            line-height: 1.6;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            margin-top: 15px;
        }
        thead {
            background: #1e293b;
            color: white;
        }
        th {
            padding: 8px 6px;
            text-align: left;
            font-weight: bold;
            font-size: 7px;
            text-transform: uppercase;
        }
        td {
            padding: 6px;
            border-bottom: 1px solid #e2e8f0;
        }
        tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        .table-note {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 10px;
            margin-top: 12px;
            font-size: 8px;
            color: #78350f;
            line-height: 1.4;
        }
        .warranty-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
        }
        .warranty-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 15px;
        }
        .warranty-icon {
            font-size: 28px;
            margin-bottom: 8px;
        }
        .warranty-title {
            color: #3b82f6;
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .warranty-subtitle {
            color: #10b981;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 6px;
        }
        .warranty-desc {
            color: #64748b;
            font-size: 8px;
            line-height: 1.4;
        }
        .cta {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            color: white;
        }
        .cta h2 {
            font-size: 20px;
            margin-bottom: 8px;
        }
        .cta p {
            font-size: 11px;
            margin-bottom: 6px;
        }
        .cta .contact {
            font-size: 12px;
            font-weight: bold;
            margin-top: 8px;
        }
        @media print {
            .page { page-break-after: always; }
        }
    </style>
</head>
<body>
    <div class="page cover">
        <div class="cover-accent"></div>
        <div class="cover-content">
            <div class="logo">☀️</div>
            <h1 class="main-title">EDF SOLUTIONS SOLAIRES</h1>
            <p class="subtitle">ÉTUDE FINANCIÈRE PERSONNALISÉE</p>
            <div class="client-box">
                <h3>CLIENT</h3>
                <div class="client-name">${clientName}</div>
                <div class="client-contact">
                    ${clientPhone ? `📞 ${clientPhone}<br>` : ''}
                    ${clientEmail ? `📧 ${clientEmail}` : ''}
                </div>
            </div>
            <div class="summary-box">
                <h3>SYNTHÈSE DE VOTRE PROJET</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Installation</div>
                        <div class="summary-value">${formattedCost}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Gain total (${projectionYears} ans)</div>
                        <div class="summary-value highlight">${formattedGain}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Production annuelle</div>
                        <div class="summary-value">${Number(data.params?.yearlyProduction || 0).toLocaleString('fr-FR')} kWh</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Retour investissement</div>
                        <div class="summary-value">${roiYears} ans</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="disclaimer">
            ⚠️ <strong>ÉTUDE NON CONTRACTUELLE</strong> - Cette projection est soumise aux fluctuations de consommation, production et d'inflation. 
            Garantie de performance sur 30 ans selon les conditions du contrat.
        </div>
        <div class="footer">
            <div class="footer-left">
                <strong>EDF SOLUTIONS SOLAIRES</strong>
                Nicolas DI STEFANO - Expert Solaire EDF
            </div>
            <div class="footer-center">
                📧 ndi-stefano@edf-solutions-solaires.com | 📞 06 83 62 33 29
            </div>
            <div class="footer-right">
                Page 1/${Math.ceil(projectionYears / 18) + 3}
            </div>
        </div>
    </div>
    
    <div class="page">
        <div class="header">
            <div class="header-logo">☀️</div>
            <div class="header-text">
                <h2>COMPARAISON DES SCÉNARIOS</h2>
                <p>Analyse financière • ${today}</p>
            </div>
        </div>
        <div class="content">
            <div class="comparison">
                <div class="scenario-card financing">
                    <span class="badge blue">CRÉDIT</span>
                    <div class="scenario-title">💳 Avec Financement</div>
                    <div class="scenario-data">
                        Apport initial <span class="value">${formatMoney(Number(data.params?.cashApport || 0))}</span><br>
                        Mensualité crédit <span class="value">${formatMoney(Number(data.params?.creditMonthlyPayment || 0))}</span><br>
                        Durée financement <span class="value">${Number(data.params?.creditDurationMonths || 180)/12} ans</span><br>
                        <br>
                        Gain total <span class="value highlight">${formattedGain}</span><br>
                        ROI <span class="value">${roiYears} ans</span>
                    </div>
                </div>
                <div class="scenario-card cash">
                    <span class="badge green">CASH</span>
                    <div class="scenario-title">💰 Paiement Comptant</div>
                    <div class="scenario-data">
                        Investissement <span class="value">${formattedCost}</span><br>
                        Mensualité <span class="value">0 €</span><br>
                        Rentable dès <span class="value">Année ${calculationResult.breakEvenPointCash || 1}</span><br>
                        <br>
                        Gain total <span class="value highlight">${formatMoney(calculationResult.totalSavingsProjectedCash || 0)}</span><br>
                        ROI <span class="value">${calculationResult.roiPercentageCash || 0}%</span>
                    </div>
                </div>
            </div>
            <div class="recommendation">
                <h3>💡 NOTRE RECOMMANDATION</h3>
                <p>
                    Le financement permet de préserver votre trésorerie tout en bénéficiant 
                    immédiatement des économies d'énergie. C'est la solution la plus flexible pour démarrer sans 
                    impacter votre épargne.
                </p>
            </div>
        </div>
        <div class="footer">
            <div class="footer-left">
                <strong>EDF SOLUTIONS SOLAIRES</strong>
                Nicolas DI STEFANO - Expert Solaire EDF
            </div>
            <div class="footer-center">
                📧 ndi-stefano@edf-solutions-solaires.com | 📞 06 83 62 33 29
            </div>
            <div class="footer-right">
                Page 2/${Math.ceil(projectionYears / 18) + 3}
            </div>
        </div>
    </div>
    
    ${generateTablePages(calculationResult, projectionYears, today)}
    
    <div class="page">
        <div class="header">
            <div class="header-logo">☀️</div>
            <div class="header-text">
                <h2>GARANTIES & ENGAGEMENT</h2>
                <p>Protection complète • ${today}</p>
            </div>
        </div>
        <div class="content">
            <div class="warranty-grid">
                <div class="warranty-card">
                    <div class="warranty-icon">☀️</div>
                    <div class="warranty-title">PANNEAUX SOLAIRES</div>
                    <div class="warranty-subtitle">30 ANS</div>
                    <div class="warranty-desc">
                        Garantie totale de productibilité. Pièces, main d'œuvre et déplacement inclus.
                    </div>
                </div>
                <div class="warranty-card">
                    <div class="warranty-icon">⚡</div>
                    <div class="warranty-title">ONDULEURS</div>
                    <div class="warranty-subtitle">30 ANS</div>
                    <div class="warranty-desc">
                        Remplacement à neuf garanti. Main d'œuvre et déplacement inclus.
                    </div>
                </div>
                <div class="warranty-card">
                    <div class="warranty-icon">🔧</div>
                    <div class="warranty-title">STRUCTURE</div>
                    <div class="warranty-subtitle">30 ANS</div>
                    <div class="warranty-desc">
                        Garantie système de fixation et étanchéité de votre toiture.
                    </div>
                </div>
                <div class="warranty-card">
                    <div class="warranty-icon">🛡️</div>
                    <div class="warranty-title">MATÉRIEL</div>
                    <div class="warranty-subtitle">30 ANS</div>
                    <div class="warranty-desc">
                        Protection complète contre défauts de fabrication et vices cachés.
                    </div>
                </div>
            </div>
            <div class="cta">
                <h2>PRÊT À DÉMARRER ?</h2>
                <p>Contactez votre expert solaire EDF</p>
                <p class="contact">📧 ndi-stefano@edf-solutions-solaires.com</p>
                <p class="contact">📞 06 83 62 33 29</p>
            </div>
        </div>
        <div class="footer">
            <div class="footer-left">
                <strong>EDF SOLUTIONS SOLAIRES</strong>
                Nicolas DI STEFANO - Expert Solaire EDF
            </div>
            <div class="footer-center">
                📧 ndi-stefano@edf-solutions-solaires.com | 📞 06 83 62 33 29
            </div>
            <div class="footer-right">
                Page ${Math.ceil(projectionYears / 18) + 3}/${Math.ceil(projectionYears / 18) + 3}
            </div>
        </div>
    </div>
</body>
</html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);

    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={generating}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Génération...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            <span>Exporter PDF</span>
          </>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Informations Client</h2>
                <p className="text-sm text-slate-400">Pour personnaliser le PDF</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); generatePDF(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nom du client <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="ex: Jean Dupont"
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="ex: 06 12 34 56 78"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="ex: client@email.fr"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all font-medium border border-white/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!clientName.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Générer PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
