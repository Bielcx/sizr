import type { Dimensao } from '../types/config';
import { formatarNumero } from '../lib/formato';

interface Props {
  dimensao: Dimensao;
  valor: number;
  unidade: string;
  aoMudar: (valor: number) => void;
}

export function SliderMedida({ dimensao, valor, unidade, aoMudar }: Props) {
  const percentual = ((valor - dimensao.min) / (dimensao.max - dimensao.min)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={`sizr-${dimensao.id}`}
          className="font-display text-[11px] font-bold tracking-[0.14em] text-texto uppercase"
        >
          {dimensao.label}
        </label>
        <span className="font-display text-[15px] font-bold whitespace-nowrap tabular-nums text-marca">
          {formatarNumero(valor, dimensao.passo < 1 ? 1 : 0)} {unidade}
        </span>
      </div>

      <input
        id={`sizr-${dimensao.id}`}
        type="range"
        className="sizr-slider mt-2.5"
        min={dimensao.min}
        max={dimensao.max}
        step={dimensao.passo}
        value={valor}
        aria-valuetext={`${valor} ${unidade}`}
        onChange={(e) => aoMudar(Number(e.target.value))}
        // A trilha preenchida é um gradiente: dois cliques de CSS a menos
        // do que empilhar divs por cima do input nativo.
        style={{
          background: `linear-gradient(to right, var(--sizr-marca) ${percentual}%, var(--sizr-borda) ${percentual}%)`,
        }}
      />

      <div className="mt-[5px] flex justify-between text-[10.5px] tabular-nums text-texto-fraco">
        <span>
          {dimensao.min} {unidade}
        </span>
        <span>
          {dimensao.max} {unidade}
        </span>
      </div>
    </div>
  );
}
