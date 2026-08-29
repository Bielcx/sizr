import * as THREE from 'three';
import {
  abaUnitaria,
  abaUnitariaArestas,
  caixaUnitaria,
  caixaUnitariaArestas,
} from './geometrias';
import { useMateriais } from './materiais';

interface Props {
  /** Medidas na unidade do config, já mapeadas para os eixos da cena. */
  x: number;
  y: number;
  z: number;
  /** Fator de conversão da unidade do config para unidades de cena. */
  escala: number;
  /** Ângulo de abertura das abas, em graus. */
  abertura: number;
  cor: string;
}

/**
 * Caixa tipo RSC: corpo + 4 abas superiores.
 *
 * Cada aba é uma pilha de três grupos, e a ordem importa:
 *   dobra  → onde a aba encosta no corpo (posição e giro em torno de Y)
 *   giro   → o quanto ela abre (rotação em X)
 *   escala → o tamanho da aba
 * Separar assim deixa a abertura independente do tamanho — mexer num
 * slider não desalinha a dobra.
 */
export function CaixaModelo({ x, y, z, escala, abertura, cor }: Props) {
  const c = x * escala;
  const a = y * escala;
  const l = z * escala;

  const anguloAbertura = THREE.MathUtils.degToRad(abertura);

  const { preenchimento, arestas } = useMateriais(cor);

  const abas = [
    { giro: 0, eixo: 'z' as const, sinal: 1 }, // frente
    { giro: Math.PI, eixo: 'z' as const, sinal: -1 }, // trás
    { giro: Math.PI / 2, eixo: 'x' as const, sinal: 1 }, // direita
    { giro: -Math.PI / 2, eixo: 'x' as const, sinal: -1 }, // esquerda
  ];

  return (
    <group>
      {/* corpo */}
      <group scale={[c, a, l]} position={[0, a / 2, 0]}>
        <mesh geometry={caixaUnitaria} material={preenchimento} />
        <lineSegments geometry={caixaUnitariaArestas} material={arestas} />
      </group>

      {/* abas */}
      {abas.map(({ giro, eixo, sinal }, i) => {
        const naFrenteOuAtras = eixo === 'z';
        const posicao: [number, number, number] = [
          naFrenteOuAtras ? 0 : (sinal * c) / 2,
          a,
          naFrenteOuAtras ? (sinal * l) / 2 : 0,
        ];
        // A aba cobre metade da medida oposta à sua dobra.
        const escalaAba: [number, number, number] = [
          naFrenteOuAtras ? c : l,
          (naFrenteOuAtras ? l : c) / 2,
          1,
        ];

        return (
          <group key={i} position={posicao} rotation={[0, giro, 0]}>
            <group rotation={[anguloAbertura, 0, 0]}>
              <group scale={escalaAba}>
                <mesh geometry={abaUnitaria} material={preenchimento} />
                <lineSegments geometry={abaUnitariaArestas} material={arestas} />
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
}
