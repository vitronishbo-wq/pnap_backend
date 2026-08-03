/**
 * Utility function to format all prison establishment names into clean, uniform tactical codes.
 * E.g., "Estabelecimento Penitenciário de Viana" -> "EP/Viana"
 *       "Estabelecimento Penitenciário Feminino de Viana" -> "EP/Fem-Viana"
 *       "Estabelecimento Penitenciário Feminino de Benguela" -> "EP/Fem-Benguela"
 *       "Cadeia Central do Huambo" -> "EP/Huambo"
 */
export function formatEPName(name: string): string {
  if (!name) return "EP/N/A";
  const clean = name.trim();

  // Custom exact mappings for explicit precision
  if (clean.includes("Feminino de Viana") || clean.includes("Feminino Luanda") || clean.includes("Feminino Viana")) return "EP/Fem-Viana";
  if (clean.includes("Feminino de Benguela") || clean.includes("Feminino Benguela")) return "EP/Fem-Benguela";
  if (clean.includes("Feminino do Huambo") || clean.includes("Feminino Huambo")) return "EP/Fem-Huambo";
  if (clean.includes("Viana")) return "EP/Viana";
  if (clean.includes("Kakila")) return "EP/Kakila";
  if (clean.includes("Sanza Pombo")) return "EP/SanzaPombo";
  if (clean.includes("Bailundo")) return "EP/Bailundo";
  if (clean.includes("Caála") || clean.includes("Caala")) return "EP/Caála";
  if (clean.includes("Benguela")) return "EP/Benguela";
  if (clean.includes("Lubango")) return "EP/Lubango";
  if (clean.includes("Cabinda")) return "EP/Cabinda";
  if (clean.includes("Bié") || clean.includes("Bie")) return "EP/Bié";
  if (clean.includes("Bengo")) return "EP/Bengo";
  if (clean.includes("Menongue")) return "EP/Menongue";
  if (clean.includes("Ndalatando")) return "EP/Ndalatando";
  if (clean.includes("Sumbe")) return "EP/Sumbe";
  if (clean.includes("Ondjiva")) return "EP/Ondjiva";
  if (clean.includes("Dundo")) return "EP/Dundo";
  if (clean.includes("Saurimo")) return "EP/Saurimo";
  if (clean.includes("Malanje")) return "EP/Malanje";
  if (clean.includes("Luena")) return "EP/Luena";
  if (clean.includes("Moçâmedes") || clean.includes("Mocamedes")) return "EP/Moçâmedes";
  if (clean.includes("Mbanza")) return "EP/MbanzaKongo";
  if (clean.includes("Cazombo")) return "EP/Cazombo";
  if (clean.includes("Catete")) return "EP/Catete";
  if (clean.includes("Huambo")) return "EP/Huambo";

  // General fallback replacement
  let formatted = clean
    .replace(/^Estabelecimento Penitenciário (Feminino )?(de |do |da )?/i, "EP/")
    .replace(/^Cadeia Central (do |de |da )?/i, "EP/")
    .replace(/^Cadeia (do |de |da )?/i, "EP/")
    .replace(/^EP /i, "EP/");

  if (!formatted.startsWith("EP/")) {
    formatted = "EP/" + formatted;
  }
  return formatted;
}
