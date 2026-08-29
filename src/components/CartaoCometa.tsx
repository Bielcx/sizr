import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Graus de rotação nos extremos do cartão. */
  rotacao?: number;
  /** Deslocamento, em px, nos extremos do cartão. */
  deslocamento?: number;
  /** Força do reflexo. Cartão de fundo mais claro precisa de menos. */
  brilho?: number;
  className?: string;
}

/* Mola do `useSpring` do motion, nos valores padrão dele. A razão de
   amortecimento dá 0,5 — subamortecida de propósito: é o repique curto no
   fim do movimento que faz o cartão parecer ter peso. */
const RIGIDEZ = 100;
const AMORTECIMENTO = 10;
const MASSA = 1;
const PARADO = 0.0004;

/**
 * Cartão com inclinação 3D e reflexo que segue o ponteiro.
 *
 * O original (Aceternity) usa `motion/react` só pelas molas. Aqui a mola é
 * integrada à mão com os mesmos parâmetros — a página já carrega three.js
 * e ogl, e trazer uma biblioteca de animação inteira para dois cartões não
 * se paga.
 *
 * O laço só roda enquanto há movimento: parado, nenhum quadro é gasto.
 */
export function CartaoCometa({
  children,
  rotacao = 17.5,
  deslocamento = 20,
  brilho = 0.6,
  className = '',
}: Props) {
  const alvo = useRef<HTMLDivElement>(null);
  const destino = useRef({ x: 0, y: 0 });
  const [sobre, setSobre] = useState(false);

  useEffect(() => {
    const elemento = alvo.current;
    if (!elemento) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let anterior = performance.now();
    let quadro = 0;

    function passo(agora: number) {
      const dt = Math.min((agora - anterior) / 1000, 0.032);
      anterior = agora;

      for (const eixo of ['x', 'y'] as const) {
        const aceleracao =
          (-RIGIDEZ * (pos[eixo] - destino.current[eixo]) - AMORTECIMENTO * vel[eixo]) / MASSA;
        vel[eixo] += aceleracao * dt;
        pos[eixo] += vel[eixo] * dt;
      }

      const el = elemento!;
      el.style.setProperty('--rx', `${-pos.y * rotacao * 2}deg`);
      el.style.setProperty('--ry', `${pos.x * rotacao * -2}deg`);
      el.style.setProperty('--tx', `${pos.x * deslocamento * 2}px`);
      el.style.setProperty('--ty', `${-pos.y * deslocamento * 2}px`);
      el.style.setProperty('--gx', `${50 + pos.x * 100}%`);
      el.style.setProperty('--gy', `${50 + pos.y * 100}%`);

      const emRepouso =
        destino.current.x === 0 &&
        destino.current.y === 0 &&
        Math.abs(pos.x) < PARADO &&
        Math.abs(pos.y) < PARADO &&
        Math.abs(vel.x) < PARADO &&
        Math.abs(vel.y) < PARADO;

      if (emRepouso) {
        quadro = 0;
        return;
      }
      quadro = requestAnimationFrame(passo);
    }

    function acordar() {
      if (quadro) return;
      anterior = performance.now();
      quadro = requestAnimationFrame(passo);
    }

    function aoMover(evento: PointerEvent) {
      const area = elemento!.getBoundingClientRect();
      destino.current = {
        x: (evento.clientX - area.left) / area.width - 0.5,
        y: (evento.clientY - area.top) / area.height - 0.5,
      };
      acordar();
    }

    function aoSair() {
      destino.current = { x: 0, y: 0 };
      acordar();
    }

    elemento.addEventListener('pointermove', aoMover);
    elemento.addEventListener('pointerleave', aoSair);

    return () => {
      elemento.removeEventListener('pointermove', aoMover);
      elemento.removeEventListener('pointerleave', aoSair);
      cancelAnimationFrame(quadro);
    };
  }, [rotacao, deslocamento]);

  return (
    /* O z-index precisa vir daqui, e não do cartão de dentro: `perspective`
       cria contexto de empilhamento, então o filho não consegue passar por
       cima do wrapper vizinho. Sem isso o cartão que cresce no hover fica
       atrás do irmão seguinte no DOM. */
    <div
      className={`relative [perspective:1200px] [transform-style:preserve-3d] ${className}`}
      style={{ zIndex: sobre ? 10 : 0 }}
    >
      <div
        ref={alvo}
        onPointerEnter={() => setSobre(true)}
        onPointerLeave={() => setSobre(false)}
        className="relative h-full rounded-2xl transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateX(var(--tx,0px)) translateY(var(--ty,0px)) translateZ(${sobre ? 50 : 0}px) scale(${sobre ? 1.05 : 1})`,
          boxShadow:
            'rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px',
        }}
      >
        {children}

        {/* O reflexo: um ponto de luz que acompanha o ponteiro. O
            `mix-blend-overlay` faz ele clarear o que está embaixo em vez
            de cobrir, então o texto do cartão continua legível. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-50 rounded-[16px] mix-blend-overlay"
          style={{
            opacity: brilho,
            background:
              'radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.9) 10%, rgba(255,255,255,0.75) 20%, rgba(255,255,255,0) 80%)',
          }}
        />
      </div>
    </div>
  );
}
