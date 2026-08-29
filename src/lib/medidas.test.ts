import assert from 'node:assert/strict';
import test from 'node:test';
import { medidaDerivada } from './medidas.ts';
import { caixa, copo, painel } from '../../presets.ts';

test('caixa: produto das tres dimensoes vira volume', () => {
  // 28 × 22 × 9 cm
  assert.equal(medidaDerivada(caixa, {}), 28 * 22 * 9);
});

test('plano de duas dimensoes vira area, nao volume', () => {
  // 120 × 180 cm = 21600 cm² → 2,16 m² com divisor 10000
  assert.equal(medidaDerivada(painel, {}), 120 * 180);
});

test('cilindro usa pi*r^2*h, nao diametro x altura', () => {
  // 8 cm de diâmetro por 12 cm: 603 cm³, não 96
  const capacidade = medidaDerivada(copo, {})!;
  assert.ok(Math.abs(capacidade - (Math.PI / 4) * 64 * 12) < 1e-9);
  assert.ok(capacidade > 600 && capacidade < 606, `esperava ~603, veio ${capacidade}`);
});

test('medidas escolhidas substituem os padroes', () => {
  assert.equal(medidaDerivada(painel, { largura: 100, altura: 200 }), 20000);
});

test('formato sem dimensoes nao produz medida', () => {
  assert.equal(medidaDerivada({ ...painel, dimensoes: [] }, {}), null);
});
