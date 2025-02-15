------ORDENDES DE ATENCION, ESTADO Y ASEGURADORA
SELECT 
  ordatencion_cod as orden_atencion,
  TO_CHAR( ordatencion_fregistro, 'YYYY-MM-DD') as orden_atencion_fecha,
  PAC.paciente_hstclinica_cod as historia,
  COALESCE(P.persona_apep, '') || ' ' || COALESCE(P.persona_apem, '')
  || ', ' || COALESCE(P.persona_nmb1, '') || ' ' || COALESCE(P.persona_nmb2, '') as paciente,
  A.empresa_rznsocial as aseguradora,
  TA.tpatencion_dsc as tipo_atencion,
  OA.ordatencion_tpatencion_cod,
  CASE WHEN OAS.ordatencionaseg_cod IS NOT NULL THEN
      CASE WHEN OAS.ordatencionaseg_estado = 0 THEN 'pendiente'
    WHEN OAS.ordatencionaseg_estado = 1 OR OAS.ordatencionaseg_estado = 2 THEN 'auditado'
    WHEN OAS.ordatencionaseg_estado = 3 THEN 'facturado' 
    WHEN OAS.ordatencionaseg_estado = 4 THEN 'cerrado'
    ELSE '' END
  WHEN OAA.ordenatencionautoseg_cod IS NOT NULL THEN
      CASE WHEN OAA.ordenatencionautoseg_estado = 0 THEN 'pendiente'
    WHEN OAA.ordenatencionautoseg_estado = 1 OR OAA.ordenatencionautoseg_estado = 2 THEN 'auditado'
    WHEN OAA.ordenatencionautoseg_estado = 3 THEN 'facturado' 
    ELSE '' END
  ELSE '' END as oa_estado,
  CASE WHEN OAS.ordatencionaseg_cod IS NOT NULL THEN
      OAS.ordatencionaseg_cobertura_dsc
  WHEN OAA.ordenatencionautoseg_cod IS NOT NULL THEN
      OAAT.tpatencion_dsc
  ELSE '' END as oa_cobertura,
  CASE WHEN T.tratamiento_cod IS NOT NULL OR th.tratamiento_cod IS NOT NULL THEN 'SI' ELSE 'NO' END as tratamiento
  
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
AND pac.paciente_cod = 160401
GROUP BY ordatencion_cod ,
  TO_CHAR( ordatencion_fregistro, 'YYYY-MM-DD') ,
  PAC.paciente_hstclinica_cod ,
  COALESCE(P.persona_apep, '') || ' ' || COALESCE(P.persona_apem, '')
  || ', ' || COALESCE(P.persona_nmb1, '') || ' ' || COALESCE(P.persona_nmb2, '') ,
  A.empresa_rznsocial ,
  COALESCE(TDOC.tpdocsunat_dsc, '') ,  
  COALESCE(F.docvntsunat_serie, '') ,
  COALESCE(F.docvntsunat_nro, '') ,
  COALESCE(TO_CHAR( F.docvntsunat_femision, 'YYYY-MM-DD'), '') ,
  TA.tpatencion_dsc ,
  CASE WHEN T.tratamiento_cod IS NOT NULL OR th.tratamiento_cod IS NOT NULL THEN 'SI' ELSE 'NO' END ,
  OAS.ordatencionaseg_cod, OAA.ordenatencionautoseg_cod, OAAT.tpatencion_dsc
ORDER BY orden_atencion_fecha, paciente