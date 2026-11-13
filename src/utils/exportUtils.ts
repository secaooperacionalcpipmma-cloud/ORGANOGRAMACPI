import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OrganogramDatabase } from '../types/organogram';

/**
 * URL for the original official PDF uploaded by the user
 */
export const OFFICIAL_ORIGINAL_PDF_URL =
  '/assets/aistudio/NOVO_ORGANOGRAMA_V1_CPI_2026_-_NOVA_ORGANIZA__O_DO_CPI_-_ORGANOGRAMA_ATUALIZADO_17876c8b.pdf';

// ============================================================================
// OKLCH & MODERN COLOR SANITIZER FOR HTML2CANVAS
// ============================================================================

let dummyCanvas: HTMLCanvasElement | null = null;
let dummyCtx: CanvasRenderingContext2D | null = null;

function ensureDummyCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!dummyCanvas) {
    dummyCanvas = document.createElement('canvas');
    dummyCanvas.width = 1;
    dummyCanvas.height = 1;
    dummyCtx = dummyCanvas.getContext('2d');
  }
  return dummyCtx;
}

function resolveColorFunction(expr: string): string {
  try {
    const ctx = ensureDummyCtx();
    if (ctx) {
      ctx.fillStyle = '#010203';
      ctx.fillStyle = expr;
      const result = ctx.fillStyle;
      if (
        result &&
        typeof result === 'string' &&
        !result.includes('oklch') &&
        !result.includes('oklab') &&
        !result.includes('color(') &&
        !result.includes('color-mix(')
      ) {
        return result;
      }
    }
  } catch {
    // ignore conversion errors and fall back below
  }

  if (expr.includes('0.696') || expr.includes('emerald') || expr.includes('green')) {
    return '#005a2b';
  }
  if (expr.includes('0.9') || expr.includes('1 0 0')) {
    return '#ffffff';
  }
  return '#0f172a';
}

/**
 * Replaces modern CSS color functions (oklch, oklab, lab, lch, color, color-mix)
 * including nested parentheses with standard rgb/hex colors.
 */
export function convertOklchToRgb(str: string): string {
  if (!str || typeof str !== 'string') return str;
  if (
    !str.includes('oklch(') &&
    !str.includes('oklab(') &&
    !str.includes('lab(') &&
    !str.includes('lch(') &&
    !str.includes('color(') &&
    !str.includes('color-mix(')
  ) {
    return str;
  }

  // Iteratively resolve balanced function calls from innermost to outermost
  let current = str;
  const pattern = /(oklch|oklab|color-mix|color|lch|lab)\(([^()]*)\)/gi;
  let guard = 0;
  while (pattern.test(current) && guard < 6) {
    current = current.replace(pattern, (match) => resolveColorFunction(match));
    guard++;
  }

  // Final safety sweep if anything malformed remains
  if (current.includes('oklch(') || current.includes('oklab(') || current.includes('color(')) {
    current = current.replace(/(oklch|oklab|color-mix|color|lch|lab)\([^)]*\)/gi, '#0f172a');
  }

  return current;
}

/**
 * Safely wraps a CSSStyleDeclaration without ever triggering Chrome/V8
 * "TypeError: Illegal invocation" on native getters or methods.
 */
function wrapStyleDeclaration(style: CSSStyleDeclaration): CSSStyleDeclaration {
  return new Proxy(style, {
    get(target, prop) {
      if (prop === 'getPropertyValue') {
        return (propertyName: string) => {
          const res = target.getPropertyValue(propertyName);
          return typeof res === 'string' ? convertOklchToRgb(res) : res;
        };
      }

      // CRITICAL: Pass `target` (NOT the Proxy receiver!) to Reflect.get
      // Passing Proxy as receiver causes `Illegal invocation` on CSSStyleDeclaration getters.
      const val = Reflect.get(target, prop, target);

      if (typeof val === 'function') {
        return val.bind(target);
      }
      if (typeof val === 'string') {
        return convertOklchToRgb(val);
      }
      return val;
    },
    set(target, prop, value) {
      return Reflect.set(target, prop, value, target);
    }
  });
}

/**
 * Waits until all images inside a container have loaded or errored.
 */
async function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
        setTimeout(done, 2500);
      });
    })
  );
}

/**
 * Safe wrapper around html2canvas that intercepts getComputedStyle without Illegal invocation
 * and cleans modern CSS colors/stylesheets before capture.
 */
export async function safeHtml2Canvas(
  element: HTMLElement,
  options: any = {}
): Promise<HTMLCanvasElement> {
  await waitForImages(element);

  const originalGetComputedStyle =
    typeof window !== 'undefined' ? window.getComputedStyle : null;

  if (originalGetComputedStyle && typeof window !== 'undefined') {
    window.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
      const style = originalGetComputedStyle.call(window, elt, pseudoElt);
      return wrapStyleDeclaration(style);
    };
  }

  try {
    const userOnClone = options.onclone;
    const isSelfContainedSheet =
      element.id === 'official-pdf-model-sheet' || element.id === 'cadastral-report-sheet';

    const mergedOptions = {
      ...options,
      onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
        if (isSelfContainedSheet) {
          // For 100% inline-styled export sheets, strip external Tailwind v4 stylesheets
          // so html2canvas never encounters any oklch() custom properties or CSS rules.
          clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
            node.parentNode?.removeChild(node);
          });
          const cleanStyle = clonedDoc.createElement('style');
          cleanStyle.textContent = `
            *, *::before, *::after { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; background-color: #ffffff; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; }
            img { display: block; max-width: 100%; }
            table { border-collapse: collapse; }
          `;
          clonedDoc.head.appendChild(cleanStyle);
        } else {
          // Sanitize <style> tags in cloned document
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach((styleTag) => {
            if (styleTag.textContent) {
              styleTag.textContent = convertOklchToRgb(styleTag.textContent);
            }
          });
        }

        // Safely wrap cloned iframe's getComputedStyle as well
        const iframeWin = clonedDoc.defaultView;
        if (iframeWin && iframeWin.getComputedStyle) {
          const origIframeGetComputedStyle = iframeWin.getComputedStyle.bind(iframeWin);
          iframeWin.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
            const style = origIframeGetComputedStyle(elt, pseudoElt);
            return wrapStyleDeclaration(style);
          };
        }

        // Ensure cloned element & ancestors are fully visible at (0, 0)
        if (clonedEl) {
          let p: HTMLElement | null = clonedEl.parentElement;
          while (p && p !== clonedDoc.body) {
            p.style.position = 'static';
            p.style.left = '0';
            p.style.top = '0';
            p.style.width = 'auto';
            p.style.height = 'auto';
            p.style.overflow = 'visible';
            p.style.opacity = '1';
            p.style.visibility = 'visible';
            p.style.display = 'block';
            p = p.parentElement;
          }
          clonedEl.style.opacity = '1';
          clonedEl.style.visibility = 'visible';
          clonedEl.style.display = 'block';
        }

        if (userOnClone) {
          userOnClone(clonedDoc, clonedEl);
        }
      }
    };

    return await html2canvas(element, mergedOptions);
  } finally {
    if (originalGetComputedStyle && typeof window !== 'undefined') {
      window.getComputedStyle = originalGetComputedStyle;
    }
  }
}

// ============================================================================
// FORMATO I: ORGANOGRAMA GRÁFICO OFICIAL (9 COLUNAS - DADOS DO SISTEMA)
// ============================================================================

/**
 * Exports the visual 9-columns organogram sheet (FORMATO I) as a high-definition landscape PDF
 * generated dynamically from current system database data, matching the Organograma Completo view.
 */
export async function exportVisualOrganogramPdf(
  elementId = 'official-pdf-model-sheet',
  filename = 'ORGANOGRAMA_CPI_2026_FORMATO_I_OFICIAL.pdf'
): Promise<void> {
  const wrapper = document.getElementById('export-sheet-wrapper');
  if (wrapper) {
    wrapper.style.display = 'block';
    wrapper.style.left = '-10000px';
    wrapper.style.opacity = '1';
  }

  try {
    let element = document.getElementById(elementId);
    if (!element) {
      element = document.getElementById('organogram-canvas-container');
    }
    if (!element) {
      throw new Error('Elemento da prancha gráfica oficial não encontrado para exportação.');
    }

    const scale = typeof window !== 'undefined' && window.innerWidth < 768 ? 1.5 : 2.0;

    const canvas = await safeHtml2Canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1620
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // A3 Landscape (420mm x 297mm) guarantees high legibility for 9 columns
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

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
  } finally {
    if (wrapper) {
      wrapper.style.display = 'none';
      wrapper.style.left = '0';
      wrapper.style.opacity = '0';
    }
  }
}

/**
 * Exports the visual 9-columns organogram sheet (FORMATO I) as a high-resolution PNG image
 * generated dynamically from current system database data.
 */
export async function exportVisualOrganogramPng(
  elementId = 'official-pdf-model-sheet',
  filename = 'ORGANOGRAMA_CPI_2026_FORMATO_I_OFICIAL.png'
): Promise<void> {
  const wrapper = document.getElementById('export-sheet-wrapper');
  if (wrapper) {
    wrapper.style.display = 'block';
    wrapper.style.left = '-10000px';
    wrapper.style.opacity = '1';
  }

  try {
    let element = document.getElementById(elementId);
    if (!element) {
      element = document.getElementById('organogram-canvas-container');
    }
    if (!element) {
      throw new Error('Elemento da prancha gráfica oficial não encontrado para exportação.');
    }

    const scale = typeof window !== 'undefined' && window.innerWidth < 768 ? 1.5 : 2.0;

    const canvas = await safeHtml2Canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1620
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    if (wrapper) {
      wrapper.style.display = 'none';
      wrapper.style.left = '0';
      wrapper.style.opacity = '0';
    }
  }
}

// ============================================================================
// FORMATO II: RELATÓRIO CADASTRAL E OPERACIONAL (TABULAR - PRINT 02)
// ============================================================================

/**
 * Generates the official Institutional Cadastral PDF Report (FORMATO II)
 * Multi-page structured report with all unit lists, commands, commanders and contacts
 */
export function exportCadastralReportPdf(
  db: OrganogramDatabase,
  filename = 'RELATORIO_CADASTRAL_CPI_PMMA_FORMATO_II_2026.pdf'
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
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
      align: 'right'
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
 * Captures the Cadastral Report (FORMATO II) as PNG image from any tab
 */
export async function exportCadastralReportPng(
  elementId = 'cadastral-report-sheet',
  filename = 'RELATORIO_CADASTRAL_CPI_PMMA_FORMATO_II_2026.png'
): Promise<void> {
  const cadastralWrapper = document.getElementById('export-cadastral-wrapper');
  let targetElement = document.getElementById(elementId);

  // If caller passed 'report-printable-area' while not on the Reports tab, fallback to offscreen sheet
  if (!targetElement) {
    targetElement =
      document.getElementById('cadastral-report-sheet') ||
      document.getElementById('report-printable-area');
  }

  if (!targetElement) {
    throw new Error('Elemento do relatório cadastral não encontrado para captura.');
  }

  const usingOffscreen = targetElement.id === 'cadastral-report-sheet' && cadastralWrapper;
  if (usingOffscreen && cadastralWrapper) {
    cadastralWrapper.style.display = 'block';
    cadastralWrapper.style.left = '-10000px';
    cadastralWrapper.style.opacity = '1';
  }

  try {
    const scale = typeof window !== 'undefined' && window.innerWidth < 768 ? 1.5 : 2.0;
    const canvas = await safeHtml2Canvas(targetElement, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    if (usingOffscreen && cadastralWrapper) {
      cadastralWrapper.style.display = 'none';
      cadastralWrapper.style.left = '0';
      cadastralWrapper.style.opacity = '0';
    }
  }
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
