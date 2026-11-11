import React from 'react';
import { OrganogramDatabase } from '../types/organogram';
import { initialCpeSpecialUnit } from '../data/seedData';

interface OfficialPdfModelSheetProps {
  database: OrganogramDatabase;
  id?: string;
  className?: string;
}

/**
 * Official Visual Sheet Component - Exact Replica of Print 01 (Desktop View)
 * Generates the official 9-columns visual organogram using live database data.
 * All colors are explicitly styled with standard hex codes to ensure 100% compatibility
 * with html2canvas and jsPDF (zero oklch errors).
 */
export const OfficialPdfModelSheet: React.FC<OfficialPdfModelSheetProps> = ({
  database,
  id = 'official-pdf-model-sheet',
  className = ''
}) => {
  const { topCommand, commands, units } = database;

  // Ensure commands are ordered 1 to 9
  const sortedCommands = [...commands].sort((a, b) => a.ordem - b.ordem);

  return (
    <div
      id={id}
      className={`font-sans select-none ${className}`}
      style={{
        width: '1580px',
        minWidth: '1580px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        padding: '24px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Top Header - Exact replica of Print 01 (Left CPI emblem, title, badge, commanders) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '3px solid #005a2b',
          marginBottom: '14px'
        }}
      >
        {/* Left Official Shield CPI 2026 */}
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <img
            src="/assets/aistudio/CPI_8bc02a05.jpg"
            alt="Emblema CPI PMMA"
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              backgroundColor: '#005a2b',
              color: '#ffffff',
              fontSize: '9px',
              fontWeight: 900,
              padding: '1px 6px',
              borderRadius: '9999px',
              border: '1px solid #ffffff'
            }}
          >
            2026
          </div>
        </div>

        {/* Header Text Block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                margin: 0
              }}
            >
              {topCommand.titulo || 'ORGANOGRAMA CPI 2026'}
            </h1>
            <span
              style={{
                backgroundColor: '#d1fae5',
                color: '#005a2b',
                fontSize: '11px',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #6ee7b7',
                textTransform: 'uppercase'
              }}
            >
              OFICIAL
            </span>
          </div>

          <p
            style={{
              fontSize: '13px',
              fontWeight: 900,
              color: '#005a2b',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: '2px 0 0 0'
            }}
          >
            {topCommand.subtitulo || 'COMANDO DO POLICIAMENTO DO INTERIOR (CPI)'}
          </p>

          <p
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#475569',
              margin: '3px 0 0 0'
            }}
          >
            Comandante Geral: <strong style={{ color: '#0f172a', fontWeight: 800 }}>{topCommand.comandanteGeral}</strong> • Comandante CPI: <strong style={{ color: '#0f172a', fontWeight: 800 }}>{topCommand.comandanteCPI}</strong>
            {topCommand.contato && (
              <span> • Tel CPI: <strong style={{ color: '#005a2b', fontWeight: 800 }}>{topCommand.contato}</strong></span>
            )}
          </p>
        </div>
      </div>

      {/* 2. Green Horizontal Connection Bar across all 9 columns */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            height: '6px',
            backgroundColor: '#005a2b',
            borderRadius: '9999px',
            width: '100%'
          }}
        />
      </div>

      {/* 3. 9 COLUMNS HORIZONTAL MATRIX (CPA I-1 TO CPA I-9) - Exact replica of Print 01 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
          gap: '10px',
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
                gap: '8px'
              }}
            >
              {/* Vertical connector line from green bar */}
              <div style={{ width: '2px', height: '12px', backgroundColor: '#005a2b' }} />

              {/* Official CPAI Emblem Box */}
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
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {command.emblemaUrl ? (
                  <img
                    src={command.emblemaUrl}
                    alt={`Emblema ${command.sigla}`}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
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
                  padding: '8px 4px',
                  textAlign: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  boxSizing: 'border-box'
                }}
              >
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    color: '#000000',
                    textTransform: 'uppercase',
                    margin: 0
                  }}
                >
                  {command.sigla}
                </h3>
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#005a2b',
                    textTransform: 'uppercase',
                    margin: '3px 0 0 0',
                    lineHeight: 1.2
                  }}
                >
                  {command.comandante}
                </p>
                <p
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#000000',
                    margin: '3px 0 0 0'
                  }}
                >
                  {command.telefone}
                </p>
              </div>

              {/* Vertical line leading to subordinate units */}
              <div style={{ width: '2px', height: '12px', backgroundColor: '#005a2b' }} />

              {/* Subordinate Units Stack in Exact Vertical Sequence */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        padding: '8px 4px',
                        textAlign: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        boxSizing: 'border-box'
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '11px',
                          fontWeight: 900,
                          color: '#000000',
                          textTransform: 'uppercase',
                          margin: 0,
                          lineHeight: 1.2
                        }}
                      >
                        {unit.identificacao}
                      </h4>
                      <p
                        style={{
                          fontSize: '10px',
                          fontWeight: 900,
                          color: '#000000',
                          textTransform: 'uppercase',
                          margin: '2px 0 0 0',
                          lineHeight: 1.2
                        }}
                      >
                        {unit.municipio}
                      </p>

                      {!isDashed ? (
                        <>
                          <p
                            style={{
                              fontSize: '10px',
                              fontWeight: 900,
                              color: '#005a2b',
                              textTransform: 'uppercase',
                              margin: '3px 0 0 0',
                              lineHeight: 1.2
                            }}
                          >
                            {unit.comandante}
                          </p>
                          <p
                            style={{
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              color: '#000000',
                              margin: '3px 0 0 0'
                            }}
                          >
                            {unit.telefone}
                          </p>
                        </>
                      ) : (
                        <p
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            margin: '3px 0 0 0'
                          }}
                        >
                          EM REGULAMENTAÇÃO
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Column 1 Special Box: CPE & 2º BPTUR Barreirinhas (Exact replica of Print 01) */}
              {command.sigla === 'CPA I-1' && (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '10px',
                    paddingTop: '8px',
                    borderTop: '2px solid #005a2b',
                    gap: '6px'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: '#f1f5f9',
                      border: '2px solid #000000',
                      borderRadius: '4px',
                      padding: '4px',
                      textAlign: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span style={{ fontWeight: 900, fontSize: '11px', color: '#000000', letterSpacing: '0.04em' }}>
                      CPE
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '4px',
                      padding: '4px',
                      textAlign: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span style={{ fontWeight: 900, fontSize: '10px', color: '#000000' }}>
                      {initialCpeSpecialUnit.unidade}
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '4px',
                      padding: '6px 4px',
                      textAlign: 'left',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
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

      {/* 4. Bottom Section: Tagline, Table of Commanders & Automatic Date */}
      <div
        style={{
          marginTop: '28px',
          paddingTop: '16px',
          borderTop: '2px solid #005a2b',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '24px'
        }}
      >
        <div style={{ fontSize: '11px', color: '#475569', fontWeight: 500, maxWidth: '420px' }}>
          <p style={{ fontWeight: 800, color: '#0f172a', margin: 0 }}>POLÍCIA MILITAR DO MARANHÃO (PMMA)</p>
          <p style={{ margin: '2px 0 0 0' }}>Comando do Policiamento do Interior (CPI) • Organograma Institucional 2026</p>
          <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Quartel do Comando Geral • Av. Jerônimo de Albuquerque, Calhau, São Luís - MA
          </p>
        </div>

        {/* CMT's DE ÁREA DO INTERIOR TABLE + DATE */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div
            style={{
              border: '2px solid #000000',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <div
              style={{
                backgroundColor: '#005a2b',
                color: '#ffffff',
                textAlign: 'center',
                fontWeight: 900,
                fontSize: '11px',
                padding: '4px 10px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                borderBottom: '1px solid #000000'
              }}
            >
              CMT's DE ÁREA DO INTERIOR
            </div>
            <table style={{ fontSize: '10px', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>
                  <th style={{ padding: '4px 8px', borderRight: '1px solid #e2e8f0' }}>CPAI</th>
                  <th style={{ padding: '4px 8px', borderRight: '1px solid #e2e8f0' }}>POSTO/NOME</th>
                  <th style={{ padding: '4px 8px', borderRight: '1px solid #e2e8f0' }}>CONTATO</th>
                  <th style={{ padding: '4px 8px' }}>E-MAIL</th>
                </tr>
              </thead>
              <tbody>
                {sortedCommands.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      backgroundColor: i % 2 === 1 ? '#f8fafc' : '#ffffff',
                      borderBottom: i < sortedCommands.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}
                  >
                    <td style={{ padding: '3px 8px', fontWeight: 900, borderRight: '1px solid #e2e8f0', color: '#0f172a' }}>
                      {c.sigla}
                    </td>
                    <td style={{ padding: '3px 8px', fontWeight: 900, borderRight: '1px solid #e2e8f0', color: '#005a2b' }}>
                      {c.comandante}
                    </td>
                    <td style={{ padding: '3px 8px', fontFamily: 'monospace', fontWeight: 800, borderRight: '1px solid #e2e8f0', color: '#0f172a' }}>
                      {c.telefone}
                    </td>
                    <td style={{ padding: '3px 8px', color: '#475569', fontFamily: 'monospace', fontSize: '9px' }}>
                      {c.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ÚLTIMA MODIFICAÇÃO (Dado automático) */}
          <div
            style={{
              border: '2px solid #000000',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              padding: '4px 8px',
              textAlign: 'center',
              minWidth: '220px',
              boxSizing: 'border-box'
            }}
          >
            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: '#475569', margin: 0 }}>
              ÚLTIMA MODIFICAÇÃO (Dado automático)
            </p>
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontFamily: 'monospace',
                fontWeight: 900,
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                marginTop: '3px'
              }}
            >
              {topCommand.dataAtualizacao || '11/11/2026'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
