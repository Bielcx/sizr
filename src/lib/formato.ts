/** Formata um número no padrão brasileiro, sem casas decimais desnecessárias. */
export function formatarNumero(valor: number, casas = 1): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: Number.isInteger(valor) && casas === 0 ? 0 : casas,
    maximumFractionDigits: casas,
  });
}

/** Formata uma medida com a unidade. Ex.: 28 → "28 cm" */
export function formatarMedida(valor: number, unidade: string): string {
  return `${formatarNumero(valor, valor % 1 === 0 ? 0 : 1)} ${unidade}`;
}

/** Formata em real. Ex.: 138.6 → "R$ 138,60" */
export function formatarReal(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
