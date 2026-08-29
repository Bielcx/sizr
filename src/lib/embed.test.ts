import assert from 'node:assert/strict';
import test from 'node:test';
import { lerEstadoUrl, lerOpcoesEmbed } from './embed.ts';
import { sizrConfig } from '../../sizr.config.ts';

const caixa = (config: typeof sizrConfig) => config.formatos[0].dimensoes[0];

test('sem parâmetros, devolve o config do arquivo', () => {
  const { config, mostrarAssinatura } = lerOpcoesEmbed('', sizrConfig);
  assert.equal(config.whatsapp.numero, sizrConfig.whatsapp.numero);
  assert.equal(mostrarAssinatura, true);
});

test('sobrescreve número, marca, unidade e cor', () => {
  const { config } = lerOpcoesEmbed('?wa=5521988887777&marca=Grafica&unidade=mm&cor=ff6b00', sizrConfig);
  assert.equal(config.whatsapp.numero, '5521988887777');
  assert.equal(config.marca.nome, 'Grafica');
  assert.equal(config.unidade, 'mm');
  assert.equal(config.marca.corPrimaria, '#ff6b00');
});

test('faixas mudam min/max e trazem o padrão para dentro do novo limite', () => {
  const { config } = lerOpcoesEmbed('?faixas=comprimento:30-40', sizrConfig);
  const dimensao = caixa(config);
  assert.deepEqual([dimensao.min, dimensao.max], [30, 40]);
  assert.equal(dimensao.padrao, 30); // o padrão do arquivo é 28, abaixo do novo mínimo
});

test('faixa inválida é ignorada em vez de quebrar o slider', () => {
  for (const busca of ['?faixas=comprimento:60-15', '?faixas=comprimento:abc', '?faixas=lixo']) {
    const dimensao = caixa(lerOpcoesEmbed(busca, sizrConfig).config);
    assert.deepEqual([dimensao.min, dimensao.max], [15, 60], busca);
  }
});

test('semmarca=1 esconde a assinatura', () => {
  assert.equal(lerOpcoesEmbed('?semmarca=1', sizrConfig).mostrarAssinatura, false);
});

test('preco liga a estimativa e usa o divisor do volume', () => {
  const { config } = lerOpcoesEmbed('?preco=12,90', sizrConfig);
  assert.equal(config.resumo.preco?.valor, 12.9);
  assert.equal(config.resumo.preco?.divisor, sizrConfig.resumo.divisorVolume);
});

test('precomin vira piso do orcamento', () => {
  const { config } = lerOpcoesEmbed('?preco=12.90&precomin=80', sizrConfig);
  assert.equal(config.resumo.preco?.minimo, 80);
});

test('preco invalido nao liga a estimativa', () => {
  for (const busca of ['?preco=abc', '?preco=0', '?preco=-5']) {
    assert.equal(lerOpcoesEmbed(busca, sizrConfig).config.resumo.preco, undefined, busca);
  }
});

test('sem preco na URL o configurador nao fala de preco', () => {
  assert.equal(lerOpcoesEmbed('?wa=5511999999999', sizrConfig).config.resumo.preco, undefined);
});

test('estado da URL devolve formato, medidas e quantidade', () => {
  const estado = lerEstadoUrl('?f=caixa&m=comprimento:28,altura:9&q=250');
  assert.equal(estado.formatoId, 'caixa');
  assert.deepEqual(estado.medidas, { comprimento: 28, altura: 9 });
  assert.equal(estado.quantidade, 250);
});

test('estado ausente ou invalido vira undefined em vez de quebrar', () => {
  assert.deepEqual(lerEstadoUrl(''), {
    formatoId: undefined,
    medidas: undefined,
    quantidade: undefined,
  });
  assert.equal(lerEstadoUrl('?q=0').quantidade, undefined);
  assert.equal(lerEstadoUrl('?m=lixo').medidas, undefined);
});
