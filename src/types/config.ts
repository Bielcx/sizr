/**
 * Tipos do sizr.config.ts.
 * Você não precisa mexer aqui para configurar o Sizr — edite o sizr.config.ts
 * na raiz do projeto. Este arquivo só existe para o editor te dar autocomplete
 * e avisar quando algo estiver fora do formato esperado.
 */

/** Eixo da cena 3D que a dimensão controla. y é sempre a vertical. */
export type Eixo = 'x' | 'y' | 'z';

/**
 * Geometrias 3D que acompanham o Sizr.
 *
 *   caixa    corpo + 4 abas. Embalagem, papelão, estojo.
 *   plano    peça plana em pé. Vidro, espelho, placa, chapa, tampo.
 *   cilindro copo, pote, tubo, lata, vaso.
 *
 * Elas são paramétricas: quem define o produto são as dimensões do
 * formato, não a geometria. Um painel de MDF e um espelho usam o mesmo
 * `plano` com faixas diferentes.
 */
export type Modelo3D = 'caixa' | 'plano' | 'cilindro';

export interface Dimensao {
  /** Identificador usado nos placeholders da mensagem. Ex.: {comprimento} */
  id: string;
  /** Abreviação mostrada no canto do viewport 3D. Ex.: 'C' */
  sigla: string;
  /** Nome que aparece ao lado do slider. */
  label: string;
  /** Qual eixo do modelo essa medida escala. */
  eixo: Eixo;
  min: number;
  max: number;
  /** Incremento do slider. Use 0.5 se seu produto aceita meia unidade. */
  passo: number;
  /** Valor com que o configurador abre. */
  padrao: number;
}

export interface Formato {
  id: string;
  nome: string;
  /** Geometria renderizada no viewport. */
  modelo: Modelo3D;
  /** false deixa o botão desabilitado com a etiqueta de "em breve". */
  disponivel: boolean;
  dimensoes: Dimensao[];
  /**
   * Só para modelo 'caixa': ângulo de abertura das abas em graus.
   * 0 = caixa fechada, 115 = abas abertas para fora.
   */
  aberturaAbas?: number;
  /**
   * Sobrescreve o resumo global só neste formato. Existe porque a mesma
   * página pode ter uma caixa medida em litros e um vidro medido em m² —
   * "Volume aprox. 4,2 L" num espelho não diz nada a ninguém.
   */
  resumo?: Partial<
    Pick<ResumoConfig, 'mostrarVolume' | 'rotuloVolume' | 'divisorVolume' | 'unidadeVolume' | 'preco'>
  >;
}

export interface Marca {
  nome: string;
  corPrimaria: string;
  corPrimariaHover: string;
  corAcento: string;
  corFundo: string;
  corSuperficie: string;
  corBorda: string;
  corTexto: string;
  corTextoSuave: string;
  corTextoFraco: string;
  corViewport: string;
  fonteTitulo: string;
  fonteCorpo: string;
}

export interface WhatsAppConfig {
  /** Só dígitos, em formato internacional: 55 + DDD + número. */
  numero: string;
  /**
   * Mensagem pré-preenchida. Placeholders disponíveis:
   *   {marca}    nome da sua empresa
   *   {formato}  nome do formato escolhido (ex.: Caixa)
   *   {medidas}  medidas em linha (ex.: 28 × 22 × 9 cm)
   *   {lista}    uma medida por linha (ex.: Comprimento: 28 cm)
   *   {volume}   volume calculado (ex.: 5,5 L)
   *   {preco}    estimativa de preço (ex.: R$ 138,60), vazio se desligada
   *   {quantidade}  quantidade pedida (ex.: 100), vazio se o campo não existe
   *   {link}     endereço que reabre exatamente esta configuração
   *   {id-da-dimensao}  valor cru de uma medida específica (ex.: {altura})
   */
  mensagem: string;
}

export interface PrecoConfig {
  /**
   * Preço da unidade resultante. O configurador multiplica todas as
   * dimensões do formato, divide pelo `divisor` e multiplica por isto.
   *
   * A fórmula se adapta sozinha à geometria: numa caixa (3 dimensões em
   * cm) `divisor: 1000` dá litros, e `valor` é o preço por litro. Num
   * formato plano (2 dimensões em cm) `divisor: 10000` dá m², e `valor`
   * vira o preço por metro quadrado.
   */
  valor: number;
  divisor: number;
  /** Piso do orçamento. Peça pequena não sai mais barata que isto. */
  minimo?: number;
  rotulo: string;
  /** Linha de ressalva embaixo do preço. Deixe claro que é estimativa. */
  observacao: string;
}

export interface QuantidadeConfig {
  label: string;
  min: number;
  max: number;
  padrao: number;
}

export interface ResumoConfig {
  rotulo: string;
  mostrarVolume: boolean;
  rotuloVolume: string;
  /** Produto das dimensões dividido por isto. cm³ → litros = 1000. */
  divisorVolume: number;
  unidadeVolume: string;
  /** Sem isto o configurador não fala de preço — é o padrão. */
  preco?: PrecoConfig;
}

export interface Textos {
  tituloFormato: string;
  ctaWhatsApp: string;
  aviso: string;
  dicaViewport: string;
  etiquetaEmBreve: string;
  /** Linha discreta depois dos formatos. Omita para não mostrar nada. */
  maisFormatos?: string;
}

export interface SizrConfig {
  marca: Marca;
  /**
   * Campo de quantidade. Sem isto o pedido chega sem dizer quantas peças
   * — e ninguém encomenda uma caixa só. Quando existe, a estimativa de
   * preço passa a ser o total.
   */
  quantidade?: QuantidadeConfig;
  /** Unidade das medidas, usada em toda a interface. Ex.: 'cm', 'mm', 'm'. */
  unidade: string;
  whatsapp: WhatsAppConfig;
  formatos: Formato[];
  resumo: ResumoConfig;
  textos: Textos;
}
