import React from 'react';
import { OrganogramDatabase } from '../types/organogram';

interface CadastralReportSheetProps {
  database: OrganogramDatabase;
  id?: string;
}

/**
 * Self-contained Cadastral Report Sheet (FORMATO II - Print 02)
 * Used to generate pristine PNG captures of the tabular report from any screen/tab
 * with pure inline hex colors (zero oklch / external Tailwind dependencies).
 */
export const CadastralReportSheet: React.FC<CadastralReportSheetProps> = ({
  database,
  id = 'cadastral-report-sheet'
}) => {
  const { topCommand, commands, units } = database;
  const sortedCommands = [...commands].sort((a, b) => a.ordem - b.ordem);

  const fontSans =
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  const fontMono =
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

  return (
    <div
      id={id}
      style={{
        width: '1200px',
        minWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f1f5f9',
        color: '#0f172a',
        padding: '24px',
        fontFamily: fontSans,
        boxSizing: 'border-box'
      }}
    >
      {/* Institutional Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #000000',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 900,
              color: '#0f172a',
              textTransform: 'uppercase'
            }}
          >
            POLÍCIA MILITAR DO MARANHÃO • COMANDO DO POLICIAMENTO DO INTERIOR (CPI)
          </h1>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              fontWeight: 700,
              color: '#005a2b'
            }}
          >
            RELATÓRIO CADASTRAL E ESTATÍSTICO OFICIAL 2026 • {commands.length} GRANDES COMANDOS • {units.length} UNIDADES
          </p>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '11px',
              color: '#475569'
            }}
          >
            Comandante Geral: <strong style={{ color: '#0f172a' }}>{topCommand.comandanteGeral}</strong> • Comandante CPI:{' '}
            <strong style={{ color: '#0f172a' }}>{topCommand.comandanteCPI}</strong>
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#005a2b',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 900,
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}
        >
          ATUALIZAÇÃO: {topCommand.dataAtualizacao || '11/11/2026'}
        </div>
      </div>

      {/* Command Sections matching Print 02 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sortedCommands.map((cmd) => {
          const cmdUnits = units.filter((u) => u.grandCommandId === cmd.id);

          return (
            <div
              key={cmd.id}
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #000000',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}
            >
              {/* Dark Green Header Bar */}
              <div
                style={{
                  backgroundColor: '#005a2b',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderBottom: '2px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {cmd.emblemaUrl && (
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#ffffff',
                        borderRadius: '4px',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <img
                        src={cmd.emblemaUrl}
                        alt={cmd.sigla}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        color: '#ffffff'
                      }}
                    >
                      {cmd.sigla} - {cmd.nome}
                    </h3>
                    <p
                      style={{
                        margin: '2px 0 0 0',
                        fontSize: '12px',
                        color: '#a7f3d0',
                        fontWeight: 500
                      }}
                    >
                      Sede: {cmd.municipioSede} • Comandante: {cmd.comandante}
                      {cmd.telefone ? ` • Tel: ${cmd.telefone}` : ''}
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    color: '#005a2b',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cmdUnits.length} Unidades
                </span>
              </div>

              {/* Units Table */}
              <table
                style={{
                  width: '100%',
                  textAlign: 'left',
                  fontSize: '12px',
                  borderCollapse: 'collapse',
                  backgroundColor: '#ffffff'
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '10px',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <th style={{ padding: '8px 12px', width: '16%' }}>Unidade</th>
                    <th style={{ padding: '8px 12px', width: '14%' }}>Tipo</th>
                    <th style={{ padding: '8px 12px', width: '20%' }}>Município Sede</th>
                    <th style={{ padding: '8px 12px', width: '24%' }}>Comandante</th>
                    <th style={{ padding: '8px 12px', width: '14%' }}>Telefone</th>
                    <th style={{ padding: '8px 12px', width: '12%' }}>E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {cmdUnits.map((u, idx) => (
                    <tr
                      key={u.id}
                      style={{
                        backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                        borderBottom: idx < cmdUnits.length - 1 ? '1px solid #f1f5f9' : 'none',
                        color: '#1e293b'
                      }}
                    >
                      <td style={{ padding: '8px 12px', fontWeight: 800, color: '#005a2b' }}>
                        {u.identificacao}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{u.tipo}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {u.municipio}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 900, color: '#0f172a' }}>
                        {u.emRegulamentacao ? 'EM REGULAMENTAÇÃO' : u.comandante}
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: fontMono }}>
                        {u.telefone || '-'}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          color: '#64748b',
                          fontFamily: fontMono,
                          fontSize: '11px'
                        }}
                      >
                        {u.email || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};
