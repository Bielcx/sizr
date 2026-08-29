import { useEffect, useRef, type ReactNode } from 'react';
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl';

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
}

/* Valores do reactbits, inclusive as cores: fundo transparente (tint
   opacity 0), borda #525252, brilho e texto quase brancos. */
const RAIO = 18;
const COR_BRILHO = '#ffffff';
const COR_BORDA = '#525252';
const COR_TEXTO = '#f5f5f5';
const INTENSIDADE = 1;
const TAMANHO_BRILHO = 10; // graus
const DESVANECIMENTO = 40; // graus
const ESPESSURA = 1; // px
const VELOCIDADE = 0.35; // rad/s quando o ponteiro está longe
const PROXIMIDADE = 250; // px

/** Folga do canvas além do botão, para o brilho vazar da borda. */
const FOLGA = 20;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = sdRoundedRect(p, uHalfSize, uRadius);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // Traço escuro colado na borda, que dá a sensação de espessura.
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  // Especular simétrico: a borda voltada para a luz e a oposta acendem
  // juntas. A janela angular é medida com a normal elíptica, então varia
  // continuamente ao longo dos lados retos.
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

/**
 * Botão com reflexo especular na borda, portado do reactbits.
 *
 * A moldura é um shader: um campo de distância de retângulo arredondado
 * desenha a borda, e uma janela angular decide que trecho dela reflete a
 * luz. O ângulo aponta para o ponteiro quando ele chega perto e volta a
 * varrer sozinho quando ele se afasta.
 *
 * O botão em si é transparente — o que se vê é só a moldura.
 */
export function BotaoEspecular({ href, children, className = '' }: Props) {
  const botao = useRef<HTMLAnchorElement>(null);
  const efeito = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const alvo = botao.current;
    const caixa = efeito.current;
    if (!alvo || !caixa) return;

    const dpr = window.devicePixelRatio || 1;
    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      dpr,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometria = new Triangle(gl);
    delete geometria.attributes.uv;

    const corLinha = new Color(COR_BRILHO);
    const corBase = new Color(COR_BORDA);

    const programa = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: 0 },
        uAngle: { value: 2.4 },
        uPx: { value: dpr },
        uLineColor: { value: [corLinha.r, corLinha.g, corLinha.b] },
        uBaseColor: { value: [corBase.r, corBase.g, corBase.b] },
        uIntensity: { value: 1 },
        uShineSize: { value: (TAMANHO_BRILHO * Math.PI) / 180 },
        uShineFade: { value: (DESVANECIMENTO * Math.PI) / 180 },
        uThickness: { value: ESPESSURA * dpr },
        uBaseWidth: { value: dpr },
      },
    });

    const malha = new Mesh(gl, { geometry: geometria, program: programa });
    caixa.appendChild(gl.canvas);

    const medida = { largura: 1, altura: 1 };

    function redimensionar() {
      // Tamanho fracionário e centro explícito mantêm a borda desenhada
      // exatamente sobre a do CSS — arredondar aqui a desloca um pixel.
      const area = alvo!.getBoundingClientRect();
      medida.largura = area.width;
      medida.altura = area.height;
      renderer.setSize(area.width + FOLGA * 2, area.height + FOLGA * 2);
      programa.uniforms.uCenter.value = [
        (FOLGA + area.width / 2) * dpr,
        (FOLGA + area.height / 2) * dpr,
      ];
      programa.uniforms.uHalfSize.value = [(area.width / 2) * dpr, (area.height / 2) * dpr];
    }

    const observador = new ResizeObserver(redimensionar);
    observador.observe(alvo);
    redimensionar();

    let anguloPonteiro: number | null = null;
    let proximidade = 0;

    function aoMover(evento: PointerEvent) {
      const area = alvo!.getBoundingClientRect();
      const cx = area.left + area.width / 2;
      const cy = area.top + area.height / 2;

      // Distância até a borda, não até o centro.
      const dx = Math.max(area.left - evento.clientX, 0, evento.clientX - area.right);
      const dy = Math.max(area.top - evento.clientY, 0, evento.clientY - area.bottom);
      const distancia = Math.hypot(dx, dy);

      if (distancia === 0) {
        // Com o ponteiro sobre o botão a luz assenta na diagonal, e balança
        // de leve conforme a posição dentro dele.
        const nx = (evento.clientX - cx) / (area.width / 2);
        const ny = (cy - evento.clientY) / (area.height / 2);
        anguloPonteiro =
          Math.atan2(2 / area.height, -2 / area.width) + nx * 0.3 + ny * 0.15;
      } else {
        anguloPonteiro = Math.atan2(cy - evento.clientY, evento.clientX - cx);
      }

      const t = Math.max(0, 1 - distancia / PROXIMIDADE);
      proximidade = t * t * (3 - 2 * t);
    }

    let angulo = 2.4;
    let anguloOcioso = 2.4;
    let brilho = 0;
    let anterior = performance.now();
    let quadro = 0;

    function passo(agora: number) {
      quadro = requestAnimationFrame(passo);
      const dt = Math.min((agora - anterior) / 1000, 0.05);
      anterior = agora;

      anguloOcioso += VELOCIDADE * dt;
      const destino = anguloPonteiro ?? anguloOcioso;

      // Caminho mais curto no círculo: sem isso a luz dá a volta inteira
      // quando o ponteiro cruza o eixo.
      const diferenca = ((destino - angulo + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angulo += diferenca * (1 - Math.exp(-dt * 7));

      brilho += (proximidade - brilho) * (1 - Math.exp(-dt * 8));

      programa.uniforms.uAngle.value = angulo;
      programa.uniforms.uRadius.value =
        Math.min(RAIO, Math.min(medida.largura, medida.altura) / 2) * dpr;
      programa.uniforms.uIntensity.value = INTENSIDADE * brilho;
      renderer.render({ scene: malha });
    }

    window.addEventListener('pointermove', aoMover);
    quadro = requestAnimationFrame(passo);

    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
      window.removeEventListener('pointermove', aoMover);
      if (gl.canvas.parentNode === caixa) caixa.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <a
      ref={botao}
      href={href}
      className={`relative inline-flex items-center justify-center rounded-[18px] px-10 py-[18px] text-[1.15rem] leading-none font-medium tracking-[0.01em] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_8px_24px_rgb(0_0_0/0.25)] transition-transform active:scale-[0.97] ${className}`}
      style={{ color: COR_TEXTO }}
    >
      <span ref={efeito} aria-hidden="true" className="pointer-events-none absolute -inset-5 z-[1] [&>canvas]:block [&>canvas]:size-full" />
      <span className="relative z-[2]">{children}</span>
    </a>
  );
}
