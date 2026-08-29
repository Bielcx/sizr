import assert from 'node:assert/strict';
import test from 'node:test';
import { montarMensagem } from './whatsapp.ts';

test('troca os placeholders pelos valores', () => {
  assert.equal(montarMensagem('Olá, {marca}!', { marca: 'Sizr' }), 'Olá, Sizr!');
});

test('linha some quando o placeholder dela vem vazio', () => {
  const template = ['Medidas: {medidas}', 'Estimativa: {preco}', 'Obrigado!'].join('\n');
  assert.equal(
    montarMensagem(template, { medidas: '28 × 22 cm', preco: '' }),
    'Medidas: 28 × 22 cm\nObrigado!',
  );
});

test('placeholder desconhecido fica no texto, para o erro aparecer', () => {
  assert.equal(montarMensagem('Total: {inexistente}', { marca: 'Sizr' }), 'Total: {inexistente}');
});

test('linha sem placeholder nenhum é preservada mesmo em branco no meio', () => {
  assert.equal(montarMensagem('Olá', {}), 'Olá');
});
