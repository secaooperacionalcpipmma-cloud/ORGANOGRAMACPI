import React from 'react';
import { OrganogramDatabase } from '../types/organogram';
import { initialCpeSpecialUnit } from '../data/seedData';

interface OfficialPdfModelSheetProps {
  database: OrganogramDatabase;
  id?: string;
  className?: string;
}

/**
 * Official Visual Sheet Component - Exact Replica of the Attached PDF
 * Designed specifically for high-resolution visual capture (PDF & PNG)
 * and 1-page landscape presentation.
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
      className={`bg-white text-slate-900 font-sans p-6 select-none ${className}`}
      style={{ width: '1580px', minHeight: '1000px', margin: '0 auto', backgroundColor: '#ffffff', color: '#0f172a' }}
    >
      {/* 1. Header with Title and Emblems on Left/Right corners identical to PDF */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#005a2b] mb-3">
        {/* Left Official Shield */}
        <div className="w-20 h-20 bg-white border border-slate-300 rounded shadow-2xs p-1 flex items-center justify-center">
          <img
            src="/assets/aistudio/CPI_8bc02a05.jpg"
            alt="Emblema CPI PMMA"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Center Main Title */}
        <div className="text-center flex-1 px-4">
          <h1 className="text-3xl font-black text-[#005a2b] tracking-wider uppercase font-sans">
            ORGANOGRAMA CPI 2026
          </h1>
          <p className="text-xs font-bold text-slate-700 tracking-wide mt-0.5">
            POLÍCIA MILITAR DO MARANHÃO • COMANDO DO POLICIAMENTO DO INTERIOR
          </p>
          <p className="text-[11px] text-slate-600 font-medium">
            Comandante Geral: <strong className="text-slate-800">{topCommand.comandanteGeral}</strong> • Comandante CPI: <strong className="text-slate-800">{topCommand.comandanteCPI}</strong> • Tel CPI: <strong className="text-slate-800">{topCommand.contato}</strong>
          </p>
        </div>

        {/* Right Official Shield */}
        <div className="w-20 h-20 bg-white border border-slate-300 rounded shadow-2xs p-1 flex items-center justify-center">
          <img
            src="/assets/aistudio/CPI_8bc02a05.jpg"
            alt="Emblema CPI PMMA"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>

      {/* 2. Green Horizontal Connection Bar */}
      <div className="relative mb-3">
        <div className="h-2 bg-[#005a2b] rounded-full w-full"></div>
      </div>

      {/* 3. 9 COLUMNS HORIZONTAL MATRIX (CPA I-1 TO CPA I-9) */}
      <div className="grid grid-cols-9 gap-3 items-start">
        {sortedCommands.map((command) => {
          const cmdUnits = units.filter((u) => u.grandCommandId === command.id);

          return (
            <div key={command.id} className="flex flex-col items-center space-y-2">
              {/* Vertical connector line from green bar */}
              <div className="w-0.5 h-3 bg-[#005a2b]"></div>

              {/* Official CPAI Emblem Box */}
              <div className="w-16 h-16 bg-white border border-slate-300 rounded shadow-xs p-1 flex items-center justify-center">
                {command.emblemaUrl ? (
                  <img
                    src={command.emblemaUrl}
                    alt={`Emblema ${command.sigla}`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-[9px] font-bold text-slate-400 uppercase text-center">
                    Sem Emblema
                  </div>
                )}
              </div>

              {/* Vertical connector line */}
              <div className="w-0.5 h-2.5 bg-[#005a2b]"></div>

              {/* Grand Command Card (Nível 1) */}
              <div className="w-full bg-white border-2 border-black rounded p-2 text-center shadow-xs">
                <h3 className="font-black text-xs text-slate-900 uppercase">
                  {command.sigla}
                </h3>
                <p className="font-extrabold text-[11px] text-slate-900 uppercase mt-0.5 leading-tight">
                  {command.comandante}
                </p>
                <p className="font-mono text-[10px] text-slate-700 mt-0.5 font-bold">
                  {command.telefone}
                </p>
              </div>

              {/* Vertical line leading to subordinate units */}
              <div className="w-0.5 h-3 bg-[#005a2b]"></div>

              {/* Subordinate Units Stack in Exact Vertical Sequence */}
              <div className="w-full flex flex-col space-y-2">
                {cmdUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className={`w-full bg-white border-2 rounded p-2 text-center shadow-2xs ${
                      unit.emRegulamentacao
                        ? 'border-dashed border-slate-400 bg-slate-50'
                        : 'border-black'
                    }`}
                  >
                    <h4 className="font-black text-[11px] text-slate-950 uppercase leading-snug">
                      {unit.identificacao}
                    </h4>
                    <p className="font-extrabold text-[10px] text-slate-800 uppercase leading-tight mt-0.5">
                      {unit.municipio}
                    </p>

                    {!unit.emRegulamentacao ? (
                      <>
                        <p className="font-extrabold text-[10px] text-[#005a2b] uppercase leading-tight mt-0.5">
                          {unit.comandante}
                        </p>
                        <p className="font-mono text-[10px] text-slate-700 font-semibold mt-0.5">
                          {unit.telefone}
                        </p>
                      </>
                    ) : (
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                        (EM REGULAMENTAÇÃO)
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Column 1 Special Box: CPE & 2º BPTUR Barreirinhas */}
              {command.sigla === 'CPA I-1' && (
                <div className="w-full flex flex-col items-center mt-3 pt-2 border-t-2 border-[#005a2b] space-y-2">
                  <div className="w-full bg-slate-100 border-2 border-black rounded p-1.5 text-center shadow-xs">
                    <span className="font-black text-xs text-slate-900 tracking-wider">CPE</span>
                  </div>

                  <div className="w-full bg-white border-2 border-black rounded p-1 text-center shadow-xs">
                    <span className="font-extrabold text-[10px] text-slate-900">
                      {initialCpeSpecialUnit.unidade}
                    </span>
                  </div>

                  <div className="w-full bg-white border-2 border-black rounded p-2 text-left shadow-xs">
                    <div className="text-[9px] font-bold text-slate-800 space-y-0.5 leading-tight">
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
      <div className="mt-8 pt-4 border-t-2 border-[#005a2b] flex items-end justify-between gap-6">
        <div className="text-xs text-slate-500 font-medium max-w-md">
          <p className="font-bold text-slate-700">POLÍCIA MILITAR DO MARANHÃO (PMMA)</p>
          <p>Comando do Policiamento do Interior (CPI) • Organograma Institucional 2026</p>
          <p className="text-[10px] text-slate-400 mt-1">
            Quartel do Comando Geral • Av. Jerônimo de Albuquerque, Calhau, São Luís - MA
          </p>
        </div>

        {/* CMT's DE ÁREA DO INTERIOR TABLE + DATE */}
        <div className="flex flex-col items-end space-y-3">
          <div className="border-2 border-black rounded overflow-hidden shadow-xs bg-white">
            <div className="bg-[#005a2b] text-white text-center font-black text-xs py-1 px-3 uppercase tracking-wide border-b border-black">
              CMT's DE ÁREA DO INTERIOR
            </div>
            <table className="text-[10px] text-left">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                <tr>
                  <th className="py-1 px-3 border-r border-slate-200">CPAI</th>
                  <th className="py-1 px-3 border-r border-slate-200">POSTO/NOME</th>
                  <th className="py-1 px-3 border-r border-slate-200">CONTATO</th>
                  <th className="py-1 px-3">E-MAIL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {sortedCommands.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-0.5 px-3 font-bold border-r border-slate-200 text-slate-900">
                      {c.sigla}
                    </td>
                    <td className="py-0.5 px-3 font-bold border-r border-slate-200 text-slate-900">
                      {c.comandante}
                    </td>
                    <td className="py-0.5 px-3 font-mono border-r border-slate-200 text-slate-800">
                      {c.telefone}
                    </td>
                    <td className="py-0.5 px-3 text-slate-600 font-mono text-[9px]">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ÚLTIMA MODIFICAÇÃO (Dado automático) */}
          <div className="border-2 border-black bg-white rounded p-1.5 text-center shadow-xs min-w-[220px]">
            <p className="text-[9px] font-bold uppercase text-slate-600">
              ÚLTIMA MODIFICAÇÃO (Dado automático)
            </p>
            <div className="bg-slate-900 text-white font-mono font-black text-xs py-0.5 px-2 rounded mt-0.5">
              {topCommand.dataAtualizacao || '11/11/2026'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
