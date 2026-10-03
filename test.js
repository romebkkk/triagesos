/**
 * TriageSOS - Back-testing y suite de verificación clínica
 * Comando: node test.js
 */
'use strict';
var assert = require('assert');
var TriageSOS = require('./triagesos.js');

var passed = 0;
function test(nombre, fn) {
  try {
    fn();
    passed++;
    console.log('  [OK] ' + nombre);
  } catch (e) {
    console.error('  [FAIL] ' + nombre + '\n         ' + e.message);
    process.exitCode = 1;
  }
}

console.log('=== 1. Back-testing: Triaje Torácico / Cardiovascular ===');

test('Opresión torácica con irradiación a mandíbula y sudor frío clasifica como Nivel 1 (Emergencia Vital)', function () {
  var res = TriageSOS.triarPecho({
    dolorOpresivo: true,
    irradiacionBrazoMandibula: true,
    sudorFrioMareoDisnea: true
  });
  assert.strictEqual(res.nivel.id, 'nivel_1');
  assert.ok(res.banderasRojas.length >= 3);
  assert.ok(/Infarto/i.test(res.motivo));
});

test('Dolor punzante que se reproduce claramente al tocar con el dedo clasifica como Nivel 4 (Músculo-esquelético)', function () {
  var res = TriageSOS.triarPecho({ dolorReproduciblePalpacion: true });
  assert.strictEqual(res.nivel.id, 'nivel_4');
  assert.strictEqual(res.banderasRojas.length, 0);
});

console.log('\n=== 2. Back-testing: Triaje Pediátrico / Banderas Rojas Infantiles ===');

test('Lactante de 2 meses con 38.2ºC de fiebre clasifica como Nivel 1 (Urgencia Hospitalaria inmediata)', function () {
  var res = TriageSOS.triarPediatria({ edadMeses: 2, temperatura: 38.2 });
  assert.strictEqual(res.nivel.id, 'nivel_1');
  assert.ok(/menor de 3 meses/i.test(res.banderasRojas[0]));
});

test('Niño con fiebre y manchas petequiales (Prueba del Vaso positiva) activa Nivel 1 Crítico', function () {
  var res = TriageSOS.triarPediatria({ petequiasManchasVaso: true, temperatura: 39.0 });
  assert.strictEqual(res.nivel.id, 'nivel_1');
  assert.ok(/Petequias|meningoc/i.test(res.banderasRojas[0]));
});

test('Niño de 4 años con fiebre de 24h, sin dificultad respiratoria y buen estado general clasifica como Nivel 4', function () {
  var res = TriageSOS.triarPediatria({ edadMeses: 48, temperatura: 38.5 });
  assert.strictEqual(res.nivel.id, 'nivel_4');
  assert.strictEqual(res.banderasRojas.length, 0);
});

console.log('\n=== 3. Back-testing: Triaje Abdominal y Cefaleas ===');

test('Vientre en tabla con dolor insoportable activa Nivel 1 (Peritonitis aguda)', function () {
  var res = TriageSOS.triarAbdomen({ vientreEnTabla: true });
  assert.strictEqual(res.nivel.id, 'nivel_1');
  assert.ok(/Abdomen agudo|Peritonitis/i.test(res.motivo + ' ' + res.banderasRojas.join(' ')));
});

test('Dolor en fosa ilíaca derecha con febrícula clasifica como Nivel 2 (Sospecha Apendicitis)', function () {
  var res = TriageSOS.triarAbdomen({ dolorFosaIliacaDerechaFiebre: true });
  assert.strictEqual(res.nivel.id, 'nivel_2');
  assert.ok(/Apendicitis/i.test(res.motivo));
});

test('Cefalea en trueno súbita insoportable activa Nivel 1 (Sospecha Hemorragia Subaracnoidea)', function () {
  var res = TriageSOS.triarCefalea({ cefaleaEnTruenoSubita: true });
  assert.strictEqual(res.nivel.id, 'nivel_1');
  assert.ok(/Hemorragia subaracnoidea|aneurisma|extrema gravedad/i.test(res.motivo + ' ' + res.banderasRojas.join(' ')));
});

test('Migraña habitual sin signos atípicos clasifica como Nivel 4 (Tratamiento pautado en domicilio)', function () {
  var res = TriageSOS.triarCefalea({ cefaleaHabitualMigranaConocida: true });
  assert.strictEqual(res.nivel.id, 'nivel_4');
});

console.log('\n' + passed + ' casos clínicos de back-testing superados con 100% de precisión.');
