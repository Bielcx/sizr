import { sizrConfig } from '../../sizr.config';
import type { SizrConfig } from '../types/config';
import { useConfigurador, type EstadoInicial } from '../hooks/useConfigurador';
import { SeletorFormato } from './SeletorFormato';
import { SliderMedida } from './SliderMedida';
import { CampoQuantidade } from './CampoQuantidade';
import { FichaResumo } from './FichaResumo';
import { Viewport } from './viewport/Viewport';

interface Props {
  /** Sobrescreve o sizr.config.ts. Útil para demos com mais de um preset. */
  config?: SizrConfig;
  /** Configuração já montada, vinda de um link compartilhado. */
  estadoInicial?: EstadoInicial;
}

/**
 * O produto inteiro: painel de controles à esquerda, cena 3D à direita.
 * Em telas estreitas os dois viram uma coluna só — o grid abaixo cuida
 * disso sem media query.
 */
export function Configurador({ config = sizrConfig, estadoInicial }: Props) {
  const {
    formatos,
    formato,
    selecionarFormato,
    medidas,
    ajustarMedida,
    quantidade,
    ajustarQuantidade,
    resumoMedidas,
    volumeFormatado,
    rotuloVolume,
    precoFormatado,
    precoRotulo,
    precoObservacao,
    href,
  } = useConfigurador(config, estadoInicial);

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] overflow-hidden rounded-[10px] border border-borda shadow-[0_12px_40px_rgb(0_0_0/0.08)]">
      <div className="flex flex-col gap-5 bg-superficie px-[26px] py-6">
        <SeletorFormato
          formatos={formatos}
          selecionado={formato.id}
          titulo={config.textos.tituloFormato}
          etiquetaEmBreve={config.textos.etiquetaEmBreve}
          maisFormatos={config.textos.maisFormatos}
          aoSelecionar={selecionarFormato}
        />

        <div className="flex flex-col gap-4">
          {formato.dimensoes.map((dimensao) => (
            <SliderMedida
              key={dimensao.id}
              dimensao={dimensao}
              valor={medidas[dimensao.id] ?? dimensao.padrao}
              unidade={config.unidade}
              aoMudar={(valor) => ajustarMedida(dimensao.id, valor)}
            />
          ))}

          {config.quantidade && (
            <CampoQuantidade
              config={config.quantidade}
              valor={quantidade}
              aoMudar={ajustarQuantidade}
            />
          )}
        </div>

        <FichaResumo
          rotulo={config.resumo.rotulo}
          medidas={resumoMedidas}
          rotuloVolume={rotuloVolume}
          volume={volumeFormatado}
          precoRotulo={precoRotulo}
          quantidade={config.quantidade ? quantidade : null}
          preco={precoFormatado}
          precoObservacao={precoObservacao}
        />

        <div className="flex flex-col gap-2.5">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md bg-marca px-4 py-3.5 text-center font-display text-[14px] leading-snug font-semibold text-fundo hover:bg-marca-hover"
          >
            {config.textos.ctaWhatsApp}
          </a>
          <p className="text-[11.5px] leading-normal text-texto-suave">{config.textos.aviso}</p>
        </div>
      </div>

      <Viewport
        formato={formato}
        medidas={medidas}
        marca={config.marca}
        dica={config.textos.dicaViewport}
      />
    </div>
  );
}
