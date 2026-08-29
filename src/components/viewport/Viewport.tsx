import { Canvas } from '@react-three/fiber';
import type { Formato, Marca } from '../../types/config';
import type { Medidas } from '../../hooks/useConfigurador';
import { CaixaModelo } from './CaixaModelo';
import { PlanoModelo } from './PlanoModelo';
import { CilindroModelo } from './CilindroModelo';
import { Controles } from './Controles';
import { escalaDaCena } from './geometrias';

interface Props {
  formato: Formato;
  medidas: Medidas;
  marca: Marca;
  dica: string;
}

/** Valor da dimensão associada a um eixo, ou null se o formato não tem. */
function medidaDoEixo(formato: Formato, medidas: Medidas, eixo: 'x' | 'y' | 'z'): number | null {
  const dimensao = formato.dimensoes.find((d) => d.eixo === eixo);
  if (!dimensao) return null;
  return medidas[dimensao.id] ?? dimensao.padrao;
}

/**
 * As três medidas da peça, na unidade do config, com o que cada geometria
 * faz quando falta um eixo:
 *   plano    sem espessura declarada, usa 1,5% da maior medida — fino o
 *            bastante para ler como chapa sem virar uma folha invisível.
 *   cilindro tem um diâmetro só: o eixo z acompanha o x, então não existe
 *            cilindro achatado por acidente.
 */
function medidasDaPeca(formato: Formato, medidas: Medidas) {
  const x = medidaDoEixo(formato, medidas, 'x') ?? 10;
  const y = medidaDoEixo(formato, medidas, 'y') ?? 10;
  const z = medidaDoEixo(formato, medidas, 'z');

  if (formato.modelo === 'cilindro') return { x, y, z: x };
  if (formato.modelo === 'plano') return { x, y, z: z ?? Math.max(x, y) * 0.015 };
  return { x, y, z: z ?? 10 };
}

export function Viewport({ formato, medidas, marca, dica }: Props) {
  const escala = escalaDaCena(formato);
  const peca = medidasDaPeca(formato, medidas);

  const x = peca.x * escala;
  const y = peca.y * escala;
  const z = peca.z * escala;

  // A câmera olha para a metade da altura: a caixa cresce para cima sem
  // sair do enquadramento.
  const alturaAlvo = y / 2;

  // Raio da esfera que envolve o produto — é o que diz à câmera o quanto
  // recuar. As abas abertas contam: cada uma tem metade da medida oposta
  // e, aberta em 115°, joga sin(115°) disso para fora da caixa. Ignorar
  // essa sobra deixa a ponta das abas cortada na borda do viewport.
  // Só a caixa tem abas; nas outras geometrias a sobra é zero.
  const aberturaRad = ((formato.aberturaAbas ?? 115) * Math.PI) / 180;
  const sobraDasAbas =
    formato.modelo === 'caixa' ? Math.max(Math.sin(aberturaRad), 0) : 0;
  const larguraTotal = x * (1 + sobraDasAbas);
  const profundidadeTotal = z * (1 + sobraDasAbas);
  const raioModelo = Math.hypot(larguraTotal, y, profundidadeTotal) / 2;

  // Sobreposições do visor (pontilhado, cantos, dica). Sempre brancas:
  // corViewport é escura por definição, então branco contrasta em
  // qualquer paleta — amarrar isso a corFundo quebra em tema escuro.
  const traco = (opacidade: number) => `rgb(255 255 255 / ${opacidade / 100})`;

  return (
    <div className="relative min-h-[380px] overflow-hidden bg-viewport">
      {/* pontilhado + brilho central, para o modelo não flutuar no vazio */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          color: '#fff',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 55%, color-mix(in srgb, ${marca.corPrimaria} 22%, transparent), transparent 60%)`,
        }}
      />

      {/* leitura técnica das medidas, no canto */}
      <div className="pointer-events-none absolute top-4 left-[18px] z-10 flex gap-3.5 font-mono text-[11px] tracking-[0.06em]">
        {formato.dimensoes.map((d) => (
          <span key={d.id} style={{ color: traco(55) }}>
            {d.sigla} <span style={{ color: marca.corAcento }}>{medidas[d.id] ?? d.padrao}</span>
          </span>
        ))}
      </div>

      {/* cantos de visor */}
      {(
        [
          'top-3.5 left-3.5 border-t border-l',
          'top-3.5 right-3.5 border-t border-r',
          'bottom-3.5 left-3.5 border-b border-l',
          'bottom-3.5 right-3.5 border-b border-r',
        ] as const
      ).map((classes) => (
        <div
          key={classes}
          className={`pointer-events-none absolute z-10 size-4 ${classes}`}
          style={{ borderColor: traco(30) }}
        />
      ))}

      <Canvas
        className="absolute inset-0"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 40, near: 0.1, far: 200, position: [5, 4.5, 6] }}
      >
        <gridHelper
          args={[14, 14, marca.corPrimaria, marca.corBorda]}
          material-transparent
          material-opacity={0.5}
        />

        {formato.modelo === 'caixa' && (
          <CaixaModelo
            x={peca.x}
            y={peca.y}
            z={peca.z}
            escala={escala}
            abertura={formato.aberturaAbas ?? 115}
            cor={marca.corAcento}
          />
        )}

        {formato.modelo === 'plano' && (
          <PlanoModelo x={peca.x} y={peca.y} z={peca.z} escala={escala} cor={marca.corAcento} />
        )}

        {formato.modelo === 'cilindro' && (
          <CilindroModelo
            diametro={peca.x}
            altura={peca.y}
            escala={escala}
            cor={marca.corAcento}
          />
        )}

        <Controles alturaAlvo={alturaAlvo} raioModelo={raioModelo} />
      </Canvas>

      <p
        className="pointer-events-none absolute right-0 bottom-3 left-0 z-10 text-center text-[11px]"
        style={{ color: traco(35) }}
      >
        {dica}
      </p>
    </div>
  );
}
