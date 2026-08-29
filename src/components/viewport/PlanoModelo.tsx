import { caixaUnitaria, caixaUnitariaArestas } from './geometrias';
import { useMateriais } from './materiais';

interface Props {
  /** Medidas na unidade do config, já mapeadas para os eixos da cena. */
  x: number;
  y: number;
  z: number;
  /** Fator de conversão da unidade do config para unidades de cena. */
  escala: number;
  cor: string;
}

/**
 * Peça plana em pé: vidro, espelho, placa, chapa, painel, tampo.
 *
 * É a mesma geometria da caixa — um bloco — com a espessura como terceira
 * medida em vez de profundidade. Não vale uma geometria própria: o que
 * muda é a proporção, e proporção é escala.
 */
export function PlanoModelo({ x, y, z, escala, cor }: Props) {
  const { preenchimento, arestas } = useMateriais(cor);

  return (
    <group scale={[x * escala, y * escala, z * escala]} position={[0, (y * escala) / 2, 0]}>
      <mesh geometry={caixaUnitaria} material={preenchimento} />
      <lineSegments geometry={caixaUnitariaArestas} material={arestas} />
    </group>
  );
}
