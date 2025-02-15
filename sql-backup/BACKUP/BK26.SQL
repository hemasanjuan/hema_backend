SELECT
  TA.tpatencion_dsc AS "TIPO ATENCION",
  TP.tppaciente_dsc AS "TIPO PACIENTE",
  OA.ordatencion_cod AS "NRO. O.A.",
  OI.ordinternamiento_cod AS "NRO. O.I.",
  P.paciente_hstclinica_cod AS "NRO. HISTORIA",
  PR.persona_apep || ' ' || PR.persona_apem || ', ' || PR.persona_nmb1 || ' ' || PR.persona_nmb2 AS "PACIENTE",
  DATE(OA.ordatencion_fregistro) AS "FECHA",
  CASE WHEN OI.ordinternamiento_estado_facturacion = 0 THEN
    'PENDIENTE'
  WHEN OI.ordinternamiento_estado_facturacion = 1 THEN
    'AUDITADA'
  END AS "ESTADO",
  NP.negociacionprecio_dsc AS "NEGOCIACION",
  A.empresa_ruc || ' - ' || A.empresa_rznsocial AS "ASEGURADORA",
  E.empresa_ruc || ' - ' || E.empresa_rznsocial AS "EMPRESA",  
  ROUND(CAST(SUM(OID.ordinternamientodet_mtoaseguradora * (1 + CASE WHEN OID.ordinternamientodet_afecto = 1 THEN OID.ordinternamientodet_igv ELSE 0 END)) AS NUMERIC), 2) AS "MONTO ASEG. CON IGV",
  ROUND(CAST(SUM(OID.ordinternamientodet_mtoasegurado * (1 + CASE WHEN OID.ordinternamientodet_afecto = 1 THEN OID.ordinternamientodet_igv ELSE 0 END)) AS NUMERIC), 2) AS "MONTO PAC. CON IGV"
FROM
  sch_clinica.tbl_ordeninternamiento OI
  INNER JOIN sch_clinica.tbl_ordatencion OA ON (OI.ordinternamiento_oacod = OA.ordatencion_cod)
  INNER JOIN sch_clinica.tbl_paciente P ON (OA.ordatencion_paciente_cod = P.paciente_cod)
  INNER JOIN sch_clinica.tbl_persona PR ON (OA.ordatencion_paciente_cod = PR.persona_cod)
  INNER JOIN sch_clinica.tbl_tpatencion TA ON (OA.ordatencion_tpatencion_cod = TA.tpatencion_cod)
  INNER JOIN sch_clinica.tbl_tppaciente TP ON (OI.ordinternamiento_tppaciente = TP.tppaciente_cod)
  INNER JOIN sch_clinica.tbl_negociacionprecio NP ON (OI.ordinternamiento_ncod = NP.negociacionprecio_cod)
  INNER JOIN sch_clinica.tbl_empresa A ON (OI.ordinternamiento_acod = A.empresa_cod)
  INNER JOIN sch_clinica.tbl_empresa E ON (OI.ordinternamiento_ecod = E.empresa_cod)
  INNER JOIN sch_clinica.tbl_ordinternamientodet OID ON (OI.ordinternamiento_cod = OID.ordinternamientodet_oicod)
WHERE
  (OI.ordinternamiento_estado_facturacion = 0 OR OI.ordinternamiento_estado_facturacion = 1)
  AND OA.ordatencion_estado = 0 AND OI.ordinternamiento_estado = 0
  AND OID.ordinternamientodet_ejecucion_auditoria = 1
  AND DATE(OI.ordinternamiento_finicio) >= :fini
  AND DATE(OI.ordinternamiento_finicio) <= :ffin
GROUP BY
  "TIPO ATENCION", "TIPO PACIENTE", "NRO. O.A.", "NRO. O.I.", "NRO. HISTORIA", "PACIENTE", "FECHA", "ESTADO", "NEGOCIACION", "ASEGURADORA", "EMPRESA", A.empresa_rznsocial
ORDER BY
  OI.ordinternamiento_finicio ASC, TP.tppaciente_dsc ASC, A.empresa_rznsocial ASC