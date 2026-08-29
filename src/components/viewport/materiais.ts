import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Os dois materiais que todo modelo usa: um preenchimento translúcido e a
 * linha das arestas, ambos na cor da marca.
 *
 * Materiais são recursos de GPU. Trocar a cor sem descartar os antigos
 * vaza memória a cada troca — por isso o descarte no cleanup, e por isso
 * isto vive num lugar só em vez de repetido em cada geometria.
 */
export function useMateriais(cor: string) {
  const preenchimento = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: cor,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [cor],
  );

  const arestas = useMemo(() => new THREE.LineBasicMaterial({ color: cor }), [cor]);

  useEffect(
    () => () => {
      preenchimento.dispose();
      arestas.dispose();
    },
    [preenchimento, arestas],
  );

  return { preenchimento, arestas };
}
