import type { Formato } from './src/types/config';

/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  BIBLIOTECA DE FORMATOS                                         │
 * │  Copie os que servem para o seu negócio e cole em `formatos`    │
 * │  no sizr.config.ts. Ajuste as faixas para a SUA produção — os   │
 * │  números aqui são de mercado, não são os seus.                  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * São só três geometrias. O que muda de um preset para o outro são as
 * medidas, os limites e a unidade de cobrança — não o código.
 *
 * Uma regra que vale para todos: a medida derivada (volume, área,
 * capacidade) é o produto das dimensões declaradas, exceto no cilindro,
 * que usa π·r²·h. Por isso os presets cobrados por metro quadrado
 * declaram só largura e altura: incluir a espessura como terceira medida
 * transformaria a área em volume e a conta sairia errada. A espessura de
 * vidro e chapa se escolhe por catálogo, não por régua.
 */

const AREA = {
  rotuloVolume: 'Área aprox.',
  divisorVolume: 10000, // cm² → m²
  unidadeVolume: 'm²',
} as const;

const LITROS = {
  rotuloVolume: 'Capacidade',
  divisorVolume: 1000, // cm³ → L
  unidadeVolume: 'L',
} as const;

/* ── Caixas ──────────────────────────────────────────────────────── */

export const caixa: Formato = {
  id: 'caixa',
  nome: 'Caixa',
  modelo: 'caixa',
  disponivel: true,
  aberturaAbas: 115,
  resumo: { rotuloVolume: 'Volume aprox.', divisorVolume: 1000, unidadeVolume: 'L' },
  dimensoes: [
    { id: 'comprimento', sigla: 'C', label: 'Comprimento', eixo: 'x', min: 15, max: 60, passo: 1, padrao: 28 },
    { id: 'largura', sigla: 'L', label: 'Largura', eixo: 'z', min: 10, max: 40, passo: 1, padrao: 22 },
    { id: 'altura', sigla: 'A', label: 'Altura', eixo: 'y', min: 5, max: 30, passo: 1, padrao: 9 },
  ],
};

/** Caixa de envio pequena, tipo mailer. Abas quase fechadas. */
export const estojo: Formato = {
  ...caixa,
  id: 'estojo',
  nome: 'Estojo',
  aberturaAbas: 95,
  dimensoes: [
    { id: 'comprimento', sigla: 'C', label: 'Comprimento', eixo: 'x', min: 8, max: 40, passo: 0.5, padrao: 20 },
    { id: 'largura', sigla: 'L', label: 'Largura', eixo: 'z', min: 6, max: 30, passo: 0.5, padrao: 14 },
    { id: 'altura', sigla: 'A', label: 'Altura', eixo: 'y', min: 2, max: 15, passo: 0.5, padrao: 5 },
  ],
};

/* ── Peças planas ────────────────────────────────────────────────── */

export const vidro: Formato = {
  id: 'vidro',
  nome: 'Vidro',
  modelo: 'plano',
  disponivel: true,
  resumo: AREA,
  dimensoes: [
    { id: 'largura', sigla: 'L', label: 'Largura', eixo: 'x', min: 20, max: 250, passo: 1, padrao: 90 },
    { id: 'altura', sigla: 'A', label: 'Altura', eixo: 'y', min: 20, max: 280, passo: 1, padrao: 180 },
  ],
};

export const espelho: Formato = {
  ...vidro,
  id: 'espelho',
  nome: 'Espelho',
  dimensoes: [
    { id: 'largura', sigla: 'L', label: 'Largura', eixo: 'x', min: 20, max: 200, passo: 1, padrao: 70 },
    { id: 'altura', sigla: 'A', label: 'Altura', eixo: 'y', min: 20, max: 220, passo: 1, padrao: 100 },
  ],
};

/** Box de banheiro: as faixas são as de uma abertura comum de banho. */
export const boxBanheiro: Formato = {
  ...vidro,
  id: 'box',
  nome: 'Box',
  dimensoes: [
    { id: 'largura', sigla: 'L', label: 'Largura do vão', eixo: 'x', min: 60, max: 220, passo: 1, padrao: 120 },
    { id: 'altura', sigla: 'A', label: 'Altura', eixo: 'y', min: 150, max: 220, passo: 1, padrao: 190 },
  ],
};

export const painel: Formato = {
  ...vidro,
  id: 'painel',
  nome: 'Painel',
  dimensoes: [
    { id: 'largura', sigla: 'L', label: 'Largura', eixo: 'x', min: 30, max: 275, passo: 1, padrao: 120 },
    { id: 'altura', sigla: 'A', label: 'Altura', eixo: 'y', min: 30, max: 185, passo: 1, padrao: 180 },
  ],
};

export const prateleira: Formato = {
  ...vidro,
  id: 'prateleira',
  nome: 'Prateleira',
  dimensoes: [
    { id: 'comprimento', sigla: 'C', label: 'Comprimento', eixo: 'x', min: 20, max: 200, passo: 1, padrao: 80 },
    { id: 'profundidade', sigla: 'P', label: 'Profundidade', eixo: 'y', min: 10, max: 60, passo: 1, padrao: 25 },
  ],
};

export const bancada: Formato = {
  ...vidro,
  id: 'bancada',
  nome: 'Bancada',
  dimensoes: [
    { id: 'comprimento', sigla: 'C', label: 'Comprimento', eixo: 'x', min: 60, max: 320, passo: 1, padrao: 180 },
    { id: 'profundidade', sigla: 'P', label: 'Profundidade', eixo: 'y', min: 40, max: 90, passo: 1, padrao: 60 },
  ],
};

export const placa: Formato = {
  ...vidro,
  id: 'placa',
  nome: 'Placa',
  dimensoes: [
    { id: 'largura', sigla: 'L', label: 'Largura', eixo: 'x', min: 10, max: 300, passo: 1, padrao: 60 },
    { id: 'altura', sigla: 'A', label: 'Altura', eixo: 'y', min: 10, max: 200, passo: 1, padrao: 40 },
  ],
};

export const envelope: Formato = {
  ...vidro,
  id: 'envelope',
  nome: 'Envelope',
  dimensoes: [
    { id: 'largura', sigla: 'L', label: 'Largura', eixo: 'x', min: 8, max: 45, passo: 0.5, padrao: 23 },
    { id: 'altura', sigla: 'A', label: 'Altura', eixo: 'y', min: 8, max: 60, passo: 0.5, padrao: 32 },
  ],
};

/* ── Cilindros ───────────────────────────────────────────────────── */

export const copo: Formato = {
  id: 'copo',
  nome: 'Copo',
  modelo: 'cilindro',
  disponivel: true,
  resumo: LITROS,
  dimensoes: [
    { id: 'diametro', sigla: 'D', label: 'Diâmetro', eixo: 'x', min: 4, max: 20, passo: 0.5, padrao: 8 },
    { id: 'altura', sigla: 'A', label: 'Altura', eixo: 'y', min: 5, max: 30, passo: 0.5, padrao: 12 },
  ],
};

export const pote: Formato = {
  ...copo,
  id: 'pote',
  nome: 'Pote',
  dimensoes: [
    { id: 'diametro', sigla: 'D', label: 'Diâmetro', eixo: 'x', min: 4, max: 30, passo: 0.5, padrao: 10 },
    { id: 'altura', sigla: 'A', label: 'Altura', eixo: 'y', min: 3, max: 40, passo: 0.5, padrao: 9 },
  ],
};

export const tubo: Formato = {
  ...copo,
  id: 'tubo',
  nome: 'Tubo',
  dimensoes: [
    { id: 'diametro', sigla: 'D', label: 'Diâmetro', eixo: 'x', min: 3, max: 25, passo: 0.5, padrao: 8 },
    { id: 'altura', sigla: 'A', label: 'Comprimento', eixo: 'y', min: 10, max: 120, passo: 1, padrao: 40 },
  ],
};
