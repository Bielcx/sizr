import type { QuantidadeConfig } from '../types/config';

interface Props {
  config: QuantidadeConfig;
  valor: number;
  aoMudar: (valor: number) => void;
}

const atalhos = [10, 50, 100, 500];

/**
 * Quantidade não é slider: quem compra embalagem digita 250, não arrasta
 * até achar. Campo numérico com atalhos para os números redondos que
 * aparecem na maioria dos pedidos.
 */
export function CampoQuantidade({ config, valor, aoMudar }: Props) {
  const limitar = (n: number) => Math.min(Math.max(n, config.min), config.max);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor="sizr-quantidade"
          className="font-display text-[11px] font-bold tracking-[0.14em] text-texto uppercase"
        >
          {config.label}
        </label>
        <span className="text-[10.5px] tabular-nums text-texto-fraco">
          mín. {config.min} · máx. {config.max}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <input
          id="sizr-quantidade"
          type="number"
          inputMode="numeric"
          min={config.min}
          max={config.max}
          value={valor}
          onChange={(e) => aoMudar(limitar(Number(e.target.value) || config.min))}
          className="w-[104px] rounded-lg border border-borda bg-fundo px-3 py-2 font-display text-[15px] font-bold tabular-nums text-texto outline-none focus:border-marca"
        />

        {atalhos
          .filter((n) => n >= config.min && n <= config.max)
          .map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => aoMudar(n)}
              className={
                n === valor
                  ? 'rounded-full border border-marca px-3 py-1.5 text-[12px] tabular-nums text-marca'
                  : 'rounded-full border border-borda px-3 py-1.5 text-[12px] tabular-nums text-texto-suave hover:border-marca hover:text-marca'
              }
            >
              {n}
            </button>
          ))}
      </div>
    </div>
  );
}
