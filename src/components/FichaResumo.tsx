interface Props {
  rotulo: string;
  medidas: string;
  rotuloVolume: string;
  volume: string | null;
  quantidade: number | null;
  precoRotulo: string | null;
  preco: string | null;
  precoObservacao: string | null;
}

/**
 * Medidas escolhidas, volume e — quando o config define preço — a
 * estimativa. As duas primeiras ficam lado a lado quando cabem e
 * empilham quando não cabem; daí o @container.
 */
export function FichaResumo({
  rotulo,
  medidas,
  rotuloVolume,
  volume,
  quantidade,
  precoRotulo,
  preco,
  precoObservacao,
}: Props) {
  return (
    <div className="@container flex flex-col gap-3 rounded-lg border border-dashed border-borda bg-fundo px-[18px] py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-[11px] font-bold tracking-[0.14em] text-texto-fraco uppercase">
            {rotulo}
          </p>
          <p className="mt-1 font-display text-[19px] font-bold whitespace-nowrap tabular-nums text-texto">
            {medidas}
          </p>
        </div>

        {volume !== null && (
          <div className="@[300px]:text-right">
            <p className="font-display text-[11px] font-bold tracking-[0.14em] text-texto-fraco uppercase">
              {rotuloVolume}
            </p>
            <p className="mt-1 font-display text-[19px] font-bold whitespace-nowrap tabular-nums text-texto-suave">
              ≈ {volume}
            </p>
          </div>
        )}
      </div>

      {/* O preço é o número que faz o cliente decidir sozinho, então ganha
          a linha inteira e o tamanho maior — não divide espaço com o
          volume. Só aparece se o config definir preço. */}
      {preco !== null && (
        <div className="border-t border-dashed border-borda pt-3">
          <p className="font-display text-[11px] font-bold tracking-[0.14em] text-texto-fraco uppercase">
            {precoRotulo}
          </p>
          <p className="mt-1 font-display text-[26px] leading-none font-bold tabular-nums text-marca">
            {preco}
            {quantidade !== null && quantidade > 1 && (
              <span className="ml-2 font-sans text-[13px] font-normal text-texto-fraco">
                {quantidade} un.
              </span>
            )}
          </p>
          {precoObservacao && (
            <p className="mt-2 text-[11px] leading-normal text-texto-fraco">{precoObservacao}</p>
          )}
        </div>
      )}
    </div>
  );
}
