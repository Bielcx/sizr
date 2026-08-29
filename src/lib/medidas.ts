import type { Formato } from '../types/config';

/** Estado das medidas de um formato: { comprimento: 28, largura: 22, ... } */
export type Medidas = Record<string, number>;

/**
 * A medida derivada do formato — volume, área ou capacidade. O resumo e o
 * preço saem daqui, então os dois concordam sempre.
 *
 * A conta depende da geometria, e não dá para fingir: num cilindro o
 * produto das medidas dá diâmetro × altura, que não é capacidade nenhuma.
 * Capacidade de cilindro é π·r²·h. Nas outras formas o produto das
 * dimensões resolve: três dimensões dão volume, duas dão área.
 *
 * Devolve null quando o formato não tem medidas suficientes — é o que
 * desliga o volume e o preço em vez de mostrar zero.
 */
export function medidaDerivada(formato: Formato, medidas: Medidas): number | null {
  if (formato.dimensoes.length === 0) return null;

  const valor = (d: Formato['dimensoes'][number]) => medidas[d.id] ?? d.padrao;

  if (formato.modelo === 'cilindro') {
    const diametro = formato.dimensoes.find((d) => d.eixo === 'x');
    const altura = formato.dimensoes.find((d) => d.eixo === 'y');
    if (!diametro || !altura) return null;
    return (Math.PI / 4) * valor(diametro) ** 2 * valor(altura);
  }

  return formato.dimensoes.reduce((acc, d) => acc * valor(d), 1);
}
