import { GrandCommand, SubordinateUnit } from '../types/organogram';

/**
 * Strips accents, lowercases and trims text
 */
export function normalizeText(text: string = ''): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Normalizes all variations of CPAI:
 * "CPA I-9", "CPAI-9", "CPAI9", "CPA/I-9", "cou cpa/i-9", "CPA-9", "CPA 9", "CPAI 9", "CPAI09", "CPA I-IX", etc.
 * Returns canonical form, e.g. "cpai9"
 */
export function normalizeCpai(text: string = ''): string {
  const s = normalizeText(text);

  // Roman numeral map for CPAI 1-9
  const romanMap: Record<string, string> = {
    'i': '1', 'ii': '2', 'iii': '3', 'iv': '4', 'v': '5',
    'vi': '6', 'vii': '7', 'viii': '8', 'ix': '9'
  };

  // Pattern 1: Match CPA + optional I + separator + number (e.g. "CPA I-9", "CPA/I-9", "cou cpa/i-9", "cpa-9", "cpa 9", "cpai9")
  const numMatch = s.match(/(?:cpa[\s\-_/]*i?|cpai)[\s\-_/]*0*([1-9])/);
  if (numMatch) {
    return `cpai${numMatch[1]}`;
  }

  // Pattern 2: Match CPA + optional I + roman numerals (e.g. "CPA I - IX", "CPAI-IV")
  const romanMatch = s.match(/(?:cpa[\s\-_/]*i?|cpai)[\s\-_/]*(ix|iv|v?i{0,3})\b/);
  if (romanMatch && romanMap[romanMatch[1]]) {
    return `cpai${romanMap[romanMatch[1]]}`;
  }

  // Fallback: general symbol stripping
  let cleaned = s.replace(/cpa[\s\-_/]*i[\s\-_]*/g, 'cpai');
  cleaned = cleaned.replace(/cpa[\s\-_]*/g, 'cpai');
  cleaned = cleaned.replace(/[^a-z0-9]/g, '');
  cleaned = cleaned.replace(/cpai0+(\d+)/g, 'cpai$1');
  return cleaned;
}

/**
 * Normalizes military unit identifiers:
 * "15º BPM", "15 BPM", "15BPM", "15o BPM", "15-BPM", "BPM 15", "15ºBPM" -> "15bpm"
 * "7ª CIPM", "7 CIPM", "7CIPM", "CIPM 7" -> "7cipm"
 */
export function normalizeUnitId(text: string = ''): string {
  let s = normalizeText(text);
  // remove degree and ordinal indicators
  s = s.replace(/[ºª°]/g, '');
  // normalize number + unit or unit + number
  const bpmMatch = s.match(/(\d+)\s*(?:bpm|batalhao)/);
  if (bpmMatch) return `${bpmMatch[1]}bpm`;
  const revBpmMatch = s.match(/(?:bpm|batalhao)\s*(\d+)/);
  if (revBpmMatch) return `${revBpmMatch[1]}bpm`;

  const cipmMatch = s.match(/(\d+)\s*(?:cipm|cia)/);
  if (cipmMatch) return `${cipmMatch[1]}cipm`;
  const revCipmMatch = s.match(/(?:cipm|cia)\s*(\d+)/);
  if (revCipmMatch) return `${revCipmMatch[1]}cipm`;

  // strip punctuation and spaces
  return s.replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if a search query matches a GrandCommand
 */
export function matchesCommand(command: GrandCommand, query: string): boolean {
  if (!query) return true;
  const qRaw = query.trim();
  const qNorm = normalizeText(qRaw);
  const qCpai = normalizeCpai(qRaw);

  const cmdCpai = normalizeCpai(command.sigla);
  if (qCpai && (cmdCpai === qCpai || cmdCpai.includes(qCpai) || qCpai.includes(cmdCpai))) {
    return true;
  }

  // Check if query is just the number of the command (e.g. "9" when searching commands)
  if (/^[1-9]$/.test(qRaw) && cmdCpai === `cpai${qRaw}`) {
    return true;
  }

  const fields = [
    command.sigla,
    command.nome,
    command.comandante,
    command.posto,
    command.municipioSede,
    command.regiao || '',
    command.telefone,
    command.email
  ];

  // Check direct inclusion or token inclusion
  return fields.some(field => {
    const fNorm = normalizeText(field);
    return fNorm.includes(qNorm);
  });
}

/**
 * Checks if a search query matches a SubordinateUnit
 */
export function matchesUnit(unit: SubordinateUnit, parentCommand: GrandCommand | undefined, query: string): boolean {
  if (!query) return true;
  const qRaw = query.trim();
  const qNorm = normalizeText(qRaw);
  const qCpai = normalizeCpai(qRaw);
  const qUnitId = normalizeUnitId(qRaw);

  // Match parent command variant
  if (parentCommand && qCpai) {
    const cmdCpai = normalizeCpai(parentCommand.sigla);
    if (cmdCpai === qCpai) {
      return true;
    }
  }

  // Match unit identification variants (e.g. "15º BPM", "15 BPM", "15bpm")
  const unitClean = normalizeUnitId(unit.identificacao);
  if (qUnitId && (unitClean.includes(qUnitId) || qUnitId.includes(unitClean))) {
    return true;
  }

  // Search words split
  const queryTokens = qNorm.split(/\s+/).filter(t => t.length > 0);
  const searchableText = normalizeText(`
    ${unit.identificacao} 
    ${unit.nome} 
    ${unit.tipo} 
    ${unit.municipio} 
    ${unit.comandante} 
    ${unit.posto} 
    ${unit.telefone} 
    ${unit.email || ''} 
    ${unit.municipiosJurisdicao ? unit.municipiosJurisdicao.join(' ') : ''}
    ${parentCommand ? parentCommand.sigla + ' ' + parentCommand.nome : ''}
  `);

  // All tokens must be matched
  return queryTokens.every(token => searchableText.includes(token));
}
