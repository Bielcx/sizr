import { cilindroUnitario, cilindroUnitarioArestas } from './geometrias';
import { useMateriais } from './materiais';

interface Props {
  /** Diâmetro, na unidade do config. */
  diametro: number;
  /** Altura, na unidade do config. */
  altura: number;
  /** Fator de conversão da unidade do config para unidades de cena. */
  escala: number;
  cor: string;
}

/**
 * Peça cilíndrica: copo, pote, tubo, lata, vaso.
 *
 * Só duas medidas importam — diâmetro e altura. O diâmetro escala os dois
 * eixos horizontais juntos, então não existe cilindro "achatado" por
 * acidente: o cliente não consegue pedir uma medida que a torneação não
 * produz.
 */
export function CilindroModelo({ diametro, altura, escala, cor }: Props) {
  const { preenchimento, arestas } = useMateriais(cor);

  const d = diametro * escala;
  const a = altura * escala;

  return (
    <group scale={[d, a, d]} position={[0, a / 2, 0]}>
      <mesh geometry={cilindroUnitario} material={preenchimento} />
      <lineSegments geometry={cilindroUnitarioArestas} material={arestas} />
    </group>
  );
}
