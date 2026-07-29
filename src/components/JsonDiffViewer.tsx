import React from "react";

interface JsonDiffViewerProps {
  before: any;
  after: any;
}

export const JsonDiffViewer: React.FC<JsonDiffViewerProps> = ({ before, after }) => {
  // Normalize values
  const cleanBefore = before !== undefined && before !== null ? before : {};
  const cleanAfter = after !== undefined && after !== null ? after : {};

  // Find all unique keys from both objects
  const keys = Array.from(new Set([
    ...Object.keys(cleanBefore),
    ...Object.keys(cleanAfter)
  ])).sort();

  if (keys.length === 0) {
    return (
      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 text-slate-500 font-mono text-center text-xxs italic">
        Sem metadados adicionais para este registo.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-slate-950 p-5 rounded-xl border border-rose-500/10 shadow-inner">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px] font-mono">
            Comparação de Estado do Log Forense (JSON State Diff)
          </span>
        </div>
        <span className="text-[8px] bg-slate-900 text-slate-500 border border-slate-800 px-2 py-0.5 rounded font-mono font-bold uppercase">
          PNAP-AO-DIFF-v2 // AES-256 IMUTÁVEL
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column: Before state */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[9px] font-mono">
            <span className="text-rose-400 font-bold uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500/55" />
              Estado Anterior (Pre-State)
            </span>
            <span className="text-slate-600">ID CANÓNICO</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-850 rounded-lg p-4 overflow-x-auto max-h-[320px] font-mono text-[10.5px] leading-relaxed scrollbar-thin text-left">
            <pre className="text-slate-400 font-mono">
              {"{\n"}
              {keys.map((key, i) => {
                const hasBefore = key in cleanBefore;
                const hasAfter = key in cleanAfter;
                const valBefore = cleanBefore[key];
                const valAfter = cleanAfter[key];
                const isDiff = JSON.stringify(valBefore) !== JSON.stringify(valAfter);

                if (!hasBefore) return null;

                let lineClass = "py-0.5 flex flex-wrap";
                let textClass = "text-slate-400";
                if (isDiff || !hasAfter) {
                  lineClass = "py-0.5 flex flex-wrap bg-rose-950/20 -mx-4 px-4 border-l-2 border-rose-500";
                  textClass = "text-rose-400 font-semibold";
                }

                return (
                  <div key={`before-${key}`} className={lineClass}>
                    <span className="text-slate-600 select-none mr-3 w-5 text-right font-sans text-[9px]">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className="text-sky-400">"{key}"</span>
                    <span className="text-slate-400">: </span>
                    <span className={`${textClass} ml-1`}>{JSON.stringify(valBefore)}</span>
                    {i < keys.length - 1 ? <span className="text-slate-500">,</span> : ""}
                  </div>
                );
              })}
              {"}"}
            </pre>
          </div>
        </div>

        {/* Right column: After state */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[9px] font-mono">
            <span className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/55 animate-ping" />
              Estado Atual (Post-State)
            </span>
            <span className="text-slate-600">SÉRIE CONFIRMADA</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-850 rounded-lg p-4 overflow-x-auto max-h-[320px] font-mono text-[10.5px] leading-relaxed scrollbar-thin text-left">
            <pre className="text-slate-400 font-mono">
              {"{\n"}
              {keys.map((key, i) => {
                const hasBefore = key in cleanBefore;
                const hasAfter = key in cleanAfter;
                const valBefore = cleanBefore[key];
                const valAfter = cleanAfter[key];
                const isDiff = JSON.stringify(valBefore) !== JSON.stringify(valAfter);

                if (!hasAfter) return null;

                let lineClass = "py-0.5 flex flex-wrap";
                let textClass = "text-slate-300";
                if (isDiff || !hasBefore) {
                  lineClass = "py-0.5 flex flex-wrap bg-emerald-950/25 -mx-4 px-4 border-l-2 border-emerald-500";
                  textClass = "text-emerald-400 font-semibold";
                }

                return (
                  <div key={`after-${key}`} className={lineClass}>
                    <span className="text-slate-600 select-none mr-3 w-5 text-right font-sans text-[9px]">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className="text-sky-400">"{key}"</span>
                    <span className="text-slate-400">: </span>
                    <span className={`${textClass} ml-1`}>{JSON.stringify(valAfter)}</span>
                    {i < keys.length - 1 ? <span className="text-slate-500">,</span> : ""}
                  </div>
                );
              })}
              {"}"}
            </pre>
          </div>
        </div>
      </div>

      {/* Grid comparing changed key-values in standard high-contrast tabular form */}
      <div className="border-t border-slate-900 pt-3.5 mt-1 text-left">
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-slate-500 uppercase font-bold text-[8.5px] font-mono">
            Tabela de Propriedades Afetadas nesta Ação
          </span>
          <span className="h-1 w-1 bg-slate-700 rounded-full" />
          <span className="text-[8px] text-slate-600">PNAP-DIFF-ANALYSIS</span>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-slate-900 bg-slate-900/25">
          <table className="w-full text-left text-[10px] text-slate-400 font-mono">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-850 text-slate-500 text-[8.5px] uppercase tracking-wider font-bold">
                <th className="px-4 py-2">Atributo Alterado</th>
                <th className="px-4 py-2">Estado Anterior (De)</th>
                <th className="px-4 py-2">Estado Seguinte (Para)</th>
                <th className="px-4 py-2 text-right">Classificação do Impacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {(() => {
                const diffList = [];
                for (const key of keys) {
                  const hasB = key in cleanBefore;
                  const hasA = key in cleanAfter;
                  const bVal = cleanBefore[key];
                  const aVal = cleanAfter[key];
                  
                  if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
                    diffList.push({
                      key,
                      before: hasB ? bVal : undefined,
                      after: hasA ? aVal : undefined
                    });
                  }
                }

                if (diffList.length === 0) {
                  return (
                    <tr>
                      <td colSpan={4} className="px-4 py-3.5 text-center text-slate-500 italic">
                        Não existem diferenças estruturais de atributos entre os estados.
                      </td>
                    </tr>
                  );
                }

                return diffList.map((item) => {
                  let badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  let actionText = "MODIFICADO";
                  if (item.before === undefined) {
                    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                    actionText = "ADICIONADO";
                  } else if (item.after === undefined) {
                    badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                    actionText = "REMOVIDO";
                  }

                  return (
                    <tr key={item.key} className="hover:bg-slate-950/40 transition">
                      <td className="px-4 py-2 font-bold text-slate-300 border-r border-slate-900/40">{item.key}</td>
                      <td className="px-4 py-2 text-rose-400 break-all max-w-[240px] border-r border-slate-900/40">
                        {item.before === undefined ? (
                          <span className="text-slate-600 italic text-[9px]">Não Definido</span>
                        ) : typeof item.before === "object" ? (
                          JSON.stringify(item.before)
                        ) : (
                          String(item.before)
                        )}
                      </td>
                      <td className="px-4 py-2 text-emerald-400 break-all max-w-[240px] border-r border-slate-900/40">
                        {item.after === undefined ? (
                          <span className="text-slate-600 italic text-[9px]">Removido</span>
                        ) : typeof item.after === "object" ? (
                          JSON.stringify(item.after)
                        ) : (
                          String(item.after)
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${badgeColor}`}>
                          {actionText}
                        </span>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
