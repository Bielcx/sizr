import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Props {
  /** Altura, em unidades de cena, para onde a câmera aponta. */
  alturaAlvo: number;
  /** Raio da esfera que envolve o produto, em unidades de cena. */
  raioModelo: number;
}

/**
 * Órbita, zoom e — o ponto principal — enquadramento que acompanha o
 * tamanho do produto.
 *
 * Num configurador com faixas fixas dá para deixar a câmera parada. Aqui
 * não: quem compra o Sizr define os próprios min/max, e uma faixa mais
 * larga faria o produto estourar as bordas do viewport. Em vez de mover a
 * câmera na mão (o que brigaria com o arrasto do usuário), a gente empurra
 * o `minDistance` do próprio OrbitControls: ele nunca deixa a câmera
 * chegar perto o bastante para cortar o modelo, e continua livre para
 * girar e afastar.
 *
 * Vai direto no three, sem @react-three/drei: os controles são a única
 * coisa que usaríamos da biblioteca, e ela traz 40+ pacotes junto.
 */
export function Controles({ alturaAlvo, raioModelo }: Props) {
  const camera = useThree((estado) => estado.camera);
  const domElement = useThree((estado) => estado.gl.domElement);

  const controles = useMemo(() => {
    const c = new OrbitControls(camera, domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.enablePan = false;
    return c;
  }, [camera, domElement]);

  useEffect(() => () => controles.dispose(), [controles]);

  useEffect(() => {
    controles.target.set(0, alturaAlvo, 0);
  }, [controles, alturaAlvo]);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;

    // O fov da câmera é o vertical; em tela estreita (celular em pé) quem
    // corta primeiro é o horizontal. Enquadrar pelo menor dos dois cobre
    // os dois casos.
    const fovVertical = THREE.MathUtils.degToRad(cam.fov);
    const fovHorizontal = 2 * Math.atan(Math.tan(fovVertical / 2) * cam.aspect);
    const menorFov = Math.min(fovVertical, fovHorizontal);

    const distanciaMinima = (raioModelo / Math.sin(menorFov / 2)) * 1.05;
    controles.minDistance = distanciaMinima;
    controles.maxDistance = Math.max(distanciaMinima * 2.5, 16);

    // update() reencaixa a câmera no novo minDistance, então o recuo
    // acompanha o slider quadro a quadro.
    controles.update();
  });

  return null;
}
