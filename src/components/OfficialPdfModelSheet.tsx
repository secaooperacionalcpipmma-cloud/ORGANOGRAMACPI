import React from 'react';
import { OrganogramDatabase } from '../types/organogram';
import { initialCpeSpecialUnit } from '../data/seedData';
import { getCurrentDateBR } from '../utils/dateUtils';

interface OfficialPdfModelSheetProps {
  database: OrganogramDatabase;
  id?: string;
  className?: string;
}

/**
 * Official Visual Sheet Component (FORMATO I)
 * 100% identical to the main screen "Organograma Completo - 9 Colunas (PDF)" view
 * shown on desktop (image_68fa1d9c.png), using live database data, current automatic date,
 * and html2canvas-safe Arial metrics + generous cell spacing so no text or bottom row is ever clipped.
 */
export const OfficialPdfModelSheet: React.FC<OfficialPdfModelSheetProps> = ({
  database,
  id = 'official-pdf-model-sheet',
  className = ''
}) => {
  const { topCommand, commands, units } = database;

  // Ensure commands are ordered 1 to 9
  const sortedCommands = [...commands].sort((a, b) => a.ordem - b.ordem);
  const currentDateBR = getCurrentDateBR();

  // Explicit Arial/Helvetica font stack guarantees identical DOM & Canvas 2D metrics in html2canvas
  const fontSans = 'Arial, Helvetica, sans-serif';

  return (
    <div
      id={id}
      className={className}
      style={{
        width: '1580px',
        minWidth: '1580px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        padding: '28px 28px 36px 28px',
        fontFamily: fontSans,
        boxSizing: 'border-box',
        borderRadius: '6px',
        userSelect: 'none'
      }}
    >
      {/* 1. Centered Official Header (identical to Organograma Completo 9 Colunas view) */}
      <div
        style={{
          textAlign: 'center',
          borderBottom: '2px solid #005a2b',
          paddingBottom: '16px',
          marginBottom: '16px',
          boxSizing: 'border-box'
        }}
      >
        <h1
          style={{
            fontSize: '30px',
            lineHeight: '38px',
            fontWeight: 900,
            color: '#005a2b',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontFamily: fontSans,
            margin: 0
          }}
        >
          {topCommand.titulo || 'ORGANOGRAMA CPI 2026'}
        </h1>
        <p
          style={{
            fontSize: '12px',
            lineHeight: '18px',
            fontWeight: 700,
            color: '#334155',
            letterSpacing: '0.025em',
            margin: '4px 0 0 0',
            textTransform: 'uppercase',
            fontFamily: fontSans
          }}
        >
          POLÍCIA MILITAR DO MARANHÃO • {topCommand.subtitulo || 'COMANDO DO POLICIAMENTO DO INTERIOR'}
        </p>
        <p
          style={{
            fontSize: '11px',
            lineHeight: '18px',
            color: '#64748b',
            fontWeight: 500,
            margin: '2px 0 0 0',
            fontFamily: fontSans
          }}
        >
          Comandante Geral:{' '}
          <strong style={{ color: '#1e293b', fontWeight: 700 }}>{topCommand.comandanteGeral}</strong>
          {' • '}
          Comandante CPI:{' '}
          <strong style={{ color: '#1e293b', fontWeight: 700 }}>{topCommand.comandanteCPI}</strong>
          {' • '}
          Tel CPI:{' '}
          <strong style={{ color: '#1e293b', fontWeight: 700 }}>{topCommand.contato}</strong>
        </p>
      </div>

      {/* 2. Green Horizontal Connection Bar */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <div
          style={{
            height: '6px',
            backgroundColor: '#005a2b',
            borderRadius: '9999px',
            width: '100%'
          }}
        />
      </div>

      {/* 3. 9 COLUMNS HORIZONTAL MATRIX (CPA I-1 TO CPA I-9) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
          gap: '12px',
          alignItems: 'start'
        }}
      >
        {sortedCommands.map((command) => {
          const cmdUnits = units.filter((u) => u.grandCommandId === command.id);

          return (
            <div
              key={command.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '4px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {/* Vertical line from green bar to emblem */}
              <div style={{ width: '2px', height: '12px', backgroundColor: '#005a2b' }} />

              {/* Official Emblem Box */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  boxSizing: 'border-box'
                }}
              >
                {command.emblemaUrl ? (
                  <img
                    src={command.emblemaUrl}
                    alt={`Emblema ${command.sigla}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: '9px',
                      lineHeight: '12px',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      textAlign: 'center'
                    }}
                  >
                    Sem Emblema
                  </div>
                )}
              </div>

              {/* Vertical connector line */}
              <div style={{ width: '2px', height: '10px', backgroundColor: '#005a2b' }} />

              {/* Grand Command Card (Nível 1) */}
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  borderRadius: '4px',
                  padding: '8px 6px',
                  textAlign: 'center',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  boxSizing: 'border-box'
                }}
              >
                <h3
                  style={{
                    fontWeight: 900,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    fontFamily: fontSans,
                    margin: 0
                  }}
                >
                  {command.sigla}
                </h3>
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: '10.5px',
                    lineHeight: '15px',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    fontFamily: fontSans,
                    margin: '3px 0 0 0'
                  }}
                >
                  {command.comandante}
                </p>
                <p
                  style={{
                    fontFamily: fontSans,
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '10px',
                    lineHeight: '15px',
                    color: '#334155',
                    margin: '2px 0 0 0',
                    fontWeight: 700
                  }}
                >
                  {command.telefone}
                </p>
              </div>

              {/* Vertical line leading to subordinate units */}
              <div style={{ width: '2px', height: '12px', backgroundColor: '#005a2b' }} />

              {/* Subordinate Units Stack in Exact Vertical Sequence */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {cmdUnits.map((unit) => {
                  const isDashed = Boolean(unit.emRegulamentacao);

                  return (
                    <div
                      key={unit.id}
                      style={{
                        width: '100%',
                        backgroundColor: isDashed ? '#f8fafc' : '#ffffff',
                        border: isDashed ? '2px dashed #94a3b8' : '2px solid #000000',
                        borderRadius: '4px',
                        padding: '8px 6px',
                        textAlign: 'center',
                        boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.04)',
                        boxSizing: 'border-box'
                      }}
                    >
                      <h4
                        style={{
                          fontWeight: 900,
                          fontSize: '11px',
                          lineHeight: '16px',
                          color: '#020617',
                          textTransform: 'uppercase',
                          fontFamily: fontSans,
                          margin: 0
                        }}
                      >
                        {unit.identificacao}
                      </h4>
                      <p
                        style={{
                          fontWeight: 800,
                          fontSize: '10px',
                          lineHeight: '14px',
                          color: '#1e293b',
                          textTransform: 'uppercase',
                          fontFamily: fontSans,
                          margin: '2px 0 0 0'
                        }}
                      >
                        {unit.municipio}
                      </p>

                      {!isDashed && (
                        <>
                          <p
                            style={{
                              fontWeight: 800,
                              fontSize: '10px',
                              lineHeight: '14px',
                              color: '#005a2b',
                              textTransform: 'uppercase',
                              fontFamily: fontSans,
                              margin: '3px 0 0 0'
                            }}
                          >
                            {unit.comandante}
                          </p>
                          <p
                            style={{
                              fontFamily: fontSans,
                              fontVariantNumeric: 'tabular-nums',
                              fontSize: '10px',
                              lineHeight: '14px',
                              color: '#334155',
                              fontWeight: 600,
                              margin: '2px 0 0 0'
                            }}
                          >
                            {unit.telefone}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Column 1 Special Box: CPE & 2º BPTUR Barreirinhas */}
              {command.sigla === 'CPA I-1' && (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '12px',
                    paddingTop: '8px',
                    borderTop: '2px solid #005a2b',
                    gap: '8px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: '#f1f5f9',
                      border: '2px solid #000000',
                      borderRadius: '4px',
                      padding: '6px',
                      textAlign: 'center',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#0f172a',
                        letterSpacing: '0.05em',
                        fontFamily: fontSans
                      }}
                    >
                      CPE
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '4px',
                      padding: '6px 4px',
                      textAlign: 'center',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '10px',
                        lineHeight: '14px',
                        color: '#0f172a',
                        fontFamily: fontSans
                      }}
                    >
                      {initialCpeSpecialUnit.unidade}
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '4px',
                      padding: '8px',
                      textAlign: 'left',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        color: '#1e293b',
                        lineHeight: '14px',
                        fontFamily: fontSans
                      }}
                    >
                      {initialCpeSpecialUnit.municipios.map((m, idx) => (
                        <div key={idx}>{m}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. BOTTOM SECTION: FOOTER TEXT + CMT'S DE ÁREA TABLE + LAST UPDATE */}
      <div
        style={{
          marginTop: '32px',
          paddingTop: '16px',
          borderTop: '2px solid #005a2b',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '24px'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            lineHeight: '16px',
            color: '#64748b',
            fontWeight: 600,
            fontFamily: fontSans
          }}
        >
          Polícia Militar do Maranhão • Comando do Policiamento do Interior (CPI) • Organograma Oficial 2026
        </div>

        {/* CMT's DE ÁREA DO INTERIOR TABLE (overflow: visible so row 9 is never clipped) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '14px'
          }}
        >
          <div
            style={{
              border: '2px solid #000000',
              borderRadius: '4px',
              overflow: 'visible',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              backgroundColor: '#ffffff'
            }}
          >
            <div
              style={{
                backgroundColor: '#005a2b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '12px',
                lineHeight: '18px',
                padding: '7px 16px',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                borderBottom: '2px solid #000000',
                fontFamily: fontSans
              }}
            >
              CMT&apos;S DE ÁREA DO INTERIOR
            </div>
            <table
              style={{
                fontSize: '10.5px',
                lineHeight: '16px',
                textAlign: 'left',
                borderCollapse: 'separate',
                borderSpacing: 0,
                backgroundColor: '#ffffff',
                fontFamily: fontSans,
                width: '100%'
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#f1f5f9',
                    fontWeight: 800,
                    color: '#1e293b'
                  }}
                >
                  <th
                    style={{
                      padding: '6px 14px',
                      lineHeight: '16px',
                      borderRight: '1px solid #cbd5e1',
                      borderBottom: '1px solid #cbd5e1',
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    CPAI
                  </th>
                  <th
                    style={{
                      padding: '6px 14px',
                      lineHeight: '16px',
                      borderRight: '1px solid #cbd5e1',
                      borderBottom: '1px solid #cbd5e1',
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    POSTO/NOME
                  </th>
                  <th
                    style={{
                      padding: '6px 14px',
                      lineHeight: '16px',
                      borderRight: '1px solid #cbd5e1',
                      borderBottom: '1px solid #cbd5e1',
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    CONTATO
                  </th>
                  <th
                    style={{
                      padding: '6px 14px',
                      lineHeight: '16px',
                      borderBottom: '1px solid #cbd5e1',
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    E-MAIL
                  </th>
                </tr>
              </thead>
              <tbody style={{ fontWeight: 600 }}>
                {sortedCommands.map((c, idx) => {
                  const bottomBorder =
                    idx < sortedCommands.length - 1 ? '1px solid #e2e8f0' : 'none';
                  return (
                    <tr
                      key={c.id}
                      style={{
                        backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff'
                      }}
                    >
                      <td
                        style={{
                          padding: '5px 14px',
                          lineHeight: '16px',
                          fontWeight: 800,
                          borderRight: '1px solid #e2e8f0',
                          borderBottom: bottomBorder,
                          color: '#0f172a',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {c.sigla}
                      </td>
                      <td
                        style={{
                          padding: '5px 14px',
                          lineHeight: '16px',
                          fontWeight: 700,
                          borderRight: '1px solid #e2e8f0',
                          borderBottom: bottomBorder,
                          color: '#0f172a',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {c.comandante}
                      </td>
                      <td
                        style={{
                          padding: '5px 14px',
                          lineHeight: '16px',
                          fontFamily: fontSans,
                          fontVariantNumeric: 'tabular-nums',
                          fontWeight: 600,
                          borderRight: '1px solid #e2e8f0',
                          borderBottom: bottomBorder,
                          color: '#1e293b',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {c.telefone}
                      </td>
                      <td
                        style={{
                          padding: '5px 14px',
                          lineHeight: '16px',
                          color: '#334155',
                          fontFamily: fontSans,
                          fontSize: '10px',
                          fontWeight: 600,
                          borderBottom: bottomBorder,
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {c.email}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ÚLTIMA MODIFICAÇÃO (Dado automático - sempre a data do dia em que o relatório é gerado) */}
          <div
            style={{
              border: '2px solid #000000',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              padding: '8px 18px',
              textAlign: 'center',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              minWidth: '230px',
              boxSizing: 'border-box'
            }}
          >
            <p
              style={{
                fontSize: '9.5px',
                lineHeight: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#475569',
                fontFamily: fontSans,
                margin: 0
              }}
            >
              ÚLTIMA MODIFICAÇÃO (Dado automático)
            </p>
            <p
              style={{
                fontSize: '13px',
                lineHeight: '18px',
                fontWeight: 900,
                color: '#0f172a',
                fontFamily: fontSans,
                fontVariantNumeric: 'tabular-nums',
                margin: '3px 0 0 0'
              }}
            >
              {currentDateBR}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
