import { useState } from 'react';
import { linkWhatsApp } from '../lib/whatsapp';

interface Props {
  /** Seu WhatsApp, o que recebe os pedidos de formato. */
  numero: string;
  /** Ramos atendidos, para quem não se reconheceu nos formatos da demo. */
  segmentos: string[];
}

/**
 * O que transforma a página em pesquisa de campo: quem não achou o próprio
 * produto escreve qual é, e isso chega no seu WhatsApp já escrito.
 *
 * Cada resposta é dado e contato ao mesmo tempo, vinda de alguém que
 * acabou de mexer no configurador — que é o tipo de resposta que nenhuma
 * pesquisa por formulário consegue.
 *
 * Vive na landing, e não dentro do `Configurador`: no embed instalado no
 * site do cliente, um campo falando com a Sizr não teria o que fazer ali.
 */
export function PerguntaProduto({ numero, segmentos }: Props) {
  const [produto, setProduto] = useState('');
  const limpo = produto.trim();

  const href = linkWhatsApp(
    numero,
    `Olá! Vim pelo Sizr. Eu vendo ${limpo} sob medida — dá para fazer um configurador disso?`,
  );

  return (
    <div className="rounded-[18px] border border-dashed border-borda p-6">
      <p className="font-display text-[15px] font-semibold">Não achou o seu produto?</p>
      <p className="mt-1.5 max-w-[54ch] text-[13.5px] leading-relaxed text-texto-suave">
        Escreve o que você vende. Se der para modelar, a gente modela — e a maioria dá, porque o
        que muda de um produto para o outro costuma ser a medida, não a forma.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <input
          value={produto}
          onChange={(e) => setProduto(e.target.value)}
          placeholder="box de banheiro, guarda-roupa, toldo…"
          aria-label="O que você vende sob medida"
          className="min-w-[240px] flex-1 rounded-lg border border-borda bg-fundo px-3 py-2.5 text-[14px] text-texto outline-none placeholder:text-texto-fraco focus:border-marca"
        />

        {/* Sem texto não há mensagem para mandar: o link some em vez de
            abrir o WhatsApp com a frase pela metade. */}
        <a
          href={limpo ? href : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!limpo}
          className={
            limpo
              ? 'rounded-full bg-marca px-5 py-2.5 font-display text-[13.5px] font-semibold whitespace-nowrap text-fundo hover:bg-marca-hover'
              : 'pointer-events-none rounded-full border border-borda px-5 py-2.5 font-display text-[13.5px] font-semibold whitespace-nowrap text-texto-fraco'
          }
        >
          Perguntar no WhatsApp
        </a>
      </div>

      {/* Os nomes dos ramos existem por dois motivos: quem chega se
          reconhece na hora, e são as palavras pelas quais essa gente
          procura no Google. */}
      <p className="mt-4 text-[12.5px] leading-relaxed text-texto-fraco">
        Já atende {segmentos.join(' · ')}.
      </p>
    </div>
  );
}
