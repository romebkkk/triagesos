/*!
 * TriageSOS v2.0.0 — Árbol clínico de decisión, constantes vitales, qSOFA y banderas rojas
 * Open-source citizen triage & red flag emergency decision tree.
 *
 * Copyright (c) 2026 DataFlow Elegance - Ismael Ben Kazem
 * Licencia MIT · 100% en el navegador · Basado en el Sistema de Triaje de Manchester (MTS) y Criterios Sepsis-3 (qSOFA)
 *
 * AVISO IMPORTANTE (SALUD):
 *  Esta herramienta es de orientación y cribado de urgencias para evitar retrasos en emergencias vitales
 *  y orientar sobre el nivel de atención adecuado. ANTE LA DUDA O SI LA PERSONA TIENE MAL ESTADO GENERAL,
 *  LLAMA INMEDIATAMENTE AL 112 O ACUDE AL CENTRO DE URGENCIAS MÁS PRÓXIMO.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TriageSOS = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '2.0.0';

  var NIVELES = {
    NIVEL_1: {
      id: 'nivel_1',
      color: '#DC2626',
      bg: '#FEF2F2',
      icono: '🚨',
      nombre: 'Nivel 1: EMERGENCIA VITAL INMEDIATA',
      tiempoRecomendado: 'Atención inmediata (0 - 15 minutos)',
      accion: 'Llama inmediatamente al 112 o acude al Servicio de Urgencias Hospitalario más cercano.'
    },
    NIVEL_2: {
      id: 'nivel_2',
      color: '#EA580C',
      bg: '#FFF7ED',
      icono: '⚠️',
      nombre: 'Nivel 2: URGENCIA PREFERENTE',
      tiempoRecomendado: 'Atención en menos de 2 a 4 horas',
      accion: 'Acude hoy mismo al Punto de Atención Continuada (PAC), Centro de Salud o Urgencias.'
    },
    NIVEL_3: {
      id: 'nivel_3',
      color: '#D97706',
      bg: '#FFFBEB',
      icono: '🕒',
      nombre: 'Nivel 3: CONSULTA NO URGENTE',
      tiempoRecomendado: 'Cita con médico de atención primaria en 24 - 48 horas',
      accion: 'Pide cita ordinaria con tu médico de cabecera. Vigila los signos de alarma.'
    },
    NIVEL_4: {
      id: 'nivel_4',
      color: '#059669',
      bg: '#ECFDF5',
      icono: '🩹',
      nombre: 'Nivel 4: AUTOCUIDADO Y OBSERVACIÓN EN DOMICILIO',
      tiempoRecomendado: 'Manejo en casa con medidas de soporte',
      accion: 'Tratamiento sintomático en el hogar (hidratación, descanso, analgésicos habituales). Consulta si no mejora en 3-5 días.'
    }
  };

  /**
   * Evaluación de constantes vitales domiciliarias
   */
  function evaluarConstantesVitales(c) {
    c = c || {};
    var satO2 = parseFloat(c.satO2) || 98;
    var pas = parseInt(c.pas, 10) || 120;
    var pad = parseInt(c.pad, 10) || 80;
    var fc = parseInt(c.fc, 10) || 75;
    var temp = parseFloat(c.temperatura) || 36.5;

    var alertas = [];

    // Saturación de oxígeno
    if (satO2 < 90) {
      alertas.push({ gravedad: 'critica', texto: 'Hipoxemia severa (SatO2 < 90%). Riesgo inminente de insuficiencia respiratoria aguda.' });
    } else if (satO2 < 94) {
      alertas.push({ gravedad: 'moderada', texto: 'Saturación de oxígeno límite o reducida (SatO2 90-93%).' });
    }

    // Tensión arterial
    if (pas < 90) {
      alertas.push({ gravedad: 'critica', texto: 'Hipotensión severa o sospecha de shock (PAS < 90 mmHg).' });
    } else if (pas >= 180 || pad >= 110) {
      alertas.push({ gravedad: 'critica', texto: 'Crisis Hipertensiva severa (PAS >= 180 o PAD >= 110 mmHg). Riesgo de daño en órganos diana.' });
    }

    // Frecuencia cardíaca
    if (fc > 130) {
      alertas.push({ gravedad: 'critica', texto: 'Taquicardia extrema en reposo (> 130 lpm).' });
    } else if (fc < 45) {
      alertas.push({ gravedad: 'critica', texto: 'Bradicardia severa en reposo (< 45 lpm).' });
    }

    // Temperatura
    if (temp >= 40.0) {
      alertas.push({ gravedad: 'critica', texto: 'Hipertermia severa / golpe de calor (>= 40.0ºC).' });
    } else if (temp < 35.0) {
      alertas.push({ gravedad: 'critica', texto: 'Hipotermia patológica (< 35.0ºC).' });
    }

    var tieneCritica = alertas.some(function(a) { return a.gravedad === 'critica'; });

    return {
      alertas: alertas,
      tieneCritica: tieneCritica,
      nivelSugerido: tieneCritica ? NIVELES.NIVEL_1 : (alertas.length ? NIVELES.NIVEL_2 : NIVELES.NIVEL_4)
    };
  }

  /**
   * Escala qSOFA (Quick Sepsis-related Organ Failure Assessment)
   * Criterios consensuados JAMA Sepsis-3 para detectar pacientes con infección grave y riesgo vital
   * @param {object} p - { frecuenciaRespiratoriaAlta: bool, alteracionEstadoMental: bool, presionSistolicaBaja: bool }
   */
  function evaluar_qSOFA(p) {
    p = p || {};
    var fr = !!p.frecuenciaRespiratoriaAlta; // FR >= 22 respiraciones por minuto
    var mental = !!p.alteracionEstadoMental; // Desorientación, somnolencia anormal, confusión
    var pas = !!p.presionSistolicaBaja;     // PAS <= 100 mmHg

    var score = (fr ? 1 : 0) + (mental ? 1 : 0) + (pas ? 1 : 0);
    var sospechaSepsisGrave = score >= 2;

    return {
      score: score,
      max: 3,
      sospechaSepsisGrave: sospechaSepsisGrave,
      nivel: sospechaSepsisGrave ? NIVELES.NIVEL_1 : (score === 1 ? NIVELES.NIVEL_2 : NIVELES.NIVEL_3),
      mensajeClinico: sospechaSepsisGrave
        ? '🚨 ALERTA CRÍTICA: Puntuación qSOFA >= 2. Alta sospecha de SEPSIS (respuesta sistémica desregulada a una infección con riesgo de fallo multiorgánico). REQUIERE TRASLADO INMEDIATO AL HOSPITAL POR 112.'
        : (score === 1 ? 'qSOFA = 1 punto. Monitorizar estrechamente la evolución y consultar hoy.' : 'qSOFA = 0 puntos. Bajo riesgo inmediato de shock séptico.')
    };
  }

  /**
   * Triaje Pediátrico de Alarma Inmediata
   */
  function triarPediatrico(s) {
    s = s || {};
    var banderasRojas = [];

    if (s.petequiasManchasPurpura) banderasRojas.push('Manchas violáceas o rojas en la piel que NO desaparecen al presionar con un vaso de cristal (sospecha de sepsis meningocócica).');
    if (s.tirajeRespiratorioHundimiento) banderasRojas.push('Dificultad para respirar evidente (se le hunden las costillas o el pecho, o aleteo nasal).');
    if (s.llantoInconsolableOHipoactivo) banderasRojas.push('Niño decaído que no responde a estímulos, somnoliento extremo o llanto muy débil quejumbroso.');
    if (s.bebeMenor3MesesFiebre) banderasRojas.push('Lactante menor de 3 meses con fiebre (>= 38ºC).');

    if (banderasRojas.length > 0) {
      return {
        nivel: NIVELES.NIVEL_1,
        motivo: 'Banderas rojas pediátricas de gravedad vital inmediata.',
        banderasRojas: banderasRojas,
        queHacer: ['Llama de inmediato al 112 o acude al hospital infantil de urgencias más cercano sin demora.']
      };
    }

    return {
      nivel: NIVELES.NIVEL_3,
      motivo: 'Cuadro sin banderas rojas inmediatas de riesgo vital.',
      banderasRojas: [],
      queHacer: ['Observar hidratación y tolerancia a líquidos.', 'Consultar con pediatra si persiste.']
    };
  }

  /**
   * Dolor Torácico / Pecho
   */
  function triarPecho(sintomas) {
    sintomas = sintomas || {};
    var banderasRojas = [];

    if (sintomas.dolorOpresivo) banderasRojas.push('Dolor de tipo opresivo («sensación de losa o peso en el centro del pecho»).');
    if (sintomas.irradiacionBrazoMandibula) banderasRojas.push('Dolor que se extiende hacia el brazo izquierdo, cuello, mandíbula o espalda.');
    if (sintomas.sudorFrioMareoDisnea) banderasRojas.push('Acompañado de sudoración fría, náuseas, mareo o dificultad para respirar.');
    if (sintomas.dolorDesgarroBrusco) banderasRojas.push('Dolor muy intenso y punzante de aparición brusca como un desgarro en el pecho o la espalda.');

    if (banderasRojas.length > 0) {
      return {
        nivel: NIVELES.NIVEL_1,
        motivo: 'Alta sospecha de Síndrome Coronario Agudo (Infarto de Miocardio) o disección aórtica.',
        banderasRojas: banderasRojas,
        queHacer: [
          'Llama al 112 de inmediato y di: «Posible infarto de miocardio / dolor torácico de perfil isquémico».',
          'Permanece en reposo absoluto (sentado o semisentado). No camines ni hagas esfuerzos.',
          'Si tienes antecedentes coronarios y te prescribieron nitroglicerina sublingual (Cafinitrina), tómala según las pautas de tu cardiólogo.'
        ]
      };
    }

    if (sintomas.dolorEmpeoraRespirarTos && sintomas.fiebre) {
      return {
        nivel: NIVELES.NIVEL_2,
        motivo: 'Sospecha de pleuritis, pericarditis o infección pulmonar (neumonía).',
        banderasRojas: ['Dolor en punta de costado con fiebre que aumenta al respirar hondo o toser.'],
        queHacer: [
          'Acude hoy a valoración médica (urgencias de atención primaria o centro de salud).',
          'No tomes antibióticos por tu cuenta sin auscultación previa.'
        ]
      };
    }

    if (sintomas.dolorReproduciblePalpacion) {
      return {
        nivel: NIVELES.NIVEL_4,
        motivo: 'Perfil músculo-esquelético o condrocostal (el dolor cambia claramente al apretar la costilla con el dedo).',
        banderasRojas: [],
        queHacer: [
          'Reposo relativo y calor local si procede.',
          'Analgésico habitual según prescripción (Paracetamol).'
        ]
      };
    }

    return {
      nivel: NIVELES.NIVEL_3,
      motivo: 'Molestia torácica sin banderas rojas agudas de isquemia.',
      banderasRojas: [],
      queHacer: ['Pide cita ordinaria con tu médico de cabecera si las molestias continúan.']
    };
  }

  return {
    VERSION: VERSION,
    NIVELES: NIVELES,
    evaluarConstantesVitales: evaluarConstantesVitales,
    evaluar_qSOFA: evaluar_qSOFA,
    triarPediatrico: triarPediatrico,
    triarPecho: triarPecho
  };
});
