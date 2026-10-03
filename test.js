/**
 * Test Suite para TriageSOS v2.0.0 - Validación clínica de constantes, qSOFA y banderas rojas
 */

const assert = require('assert');
const TriageSOS = require('./triagesos');

console.log('--- INICIANDO TESTS CLÍNICOS DE TRIAGESOS v2.0.0 ---');

// Test 1: Constantes vitales con hipoxemia crítica (SatO2 < 90%)
const vitCrit = TriageSOS.evaluarConstantesVitales({ satO2: 88, pas: 110, fc: 80 });
assert.strictEqual(vitCrit.tieneCritica, true);
assert.strictEqual(vitCrit.nivelSugerido.id, 'nivel_1');
console.log('✅ Test 1 Superado: Hipoxemia severa detectada como Nivel 1 inmediato.');

// Test 2: Constantes vitales normales
const vitNorm = TriageSOS.evaluarConstantesVitales({ satO2: 98, pas: 120, fc: 70, temperatura: 36.6 });
assert.strictEqual(vitNorm.tieneCritica, false);
console.log('✅ Test 2 Superado: Constantes normales evaluadas sin falsas alarmas.');

// Test 3: Escala qSOFA para detección precoz de sepsis (score >= 2)
const qsofaPos = TriageSOS.evaluar_qSOFA({
  frecuenciaRespiratoriaAlta: true, // FR >= 22
  alteracionEstadoMental: true,     // Confuso/somnoliento
  presionSistolicaBaja: false
});
assert.strictEqual(qsofaPos.score, 2);
assert.strictEqual(qsofaPos.sospechaSepsisGrave, true);
assert.strictEqual(qsofaPos.nivel.id, 'nivel_1');
console.log('✅ Test 3 Superado: Escala qSOFA detecta sospecha de Sepsis-3 crítica.');

// Test 4: Banderas rojas pediátricas (Petequias que no blanquean)
const pedCrit = TriageSOS.triarPediatrico({
  petequiasManchasPurpura: true,
  tirajeRespiratorioHundimiento: false
});
assert.strictEqual(pedCrit.nivel.id, 'nivel_1');
assert.ok(pedCrit.banderasRojas[0].includes('meningocócica'));
console.log('✅ Test 4 Superado: Banderas rojas pediátricas (petequias) detectadas con urgencia máxima.');

// Test 5: Triaje de dolor torácico (Sospecha Infarto)
const pechoInfarto = TriageSOS.triarPecho({
  dolorOpresivo: true,
  irradiacionBrazoMandibula: true,
  sudorFrioMareoDisnea: true
});
assert.strictEqual(pechoInfarto.nivel.id, 'nivel_1');
console.log('✅ Test 5 Superado: Infarto de miocardio agudo clasificado como Nivel 1.');

console.log('\n--- TODOS LOS 5 TESTS DE TRIAGESOS v2.0.0 SUPERADOS EXITOSAMENTE ---');
