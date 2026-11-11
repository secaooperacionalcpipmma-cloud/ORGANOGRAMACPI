import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { initialDatabase } from './src/data/seedData';
import { OrganogramDatabase, SubordinateUnit, GrandCommand, AIAnalysisReport, UnitDiffItem, HistoryRecord } from './src/types/organogram';

dotenv.config();

const app = express();
// Port 3000 is required by the environment; port 8080 is reserved for Nginx.
const PORT = (process.env.PORT && process.env.PORT !== '8080') ? Number(process.env.PORT) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Allow large payloads for high-resolution screenshots/prints
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'organogram-db.json');
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Database helper functions
function getDatabase(): OrganogramDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database file, using initial data:', error);
  }
  // Initialize with seed data
  saveDatabase(initialDatabase);
  return initialDatabase;
}

function saveDatabase(db: OrganogramDatabase) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database file:', error);
  }
}

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ======================== API ROUTES ========================

// 1. Get full organogram
app.get('/api/organogram', (_req, res) => {
  const db = getDatabase();
  res.json({ success: true, data: db });
});

// 2. Update Top Command Info
app.post('/api/organogram/top', (req, res) => {
  const db = getDatabase();
  db.topCommand = { ...db.topCommand, ...req.body };
  db.lastUpdated = new Date().toLocaleString('pt-BR');
  saveDatabase(db);
  res.json({ success: true, data: db });
});

// 3. Upsert Unit (Create or Edit)
app.post('/api/organogram/unit', (req, res) => {
  const db = getDatabase();
  const unitData: SubordinateUnit = req.body;

  if (!unitData.identificacao || !unitData.grandCommandId) {
    return res.status(400).json({ success: false, message: 'Identificação e Grande Comando são obrigatórios.' });
  }

  const existingIndex = db.units.findIndex(u => u.id === unitData.id || u.identificacao.toLowerCase() === unitData.identificacao.toLowerCase());
  
  if (existingIndex >= 0) {
    db.units[existingIndex] = { ...db.units[existingIndex], ...unitData };
  } else {
    const newUnit: SubordinateUnit = {
      ...unitData,
      id: unitData.id || `unit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      municipiosJurisdicao: unitData.municipiosJurisdicao || [unitData.municipio]
    };
    db.units.push(newUnit);
  }

  db.lastUpdated = new Date().toLocaleString('pt-BR');
  saveDatabase(db);
  res.json({ success: true, data: db.units });
});

// 4. Delete Unit
app.delete('/api/organogram/unit/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const initialCount = db.units.length;
  db.units = db.units.filter(u => u.id !== id);

  if (db.units.length === initialCount) {
    return res.status(404).json({ success: false, message: 'Unidade não encontrada.' });
  }

  db.lastUpdated = new Date().toLocaleString('pt-BR');
  saveDatabase(db);
  res.json({ success: true, data: db.units });
});

// 5. Upsert Grand Command
app.post('/api/organogram/command', (req, res) => {
  const db = getDatabase();
  const cmdData: GrandCommand = req.body;

  if (!cmdData.sigla || !cmdData.nome) {
    return res.status(400).json({ success: false, message: 'Sigla e Nome são obrigatórios.' });
  }

  const idx = db.commands.findIndex(c => c.id === cmdData.id || c.sigla.toLowerCase() === cmdData.sigla.toLowerCase());
  if (idx >= 0) {
    db.commands[idx] = { ...db.commands[idx], ...cmdData };
  } else {
    const newCmd: GrandCommand = {
      ...cmdData,
      id: cmdData.id || `cpa-${Date.now()}`,
      ordem: cmdData.ordem || db.commands.length + 1
    };
    db.commands.push(newCmd);
  }

  db.lastUpdated = new Date().toLocaleString('pt-BR');
  saveDatabase(db);
  res.json({ success: true, data: db.commands });
});

// 6. Delete Grand Command
app.delete('/api/organogram/command/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  // Also check if there are subordinated units
  const hasUnits = db.units.some(u => u.grandCommandId === id);
  if (hasUnits) {
    return res.status(400).json({ success: false, message: 'Não é possível excluir um Grande Comando que ainda possui unidades subordinadas vinculadas.' });
  }

  db.commands = db.commands.filter(c => c.id !== id);
  db.lastUpdated = new Date().toLocaleString('pt-BR');
  saveDatabase(db);
  res.json({ success: true, data: db.commands });
});

// 7. Upload Emblem Image
app.post('/api/emblems/upload', (req, res) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'Dados da imagem não fornecidos.' });
    }

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const safeName = `emblem_${Date.now()}_${(filename || 'brasao.png').replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const filePath = path.resolve(UPLOAD_DIR, safeName);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${safeName}`;

    res.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error saving emblem:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar o emblema.' });
  }
});

// 8. AI Analysis of Organogram Print / Image
app.post('/api/ai/analyze-organogram', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Nenhuma imagem foi enviada para análise.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const db = getDatabase();

    const isPdf = mimeType === 'application/pdf' || imageBase64.startsWith('data:application/pdf');
    const effectiveMimeType = isPdf ? 'application/pdf' : (mimeType.startsWith('image/') ? mimeType : 'image/png');

    const systemPrompt = `Você é um analista militar especialista no Organograma Oficial da Polícia Militar do Maranhão (PMMA) e Comando do Policiamento do Interior (CPI).
Sua missão é realizar leitura minuciosa do documento ${isPdf ? 'PDF' : 'de imagem'} do organograma, reconhecendo cada detalhe dos Grandes Comandos e Unidades Subordinadas.

O organograma contém 9 Grandes Comandos (CPA I-1 a CPA I-9) e seus respectivos batalhões (BPMs) e companhias (CIPM, CIMT, EPMONT, BMT).

Para cada unidade ou batalhão identificado, você DEVE extrair com máxima fidelidade:
- identificacao: Número/sigla oficial da unidade (ex: "15º BPM", "2º BPM", "19º BPM", "1º EPMONT", "2º BMT", "1ª CIMT", "48º BPM").
- grandCommandSigla: Sigla exata do Grande Comando (ex: "CPA I-1", "CPA I-2", "CPA I-3", ..., "CPA I-9").
- nome: Nome oficial da unidade ou deduzido a partir da identificação.
- comandante: Nome completo do Comandante conforme escrito na caixa (ex: "TEN CEL QOEM LEILA", "MAJ QOEM SOARES JÚNIOR").
- posto: Posto ou graduação do comandante. OBRIGATÓRIO: Converta todas as siglas de posto para "QOEM" (ex: "CEL QOEM", "TEN CEL QOEM", "MAJ QOEM", "CAP QOEM").
- municipio: Cidade / Município sede onde a unidade está instalada (ex: "BACABAL", "CAXIAS", "IMPERATRIZ", "BALSAS").
- telefone: Telefone ou número de contato visível na caixa.
- email: E-mail funcional institucional caso visível (ex: "pmmacpai1.2@gmail.com"). Se ausente, deixe vazio.
- confianca: Nível de confiança da leitura de 0 a 100.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "unidades": [
    {
      "identificacao": "string",
      "grandCommandSigla": "string",
      "nome": "string",
      "comandante": "string",
      "posto": "string",
      "municipio": "string",
      "telefone": "string",
      "email": "string",
      "confianca": number
    }
  ],
  "resumoIA": "Breve resumo textual das informações e grandes comandos identificados no documento."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: effectiveMimeType,
              data: cleanBase64,
            },
          },
          {
            text: `Analise detalhadamente este documento ${isPdf ? 'PDF' : 'gráfico'} do Organograma CPI 2026. Extraia todos os Comandos (CPA I-1 ao CPA I-9) e todas as Unidades Subordinadas, comandantes, postos (QOEM), municípios e telefones de contato. Retorne o JSON estruturado.`,
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData: { unidades?: any[]; resumoIA?: string } = {};

    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini:', responseText);
      return res.status(500).json({ success: false, message: 'Falha ao processar a resposta da IA em formato JSON.' });
    }

    const extractedUnits = parsedData.unidades || [];

    // Helper normalization for matching
    const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // Now compare with current database units
    const diffItems: UnitDiffItem[] = [];

    // Map existing units for quick lookup
    const existingMap = new Map<string, SubordinateUnit>();
    db.units.forEach(u => {
      existingMap.set(normalize(u.identificacao), u);
    });

    // Also get command sigla lookup
    const commandMap = new Map<string, GrandCommand>();
    db.commands.forEach(c => {
      commandMap.set(c.id, c);
      commandMap.set(normalize(c.sigla), c);
    });

    for (const extracted of extractedUnits) {
      const normId = normalize(extracted.identificacao);
      const existing = existingMap.get(normId);

      const parentCmd = existing ? db.commands.find(c => c.id === existing.grandCommandId) : null;
      const existingCmdSigla = parentCmd?.sigla || 'N/A';
      const extractedCmdSigla = extracted.grandCommandSigla || 'N/A';

      const confianca = typeof extracted.confianca === 'number' ? extracted.confianca : 90;
      const requerConferencia = confianca < 75;

      if (!existing) {
        // Nova unidade identificada
        diffItems.push({
          identificacao: extracted.identificacao,
          grandCommandSigla: extractedCmdSigla,
          status: 'NOVA UNIDADE IDENTIFICADA',
          confianca,
          requerConferencia,
          campoModificado: ['Nova Unidade'],
          dadosAnteriores: null,
          dadosNovos: {
            identificacao: extracted.identificacao,
            grandCommandSigla: extractedCmdSigla,
            nome: extracted.nome || extracted.identificacao,
            comandante: extracted.comandante || 'A DEFINIR',
            posto: extracted.posto || 'QOEM',
            municipio: extracted.municipio || 'Maranhão',
            telefone: extracted.telefone || '',
            email: extracted.email || ''
          },
          aprovado: !requerConferencia
        });
      } else {
        // Compare fields
        const modFields: string[] = [];

        const comandanteChanged = normalize(existing.comandante) !== normalize(extracted.comandante);
        const postoChanged = normalize(existing.posto) !== normalize(extracted.posto) && extracted.posto;
        const phoneChanged = normalize(existing.telefone) !== normalize(extracted.telefone) && extracted.telefone;
        const emailChanged = normalize(existing.email || '') !== normalize(extracted.email || '') && extracted.email;
        const munChanged = normalize(existing.municipio) !== normalize(extracted.municipio) && extracted.municipio;
        const cmdChanged = normalize(existingCmdSigla) !== normalize(extractedCmdSigla) && extractedCmdSigla && extractedCmdSigla !== 'N/A';

        if (comandanteChanged) modFields.push('Comandante');
        if (postoChanged) modFields.push('Posto/Graduação');
        if (phoneChanged) modFields.push('Telefone de Contato');
        if (emailChanged) modFields.push('E-mail');
        if (munChanged) modFields.push('Município');
        if (cmdChanged) modFields.push('Grande Comando');

        let status: UnitDiffItem['status'] = 'NENHUMA ALTERAÇÃO';

        if (cmdChanged) {
          status = 'COMANDO TRANSFERIDO';
        } else if (comandanteChanged || postoChanged) {
          status = 'ALTERAÇÃO IDENTIFICADA';
        } else if (phoneChanged || emailChanged) {
          status = 'CONTATO ATUALIZADO';
        } else if (munChanged) {
          status = 'ALTERAÇÃO IDENTIFICADA';
        }

        diffItems.push({
          identificacao: existing.identificacao,
          unitId: existing.id,
          grandCommandSigla: extractedCmdSigla || existingCmdSigla,
          status,
          confianca,
          requerConferencia,
          campoModificado: modFields,
          dadosAnteriores: {
            identificacao: existing.identificacao,
            grandCommandSigla: existingCmdSigla,
            nome: existing.nome,
            comandante: existing.comandante,
            posto: existing.posto,
            municipio: existing.municipio,
            telefone: existing.telefone,
            email: existing.email || ''
          },
          dadosNovos: {
            identificacao: extracted.identificacao || existing.identificacao,
            grandCommandSigla: extractedCmdSigla || existingCmdSigla,
            nome: extracted.nome || existing.nome,
            comandante: extracted.comandante || existing.comandante,
            posto: extracted.posto || existing.posto,
            municipio: extracted.municipio || existing.municipio,
            telefone: extracted.telefone || existing.telefone,
            email: extracted.email || existing.email
          },
          aprovado: status !== 'NENHUMA ALTERAÇÃO' && !requerConferencia
        });
      }
    }

    // Statistics
    const totalAlteracoes = diffItems.filter(i => i.status === 'ALTERAÇÃO IDENTIFICADA').length;
    const totalNovas = diffItems.filter(i => i.status === 'NOVA UNIDADE IDENTIFICADA').length;
    const totalContatos = diffItems.filter(i => i.status === 'CONTATO ATUALIZADO').length;
    const totalSemAlt = diffItems.filter(i => i.status === 'NENHUMA ALTERAÇÃO').length;
    const totalReqConf = diffItems.filter(i => i.requerConferencia).length;

    const report: AIAnalysisReport = {
      id: `rep-${Date.now()}`,
      dataAnalise: new Date().toLocaleString('pt-BR'),
      totalIdentificados: extractedUnits.length,
      totalAlteracoes,
      totalNovas,
      totalContatosAtualizados: totalContatos,
      totalSemAlteracao: totalSemAlt,
      totalRequerConferencia: totalReqConf,
      confiancaMedia: Math.round(diffItems.reduce((acc, curr) => acc + curr.confianca, 0) / (diffItems.length || 1)),
      itens: diffItems,
      resumoIA: parsedData.resumoIA || `Foram identificadas ${extractedUnits.length} unidades e batalhões no print fornecido. Foram encontradas ${totalAlteracoes + totalContatos + totalNovas} atualizações pertinentes.`
    };

    res.json({ success: true, report });
  } catch (error: any) {
    console.error('Error during AI analysis:', error);
    res.status(500).json({ success: false, message: `Erro ao analisar o organograma: ${error.message || error}` });
  }
});

// 9. Apply Approved Changes
app.post('/api/ai/apply-changes', (req, res) => {
  try {
    const { approvedItems, usuario = 'Administrador do Sistema', imagemUrl, reportSummary } = req.body;
    const db = getDatabase();

    if (!approvedItems || !Array.isArray(approvedItems)) {
      return res.status(400).json({ success: false, message: 'Lista de alterações aprovadas inválida.' });
    }

    // Create backup snapshot before applying
    const preSnapshot = {
      topCommand: { ...db.topCommand },
      commands: [...db.commands],
      units: [...db.units],
      timestamp: new Date().toISOString()
    };

    let appliedCount = 0;

    for (const item of approvedItems as UnitDiffItem[]) {
      if (!item.aprovado || item.status === 'NENHUMA ALTERAÇÃO') continue;

      // Find target command id from sigla
      const targetCmd = db.commands.find(c => 
        c.sigla.toLowerCase().replace(/[^a-z0-9]/g, '') === item.dadosNovos.grandCommandSigla.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      const grandCommandId = targetCmd ? targetCmd.id : (db.commands[0]?.id || 'cpa-i-1');

      if (item.status === 'NOVA UNIDADE IDENTIFICADA') {
        const newUnit: SubordinateUnit = {
          id: `unit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          identificacao: item.dadosNovos.identificacao,
          tipo: item.dadosNovos.identificacao.includes('CIPM') ? 'Companhia Independente' : 'Batalhão',
          nome: item.dadosNovos.nome || `${item.dadosNovos.identificacao} de Polícia Militar`,
          grandCommandId,
          municipio: item.dadosNovos.municipio || 'Sede',
          municipiosJurisdicao: [item.dadosNovos.municipio || 'Sede'],
          comandante: item.dadosNovos.comandante,
          posto: item.dadosNovos.posto || 'QOEM',
          telefone: item.dadosNovos.telefone,
          email: item.dadosNovos.email || ''
        };
        db.units.push(newUnit);
        appliedCount++;
      } else {
        // Update existing unit
        const idx = db.units.findIndex(u => u.id === item.unitId || u.identificacao.toLowerCase() === item.identificacao.toLowerCase());
        if (idx >= 0) {
          db.units[idx] = {
            ...db.units[idx],
            comandante: item.dadosNovos.comandante || db.units[idx].comandante,
            posto: item.dadosNovos.posto || db.units[idx].posto,
            telefone: item.dadosNovos.telefone || db.units[idx].telefone,
            email: item.dadosNovos.email || db.units[idx].email,
            municipio: item.dadosNovos.municipio || db.units[idx].municipio,
            grandCommandId: targetCmd ? targetCmd.id : db.units[idx].grandCommandId
          };
          appliedCount++;
        }
      }
    }

    const record: HistoryRecord = {
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
      usuario,
      tipoAcao: 'ATUALIZAÇÃO POR PDF IA',
      descricao: reportSummary || `Atualização inteligente realizada por IA via documento PDF: ${appliedCount} unidade(s) atualizadas ou inseridas.`,
      totalAlteracoes: appliedCount,
      imagemUrl: imagemUrl || undefined,
      snapshot: preSnapshot
    };

    db.history.unshift(record);
    db.lastUpdated = new Date().toLocaleString('pt-BR');
    saveDatabase(db);

    res.json({ success: true, appliedCount, data: db });
  } catch (error: any) {
    console.error('Error applying changes:', error);
    res.status(500).json({ success: false, message: `Erro ao aplicar alterações: ${error.message}` });
  }
});

// 10. Version History & Rollback
app.get('/api/history', (_req, res) => {
  const db = getDatabase();
  res.json({ success: true, data: db.history });
});

app.post('/api/history/restore/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const historyItem = db.history.find(h => h.id === id);

  if (!historyItem || !historyItem.snapshot) {
    return res.status(404).json({ success: false, message: 'Registro de histórico não encontrado para restauração.' });
  }

  // Backup current state first
  const currentSnapshot = {
    topCommand: { ...db.topCommand },
    commands: [...db.commands],
    units: [...db.units],
    timestamp: new Date().toISOString()
  };

  db.topCommand = historyItem.snapshot.topCommand;
  db.commands = historyItem.snapshot.commands;
  db.units = historyItem.snapshot.units;
  db.lastUpdated = new Date().toLocaleString('pt-BR');

  const rollbackRecord: HistoryRecord = {
    id: `hist-rollback-${Date.now()}`,
    timestamp: new Date().toISOString(),
    usuario: 'Administrador (Rollback)',
    tipoAcao: 'RESTAURAÇÃO',
    descricao: `Restauração do organograma para a versão de ${new Date(historyItem.timestamp).toLocaleString('pt-BR')}.`,
    totalAlteracoes: db.units.length,
    snapshot: currentSnapshot
  };

  db.history.unshift(rollbackRecord);
  saveDatabase(db);

  res.json({ success: true, message: 'Organograma restaurado com sucesso.', data: db });
});

// 11. Reset to Initial Seed Data
app.post('/api/reset-demo', (_req, res) => {
  saveDatabase(initialDatabase);
  res.json({ success: true, message: 'Banco de dados restaurado para os dados oficiais de fábrica.', data: initialDatabase });
});

// ======================== SERVER & VITE INTEGRATION ========================

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Organograma Institucional 2026 rodando na porta ${PORT}`);
  });
}

startServer();
