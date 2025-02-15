SELECT
 CONS.fecha_pago,
 CONS.apellidos_nombres,
 CONS.tipo_paciente,
 CONS.doc_venta,
 CONS.receta,
 CONS.examen_laboratorio,
 CONS.pu_venta,
 CONS.laboratorio
FROM(
SELECT 
  1 AS orden,
  TO_CHAR(DV.docvntsunat_femision, 'DD-MM-YYYY HH:mm') AS fecha_pago,
  PC.paciente_hstclinica_cod ||' - '|| 
  PR.persona_apep ||' ' || PR.persona_apem ||' '|| PR.persona_nmb1 ||' '|| PR.persona_nmb2 AS apellidos_nombres,
  tpp.tppaciente_dsc as tipo_paciente,
  DV.docvntsunat_cod AS doc_venta,
  RM.recetamed_cod AS receta,
  RS.recetamedsegus_segus_cod ||' - '|| RS.recetamedsegus_segus_item ||' '|| SD.segus_det_dsc AS examen_laboratorio,
  --ROUND(CAST(DD.docvntsunatdet_preciounineto * (1 + 0.18) AS NUMERIC), 2) AS pu_neto,
  ROUND(CAST((DD.docvntsunatdet_preciouniventa * (1 + 0.18) * RS.recetamedsegus_cantidad) AS NUMERIC), 2) AS pu_venta,
  --ROUND(CAST(DD.docvntsunatdet_totneto * (1 + 0.18) AS NUMERIC), 2) AS total_neto  
  CASE WHEN LE.labexamenes_labcod IS NULL THEN
     'LABORATORIO CLINICA'
  ELSE 
   EM.empresa_nmbcomercial
  END AS laboratorio
FROM 
  sch_clinica.tbl_recetamedsegus RS
  INNER JOIN sch_clinica.tbl_segus_det SD ON RS.recetamedsegus_segusdet_cod = SD.segus_det_cod
  INNER JOIN sch_clinica.tbl_recetamed RM ON RS.recetamedsegus_rmcod = RM.recetamed_cod
  INNER JOIN sch_clinica.tbl_ordatencion OA ON RM.recetamed_ordatenciondet_cod = OA.ordatencion_cod
  INNER JOIN sch_clinica.tbl_persona PR ON OA.ordatencion_paciente_cod = PR.persona_cod
  LEFT  JOIN sch_clinica.tbl_paciente PC ON PR.persona_cod = PC.paciente_cod
  inner join sch_clinica.tbl_tppaciente TPP on tpp.tppaciente_cod=OA.ordatencion_tpaciente_cod 
  INNER JOIN sch_clinica.tbl_rmsegus_prvnt RP ON RS.recetamedsegus_cod = RP.rmsegus_prvnt_rscod
  INNER JOIN sch_clinica.tbl_docvntsunat DV ON RP.rmsegus_prvnt_prvntcod = DV.docvntsunat_predocvnt_cod
  INNER JOIN sch_clinica.tbl_docvntsunatdet DD ON DV.docvntsunat_cod = DD.docvntsunatdet_cod AND DD.docvntsunatdet_elemento_cod = RS.recetamedsegus_segus_cod AND DD.docvntsunatdet_elemento_item = RS.recetamedsegus_segus_item
  LEFT  JOIN sch_clinica.tbl_labexamenes LE ON RS.recetamedsegus_cod = LE.labexamenes_rmseguscod
  LEFT  JOIN sch_clinica.tbl_empresa EM ON LE.labexamenes_labcod = EM.empresa_cod
WHERE
  RM.recetamed_area_cod = 31
  AND RS.recetamedsegus_cantpendiente = 0
  AND DV.docvntsunat_anulado = 0
  AND NOT EXISTS (SELECT 1 
  FROM 
  	sch_clinica.tbl_docvntsunat_referencia DR
  WHERE
    DR.docvntsunat_referencia_docref_cod = DV.docvntsunat_cod)
  AND DATE(DV.docvntsunat_femision) >= :finicio
  AND DATE(DV.docvntsunat_femision) <= :ffin
UNION ALL
SELECT 
  2 AS orden,
  '' AS fecha_pago,
  '' AS apellidos_nombres,
  '' AS tipo_paciente,
  '' AS doc_venta,
  0 AS receta,
  '   TOTALES    ' AS examen_laboratorio,
  --ROUND(CAST(DD.docvntsunatdet_preciounineto * (1 + 0.18) AS NUMERIC), 2) AS pu_neto,
  SUM(ROUND(CAST((DD.docvntsunatdet_preciouniventa * (1 + 0.18) * RS.recetamedsegus_cantidad) AS NUMERIC), 2)) AS pu_venta,
  --ROUND(CAST(DD.docvntsunatdet_totneto * (1 + 0.18) AS NUMERIC), 2) AS total_neto  
  '' AS laboratorio
FROM 
  sch_clinica.tbl_recetamedsegus RS
  INNER JOIN sch_clinica.tbl_segus_det SD ON RS.recetamedsegus_segusdet_cod = SD.segus_det_cod
  INNER JOIN sch_clinica.tbl_recetamed RM ON RS.recetamedsegus_rmcod = RM.recetamed_cod
  INNER JOIN sch_clinica.tbl_ordatencion OA ON RM.recetamed_ordatenciondet_cod = OA.ordatencion_cod
  INNER JOIN sch_clinica.tbl_persona PR ON OA.ordatencion_paciente_cod = PR.persona_cod
  LEFT  JOIN sch_clinica.tbl_paciente PC ON PR.persona_cod = PC.paciente_cod
  INNER JOIN sch_clinica.tbl_rmsegus_prvnt RP ON RS.recetamedsegus_cod = RP.rmsegus_prvnt_rscod
  INNER JOIN sch_clinica.tbl_docvntsunat DV ON RP.rmsegus_prvnt_prvntcod = DV.docvntsunat_predocvnt_cod
  INNER JOIN sch_clinica.tbl_docvntsunatdet DD ON DV.docvntsunat_cod = DD.docvntsunatdet_cod AND DD.docvntsunatdet_elemento_cod = RS.recetamedsegus_segus_cod AND DD.docvntsunatdet_elemento_item = RS.recetamedsegus_segus_item
  LEFT  JOIN sch_clinica.tbl_labexamenes LE ON RS.recetamedsegus_cod = LE.labexamenes_rmseguscod
  LEFT  JOIN sch_clinica.tbl_empresa EM ON LE.labexamenes_labcod = EM.empresa_cod
WHERE
  RM.recetamed_area_cod = 31
  AND RS.recetamedsegus_cantpendiente = 0
  AND DV.docvntsunat_anulado = 0
  AND NOT EXISTS (SELECT 1 
  FROM 
  	sch_clinica.tbl_docvntsunat_referencia DR
  WHERE
    DR.docvntsunat_referencia_docref_cod = DV.docvntsunat_cod)
  AND DATE(DV.docvntsunat_femision) >= :finicio
  AND DATE(DV.docvntsunat_femision) <= :ffin
ORDER BY fecha_pago DESC, receta
) AS CONS