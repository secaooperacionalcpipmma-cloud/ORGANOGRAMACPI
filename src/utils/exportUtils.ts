import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OrganogramDatabase } from '../types/organogram';

/**
 * Exports a specific DOM element as a high-resolution PNG image
 */
export async function exportElementAsPng(elementId: string, filename = 'organograma_institucional_2026.png'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemento do organograma não encontrado para captura.');
  }

  const canvas = await html2canvas(element, {
    scale: 2, // High resolution
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an official Institutional PDF Report of the Organogram
 */
export function exportOrganogramReportPdf(db: OrganogramDatabase, filename = 'relatorio_organograma_2026.pdf'): void {
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
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('POLÍCIA MILITAR DO MARANHÃO - COMANDO DO POLICIAMENTO DO INTERIOR', pageWidth / 2, 9, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ORGANOGRAMA INSTITUCIONAL DE GRANDES COMANDOS E UNIDADES SUBORDINADAS – 2026', pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(8);
  doc.text(`Atualização: ${db.lastUpdated} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 21, { align: 'center' });

  // Body
  let y = 32;
  doc.setTextColor(20, 20, 20);

  // Summary box
  doc.setFillColor(245, 248, 245);
  doc.setDrawColor(0, 90, 43);
  doc.setLineWidth(0.5);
  doc.rect(10, y, pageWidth - 20, 16, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('QUADRO DE DISTRIBUIÇÃO OPERACIONAL:', 14, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Grandes Comandos (CPAI): ${db.commands.length} | Total de Unidades Operacionais (BPM/CIPM): ${db.units.length} | Sede: ${db.topCommand.sede}`, 14, y + 11);

  y += 22;

  // Render Commands and their units in structured columns/tables
  db.commands.forEach((cmd, idx) => {
    const cmdUnits = db.units.filter(u => u.grandCommandId === cmd.id);

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
    doc.text(`Cmdte: ${cmd.comandante} | Contato: ${cmd.telefone}`, pageWidth - 14, y + 5, { align: 'right' });

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
    doc.text(`Polícia Militar do Maranhão - CPI - Documento Oficial 2026 - Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  doc.save(filename);
}

/**
 * Triggers native browser print formatted with institutional styles
 */
export function printOrganogram(): void {
  window.print();
}
