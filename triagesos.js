/*!
 * TriageSOS v1.0.0 — Árbol clínico de decisión y detección de banderas rojas
 * Open-source citizen triage & red flag emergency decision tree.
 *
 * Copyright (c) 2026 DataFlow Elegance - Ismael Ben Kazem
 * Licencia MIT · 100% en el navegador · Basado en criterios del Sistema de Triaje de Manchester (MTS) y guías del SNS
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

  var VERSION = '1.0.0';

  // ------------------------------------------------------------------ Niveles de Triaje
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

  // ------------------------------------------------------------------ Motores Clínicos por Categoría

  /**
   * 1. DOLOR TORÁCICO / PECHO
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
          'Analgésico habitual según prescripción (Paracetamol).',
          'Si no cede en unos días o aparecen opresión o mareo, consulta a tu médico.'
        ]
      };
    }

    return {
      nivel: NIVELES.NIVEL_3,
      motivo: 'Molestia torácica sin banderas rojas agudas de isquemia.',
      banderasRojas: [],
      queHacer: ['Solicita cita con tu médico de cabecera para un electrocardiograma y estudio basal.']
    };
  }

  /**
   * 2. FIEBRE EN NIÑOS Y PEDIATRÍA
   */
  function triarPediatria(sintomas) {
    sintomas = sintomas || {};
    var banderasRojas = [];

    var meses = parseInt(sintomas.edadMeses, 10);
    var esLactanteMenor3Meses = !isNaN(meses) && meses < 3 && sintomas.temperatura >= 38.0;

    if (esLactanteMenor3Meses) {
      banderasRojas.push('Fiebre (>= 38ºC) en bebé menor de 3 meses. En lactantes pequeños la fiebre siempre es motivo de urgencia hospitalaria por riesgo de infección bacteriana grave oculta.');
    }

    if (sintomas.petequiasManchasVaso) {
      banderasRojas.push('Aparición de pequeñas manchas rojas o violáceas en la piel que NO desaparecen al presionar con un vaso de cristal (Prueba del Vaso positiva / Petequias). Sospecha de sepsis o enfermedad meningocócica.');
    }

    if (sintomas.dificultadRespiratoriaMarcada) {
      banderasRojas.push('Dificultad respiratoria con tiraje (se hunden las costillas o el pecho al respirar, respira muy rápido o se mueven las aletas de la nariz).');
    }

    if (sintomas.letargiaIrritabilidadInconsolable) {
      banderasRojas.push('Niño muy decaído, somnoliento en exceso (no responde, cuesta despertarle) o llanto débil continuo inconsolable.');
    }

    if (sintomas.convulsion) {
      banderasRojas.push('Episodio convulsivo (pérdida de conciencia con sacudidas o rigidez).');
    }

    if (banderasRojas.length > 0) {
      return {
        nivel: NIVELES.NIVEL_1,
        motivo: 'Presencia de signos de alarma vital en pediatría.',
        banderasRojas: banderasRojas,
        queHacer: [
          'Acude DE INMEDIATO a urgencias pediátricas o llama al 112.',
          'Si tiene manchas petequiales, no pierdas ni un minuto.',
          'No abrigues en exceso al niño si tiene fiebre alta.'
        ]
      };
    }

    if (sintomas.fiebreMasDe3Dias || sintomas.rechazoComidaVomitosFrecuentes) {
      return {
        nivel: NIVELES.NIVEL_2,
        motivo: 'Fiebre mantenida más de 72 horas o riesgo de deshidratación por vómitos repetidos.',
        banderasRojas: ['Fiebre prolongada o intolerancia oral.'],
        queHacer: [
          'Lleva al niño al pediatra o centro de salud hoy mismo para explorar oídos, garganta y orina.',
          'Ofrece líquidos en pequeños sorbos frecuentes (suero de rehidratación oral).'
        ]
      };
    }

    return {
      nivel: NIVELES.NIVEL_4,
      motivo: 'Fiebre de corta duración con buen estado general (el niño juega y sonríe cuando baja la fiebre).',
      banderasRojas: [],
      queHacer: [
        'Medidas de confort: ropa fresca, ofrecer agua con frecuencia.',
        'Antitérmico (Paracetamol infantil) solo si el niño tiene malestar o dolor, no solo para «bajar la cifra».',
        'Vigila siempre la aparición de manchas en la piel o dificultad respiratoria.'
      ]
    };
  }

  /**
   * 3. DOLOR ABDOMINAL
   */
  function triarAbdomen(sintomas) {
    sintomas = sintomas || {};
    var banderasRojas = [];

    if (sintomas.vientreEnTabla) banderasRojas.push('Abdomen duro como una piedra («vientre en tabla») con dolor insoportable al tacto o al soltar la presión. Sospecha de peritonitis o perforación de víscera.');
    if (sintomas.vomitosSangreHecesNegras) banderasRojas.push('Vómitos con sangre roja o posos oscuros, o heces negras como el alquitrán y muy malolientes (melenas). Hemorragia digestiva.');
    if (sintomas.dolorSubitoBrutalDesmayo) banderasRojas.push('Dolor abdominal o lumbar de inicio explosivo con mareo intenso o síncope (sospecha de aneurisma o embarazo ectópico).');

    if (banderasRojas.length > 0) {
      return {
        nivel: NIVELES.NIVEL_1,
        motivo: 'Abdomen agudo quirúrgico o hemorragia digestiva activa.',
        banderasRojas: banderasRojas,
        queHacer: [
          'Llama al 112 o acude inmediatamente a urgencias hospitalarias.',
          'NO tomes analgésicos fuertes ni laxantes.',
          'NO comas ni bebas nada (ayunas rigurosas por si requiere cirugía urgente).'
        ]
      };
    }

    if (sintomas.dolorFosaIliacaDerechaFiebre) {
      return {
        nivel: NIVELES.NIVEL_2,
        motivo: 'Sospecha de Apendicitis Aguda (dolor continuo que se fija abajo a la derecha del ombligo con febrícula o vómitos).',
        banderasRojas: ['Dolor persistente en fosa ilíaca derecha.'],
        queHacer: [
          'Acude a urgencias hospitalarias para ecografía y analítica antes de que evolucione.',
          'Mantener en ayunas.'
        ]
      };
    }

    if (sintomas.diarreaVomitosSinSangreBuenEstado) {
      return {
        nivel: NIVELES.NIVEL_4,
        motivo: 'Cuadro compatible con gastroenteritis aguda común.',
        banderasRojas: [],
        queHacer: [
          'Hidratación con suero oral en pequeños sorbos.',
          'Dieta blanda progresiva según tolerancia.',
          'Si no tolera líquidos en 12h o aparece sangre, acudir a consulta.'
        ]
      };
    }

    return {
      nivel: NIVELES.NIVEL_3,
      motivo: 'Dolor o molestia abdominal no complicada.',
      banderasRojas: [],
      queHacer: ['Consulta programada con médico de atención primaria.']
    };
  }

  /**
   * 4. DOLOR DE CABEZA / CEFALEA
   */
  function triarCefalea(sintomas) {
    sintomas = sintomas || {};
    var banderasRojas = [];

    if (sintomas.cefaleaEnTruenoSubita) banderasRojas.push('Cefalea en trueno: dolor de cabeza que alcanza su máxima intensidad insoportable en menos de 1 minuto («el peor dolor de cabeza de mi vida»). Sospecha de rotura de aneurisma / hemorragia subaracnoidea.');
    if (sintomas.rigidezNucaFiebre) banderasRojas.push('Fiebre alta acompañada de rigidez en la nuca (incapacidad para tocar el pecho con la barbilla) y fotofobia. Sospecha de meningitis.');
    if (sintomas.deficitNeurologicoVisionFuerza) banderasRojas.push('Dolor de cabeza acompañado de pérdida de visión súbita, debilidad en un lado del cuerpo o dificultad para hablar.');

    if (banderasRojas.length > 0) {
      return {
        nivel: NIVELES.NIVEL_1,
        motivo: 'Cefalea con banderas rojas neurológicas de extrema gravedad.',
        banderasRojas: banderasRojas,
        queHacer: [
          'Llama al 112 de inmediato.',
          'Permanece tumbado en penumbra mientras llega el equipo médico.',
          'No tomes aspirina ni fármacos que alteren la coagulación.'
        ]
      };
    }

    if (sintomas.cefaleaHabitualMigranaConocida) {
      return {
        nivel: NIVELES.NIVEL_4,
        motivo: 'Crisis de migraña o cefalea tensional habitual sin cambios en su patrón típico.',
        banderasRojas: [],
        queHacer: [
          'Tratamiento pautado habitualmente por tu médico (triptanes o analgésicos tomados al inicio del dolor).',
          'Reposo en habitación oscura y silenciosa.'
        ]
      };
    }

    return {
      nivel: NIVELES.NIVEL_3,
      motivo: 'Cefalea de características no urgentes.',
      banderasRojas: [],
      queHacer: ['Cita con médico de familia para valorar causas y pauta analgésica.']
    };
  }

  return {
    VERSION: VERSION,
    NIVELES: NIVELES,
    triarPecho: triarPecho,
    triarPediatria: triarPediatria,
    triarAbdomen: triarAbdomen,
    triarCefalea: triarCefalea
  };
});
