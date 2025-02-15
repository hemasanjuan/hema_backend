(SELECT
  TA.tpatencion_dsc AS "TIPO ATENCION",
  TP.tppaciente_dsc AS "TIPO PACIENTE",
  OA.ordatencion_cod AS "NRO. O.A.",  
  P.paciente_hstclinica_cod AS "NRO. HISTORIA",
  PR.persona_apep || ' ' || PR.persona_apem || ', ' || PR.persona_nmb1 || ' ' || PR.persona_nmb2 AS "PACIENTE",
  DATE(OA.ordatencion_fregistro) AS "FECHA",
  CASE WHEN OAAS.ordenatencionautoseg_estado = 0 THEN
    'PENDIENTE'
  WHEN OAAS.ordenatencionautoseg_estado = 1 THEN
    'AUDITADA'
  END AS "ESTADO",
  NP.negociacionprecio_dsc AS "NEGOCIACION",
  A.empresa_ruc || ' - ' || A.empresa_rznsocial AS "ASEGURADORA",
  E.empresa_ruc || ' - ' || E.empresa_rznsocial AS "EMPRESA",  
  ROUND(CAST(SUM(OAAD.ordatencionasegdet_montoaseguradora) AS NUMERIC), 2) AS "MONTO ASEG. CON IGV"
FROM
  sch_clinica.tbl_ordenatencionautoseg OAAS 
  INNER JOIN sch_clinica.tbl_ordatencion OA ON (OAAS.ordenatencionautoseg_cod = OA.ordatencion_cod)
  INNER JOIN sch_clinica.tbl_paciente P ON (OA.ordatencion_paciente_cod = P.paciente_cod)
  INNER JOIN sch_clinica.tbl_persona PR ON (OA.ordatencion_paciente_cod = PR.persona_cod)
  INNER JOIN sch_clinica.tbl_tpatencion TA ON (OA.ordatencion_tpatencion_cod = TA.tpatencion_cod)
  INNER JOIN sch_clinica.tbl_tppaciente TP ON (OA.ordatencion_tpaciente_cod = TP.tppaciente_cod)
  INNER JOIN sch_clinica.tbl_negociacionprecio NP ON (OA.ordatencion_negprc_emp_aseg_ncod = NP.negociacionprecio_cod)
  INNER JOIN sch_clinica.tbl_empresa A ON (OA.ordatencion_negprc_emp_aseg_acod = A.empresa_cod)
  INNER JOIN sch_clinica.tbl_empresa E ON (OA.ordatencion_negprc_emp_aseg_ecod = E.empresa_cod)
  INNER JOIN sch_clinica.tbl_ordatencionasegdet OAAD ON (OA.ordatencion_cod = OAAD.ordatencionasegdet_ordatencion_cod)
WHERE
  (OAAS.ordenatencionautoseg_estado = 0 OR OAAS.ordenatencionautoseg_estado = 1)
  AND OA.ordatencion_tpaciente_cod <> 3
  AND OA.ordatencion_estado = 0
  AND DATE(OA.ordatencion_fregistro) >= :fini
  AND DATE(OA.ordatencion_fregistro) <= :ffin
  --AND NP.negociacionprecio_dsc = :negociacion
GROUP BY
  "TIPO ATENCION", "TIPO PACIENTE", "NRO. O.A.", "NRO. HISTORIA", "PACIENTE", "FECHA", "ESTADO", "NEGOCIACION", "ASEGURADORA", "EMPRESA", A.empresa_rznsocial
HAVING
  SUM(OAAD.ordatencionasegdet_montoaseguradora) > 0
ORDER BY
  OA.ordatencion_fregistro ASC)

UNION

(SELECT
  TA.tpatencion_dsc AS "TIPO ATENCION",
  TP.tppaciente_dsc AS "TIPO PACIENTE",
  OA.ordatencion_cod AS "NRO. O.A.",  
  P.paciente_hstclinica_cod AS "NRO. HISTORIA",
  PR.persona_apep || ' ' || PR.persona_apem || ', ' || PR.persona_nmb1 || ' ' || PR.persona_nmb2 AS "PACIENTE",
  DATE(OA.ordatencion_fregistro) AS "FECHA",
  CASE WHEN OAAS.ordatencionaseg_estado = 0 THEN
    'PENDIENTE'
  WHEN OAAS.ordatencionaseg_estado = 1 THEN
    'AUDITADA'
  END AS "ESTADO",
  NP.negociacionprecio_dsc AS "NEGOCIACION",
  A.empresa_ruc || ' - ' || A.empresa_rznsocial AS "ASEGURADORA",
  E.empresa_ruc || ' - ' || E.empresa_rznsocial AS "EMPRESA",  
  ROUND(CAST(SUM(OAAD.ordatencionasegdet_montoaseguradora) AS NUMERIC), 2) AS "MONTO ASEG. CON IGV"
FROM
  sch_clinica.tbl_ordatencionaseg OAAS 
  INNER JOIN sch_clinica.tbl_ordatencion OA ON (OAAS.ordatencionaseg_cod = OA.ordatencion_cod)
  INNER JOIN sch_clinica.tbl_paciente P ON (OA.ordatencion_paciente_cod = P.paciente_cod)
  INNER JOIN sch_clinica.tbl_persona PR ON (OA.ordatencion_paciente_cod = PR.persona_cod)
  INNER JOIN sch_clinica.tbl_tpatencion TA ON (OA.ordatencion_tpatencion_cod = TA.tpatencion_cod)
  INNER JOIN sch_clinica.tbl_tppaciente TP ON (OA.ordatencion_tpaciente_cod = TP.tppaciente_cod)
  INNER JOIN sch_clinica.tbl_negociacionprecio NP ON (OA.ordatencion_negprc_emp_aseg_ncod = NP.negociacionprecio_cod)
  INNER JOIN sch_clinica.tbl_empresa A ON (OA.ordatencion_negprc_emp_aseg_acod = A.empresa_cod)
  INNER JOIN sch_clinica.tbl_empresa E ON (OA.ordatencion_negprc_emp_aseg_ecod = E.empresa_cod)
  INNER JOIN sch_clinica.tbl_ordatencionasegdet OAAD ON (OA.ordatencion_cod = OAAD.ordatencionasegdet_ordatencion_cod)
WHERE
  (OAAS.ordatencionaseg_estado = 0 OR OAAS.ordatencionaseg_estado = 1)
  AND OA.ordatencion_tpaciente_cod <> 3
  AND OA.ordatencion_estado = 0
  AND DATE(OA.ordatencion_fregistro) >= :fini
  AND DATE(OA.ordatencion_fregistro) <= :ffin
  --AND NP.negociacionprecio_dsc = #negociacion#
GROUP BY
  "TIPO ATENCION", "TIPO PACIENTE", "NRO. O.A.", "NRO. HISTORIA", "PACIENTE", "FECHA", "ESTADO", "NEGOCIACION", "ASEGURADORA", "EMPRESA", A.empresa_rznsocial
HAVING
  SUM(OAAD.ordatencionasegdet_montoaseguradora) > 0
ORDER BY
  OA.ordatencion_fregistro ASC)