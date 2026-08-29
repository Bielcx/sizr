import { useState } from 'react';
import type { SizrConfig } from '../types/config';
import { lerOpcoesEmbed } from '../lib/embed';
import { Configurador } from './Configurador';

interface Props {
  /** Endereço onde este build está publicado. Vai no src do iframe. */
  site: string;
  /** De onde saem as dimensões e os valores iniciais das faixas. */
  config: SizrConfig;
  /** O mesmo config com preço por formato, para a amostra do Pro. */
  configComPreco: SizrConfig;
  /** Para onde vai quem clicar na amostra de preço, que é do Pro. */
  linkPro: string;
}

/* `exemplo` é placeholder, não valor: campo já preenchido obriga a apagar
   antes de digitar. Vazio, o gerador cai no mesmo exemplo — a prévia
   continua funcionando enquanto a pessoa não preencheu. */
const campos = [
  { id: 'wa', label: 'Seu WhatsApp', dica: 'país + DDD + número', exemplo: '5511999999999' },
  { id: 'marca', label: 'Nome da empresa', dica: 'aparece na mensagem', exemplo: 'Sua Empresa' },
  { id: 'cor', label: 'Cor principal', dica: 'hex, sem #', exemplo: '4df98a' },
] as const;

type Valores = Record<(typeof campos)[number]['id'], string>;
type Faixa = { id: string; label: string; min: string; max: string };

const entrada =
  'w-full rounded-lg border border-borda bg-fundo px-3 py-2.5 text-[14px] text-texto outline-none focus:border-marca';
const rotulo =
  'font-display text-[11px] font-bold tracking-[0.14em] text-texto-fraco uppercase';

/**
 * Demonstração e gerador no mesmo bloco, nesta ordem: o visitante arrasta
 * primeiro, preenche depois, copia por último. Um configurador só na
 * página — o de cima É a prévia, alimentado pelos campos de baixo.
 *
 * As faixas estão aqui porque são o argumento central do produto — o
 * cliente não consegue pedir o que você não fabrica — e ficavam
 * invisíveis enquanto só existiam na URL.
 */
export function GeradorEmbed({ site, config, configComPreco, linkPro }: Props) {
  const [valores, setValores] = useState<Valores>(
    () => Object.fromEntries(campos.map((c) => [c.id, ''])) as Valores,
  );

  const [faixas, setFaixas] = useState<Faixa[]>(() =>
    (config.formatos.find((f) => f.dimensoes.length > 0)?.dimensoes ?? []).map((d) => ({
      id: d.id,
      label: d.label,
      min: String(d.min),
      max: String(d.max),
    })),
  );

  const [copiado, setCopiado] = useState(false);
  const [comPreco, setComPreco] = useState(false);

  function ajustarFaixa(id: string, campo: 'min' | 'max', valor: string) {
    setFaixas((atual) => atual.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)));
  }

  // Faixa incompleta ou invertida sai da URL em vez de virar um slider
  // quebrado no site de quem colou.
  const faixasValidas = faixas.filter(
    (f) => Number(f.min) < Number(f.max) && f.min !== '' && f.max !== '',
  );

  const query = [
    'embed=1',
    `wa=${encodeURIComponent(valores.wa.replace(/\D/g, '') || '5511999999999')}`,
    `marca=${encodeURIComponent(valores.marca || 'Sua Empresa')}`,
    `cor=${encodeURIComponent(valores.cor.replace(/^#/, '') || '4df98a')}`,
    faixasValidas.length
      ? `faixas=${faixasValidas.map((f) => `${f.id}:${f.min}-${f.max}`).join(',')}`
      : null,
  ]
    .filter(Boolean)
    .join('&');

  // A prévia é a própria URL aplicada: em vez de reconstruir o config na
  // mão, passa pelo mesmo leitor que o embed usa. O que aparece aqui é,
  // por construção, o que vai aparecer no site de quem colar.
  const configPrevia = lerOpcoesEmbed(query, comPreco ? configComPreco : config).config;

  /*
   * O <script> existe porque altura fixa quebra no celular: lá o
   * configurador empilha e passa de 900px. O iframe avisa a altura real e
   * a página só aplica. A checagem de origem impede que outro iframe da
   * página do cliente redimensione este.
   */
  const snippet = `<iframe id="sizr" src="${site}/?${query}"
  width="100%" height="620" style="border:0;border-radius:12px"
  title="Monte seu produto sob medida"></iframe>
<script>
  addEventListener('message', function (e) {
    if (e.origin !== '${site}' || !e.data || !e.data.sizr) return;
    document.getElementById('sizr').height = e.data.sizr;
  });
</script>`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sem permissão de clipboard o texto continua visível e selecionável.
      // Não vale um fallback com textarea escondida.
      setCopiado(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Um configurador só na página, e ele vem primeiro: o produto se
          vende sendo tocado, não lido. Os campos abaixo o transformam no
          da pessoa. */}
      <div className="rounded-[18px] shadow-[0_30px_70px_rgb(0_0_0/0.4)]">
        <Configurador config={configPrevia} />
      </div>

      {/* Os campos ficam fechados: quem chega quer ver a peça girando, não
          preencher formulário. Quem decidiu levar abre e leva. `details`
          nativo — um acordeão em React aqui seria estado à toa. */}
      <details id="gerar" className="group scroll-mt-20 rounded-[18px] border border-borda bg-superficie/60 open:p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 group-open:px-0 group-open:pt-0">
          <span>
            <span className="font-display text-[15px] font-semibold">
              Personalizar e pegar o meu código
            </span>
            <span className="mt-1 block text-[12.5px] text-texto-suave">
              Seu WhatsApp, sua cor e as medidas que você fabrica. Leva um minuto.
            </span>
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 text-[18px] leading-none text-marca transition-transform group-open:rotate-45"
          >
            +
          </span>
        </summary>

        <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-4">
        {campos.map((campo) => (
          <label key={campo.id} className="flex flex-col gap-1.5">
            <span className={rotulo}>{campo.label}</span>
            <input
              value={valores[campo.id]}
              placeholder={campo.exemplo}
              onChange={(e) => setValores((v) => ({ ...v, [campo.id]: e.target.value }))}
              className={`${entrada} placeholder:text-texto-fraco`}
            />
            <span className="text-[11px] text-texto-fraco">{campo.dica}</span>
          </label>
        ))}
      </div>

      {faixas.length > 0 && (
        <div>
          <p className={rotulo}>O que você fabrica</p>
          <p className="mt-1 text-[12.5px] text-texto-suave">
            Fora dessa faixa o cliente não consegue pedir.
          </p>

          <div className="mt-3 flex flex-col gap-2.5">
            {faixas.map((faixa) => (
              <div key={faixa.id} className="flex flex-wrap items-center gap-3">
                <span className="min-w-[110px] text-[13px] text-texto-suave">{faixa.label}</span>
                {(['min', 'max'] as const).map((campo) => (
                  <label key={campo} className="flex items-center gap-2">
                    <span className="text-[11px] text-texto-fraco">
                      {campo === 'min' ? 'de' : 'até'}
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={faixa[campo]}
                      onChange={(e) => ajustarFaixa(faixa.id, campo, e.target.value)}
                      className={`${entrada} w-[86px] tabular-nums`}
                    />
                  </label>
                ))}
                <span className="text-[11px] text-texto-fraco">{config.unidade}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Em vez de descrever o Pro, deixa experimentar: o interruptor liga
          o preço na prévia acima. O código copiado continua sem ele — quem
          não pagou não leva a funcionalidade junto. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-dashed border-borda p-4">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={comPreco}
            onChange={(e) => setComPreco(e.target.checked)}
            className="size-4 accent-[var(--sizr-marca)]"
          />
          <span className="text-[13px] text-texto">
            Ver com preço estimado
            <span className="ml-2 rounded-full bg-marca/15 px-2 py-0.5 text-[10px] tracking-[0.06em] text-marca">
              pro
            </span>
          </span>
        </label>
        <a
          href={linkPro}
          className="rounded-full px-4 py-2 font-display text-[12.5px] font-semibold whitespace-nowrap text-marca shadow-[inset_0_0_0_1px_var(--sizr-marca)] hover:bg-marca/10"
        >
          Ver o Pro
        </a>
      </div>

      <div className="relative rounded-[14px] border border-borda bg-fundo p-4">
        {/* Ícone em vez de texto, como em qualquer bloco de código: o
            title e o aria-label seguram o significado para quem passa o
            mouse e para leitor de tela. */}
        <button
          type="button"
          onClick={copiar}
          title={copiado ? 'Copiado' : 'Copiar'}
          aria-label={copiado ? 'Copiado' : 'Copiar código'}
          className="absolute top-2.5 right-2.5 rounded-lg p-2 text-texto-fraco transition-colors hover:bg-marca/10 hover:text-marca"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`size-4 ${copiado ? 'text-marca' : ''}`}
            aria-hidden="true"
          >
            {copiado ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </>
            )}
          </svg>
        </button>
        {/* Quebra em vez de rolar: a URL é longa e uma barra lateral aqui
            esconde metade do que a pessoa precisa copiar. `anywhere` só
            quebra quando não cabe, então a indentação continua legível. */}
        <pre className="pr-10 font-mono text-[11.5px] leading-[1.7] whitespace-pre-wrap text-texto-suave [overflow-wrap:anywhere]">
          <code>{snippet}</code>
        </pre>
      </div>

        {comPreco && (
          <p className="text-[12px] text-texto-fraco">
            O código acima sai sem o preço — ele é do Pro.
          </p>
        )}
        </div>
      </details>
    </div>
  );
}
