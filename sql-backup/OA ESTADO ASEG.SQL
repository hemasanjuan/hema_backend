------ORDENDES DE ATENCION, ESTADO Y ASEGURADORA
SELECT 
  ordatencion_cod as orden_atencion,
  TO_CHAR( ordatencion_fregistro, 'YYYY-MM-DD') as orden_atencion_fecha,
  PAC.paciente_hstclinica_cod as historia,
  COALESCE(P.persona_apep, '') || ' ' || COALESCE(P.persona_apem, '')
  || ', ' || COALESCE(P.persona_nmb1, '') || ' ' || COALESCE(P.persona_nmb2, '') as paciente,
  P.persona_cel as celular,
  A.empresa_rznsocial as aseguradora,
  T.tratamiento_emcod as especialidad
  
FROM sch_clinica.tbl_ordatencion OA
INNER JOIN sch_clinica.tbl_tpatencion TA ON TA.tpatencion_cod = OA.ordatencion_tpatencion_cod
LEFT JOIN sch_clinica.tbl_ordatencion_factura_historial OFH ON OFH.ordatencion_factura_historial_oacod = OA.ordatencion_cod
  	AND OFH.ordatencion_factura_historial_estado = 1 
LEFT JOIN sch_clinica.tbl_recetamed R ON R.recetamed_ordatenciondet_cod = OA.ordatencion_cod
LEFT JOIN sch_clinica.tbl_tratamiento T ON T.tratamiento_rmcod = R.recetamed_cod 
LEFT JOIN sch_clinica.tbl_ordeninternamiento OI ON oi.ordinternamiento_oacod = OA.ordatencion_cod
LEFT JOIN sch_clinica.tbl_tratamiento TH ON TH.tratamiento_oicod = oi.ordinternamiento_cod 
LEFT JOIN sch_clinica.tbl_docvntsunat F ON F.docvntsunat_cod = OFH.ordatencion_factura_historial_docvntsunatcod    
LEFT JOIN sch_clinica.tbl_tpdocsunat TDOC ON F.docvntsunat_tpdoc = TDOC.tpdocsunat_cod
INNER JOIN sch_clinica.tbl_paciente PAC ON PAC.paciente_cod = OA.ordatencion_paciente_cod
INNER JOIN sch_clinica.tbl_persona P ON P.persona_cod = OA.ordatencion_paciente_cod
INNER JOIN sch_clinica.tbl_empresa A ON A.empresa_cod = OA.ordatencion_negprc_emp_aseg_acod 
LEFT JOIN sch_clinica.tbl_ordatencionaseg OAS ON OAS.ordatencionaseg_cod = OA.ordatencion_cod
LEFT JOIN sch_clinica.tbl_ordenatencionautoseg OAA ON OAA.ordenatencionautoseg_cod = OA.ordatencion_cod
LEFT JOIN sch_clinica.tbl_tpatencion OAAT ON OAAT.tpatencion_cod = OAA.ordenatencionautoseg_coberturaaseg
WHERE
--(F.docvntsunat_cod IS NULL OR EXTRACT(year FROM F.docvntsunat_femision) = 2013)
DATE(ordatencion_fregistro) >= :finicio AND DATE(ordatencion_fregistro) <= :ffin
AND (ordatencion_tpatencion_cod = 1 OR ordatencion_tpatencion_cod = 4 OR ordatencion_tpatencion_cod = 6)
AND OA.ordatencion_tpaciente_cod = 2
GROUP BY ordatencion_cod ,
  TO_CHAR( ordatencion_fregistro, 'YYYY-MM-DD') ,
  PAC.paciente_hstclinica_cod ,
  COALESCE(P.persona_apep, '') || ' ' || COALESCE(P.persona_apem, '')
  || ', ' || COALESCE(P.persona_nmb1, '') || ' ' || COALESCE(P.persona_nmb2, '') ,
  P.persona_cel,
  A.empresa_rznsocial ,
  COALESCE(TDOC.tpdocsunat_dsc, '') ,  
  COALESCE(F.docvntsunat_serie, '') ,
  COALESCE(F.docvntsunat_nro, '') ,
  COALESCE(TO_CHAR( F.docvntsunat_femision, 'YYYY-MM-DD'), '') ,
  T.tratamiento_emcod
ORDER BY orden_atencion_fecha, paciente

----------------ORDENES DE ATENCINM -----------

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
  AND oa.ordatencion_cod ='279691'
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
  AND oa.ordatencion_cod ='279691'
GROUP BY
  "TIPO ATENCION", "TIPO PACIENTE", "NRO. O.A.", "NRO. HISTORIA", "PACIENTE", "FECHA", "ESTADO", "NEGOCIACION", "ASEGURADORA", "EMPRESA", A.empresa_rznsocial
HAVING
  SUM(OAAD.ordatencionasegdet_montoaseguradora) > 0
ORDER BY
  OA.ordatencion_fregistro ASC)