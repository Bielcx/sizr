import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Formato, SizrConfig } from '../types/config';
import { formatarMedida, formatarNumero, formatarReal } from '../lib/formato';
import { linkWhatsApp, montarMensagem } from '../lib/whatsapp';
import { medidaDerivada, type Medidas } from '../lib/medidas';

export type { Medidas };

/** O que a URL consegue restaurar de uma configuração já montada. */
export interface EstadoInicial {
  formatoId?: string;
  medidas?: Medidas;
  quantidade?: number;
}

function medidasPadrao(formato: Formato): Medidas {
  return Object.fromEntries(formato.dimensoes.map((d) => [d.id, d.padrao]));
}

/**
 * Todo o estado do configurador. Fica num hook só para que o painel de
 * controles e a cena 3D leiam exatamente os mesmos números — o viewport
 * nunca calcula nada por conta própria.
 */
export function useConfigurador(config: SizrConfig, inicial: EstadoInicial = {}) {
  const formatos = config.formatos;

  const formatoInicial = useMemo(
    () => formatos.find((f) => f.disponivel && f.dimensoes.length > 0) ?? formatos[0],
    [formatos],
  );

  const [formatoId, setFormatoId] = useState(
    () => formatos.find((f) => f.id === inicial.formatoId)?.id ?? formatoInicial.id,
  );

  const [quantidade, setQuantidade] = useState(
    () => inicial.quantidade ?? config.quantidade?.padrao ?? 1,
  );

  // Guardamos as medidas por formato: trocar de formato e voltar não perde
  // o que o cliente já tinha ajustado.
  // As medidas que vieram na URL entram por cima das padrão, só nos ids
  // que aquele formato realmente tem — link velho com dimensão que não
  // existe mais não quebra o configurador.
  const [medidasPorFormato, setMedidasPorFormato] = useState<Record<string, Medidas>>(() =>
    Object.fromEntries(
      formatos.map((f) => {
        const padrao = medidasPadrao(f);
        if (f.id !== inicial.formatoId || !inicial.medidas) return [f.id, padrao];
        const daUrl = Object.fromEntries(
          Object.entries(inicial.medidas).filter(([id]) => id in padrao),
        );
        return [f.id, { ...padrao, ...daUrl }];
      }),
    ),
  );

  const formato = formatos.find((f) => f.id === formatoId) ?? formatoInicial;
  const medidas = medidasPorFormato[formato.id] ?? medidasPadrao(formato);

  const ajustarMedida = useCallback(
    (dimensaoId: string, valor: number) => {
      setMedidasPorFormato((anterior) => ({
        ...anterior,
        [formato.id]: { ...anterior[formato.id], [dimensaoId]: valor },
      }));
    },
    [formato.id],
  );

  const resetar = useCallback(() => {
    setMedidasPorFormato((anterior) => ({ ...anterior, [formato.id]: medidasPadrao(formato) }));
  }, [formato]);

  /** "28 × 22 × 9 cm" */
  const resumoMedidas = useMemo(() => {
    const numeros = formato.dimensoes.map((d) => formatarNumero(medidas[d.id] ?? d.padrao, 0));
    return numeros.length ? `${numeros.join(' × ')} ${config.unidade}` : '—';
  }, [formato, medidas, config.unidade]);

  // Resumo efetivo: o formato pode sobrescrever o global. Uma caixa em
  // litros e um vidro em m² convivem na mesma página assim.
  const resumo = { ...config.resumo, ...formato.resumo };

  // A conta em si vive em lib/medidas.ts, onde dá para testar sem React.
  const produto = useMemo(() => medidaDerivada(formato, medidas), [formato, medidas]);

  /** Volume aproximado, ou null quando desligado no config. */
  const volume =
    produto === null || !resumo.mostrarVolume ? null : produto / resumo.divisorVolume;

  const volumeFormatado =
    volume === null ? null : `${formatarNumero(volume, 1)} ${resumo.unidadeVolume}`;

  /**
   * Estimativa de preço, ou null quando o config não define preço.
   * O mínimo vale por peça: um pedido de 100 unidades pequenas não pode
   * cair para o piso de uma só.
   */
  const preco = resumo.preco;
  const precoUnitario =
    preco === undefined || produto === null
      ? null
      : Math.max((produto / preco.divisor) * preco.valor, preco.minimo ?? 0);

  const precoFormatado = precoUnitario === null ? null : formatarReal(precoUnitario * quantidade);

  /**
   * Endereço que reabre exatamente esta configuração. Preserva os
   * parâmetros do embed (WhatsApp, cor, faixas) e acrescenta o estado —
   * é assim que a loja confere o que o cliente montou em vez de tentar
   * remontar pelas medidas escritas na mensagem.
   */
  const linkConfiguracao = useMemo(() => {
    if (typeof window === 'undefined') return '';

    const url = new URL(window.location.href);
    url.searchParams.set('f', formato.id);
    url.searchParams.set(
      'm',
      formato.dimensoes.map((d) => `${d.id}:${medidas[d.id] ?? d.padrao}`).join(','),
    );
    if (config.quantidade) url.searchParams.set('q', String(quantidade));
    return url.toString();
  }, [formato, medidas, quantidade, config.quantidade]);

  // Mantém a barra de endereço em dia: recarregar não perde o que já foi
  // ajustado, e copiar a URL copia a configuração.
  useEffect(() => {
    if (typeof window === 'undefined' || !linkConfiguracao) return;
    window.history.replaceState(null, '', linkConfiguracao);
  }, [linkConfiguracao]);

  const href = useMemo(() => {
    const lista = formato.dimensoes
      .map((d) => `${d.label}: ${formatarMedida(medidas[d.id] ?? d.padrao, config.unidade)}`)
      .join('\n');

    const substituicoes: Record<string, string> = {
      marca: config.marca.nome,
      formato: formato.nome,
      medidas: resumoMedidas,
      lista,
      volume: volumeFormatado ?? '',
      preco: precoFormatado ?? '',
      quantidade: config.quantidade ? String(quantidade) : '',
      link: linkConfiguracao,
      unidade: config.unidade,
    };

    // Cada dimensão também vira placeholder: {comprimento}, {altura}, ...
    for (const d of formato.dimensoes) {
      substituicoes[d.id] = formatarMedida(medidas[d.id] ?? d.padrao, config.unidade);
    }

    return linkWhatsApp(
      config.whatsapp.numero,
      montarMensagem(config.whatsapp.mensagem, substituicoes),
    );
  }, [
    config,
    formato,
    medidas,
    resumoMedidas,
    volumeFormatado,
    precoFormatado,
    quantidade,
    linkConfiguracao,
  ]);

  return {
    formatos,
    formato,
    selecionarFormato: setFormatoId,
    medidas,
    ajustarMedida,
    resetar,
    quantidade,
    ajustarQuantidade: setQuantidade,
    resumoMedidas,
    volumeFormatado,
    rotuloVolume: resumo.rotuloVolume,
    precoFormatado,
    linkConfiguracao,
    precoRotulo: preco?.rotulo ?? null,
    precoObservacao: preco?.observacao ?? null,
    href,
  };
}
