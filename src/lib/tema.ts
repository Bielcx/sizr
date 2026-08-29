import type { Marca } from '../types/config';

/**
 * Copia as cores e fontes do sizr.config.ts para variáveis CSS no <html>.
 * Rodar antes do primeiro render evita que a página pisque com as cores
 * padrão do index.css.
 */
export function aplicarTema(marca: Marca): void {
  const vars: Record<string, string> = {
    '--sizr-marca': marca.corPrimaria,
    '--sizr-marca-hover': marca.corPrimariaHover,
    '--sizr-acento': marca.corAcento,
    '--sizr-fundo': marca.corFundo,
    '--sizr-superficie': marca.corSuperficie,
    '--sizr-borda': marca.corBorda,
    '--sizr-texto': marca.corTexto,
    '--sizr-texto-suave': marca.corTextoSuave,
    '--sizr-texto-fraco': marca.corTextoFraco,
    '--sizr-viewport': marca.corViewport,
    '--sizr-fonte-titulo': marca.fonteTitulo,
    '--sizr-fonte-corpo': marca.fonteCorpo,
  };

  const raiz = document.documentElement;
  for (const [nome, valor] of Object.entries(vars)) {
    raiz.style.setProperty(nome, valor);
  }
}
