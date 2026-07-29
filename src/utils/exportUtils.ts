import { Delegation } from "../types";

/**
 * Escapes fields for CSV format
 */
function escapeCSV(val: string | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates and downloads a CSV file containing all delegations
 */
export function exportDelegationsToCSV(delegations: Delegation[], operators: any[]) {
  const headers = [
    "ID Portaria",
    "Delegante",
    "NIP Delegante",
    "Delegado",
    "NIP Delegado",
    "Competencia",
    "Data Inicio",
    "Hora Inicio",
    "Data Fim",
    "Hora Fim",
    "Estado",
    "Motivo Justificativo",
    "Hash Criptografico",
    "Assinatura Cripto Delegante",
    "Assinatura Cripto Delegado"
  ];

  const rows = delegations.map(del => {
    const delegatorObj = operators.find(o => o.id === del.delegatorId);
    const delegateeObj = operators.find(o => o.id === del.delegateeId);

    const delegatorName = delegatorObj ? delegatorObj.name : "Direccao Geral";
    const delegateeName = delegateeObj ? delegateeObj.name : "Oficial Designado";

    let roleLabel = del.roleId;
    if (del.roleId === "PROVINCIAL_DIRECTOR") roleLabel = "Director Provincial";
    else if (del.roleId === "PRISON_DIRECTOR") roleLabel = "Director de Cadeia";
    else if (del.roleId === "CHEFE_SEGURANCA") roleLabel = "Chefe de Seguranca";
    else if (del.roleId === "CHEFE_SAUDE") roleLabel = "Chefe de Saude";

    let stateLabel: string = del.status;
    if (del.status === "ACTIVE") stateLabel = "ATIVA";
    else if (del.status === "REVOKED") stateLabel = "REVOGADA";
    else if (del.status === "SCHEDULED") stateLabel = "AGENDADA";
    else if (del.status === "EXPIRED") stateLabel = "EXPIRADA";

    return [
      del.id,
      delegatorName,
      del.delegatorId,
      delegateeName,
      del.delegateeId,
      roleLabel,
      del.startDate,
      del.startTime || "00:00",
      del.endDate,
      del.endTime || "23:59",
      stateLabel,
      del.reason,
      del.auditHash,
      del.delegatorSignature || "",
      del.delegateeSignature || ""
    ];
  });

  const csvContent = "\uFEFF" + [
    headers.join(","),
    ...rows.map(row => row.map(escapeCSV).join(","))
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute("download", `Auditoria_Delegacoes_${dateStr}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a styled Excel (.xls) file containing all delegations
 */
export function exportDelegationsToExcel(delegations: Delegation[], operators: any[], auditorName: string) {
  const dateStr = new Date().toISOString().split("T")[0];
  const timeStr = new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });

  let tableRowsHtml = "";
  delegations.forEach((del, idx) => {
    const delegatorObj = operators.find(o => o.id === del.delegatorId);
    const delegateeObj = operators.find(o => o.id === del.delegateeId);

    const delegatorName = delegatorObj ? delegatorObj.name : "Direccao Geral";
    const delegateeName = delegateeObj ? delegateeObj.name : "Oficial Designado";

    let roleLabel = del.roleId;
    if (del.roleId === "PROVINCIAL_DIRECTOR") roleLabel = "Director Provincial";
    else if (del.roleId === "PRISON_DIRECTOR") roleLabel = "Director de Cadeia";
    else if (del.roleId === "CHEFE_SEGURANCA") roleLabel = "Chefe de Seguranca";
    else if (del.roleId === "CHEFE_SAUDE") roleLabel = "Chefe de Saude";

    let stateLabel: string = del.status;
    let statusClass = "status-expired";
    if (del.status === "ACTIVE") { stateLabel = "ATIVA"; statusClass = "status-active"; }
    else if (del.status === "REVOKED") { stateLabel = "REVOGADA"; statusClass = "status-revoked"; }
    else if (del.status === "SCHEDULED") { stateLabel = "AGENDADA"; statusClass = "status-scheduled"; }
    else if (del.status === "EXPIRED") { stateLabel = "EXPIRADA"; statusClass = "status-expired"; }

    const isZebra = idx % 2 === 0 ? "style='background-color:#f8fafc;'" : "";

    tableRowsHtml += `
      <tr ${isZebra}>
        <td style="font-family:monospace;font-weight:bold;color:#b45309;">${del.id}</td>
        <td>${delegatorName} <span style="font-size:8pt;color:#64748b;">(NIP ${del.delegatorId})</span></td>
        <td>${delegateeName} <span style="font-size:8pt;color:#64748b;">(NIP ${del.delegateeId})</span></td>
        <td style="font-weight:500;">${roleLabel}</td>
        <td style="font-family:monospace;text-align:center;">${del.startDate} ${del.startTime || "00:00"}</td>
        <td style="font-family:monospace;text-align:center;">${del.endDate} ${del.endTime || "23:59"}</td>
        <td class="${statusClass}" style="text-align:center;">${stateLabel}</td>
        <td style="font-size:8.5pt;color:#475569;max-width:300px;word-wrap:break-word;">${del.reason}</td>
        <td style="font-family:monospace;font-size:8pt;color:#64748b;">${del.auditHash.substring(0, 16)}...</td>
      </tr>
    `;
  });

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Delegacoes NREP</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; margin-top: 10px; width: 100%; }
        th { background-color: #0f172a; color: #ffffff; font-family: sans-serif; font-size: 9.5pt; font-weight: bold; padding: 8px 6px; border: 1px solid #334155; text-align: left; }
        td { font-family: sans-serif; font-size: 9pt; padding: 7px 6px; border: 1px solid #cbd5e1; }
        .title-cell { font-family: sans-serif; font-size: 14pt; font-weight: bold; color: #1e293b; text-align: center; }
        .subtitle-cell { font-family: sans-serif; font-size: 9.5pt; font-style: italic; color: #475569; text-align: center; }
        .meta-label { font-family: sans-serif; font-size: 8.5pt; font-weight: bold; color: #475569; background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px; }
        .meta-value { font-family: sans-serif; font-size: 8.5pt; color: #0f172a; border: 1px solid #cbd5e1; padding: 4px; }
        .status-active { color: #10b981; font-weight: bold; background-color: #ecfdf5; }
        .status-revoked { color: #f43f5e; font-weight: bold; background-color: #fff1f2; }
        .status-scheduled { color: #0ea5e9; font-weight: bold; background-color: #f0f9ff; }
        .status-expired { color: #64748b; font-weight: bold; background-color: #f8fafc; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="9" class="title-cell" style="border:none;">REPÚBLICA DE ANGOLA</td>
        </tr>
        <tr>
          <td colspan="9" class="subtitle-cell" style="border:none;font-weight:bold;">MINISTÉRIO DO INTERIOR | SERVIÇO PENITENCIÁRIO NACIONAL</td>
        </tr>
        <tr>
          <td colspan="9" class="subtitle-cell" style="border:none;padding-bottom:15px;">Registo de Auditoria de Atos Administrativos e Outorgas de Poderes (PNAP-AO)</td>
        </tr>
        
        <tr>
          <td class="meta-label" colspan="2">Entidade de Inspeção:</td>
          <td class="meta-value" colspan="3">Serviço Penitenciário Nacional - Direcção Geral</td>
          <td class="meta-label" colspan="2">Data de Exportação:</td>
          <td class="meta-value" colspan="2">${dateStr} ${timeStr}</td>
        </tr>
        <tr>
          <td class="meta-label" colspan="2">Operador Auditor NREP:</td>
          <td class="meta-value" colspan="3">${auditorName}</td>
          <td class="meta-label" colspan="2">Total de Registos:</td>
          <td class="meta-value" colspan="2" style="font-weight:bold;color:#b45309;">${delegations.length} Atos Regulados</td>
        </tr>
        
        <tr><td colspan="9" style="border:none;height:10px;"></td></tr>

        <thead>
          <tr>
            <th style="width:110px;">ID Portaria</th>
            <th style="width:180px;">Autoridade Outorgante (Delegante)</th>
            <th style="width:180px;">Oficial Beneficiário (Delegado)</th>
            <th style="width:150px;">Competência Outorgada</th>
            <th style="width:130px;text-align:center;">Início Vigência</th>
            <th style="width:130px;text-align:center;">Termo Vigência</th>
            <th style="width:100px;text-align:center;">Estado Legal</th>
            <th style="width:250px;">Motivo e Enquadramento</th>
            <th style="width:150px;">Hash de Auditoria</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Registo_Forense_Delegacoes_${dateStr}.xls`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
