# Sizr

Configurador 3D de produto sob medida. O cliente ajusta as medidas com
sliders, vê o resultado em 3D em tempo real e manda o pedido direto no
WhatsApp com as medidas já escritas na mensagem.

**Sem backend, sem banco de dados, sem mensalidade.** O build é um site
estático — sobe em Vercel, Netlify, Cloudflare Pages ou GitHub Pages e
fica lá, de graça, sem nada para manter.

---

## Rodando

Precisa de [Node.js 20+](https://nodejs.org).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente `localhost:5173`).

Para publicar:

```bash
npm run build
```

Para rodar os testes do parser de embed:

```bash
npm test
```

O resultado fica em `dist/`. É essa pasta que você sobe.

---

## Configurando

Tudo que você precisa mudar está em **`sizr.config.ts`**, na raiz do
projeto. Nenhum outro arquivo precisa ser tocado.

| O que | Onde | Exemplo |
| --- | --- | --- |
| Nome da empresa | `marca.nome` | `'Gráfica Central'` |
| Cores | `marca.cor*` | `corPrimaria: '#0d5c3a'` |
| Fontes | `marca.fonte*` | trocar também o `<link>` no `index.html` |
| Número do WhatsApp | `whatsapp.numero` | `'5511999999999'` (país + DDD + número, só dígitos) |
| Texto da mensagem | `whatsapp.mensagem` | veja os placeholders abaixo |
| Unidade | `unidade` | `'cm'`, `'mm'`, `'m'` |
| Formatos e faixas | `formatos[]` | `min: 15, max: 60` |
| Textos dos botões | `textos` | `ctaWhatsApp: 'Pedir orçamento'` |

### As três geometrias

| `modelo` | Serve para | Medidas que ele usa |
| --- | --- | --- |
| `caixa` | embalagem, papelão, estojo | comprimento (x), largura (z), altura (y) + abas |
| `plano` | vidro, espelho, placa, chapa, tampo, painel | largura (x), altura (y), espessura (z) |
| `cilindro` | copo, pote, tubo, lata, vaso | diâmetro (x), altura (y) |

Elas são paramétricas: quem define o produto são as **dimensões** do
formato, não a geometria. Um painel de MDF e um espelho de 4 mm usam o
mesmo `plano` com faixas diferentes. No `cilindro` o diâmetro escala os
dois eixos horizontais juntos — não existe cilindro achatado por engano.
No `plano`, se você não declarar espessura, ele usa 1,5% da maior medida.

Cada formato pode sobrescrever o resumo global com `resumo`, porque a
mesma página costuma ter unidades diferentes: a caixa sai em litros e o
vidro em metro quadrado. `divisorVolume` é o que faz essa troca — e o
preço do Pro acompanha, com o `divisor` dele.

---

### A biblioteca de formatos

O **`presets.ts`** traz formatos prontos das três geometrias: caixa,
estojo, vidro, espelho, box de banheiro, painel, prateleira, bancada,
placa, envelope, copo, pote e tubo. Importe os que servem e cole em
`formatos`, no `sizr.config.ts`:

```ts
import { caixa, painel, prateleira } from './presets.ts';
// ...
formatos: [caixa, painel, prateleira],
```

As faixas ali são de mercado, não as suas — ajuste antes de publicar.

**Uma regra que atravessa todos:** a medida derivada (volume, área,
capacidade) é o produto das dimensões declaradas, com uma exceção — o
cilindro usa π·r²·h, porque diâmetro × altura não é capacidade de nada.
Por isso os presets cobrados por metro quadrado declaram só largura e
altura: incluir a espessura como terceira medida transformaria a área em
volume e o preço sairia errado. Espessura de vidro e de chapa se escolhe
por catálogo, não por régua.

---

### As faixas de medida são o seu catálogo

`min` e `max` de cada dimensão são o limite real da sua produção. Se você
não corta caixa acima de 60 cm, ponha `max: 60` — o cliente simplesmente
não consegue pedir o que você não faz. É o jeito mais barato de evitar um
orçamento que vira "isso a gente não consegue".

### Placeholders da mensagem

| Placeholder | Vira |
| --- | --- |
| `{marca}` | nome da empresa |
| `{formato}` | formato escolhido (ex.: `Caixa`) |
| `{medidas}` | medidas em linha (ex.: `28 × 22 × 9 cm`) |
| `{lista}` | uma medida por linha (ex.: `Comprimento: 28 cm`) |
| `{volume}` | volume calculado (ex.: `5,5 L`) |
| `{comprimento}`, `{altura}`, … | o `id` de qualquer dimensão do formato |

### Formatos "em breve"

Um formato com `disponivel: false` continua aparecendo, desabilitado, com
a etiqueta "em breve". Serve para sinalizar que tem mais coisa vindo sem
prometer o que ainda não dá para entregar.

A caixa é só o modelo que já está implementado — o configurador não é de
embalagem, é de qualquer coisa que se venda por medida (bancada,
prateleira, toldo, painel, vidro). Troque a lista de "em breve" pelos
produtos que **você** vende: ela é a vitrine do que dá para modelar.

---

## Modo embed (iframe)

O mesmo build serve dois usos. Sem parâmetros, ele abre a landing. Com
`?embed=1`, abre só o configurador — feito para rodar dentro de um
`<iframe>` no site de outra pessoa, sem que ela instale nada:

```html
<iframe
  src="https://seu-dominio.com/?embed=1&wa=5511999999999&marca=Sua%20Empresa&cor=4df98a&faixas=comprimento:15-60,altura:5-30"
  width="100%" height="620" style="border:0;border-radius:12px"
  title="Monte seu produto sob medida"
></iframe>
```

| Parâmetro | O que faz |
| --- | --- |
| `embed` | Liga o modo iframe. Basta estar presente. |
| `wa` | WhatsApp de destino: país + DDD + número, só dígitos. |
| `marca` | Nome da empresa (usado na mensagem e na interface). |
| `cor` | Cor primária em hex, com ou sem `#`. O tom de hover sai dela. |
| `unidade` | `cm`, `mm`, `m`… |
| `faixas` | Limites de produção: `dimensao:min-max`, separados por vírgula. |
| `preco` | Quanto você cobra por unidade. Liga a estimativa ao vivo. |
| `precomin` | Valor mínimo de pedido, para peça pequena não sair de graça. |
| `semmarca` | `1` esconde a assinatura "feito com Sizr" no rodapé. |
| `f` `m` `q` | Formato, medidas e quantidade — preenchidos sozinhos. |

**O snippet traz um `<script>`, e ele importa.** Altura fixa quebra no
celular: lá o configurador empilha painel e cena 3D e passa de 900px, e o
conteúdo fica cortado dentro do iframe. O embed mede a própria altura com
um `ResizeObserver` e avisa a página hospedeira; o script do outro lado só
aplica o número, e confere a origem antes — outro iframe da página não
consegue redimensionar este.

**Link que reabre o pedido.** Enquanto o cliente mexe, o configurador
grava formato, medidas e quantidade na própria URL (`f`, `m`, `q`) com
`replaceState`. Esse endereço vai junto na mensagem do WhatsApp pelo
placeholder `{link}`: em vez de reconstruir o pedido pelas medidas
escritas, a loja abre o link e vê exatamente o que o cliente montou.
Parâmetro inválido é ignorado, então link velho degrada para o padrão em
vez de quebrar.

O que não vem na URL cai no valor do `sizr.config.ts`. Uma faixa
malformada é ignorada em vez de quebrar o slider, e o valor padrão é
puxado para dentro do novo limite — `npm test` cobre esses casos.

### Grátis x Pro

O modo embed é o produto de graça: qualquer um gera o iframe na landing,
com o WhatsApp, a cor e as **faixas de produção** dele, e usa sem
cadastro. O que ele carrega é a assinatura "feito com Sizr" no rodapé,
com link de volta marcado (`?via=embed`) — é o que transforma cada
instalação grátis em divulgação.

O Pro entrega duas coisas, e a URL de quem paga sai com `semmarca=1` e
`preco=`:

| | Grátis | Pro |
| --- | --- | --- |
| Configurador 3D e faixas | ✓ | ✓ |
| Pedido no WhatsApp | ✓ | ✓ |
| Estimativa de preço ao vivo | — | ✓ |
| Assinatura no rodapé | sim | não |

**Como o preço é calculado.** `(produto de todas as dimensões / divisor)
× valor`, com piso em `minimo`. A fórmula se adapta à geometria sozinha:
três dimensões em cm com `divisor: 1000` dão litros, então `valor` é o
preço por litro; um formato plano de duas dimensões com `divisor: 10000`
dá m², e `valor` vira o preço por metro quadrado. Não existe código
separado por tipo de produto.

O preço também entra na mensagem do WhatsApp pelo placeholder `{preco}`.
Linha de template cujo placeholder resolve vazio é removida inteira — sem
preço configurado, a linha "Estimativa: {preco}" não vira um rótulo
órfão.

> **Sobre o `semmarca`:** sem backend não há como validar licença — o
> parâmetro é honra-o-cliente de propósito. Vale a pena: quem ia pagar
> paga, e quem ia burlar não ia pagar de qualquer jeito, mas continua
> divulgando enquanto não descobre o truque. Se um dia virar problema, o
> passo seguinte é uma função serverless assinando o parâmetro.

---

## Encaixando num site que já existe

O `src/App.tsx` é só uma página de demonstração. Se você já tem site,
importe o componente e ignore o resto:

```tsx
import { Configurador } from './components/Configurador';

<Configurador />;
```

Ele lê o `sizr.config.ts` sozinho. Se precisar de mais de um preset na
mesma página (duas linhas de produto, por exemplo), passe um config
próprio: `<Configurador config={outroConfig} />`.

---

## Como está organizado

```
sizr.config.ts              ← o único arquivo que você edita
src/
  App.tsx                   a landing de venda
  Embed.tsx                 o configurador puro, para o iframe
  types/config.ts           tipos do config (autocomplete no editor)
  lib/
    tema.ts                 cores do config → variáveis CSS
    whatsapp.ts             placeholders + link wa.me
    formato.ts              formatação de número em pt-BR
    embed.ts                parâmetros da URL → config (+ embed.test.ts)
    medidas.ts              volume, área e capacidade (+ medidas.test.ts)
  hooks/useConfigurador.ts  todo o estado: medidas, volume, link
  components/
    Configurador.tsx        junta painel + cena 3D
    GeradorEmbed.tsx        gera o iframe do plano grátis, com copiar
    SeletorFormato.tsx      botões de formato
    SliderMedida.tsx        um slider por dimensão
    FichaResumo.tsx         medidas + volume
    viewport/
      Viewport.tsx          o <Canvas> e os elementos sobrepostos
      CaixaModelo.tsx       a caixa: corpo + 4 abas
      PlanoModelo.tsx       peça plana: vidro, placa, painel
      CilindroModelo.tsx    copo, pote, tubo
      materiais.ts          preenchimento + arestas, com descarte
      Controles.tsx         girar e dar zoom
      geometrias.ts         geometrias unitárias compartilhadas
```

## Stack

React 19 · Vite 7 · TypeScript · Tailwind CSS 4 · three.js + React Three Fiber
