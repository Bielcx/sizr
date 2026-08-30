import { sizrConfig } from '../sizr.config';
import type { SizrConfig } from './types/config';
import { GeradorEmbed } from './components/GeradorEmbed';
import { BotaoEspecular } from './components/BotaoEspecular';
import { CartaoCometa } from './components/CartaoCometa';
import { PerguntaProduto } from './components/PerguntaProduto';
import { linkWhatsApp } from './lib/whatsapp';

/* ── Edite estes valores ─────────────────────────────────────────────
   A página atende dois públicos e não os mistura: o dono do negócio
   manda mensagem (a venda é sua, no Pix), o desenvolvedor compra o
   template no Gumroad por uma faixa lá embaixo.

   SITE:     onde você publicou este build. Vai no src do iframe.
   WA_VENDAS: SEU WhatsApp, o que recebe os interessados.
   GUMROAD:  link do template no Gumroad ("Share" → copiar URL). */
const SITE = 'https://sizr.app';
const WA_VENDAS = '5511999999999';
const GUMROAD_PRO = 'https://SEUUSUARIO.gumroad.com/l/sizr-pro';
const GUMROAD_CODIGO = 'https://SEUUSUARIO.gumroad.com/l/sizr';

/* Tudo pagamento único. O grátis não é isca: funciona de verdade e
   carrega a assinatura que traz o próximo cliente. */
const PRECO_PRO = 'R$ 197';
const PRECO_CODIGO = 'R$ 349';

/* A amostra do Pro: o interruptor no gerador troca o config grátis por
   este, e o preço aparece na prévia. É a funcionalidade sendo
   experimentada em vez de descrita numa lista. */
const OBSERVACAO = 'Valor de referência pelas medidas. O orçamento final é confirmado por você.';

/* Cada geometria cobra pela unidade que faz sentido nela: a caixa por
   litro, o painel por metro quadrado, o copo por litro de capacidade. É a
   mesma fórmula — muda o divisor. */
const precosDemo: Record<string, { valor: number; divisor: number; minimo: number }> = {
  caixa: { valor: 34.9, divisor: 1000, minimo: 45 }, // por litro
  painel: { valor: 189, divisor: 10000, minimo: 120 }, // por m²
  prateleira: { valor: 149, divisor: 10000, minimo: 60 }, // por m²
  envelope: { valor: 42, divisor: 10000, minimo: 25 }, // por m²
  copo: { valor: 95, divisor: 1000, minimo: 12 }, // por litro de capacidade
};

const configDemo: SizrConfig = {
  ...sizrConfig,
  formatos: sizrConfig.formatos.map((formato) => {
    const preco = precosDemo[formato.id];
    if (!preco) return formato;
    return {
      ...formato,
      resumo: { ...formato.resumo, preco: { ...preco, rotulo: 'Estimativa', observacao: OBSERVACAO } },
    };
  }),
};

/* Os ramos que a página atende. Existem por reconhecimento — quem chega
   se acha na lista — e por busca: são as palavras que essa gente digita
   no Google. */
const segmentos = [
  'marcenaria',
  'vidraçaria',
  'serralheria',
  'gráfica',
  'embalagem',
  'marmoraria',
  'toldos',
  'comunicação visual',
];

const contato = (assunto: string) =>
  linkWhatsApp(WA_VENDAS, `Olá! Vim pelo Sizr. Quero saber sobre ${assunto}.`);

const planos = [
  {
    id: 'gratis',
    nome: 'Grátis',
    preco: 'R$ 0',
    nota: 'para sempre · sem cadastro',
    destaque: false,
    para: 'Pegue o código aqui em cima e cole. É só isso.',
    itens: [
      'Caixa, painel e cilindro em 3D',
      'Suas faixas de produção: o cliente não pede o impossível',
      'Seu WhatsApp e a sua cor',
      'Hospedagem por nossa conta',
      'Uma linha "feito com Sizr" no rodapé',
    ],
    cta: 'Gerar meu código',
    href: '#gerar',
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: PRECO_PRO,
    nota: 'pagamento único · sem mensalidade',
    destaque: true,
    para: 'O configurador que mostra o preço e fecha sozinho.',
    itens: [
      'Preço estimado ao vivo, enquanto o cliente arrasta',
      'O pedido chega no WhatsApp já com o valor',
      'Sem a assinatura "feito com Sizr" no rodapé',
      'Caixa, painel e cilindro — e os que entrarem depois',
      'Paga uma vez, usa para sempre',
    ],
    cta: `Comprar por ${PRECO_PRO}`,
    href: GUMROAD_PRO,
  },
];

/* ── Prova social ────────────────────────────────────────────────────
   Rascunho: a seção só aparece quando esta lista tiver alguém dentro.
   Fica vazia de propósito — depoimento inventado é o jeito mais rápido
   de perder a confiança de quem está decidindo, e é justamente o tipo de
   coisa que um comprador atento confere.

   Preencha depois das primeiras instalações reais, por exemplo:

   { nome: 'Marina', negocio: 'Vidraçaria Aurora, Campinas',
     texto: 'Antes eu perdia meia hora por orçamento perguntando medida.
             Agora chega tudo pronto no WhatsApp.',
     detalhe: '12 pedidos no primeiro mês' }
*/
const depoimentos: { nome: string; negocio: string; texto: string; detalhe?: string }[] = [];

const faq = [
  [
    'Qual é a pegadinha do grátis?',
    'Nenhuma. Sem cadastro, sem cartão, sem prazo. Em troca fica uma linha "feito com Sizr" no rodapé do configurador — é ela que traz o próximo cliente e paga a hospedagem.',
  ],
  [
    'Preciso saber programar?',
    'Não. Você preenche os campos aqui em cima e cola o resultado no seu site, no mesmo lugar em que colaria um vídeo do YouTube. Se preferir, a gente cola por você.',
  ],
  [
    'Para onde vão os meus pedidos?',
    'Direto do navegador do seu cliente para o seu WhatsApp. Não existe servidor nosso no meio: a gente não recebe, não guarda e não vê pedido nenhum — nem teria onde.',
  ],
  [
    'E se meu produto não é caixa?',
    'Existem três formas: caixa, painel plano (vidro, espelho, placa, tampo) e cilindro (copo, pote, tubo). O que define o seu produto são as faixas de medida, não a forma. Precisa de outra? A gente modela.',
  ],
  [
    'E se o Sizr sair do ar?',
    'O configurador grátis e o Pro carregam do nosso endereço, então dependem dele. Se isso for risco demais para você, o código-fonte roda no seu próprio servidor e não depende da gente para nada.',
  ],
];

const botao =
  'inline-flex items-center justify-center gap-2 rounded-full bg-marca px-6 py-3 font-display text-[14px] font-semibold text-fundo transition-colors hover:bg-marca-hover';
const botaoVazado =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-[14px] font-semibold text-marca shadow-[inset_0_0_0_1px_var(--sizr-marca)] transition-colors hover:bg-marca/10';

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-borda/70 bg-fundo/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-[66px] max-w-[1100px] items-center gap-2 px-5">
          <a href="#" className="flex shrink-0 items-center gap-2.5" aria-label="Sizr, início">
            {/* O mesmo arquivo do favicon: um desenho só para a aba e para
                o cabeçalho, sem duas versões para manter em sincronia. */}
            <img
              src="/favicon.svg"
              alt=""
              width="24"
              height="24"
              className="size-6 rounded-[7px] shadow-[0_0_16px_color-mix(in_srgb,var(--sizr-marca)_45%,transparent)]"
            />
            <span className="font-display text-[17px] font-bold tracking-[-0.02em]">Sizr</span>
          </a>

          {/* Os dois destinos que alguém procura no topo. Somem no celular,
              onde a página inteira é uma rolagem curta e o botão basta. */}
          <nav className="ml-6 hidden items-center gap-1 sm:flex">
            {[
              ['Planos', '#planos'],
              ['Perguntas', '#perguntas'],
            ].map(([texto, destino]) => (
              <a
                key={destino}
                href={destino}
                className="rounded-lg px-3 py-2 text-[13.5px] text-texto-suave transition-colors hover:bg-superficie hover:text-texto"
              >
                {texto}
              </a>
            ))}
          </nav>

          <a
            href={contato('o configurador')}
            className="ml-auto hidden rounded-lg px-3 py-2 text-[13.5px] whitespace-nowrap text-texto-suave transition-colors hover:bg-superficie hover:text-texto md:block"
          >
            Falar com a gente
          </a>

          <a
            href="#gerar"
            className="ml-auto shrink-0 rounded-full bg-marca px-4 py-2 font-display text-[13.5px] font-semibold whitespace-nowrap text-fundo transition-colors hover:bg-marca-hover md:ml-3"
          >
            Gerar o meu grátis
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1100px] flex-col gap-20 px-5 pt-12 pb-16">
        {/* A dor primeiro: quem chega não está procurando um configurador
            3D, está cansado de perguntar medida. O produto entra na linha
            seguinte, como resposta. */}
        <section className="relative mx-auto flex min-h-[calc(100svh-66px-3rem)] max-w-[680px] flex-col justify-center text-center">
          {/* Brilho atrás do título. Sem movimento e sem elemento novo na
              leitura — só tira o texto do vazio. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[420px] w-[680px] max-w-[120vw] -translate-x-1/2 -translate-y-[60%] rounded-full opacity-70 blur-[90px]"
            style={{
              background:
                'radial-gradient(closest-side, color-mix(in srgb, var(--sizr-marca) 22%, transparent), transparent)',
            }}
          />

          <h1 className="font-display text-[clamp(2.1rem,5.6vw,3.4rem)] leading-[1.06] font-bold tracking-[-0.035em]">
            Você ainda pergunta{' '}
            <span className="bg-linear-100 from-marca to-marca-hover bg-clip-text text-transparent">
              “qual a medida?”
            </span>{' '}
            dez vezes por orçamento.
          </h1>

          <p className="mx-auto mt-6 max-w-[44ch] text-[17px] leading-[1.55] text-texto-suave">
            O Sizr põe um configurador 3D no seu site: o cliente escolhe as medidas, vê a peça
            girando e manda o pedido pronto no seu WhatsApp. Grátis, em um minuto.
          </p>

          <div className="mt-8">
            <BotaoEspecular href="#embed">Gerar o meu grátis</BotaoEspecular>
          </div>
        </section>

        <section id="embed" className="flex flex-col gap-4 scroll-mt-20">
          <h2 className="font-display text-[11px] font-bold tracking-[0.18em] text-texto-fraco uppercase">
            Experimente e leve o seu
          </h2>

          <GeradorEmbed
            site={SITE}
            config={sizrConfig}
            configComPreco={configDemo}
            linkPro={GUMROAD_PRO}
          />

          <PerguntaProduto numero={WA_VENDAS} segmentos={segmentos} />
        </section>

        <section id="planos" className="scroll-mt-20 border-t border-borda/70 pt-12">
          <h2 className="mb-6 font-display text-[13px] font-semibold tracking-[0.04em] text-texto-fraco uppercase">
            Escolha como quer usar
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-stretch gap-4">
            {/* O cartão do grátis tem fundo mais transparente, então o mesmo
                reflexo estoura nele — por isso o brilho menor. */}
            {planos.map((plano) => (
              <CartaoCometa key={plano.id} brilho={plano.destaque ? 0.6 : 0.3}>
                {/* A cor da marca só aparece no Pro — inclusive nos ✓ e no
                    preço. Verde nos dois cartões não destaca nenhum. */}
                <div
                  className={`flex h-full flex-col rounded-2xl border p-7 ${
                    plano.destaque
                      ? 'border-marca bg-[color-mix(in_srgb,var(--sizr-marca)_7%,var(--sizr-superficie))] shadow-[0_0_60px_-18px_var(--sizr-marca)]'
                      : 'border-borda bg-superficie'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-display text-[16px] font-semibold">{plano.nome}</h3>
                    {plano.destaque && (
                      <span className="rounded-full bg-marca/15 px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.06em] text-marca uppercase">
                        mais popular
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] text-texto-fraco">{plano.para}</p>

                  <p
                    className={`mt-5 font-display text-[clamp(2rem,4.4vw,2.6rem)] leading-none font-bold tracking-[-0.03em] ${
                      plano.destaque ? 'text-marca' : 'text-texto'
                    }`}
                  >
                    {plano.preco}
                  </p>
                  <p className="mt-2 text-[13px] text-texto-suave">{plano.nota}</p>

                  <ul className="mt-6 mb-7 flex list-none flex-col gap-2.5 p-0">
                    {plano.itens.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2.5 text-[13.5px] leading-[1.5] text-texto-suave"
                      >
                        <span className={plano.destaque ? 'text-marca' : 'text-texto-fraco'}>
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <a href={plano.href} className={`mt-auto ${plano.destaque ? botao : botaoVazado}`}>
                    {plano.cta}
                  </a>
                </div>
              </CartaoCometa>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-texto-fraco">
            Nenhum dos dois tem mensalidade, e o Pro tem reembolso em até 7 dias. Precisa de um
            formato que ainda não existe?{' '}
            <a href={contato('um formato 3D sob encomenda')} className="text-marca hover:underline">
              fale com a gente
            </a>
            .
          </p>
        </section>

        {depoimentos.length > 0 && (
          <section className="border-t border-borda/70 pt-12">
            <h2 className="mb-6 font-display text-[13px] font-semibold tracking-[0.04em] text-texto-fraco uppercase">
              Quem já usa
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
              {depoimentos.map((depoimento) => (
                <figure
                  key={depoimento.nome + depoimento.negocio}
                  className="m-0 rounded-2xl border border-borda/70 bg-superficie/60 p-6"
                >
                  <blockquote className="m-0 text-[14.5px] leading-[1.6] text-texto">
                    “{depoimento.texto}”
                  </blockquote>
                  <figcaption className="mt-4 text-[13px] text-texto-suave">
                    <span className="font-display font-semibold text-texto">{depoimento.nome}</span>
                    {' · '}
                    {depoimento.negocio}
                    {depoimento.detalhe && (
                      <span className="mt-1 block text-[12px] text-marca">{depoimento.detalhe}</span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section id="perguntas" className="scroll-mt-20 border-t border-borda/70 pt-12">
          <h2 className="mb-6 font-display text-[13px] font-semibold tracking-[0.04em] text-texto-fraco uppercase">
            Perguntas
          </h2>
          <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-x-8 gap-y-7">
            {faq.map(([pergunta, resposta]) => (
              <div key={pergunta}>
                <dt className="font-display text-[15px] font-semibold">{pergunta}</dt>
                <dd className="mt-1.5 text-[14px] leading-[1.6] text-texto-suave">{resposta}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-[18px] border border-borda/70 bg-superficie/40 px-7 py-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="max-w-[46ch]">
              <h2 className="font-display text-[15px] font-semibold">
                É desenvolvedor ou agência?
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-[1.6] text-texto-suave">
                O código-fonte deste configurador está à venda como template no Gumroad: React,
                Vite e three.js, com a marca e as faixas em um arquivo só. Compra uma vez, roda no
                seu servidor, usa em quantos clientes quiser — sem assinatura nenhuma.
              </p>
            </div>
            <a href={GUMROAD_CODIGO} className={`${botaoVazado} whitespace-nowrap`}>
              Template por {PRECO_CODIGO}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-borda/70 bg-superficie/50">
        <div className="mx-auto max-w-[1100px] px-5 py-11 text-[12px] leading-[1.6] text-texto-fraco">
          Sizr · configurador de produto sob medida · demo com a marca {sizrConfig.marca.nome}. O
          WhatsApp da demonstração é um número de exemplo.
        </div>
      </footer>
    </>
  );
}
