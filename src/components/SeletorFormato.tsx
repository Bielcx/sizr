import type { Formato } from '../types/config';

interface Props {
  formatos: Formato[];
  selecionado: string;
  titulo: string;
  etiquetaEmBreve: string;
  maisFormatos?: string;
  aoSelecionar: (id: string) => void;
}

/**
 * Formatos ainda não liberados continuam visíveis, desabilitados.
 * É de propósito: mostra ao cliente que existe mais coisa vindo sem
 * prometer o que ainda não dá para entregar.
 */
export function SeletorFormato({
  formatos,
  selecionado,
  titulo,
  etiquetaEmBreve,
  maisFormatos,
  aoSelecionar,
}: Props) {
  if (formatos.length <= 1) return null;

  return (
    <div>
      <p className="font-display text-[11px] font-bold tracking-[0.18em] text-texto-fraco uppercase">
        {titulo}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {formatos.map((formato) => {
          const ativo = formato.id === selecionado;
          const habilitado = formato.disponivel && formato.dimensoes.length > 0;

          return (
            <button
              key={formato.id}
              type="button"
              disabled={!habilitado}
              aria-pressed={ativo}
              onClick={() => aoSelecionar(formato.id)}
              className={
                ativo
                  ? 'rounded-full border border-marca bg-marca px-5 py-2 font-display text-[13px] font-semibold text-fundo'
                  : habilitado
                    ? 'rounded-full border border-borda px-5 py-2 font-display text-[13px] font-semibold text-texto-suave hover:border-marca hover:text-marca'
                    : 'cursor-not-allowed rounded-full border border-dashed border-borda px-5 py-2 font-display text-[13px] font-semibold text-texto-fraco'
              }
            >
              {formato.nome}
              {!habilitado && (
                <span className="ml-1.5 text-[9px] tracking-[0.1em] text-texto-fraco uppercase">
                  {etiquetaEmBreve}
                </span>
              )}
            </button>
          );
        })}

        {/* Uma linha no lugar de uma fila de botões desabilitados: diz que
            a lista cresce sem fazer o configurador parecer vazio. */}
        {maisFormatos && (
          <span className="self-center text-[12px] text-texto-fraco">{maisFormatos}</span>
        )}
      </div>
    </div>
  );
}
