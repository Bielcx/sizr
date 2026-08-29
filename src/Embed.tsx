import { useEffect, useRef } from 'react';
import { Configurador } from './components/Configurador';
import type { OpcoesEmbed } from './lib/embed';
import type { EstadoInicial } from './hooks/useConfigurador';

/* O motor do plano grátis: cada embed instalado é um link de volta para
   cá. `via=embed` separa esse tráfego do resto no analytics — é o número
   que diz se o grátis está se pagando. */
const SITE = 'https://sizr.app/?via=embed';

interface Props extends OpcoesEmbed {
  estadoInicial: EstadoInicial;
}

/**
 * O que roda dentro do <iframe> no site do cliente: o configurador e nada
 * mais. Sem cabeçalho, sem margem — quem controla o tamanho é o iframe.
 */
export default function Embed({ config, mostrarAssinatura, estadoInicial }: Props) {
  const raiz = useRef<HTMLDivElement>(null);

  /*
   * Altura fixa no iframe quebra no celular: lá o configurador empilha
   * painel e 3D e passa de 900px, então o conteúdo fica cortado no site
   * de quem colou. Aqui a gente mede e avisa a página hospedeira a cada
   * mudança de layout; o snippet do lado de lá só aplica o número.
   */
  useEffect(() => {
    const elemento = raiz.current;
    if (!elemento || window.parent === window) return;

    const avisar = () =>
      window.parent.postMessage({ sizr: Math.ceil(elemento.getBoundingClientRect().height) }, '*');

    const observador = new ResizeObserver(avisar);
    observador.observe(elemento);
    avisar();

    return () => observador.disconnect();
  }, []);

  return (
    <div ref={raiz} className="flex flex-col">
      <Configurador config={config} estadoInicial={estadoInicial} />

      {mostrarAssinatura && (
        <a
          href={SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="border-t border-borda py-2 text-center text-[11px] text-texto-fraco hover:text-marca"
        >
          feito com <span className="font-display font-semibold text-texto-suave">Sizr</span> ·
          monte o seu grátis
        </a>
      )}
    </div>
  );
}
