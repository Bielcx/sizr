import type { SizrConfig } from './src/types/config';
import { caixa, copo, envelope, painel, prateleira } from './presets.ts';

/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  SIZR — este é o único arquivo que você precisa editar.         │
 * │  Troque os valores abaixo pelos da sua empresa, rode            │
 * │  `npm run build` e suba a pasta dist/. Não tem backend,         │
 * │  não tem banco, não tem mensalidade.                            │
 * └─────────────────────────────────────────────────────────────────┘
 */
export const sizrConfig: SizrConfig = {
  /* ── 1. Sua marca ────────────────────────────────────────────────
     As cores viram variáveis CSS automaticamente. Aceita qualquer
     formato que o CSS entenda: hex, rgb(), oklch(). */
  marca: {
    nome: 'Sua Empresa',

    corPrimaria: '#4df98a', // botões, sliders, destaques
    corPrimariaHover: '#86ffb5', // o mesmo tom, um pouco mais claro
    corAcento: '#4df98a', // linhas do modelo 3D

    corFundo: '#07090d', // fundo da página
    corSuperficie: '#10141c', // fundo do painel de controles
    corBorda: '#232a36',

    corTexto: '#f5f7fb',
    corTextoSuave: '#b3bac6',
    corTextoFraco: '#8c95a6',

    corViewport: '#0a0d12', // fundo da área 3D

    fonteTitulo: "'Chakra Petch', system-ui, sans-serif",
    fonteCorpo: "'Instrument Sans', system-ui, sans-serif",
  },

  /* ── 1b. Quantidade ──────────────────────────────────────────────
     Ninguém encomenda uma peça só. Com este bloco o pedido chega com a
     quantidade e a estimativa vira o total. Apague para esconder o
     campo. */
  quantidade: {
    label: 'Quantidade',
    min: 1,
    max: 5000,
    padrao: 100,
  },

  /* ── 2. Unidade das medidas ──────────────────────────────────────
     Aparece em toda a interface e na mensagem do WhatsApp. */
  unidade: 'cm',

  /* ── 3. WhatsApp ─────────────────────────────────────────────────
     numero: só dígitos, com código do país. 55 + DDD + número.
     mensagem: veja os placeholders disponíveis em src/types/config.ts */
  whatsapp: {
    numero: '5511999999999',
    mensagem: [
      'Olá! Quero um orçamento de {formato}:',
      '',
      '{lista}',
      'Quantidade: {quantidade}',
      '',
      'Volume aprox.: {volume}',
      'Estimativa: {preco}',
      '',
      'Ver a configuração: {link}',
      '',
      '(Medidas de referência — posso ajustar conforme a produção.)',
    ].join('\n'),
  },

  /* ── 4. Formatos e faixas de medida ──────────────────────────────
     Cada formato vira um botão no topo do painel. Marque
     `disponivel: false` para mostrar um formato como "em breve"
     sem removê-lo da interface — funciona bem como prova de que
     tem mais coisa vindo.

     As faixas (min/max) são o limite real da sua produção. Se você
     não corta caixa acima de 60 cm, o cliente não consegue pedir. */
  formatos: [
    /* Escolhidos da biblioteca em presets.ts — abra lá para ver a lista
       inteira (vidro, espelho, box, bancada, placa, estojo, pote, tubo…)
       e troque estes pelos produtos que VOCÊ vende. As faixas são de
       mercado, não as suas: ajuste antes de publicar. */
    caixa,
    painel,
    prateleira,
    envelope,
    copo,
  ],

  /* ── 5. Ficha de resumo ──────────────────────────────────────────
     O volume é o produto de todas as dimensões dividido pelo
     divisorVolume. Em centímetros, 1000 converte cm³ para litros.
     Se seu produto é plano (adesivo, placa), deixe mostrarVolume
     como false. */
  resumo: {
    rotulo: 'Seu produto',
    mostrarVolume: true,
    rotuloVolume: 'Volume aprox.',
    divisorVolume: 1000,
    unidadeVolume: 'L',

    /* Estimativa de preco ao vivo. Comentada: sem ela o configurador nao
       fala de preco, que e o comportamento do plano gratuito.

       A conta e: (produto de todas as dimensoes / divisor) x valor, com
       piso no minimo. Numa caixa em cm com divisor 1000 isso da litros,
       entao `valor` e o preco por litro. Num formato plano de duas
       dimensoes, divisor 10000 da m2 e `valor` vira o preco por metro
       quadrado — a mesma formula serve as duas geometrias. */
    // preco: {
    //   valor: 34.9,
    //   divisor: 1000,
    //   minimo: 45,
    //   rotulo: 'Estimativa',
    //   observacao: 'Valor de referencia pelas medidas. O orcamento final e confirmado por voce.',
    // },
  },

  /* ── 6. Textos da interface ──────────────────────────────────── */
  textos: {
    tituloFormato: 'Formato',
    ctaWhatsApp: 'Pedir orçamento no WhatsApp',
    aviso: 'Medidas de referência — a produção confirma os limites exatos com você.',
    dicaViewport: 'Arraste para girar · Scroll para zoom',
    etiquetaEmBreve: 'em breve',

    /* Uma linha discreta depois dos formatos, dizendo que a lista cresce.
       Apague para não mostrar nada. Um formato com `disponivel: false`
       continua funcionando se você quiser anunciar um produto específico
       — mas uma fila de botões cinzas faz o configurador parecer mais
       indisponível do que disponível. */
    maisFormatos: '+ mais formatos em breve',
  },
};
