import * as THREE from 'three';
import type { Formato } from '../../types/config';

/**
 * Geometrias unitárias (1×1×1) criadas uma única vez e compartilhadas.
 * As medidas do cliente viram escala nos grupos que as envolvem — nada de
 * recriar geometria a cada movimento de slider, que é o que trava o
 * configurador em celular.
 */
export const caixaUnitaria = new THREE.BoxGeometry(1, 1, 1);
export const caixaUnitariaArestas = new THREE.EdgesGeometry(caixaUnitaria);

/** Plano com o pivô na base, para a aba girar a partir da dobra. */
export const abaUnitaria = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
export const abaUnitariaArestas = new THREE.EdgesGeometry(abaUnitaria);

/**
 * Cilindro de diâmetro 1 e altura 1. As arestas usam limiar de 30°: as
 * faces laterais vizinhas fazem 7,5° entre si, então só as duas bordas
 * circulares sobram — que é o contorno que a gente quer desenhar, sem as
 * 48 linhas verticais dos gomos.
 */
export const cilindroUnitario = new THREE.CylinderGeometry(0.5, 0.5, 1, 48);
export const cilindroUnitarioArestas = new THREE.EdgesGeometry(cilindroUnitario, 30);

/** Tamanho, em unidades de cena, da maior medida padrão do formato. */
const UNIDADES_ALVO = 2.8;

/**
 * Converte a unidade do config (cm, mm, m, polegada…) para unidades de cena.
 *
 * A escala sai das medidas padrão do próprio formato, não de um número
 * fixo: assim o enquadramento inicial fica igual seja qual for a unidade
 * que a empresa usa. Uma marcenaria que trabalha em milímetros e uma
 * gráfica que trabalha em centímetros abrem o configurador com o produto
 * ocupando exatamente o mesmo espaço na tela.
 */
export function escalaDaCena(formato: Formato): number {
  const maiorPadrao = Math.max(...formato.dimensoes.map((d) => d.padrao), 1);
  return UNIDADES_ALVO / maiorPadrao;
}
