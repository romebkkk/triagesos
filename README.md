# TriageSOS v2.0 🏥🚨

> **Árbol de decisión clínica ciudadana, triaje de constantes vitales domiciliarias (SatO2, tensión, pulso), algoritmo qSOFA para detección precoz de Sepsis y banderas rojas pediátricas.** 100% en el navegador, privado y de código abierto.

[![Licencia MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)](LICENSE)
[![Tests Clínicos v2](https://img.shields.io/badge/tests-5%20passed-brightgreen.svg)](test.js)
[![Protocolo Sepsis-3](https://img.shields.io/badge/criterios-MTS%20%2B%20qSOFA%20JAMA-red.svg)](#validación-clínica)
[![100% In-Browser](https://img.shields.io/badge/privacidad-100%25%20local-emerald.svg)](index.html)

---

## 🎯 ¿Qué Novedades Trae la Versión 2.0?

En la **versión 2.0**:
1. **Triaje de Constantes Vitales Domiciliarias:**
   - Permite introducir mediciones de aparatos caseros (pulsioxímetro, tensiómetro, termómetro) para detectar hipoxemia crítica ($SatO2 < 90\%$), shock hemodinámico ($PAS < 90\text{ mmHg}$) o crisis hipertensivas de forma automática.
2. **Escala qSOFA (Quick Sepsis-related Organ Failure Assessment):**
   - Implementa los criterios internacionales de consenso **Sepsis-3 (*JAMA* 2016)** para identificar pacientes con infecciones comunes que están evolucionando hacia una sepsis grave potencialmente mortal, antes de que sea tarde.
3. **Banderas Rojas Pediátricas Específicas:**
   - Detección de petequias (prueba del vaso de cristal para descartar sepsis meningocócica), tiraje costal en lactantes y fiebre en menores de 3 meses.
4. **4 Niveles de Prioridad Asistencial (Manchester Triage System):**
   - Nivel 1 (Emergencia 112 inmediata), Nivel 2 (Urgencia preferente <2-4h), Nivel 3 (Consulta primaria 24-48h) y Nivel 4 (Autocuidado en domicilio).

---

## 🚀 Pruebas Automatizadas

```bash
node test.js
```

---

## 🔒 Privacidad Radical
- Cero servidores, cero registros. Datos 100% locales en la memoria del navegador.

---

## 📄 Licencia
Licencia MIT. Copyright (c) 2026 DataFlow Elegance — Ismael Ben Kazem.
