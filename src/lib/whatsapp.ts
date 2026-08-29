/**
 * Geração do link wa.me. É aqui que o Sizr substitui um backend:
 * em vez de gravar o pedido num banco e disparar e-mail, a gente monta
 * uma mensagem pronta e entrega a conversa no WhatsApp da empresa.
 */

/** Valores que os placeholders da mensagem podem usar. */
export type Substituicoes = Record<string, string>;

/**
 * Troca {placeholders} pelos valores correspondentes.
 * Placeholder sem valor definido fica no texto de propósito — assim um
 * erro de digitação no sizr.config.ts aparece na mensagem em vez de
 * sumir silenciosamente.
 */
export function montarMensagem(template: string, valores: Substituicoes): string {
  const linhas = template.split('\n').flatMap((linha) => {
    const chaves = [...linha.matchAll(/\{([\w-]+)\}/g)].map((m) => m[1]);

    // Linha construída em volta de um placeholder que veio vazio (preço
    // desligado, volume desligado) some inteira: senão sobra um rótulo
    // órfão do tipo "Estimativa: " na mensagem do cliente.
    const temPlaceholder = chaves.some((chave) => chave in valores);
    const todosVazios = chaves.every((chave) => (valores[chave] ?? '') === '');
    if (temPlaceholder && todosVazios) return [];

    return [
      linha.replace(/\{([\w-]+)\}/g, (original, chave: string) =>
        chave in valores ? valores[chave] : original,
      ),
    ];
  });

  return linhas
    .join('\n')
    // Sem a linha removida, o espaço em volta dela não vira buraco.
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Monta o link wa.me com a mensagem já codificada. */
export function linkWhatsApp(numero: string, mensagem: string): string {
  const apenasDigitos = numero.replace(/\D/g, '');
  return `https://wa.me/${apenasDigitos}?text=${encodeURIComponent(mensagem)}`;
}
