import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OrganogramDatabase } from '../types/organogram';

/**
 * URL for the original official PDF uploaded by the user
 */
export const OFFICIAL_ORIGINAL_PDF_URL =
  '/assets/aistudio/NOVO_ORGANOGRAMA_V1_CPI_2026_-_NOVA_ORGANIZA__O_DO_CPI_-_ORGANOGRAMA_ATUALIZADO_17876c8b.pdf';

// ============================================================================
// VERSÃO 1: MODELO GRÁFICO OFICIAL (IDÊNTICO AO PDF ANEXO)
// ============================================================================

/**
 * Exports the visual 9-columns organogram sheet as a high-definition landscape PDF
 * perfectly fitted onto a single landscape page (A3 landscape for maximum sharpness).
 */
export async function exportVisualOrganogramPdf(
  elementId = 'official-pdf-model-sheet',
  filename = 'ORGANOGRAMA_CPI_2026_MODELO_OFICIAL.pdf'
): Promise<void> {
  let element = document.getElementById(elementId);
  if (!element) {
    element = document.getElementById('organogram-canvas-container');
  }
  if (!element) {
    throw new Error('Elemento da prancha gráfica oficial não encontrado para exportação.');
  }

  // Render element at high resolution
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 1600,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // A3 Landscape (420mm x 297mm) guarantees high legibility for 9 columns
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Compute dimensions preserving aspect ratio
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const margin = 8; // 8mm margins
  const usableWidth = pdfWidth - margin * 2;
  const usableHeight = pdfHeight - margin * 2;

  const ratio = Math.min(usableWidth / imgWidth, usableHeight / imgHeight);
  const finalWidth = imgWidth * ratio;
  const finalHeight = imgHeight * ratio;
  const posX = (pdfWidth - finalWidth) / 2;
  const posY = (pdfHeight - finalHeight) / 2;

  pdf.addImage(imgData, 'JPEG', posX, posY, finalWidth, finalHeight, undefined, 'FAST');
  pdf.save(filename);
}

/**
 * Exports the visual 9-columns organogram sheet as a high-resolution PNG image
 */
export async function exportVisualOrganogramPng(
  elementId = 'official-pdf-model-sheet',
  filename = 'ORGANOGRAMA_CPI_2026_MODELO_OFICIAL.png'
): Promise<void> {
  let element = document.getElementById(elementId);
  if (!element) {
    element = document.getElementById('organogram-canvas-container');
  }
  if (!element) {
    throw new Error('Elemento da prancha gráfica oficial não encontrado para exportação.');
  }

  const canvas = await html2canvas(element, {
    scale: 2.5, // 2.5x gives ultra-crisp ~3950px wide image
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 1600,
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// VERSÃO 2: RELATÓRIO CADASTRAL E OPERACIONAL (VERSÃO EXISTENTE NO SISTEMA)
// ============================================================================

/**
 * Generates the existing official Institutional Cadastral PDF Report
 * Multi-page structured report with all unit lists, commands, commanders and contacts
 */
export function exportCadastralReportPdf(
  db: OrganogramDatabase,
  filename = 'RELATORIO_CADASTRAL_CPI_PMMA_2026.pdf'
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Background Institutional Green
  doc.setFillColor(0, 90, 43); // PMMA Forest Green #005a2b
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'POLÍCIA MILITAR DO MARANHÃO - COMANDO DO POLICIAMENTO DO INTERIOR (CPI)',
    pageWidth / 2,
    9,
    { align: 'center' }
  );

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'RELATÓRIO OPERACIONAL E CADASTRAL DE GRANDES COMANDOS E UNIDADES SUBORDINADAS – 2026',
    pageWidth / 2,
    15.5,
    { align: 'center' }
  );

  doc.setFontSize(8);
  doc.text(
    `Atualização: ${db.lastUpdated || db.topCommand.dataAtualizacao || '11/11/2026'} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
    pageWidth / 2,
    21,
    { align: 'center' }
  );

  // Body
  let y = 30;
  doc.setTextColor(20, 20, 20);

  // Summary box
  doc.setFillColor(245, 248, 245);
  doc.setDrawColor(0, 90, 43);
  doc.setLineWidth(0.5);
  doc.rect(10, y, pageWidth - 20, 16, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('QUADRO DE DISTRIBUIÇÃO OPERACIONAL DO CPI:', 14, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Grandes Comandos (CPAI): ${db.commands.length} | Total de Unidades Operacionais (BPM/CIPM): ${db.units.length} | Comandante Geral: ${db.topCommand.comandanteGeral}`,
    14,
    y + 11.5
  );

  y += 22;

  // Render Commands and their units in structured columns/tables
  db.commands.forEach((cmd) => {
    const cmdUnits = db.units.filter((u) => u.grandCommandId === cmd.id);

    // Check if new page needed
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 15;
    }

    // Command Header Bar
    doc.setFillColor(0, 90, 43);
    doc.rect(10, y, pageWidth - 20, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cmd.sigla} - ${cmd.nome.toUpperCase()} (Sede: ${cmd.municipioSede})`, 13, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Cmdte: ${cmd.comandante} | Contato: ${cmd.telefone}`, pageWidth - 14, y + 5, {
      align: 'right',
    });

    y += 8;

    // Unit table header
    doc.setFillColor(235, 240, 235);
    doc.setDrawColor(180, 180, 180);
    doc.rect(10, y, pageWidth - 20, 5, 'FD');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIDADE', 14, y + 3.5);
    doc.text('TIPO', 42, y + 3.5);
    doc.text('MUNICÍPIO SEDE', 72, y + 3.5);
    doc.text('COMANDANTE / GRADUAÇÃO', 115, y + 3.5);
    doc.text('TELEFONE', 180, y + 3.5);
    doc.text('E-MAIL INSTITUCIONAL', 225, y + 3.5);

    y += 5.5;

    // Units rows
    cmdUnits.forEach((u, uIdx) => {
      if (y > pageHeight - 15) {
        doc.addPage();
        y = 15;
      }

      if (uIdx % 2 === 1) {
        doc.setFillColor(250, 252, 250);
        doc.rect(10, y - 0.5, pageWidth - 20, 5, 'F');
      }

      doc.setTextColor(20, 20, 20);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(u.identificacao, 14, y + 3);

      doc.setFont('helvetica', 'normal');
      doc.text(u.tipo, 42, y + 3);
      doc.text(u.municipio, 72, y + 3);
      doc.text(u.comandante, 115, y + 3);
      doc.text(u.telefone, 180, y + 3);
      doc.text(u.email || '-', 225, y + 3);

      y += 5;
    });

    y += 4;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text(
      `Polícia Militar do Maranhão - CPI - Documento Oficial 2026 - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  doc.save(filename);
}

/**
 * Captures an element (like the printable report) as PNG image
 */
export async function exportCadastralReportPng(
  elementId = 'report-printable-area',
  filename = 'RELATORIO_CADASTRAL_CPI_PMMA_2026.png'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemento do relatório cadastral não encontrado para captura.');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// ALIASES PARA COMPATIBILIDADE ANTERIOR
// ============================================================================

export const exportOrganogramReportPdf = exportCadastralReportPdf;
export const exportElementAsPng = exportVisualOrganogramPng;

/**
 * Triggers native browser print formatted with institutional styles
 */
export function printOrganogram(): void {
  window.print();
}
