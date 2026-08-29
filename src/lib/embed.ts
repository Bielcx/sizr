import type { SizrConfig } from '../types/config';
import type { EstadoInicial } from '../hooks/useConfigurador';

/**
 * Modo embed: o cliente não instala nada, só cola um <iframe> apontando
 * para esta página com os parâmetros dele na URL. É por isso que a
 * configuração precisa caber numa query string — sem build, sem deploy,
 * sem backend do lado dele.
 *
 * ?embed=1&wa=5511999999999&marca=Grafica%20Central&cor=ff6b00
 *         &unidade=cm&faixas=comprimento:15-60,altura:5-30&semmarca=1
 *         &preco=12.90&precomin=80
 */
export interface OpcoesEmbed {
  config: SizrConfig;
  /** Assinatura "feito com Sizr" no rodapé do iframe. */
  mostrarAssinatura: boolean;
}

/** Aceita `ff6b00`, `#ff6b00` ou qualquer cor que o CSS entenda. */
function normalizarCor(valor: string): string {
  return /^[0-9a-f]{3,8}$/i.test(valor) ? `#${valor}` : valor;
}

/**
 * `comprimento:15-60,altura:5-30` → aplica min/max nas dimensões de mesmo
 * id, em todos os formatos. O padrão é recolocado dentro da faixa nova:
 * um slider que abre fora do próprio limite é o bug óbvio aqui.
 */
function aplicarFaixas(config: SizrConfig, faixas: string): SizrConfig {
  const limites = new Map<string, [number, number]>();

  for (const parte of faixas.split(',')) {
    const [id, intervalo] = parte.split(':');
    const [min, max] = (intervalo ?? '').split('-').map(Number);
    if (!id || !Number.isFinite(min) || !Number.isFinite(max) || min >= max) continue;
    limites.set(id.trim(), [min, max]);
  }

  if (limites.size === 0) return config;

  return {
    ...config,
    formatos: config.formatos.map((formato) => ({
      ...formato,
      dimensoes: formato.dimensoes.map((dimensao) => {
        const limite = limites.get(dimensao.id);
        if (!limite) return dimensao;
        const [min, max] = limite;
        return { ...dimensao, min, max, padrao: Math.min(Math.max(dimensao.padrao, min), max) };
      }),
    })),
  };
}

/**
 * `preco` é o valor da unidade que o config já define (litro, m²…) e
 * `precomin` o piso do orçamento. Sem `preco` na URL nem no arquivo, o
 * configurador não fala de preço — é assim que o plano grátis fica.
 */
function aplicarPreco(config: SizrConfig, valorCru: string, minimoCru: string | null): SizrConfig {
  const valor = Number(valorCru.replace(',', '.'));
  if (!Number.isFinite(valor) || valor <= 0) return config;

  const minimo = Number((minimoCru ?? '').replace(',', '.'));
  const anterior = config.resumo.preco;

  return {
    ...config,
    resumo: {
      ...config.resumo,
      preco: {
        divisor: anterior?.divisor ?? config.resumo.divisorVolume,
        rotulo: anterior?.rotulo ?? 'Estimativa',
        observacao:
          anterior?.observacao ??
          'Estimativa automática pelas medidas. O valor final é confirmado no orçamento.',
        ...anterior,
        valor,
        ...(Number.isFinite(minimo) && minimo > 0 ? { minimo } : {}),
      },
    },
  };
}

/**
 * Estado de uma configuração já montada: `?f=caixa&m=comprimento:28,altura:9&q=100`.
 * É o que faz o link do pedido reabrir exatamente o que o cliente viu —
 * medida inválida é ignorada, então link velho degrada para o padrão em
 * vez de quebrar.
 */
export function lerEstadoUrl(busca: string): EstadoInicial {
  const params = new URLSearchParams(busca);

  const medidas: Record<string, number> = {};
  for (const parte of (params.get('m') ?? '').split(',')) {
    const [id, cru] = parte.split(':');
    const valor = Number(cru);
    if (id && Number.isFinite(valor)) medidas[id.trim()] = valor;
  }

  const quantidade = Number(params.get('q'));

  return {
    formatoId: params.get('f')?.trim() || undefined,
    medidas: Object.keys(medidas).length ? medidas : undefined,
    quantidade: Number.isFinite(quantidade) && quantidade > 0 ? quantidade : undefined,
  };
}

export function lerOpcoesEmbed(busca: string, base: SizrConfig): OpcoesEmbed {
  const params = new URLSearchParams(busca);
  const pegar = (chave: string) => params.get(chave)?.trim() || null;

  const cor = pegar('cor');
  const marca = pegar('marca');
  const wa = pegar('wa');
  const unidade = pegar('unidade');
  const faixas = pegar('faixas');
  const precoValor = pegar('preco');

  let config: SizrConfig = {
    ...base,
    unidade: unidade ?? base.unidade,
    marca: {
      ...base.marca,
      nome: marca ?? base.marca.nome,
      ...(cor
        ? {
            corPrimaria: normalizarCor(cor),
            corAcento: normalizarCor(cor),
            // Clarear no hover é trabalho do CSS — evita fazer conta de cor aqui.
            corPrimariaHover: `color-mix(in srgb, ${normalizarCor(cor)} 78%, white)`,
          }
        : {}),
    },
    whatsapp: { ...base.whatsapp, numero: wa ?? base.whatsapp.numero },
  };

  if (faixas) config = aplicarFaixas(config, faixas);
  if (precoValor) config = aplicarPreco(config, precoValor, pegar('precomin'));

  // ponytail: honra-o-cliente. Sem backend não dá para validar licença;
  // quem paga recebe a URL com semmarca=1. Se virar problema, o próximo
  // passo é uma função serverless que assina o parâmetro.
  return { config, mostrarAssinatura: pegar('semmarca') !== '1' };
}
