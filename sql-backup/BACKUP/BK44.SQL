/*Basado en que los pedidos de hospitalizacion de hacen por EMERGENCIA*/
SELECT
 CONSULTA."PACIENTE",
 CONSULTA."TIPO PACIENTE",
 CONSULTA."FECHA",
 CONSULTA."PRODUCTO | F. FARM. | FABR. | F. PRES.",
 CONSULTA."CANTIDAD",
 CONSULTA."TOTAL"
FROM
(
SELECT
  2 AS orden,
  OA.ordatencion_cod AS "OACOD",
  OI.ordinternamiento_cod AS "OICOD", 
  PA.paciente_hstclinica_cod AS "HC",
  ''  AS "PACIENTE",
  '' AS "TIPO PACIENTE",
  to_char(OI.ordinternamiento_finicio, 'YYYY-MM-DD') as "FECHA",
  CASE WHEN EM.emergencia_medicamento_tpproducto = 1 THEN
  	COALESCE(PFD.prodfarmadet_prodfarma_cod,'') || ' - ' || COALESCE(PFD.prodfarmadet_item,'') || ' | ' || COALESCE(P1.producto_dsc,'') || ' | ' ||
    COALESCE(FF1.ffar_dsc,'') || ' | ' || COALESCE(F1.fabr_dsc,'') || ' | ' || COALESCE(FP1.fpres_dsc,'')
  ELSE
    P2.producto_cod || ' - ' || COALESCE(P2.producto_dsc,'') || ' | ' ||
    COALESCE(FF2.ffar_dsc,'') || ' | ' || COALESCE( F2.fabr_dsc ,'')|| ' | ' || COALESCE(FP2.fpres_dsc,'')
  END AS "PRODUCTO | F. FARM. | FABR. | F. PRES.",
  CAST(EM.emergencia_medicamento_cantidad AS VARCHAR) AS "CANTIDAD",
  CAST(ROUND(CAST(OID.ordinternamientodet_precioventa AS NUMERIC), 4) AS VARCHAR) AS "TOTAL"
  
FROM 
  sch_clinica.tbl_ordinternamientodet OID
  INNER JOIN sch_clinica.tbl_ordeninternamiento OI ON (OID.ordinternamientodet_oicod = OI.ordinternamiento_cod)
  INNER JOIN sch_clinica.tbl_ordatencion OA ON (OI.ordinternamiento_oacod = OA.ordatencion_cod)
  INNER JOIN sch_clinica.tbl_paciente PA ON (OA.ordatencion_paciente_cod = PA.paciente_cod)
  INNER JOIN sch_clinica.tbl_persona PE ON (OA.ordatencion_paciente_cod = PE.persona_cod)
  INNER JOIN sch_clinica.tbl_tppaciente TP ON (OA.ordatencion_tpaciente_cod = TP.tppaciente_cod)
  INNER JOIN sch_clinica.tbl_emergencia_medicamento EM ON (OID.ordinternamientodet_cod = EM.emergencia_medicamento_oidet_cod)
  LEFT JOIN sch_clinica.tbl_prodfarmadet PFD ON (EM.emergencia_medicamento_prodfarma_cod = PFD.prodfarmadet_prodfarma_cod
  												AND EM.emergencia_medicamento_prodfarma_item = PFD.prodfarmadet_item
                                                AND EM.emergencia_medicamento_tpproducto = 1)
  LEFT JOIN sch_clinica.tbl_prodfarma PF ON (PFD.prodfarmadet_prodfarma_cod = PF.prodfarma_cod)
  LEFT JOIN sch_clinica.tbl_ffar FF1 ON (PF.prodfarma_ffar_cod = FF1.ffar_cod)
  LEFT JOIN sch_clinica.tbl_fpres FP1 ON (PFD.prodfarmadet_fpres_cod = FP1.fpres_cod)
  LEFt JOIN sch_clinica.tbl_fabr F1 ON (PFD.prodfarmadet_fabr_cod = F1.fabr_cod)
  LEFT JOIN sch_clinica.tbl_producto P1 ON (PF.prodfarma_producto_cod = P1.producto_cod)
  LEFT JOIN sch_clinica.tbl_producto P2 ON (EM.emergencia_medicamento_producto_cod = P2.producto_cod)
  LEFT JOIN sch_clinica.tbl_ffar FF2 ON (P2.producto_ffar_cod = FF2.ffar_cod)
  LEFT JOIN sch_clinica.tbl_fpres FP2 ON (P2.producto_fpres_cod = FP2.fpres_cod)
  LEFt JOIN sch_clinica.tbl_fabr F2 ON (P2.producto_fabricante_cod = F2.fabr_cod)

WHERE
  OID.ordinternamientodet_tpservicio = 2
  AND EM.emergencia_medicamento_estado = 1
  AND to_char(OI.ordinternamiento_finicio, 'YYYY-MM-DD') >= '01/01/2023'

UNION

SELECT
  1 AS orden,
  OA.ordatencion_cod AS "OACOD",
  OI.ordinternamiento_cod AS "OICOD",  
  PA.paciente_hstclinica_cod AS "HC",
  PA.paciente_hstclinica_cod || ' - ' || PE.persona_apep || ' ' || PE.persona_apem  || ' ' || 
  PE.persona_nmb1 || ' ' || PE.persona_nmb2 AS "PACIENTE",
  TP.tppaciente_dsc AS "TIPO PACIENTE",
  to_char(OI.ordinternamiento_finicio, 'YYYY-MM-DD') as "FECHA",
  '' AS "PRODUCTO | F. FARM. | FABR. | F. PRES.",
  '' AS "CANTIDAD",
  '' AS "TOTAL"
FROM
  sch_clinica.tbl_ordinternamientodet OID
  INNER JOIN sch_clinica.tbl_ordeninternamiento OI ON (OID.ordinternamientodet_oicod = OI.ordinternamiento_cod)
  INNER JOIN sch_clinica.tbl_ordatencion OA ON (OI.ordinternamiento_oacod = OA.ordatencion_cod)
  INNER JOIN sch_clinica.tbl_paciente PA ON (OA.ordatencion_paciente_cod = PA.paciente_cod)
  INNER JOIN sch_clinica.tbl_persona PE ON (OA.ordatencion_paciente_cod = PE.persona_cod)
  INNER JOIN sch_clinica.tbl_tppaciente TP ON (OA.ordatencion_tpaciente_cod = TP.tppaciente_cod)
WHERE
  OID.ordinternamientodet_tpservicio = 2

  AND to_char(OI.ordinternamiento_finicio, 'YYYY-MM-DD') >= '01/01/2023'
UNION

select 
  3 AS orden,
  OA.ordatencion_cod AS "OACOD",
  OI.ordinternamiento_cod AS "OICOD", 
  PA.paciente_hstclinica_cod AS "HC",
  ''  AS "PACIENTE",
  '' AS "TIPO PACIENTE",
  to_char(OI.ordinternamiento_finicio, 'YYYY-MM-DD') as "FECHA",
  COALESCE(PFD.prodfarmadet_prodfarma_cod,'') || ' - ' || COALESCE(PFD.prodfarmadet_item,'') || ' | ' || COALESCE(P1.producto_dsc,'') || ' | ' ||
  COALESCE(FF1.ffar_dsc,'') || ' | ' || COALESCE(F1.fabr_dsc,'') || ' | ' || COALESCE(FP1.fpres_dsc,'')  AS "PRODUCTO | F. FARM. | FABR. | F. PRES.",
  CAST(PTME.plantrabmed_ejecucion_cantsuministrada AS VARCHAR) AS "CANTIDAD",
  CAST(ROUND(CAST(OID.ordinternamientodet_precioventa AS NUMERIC), 4) AS VARCHAR) AS "TOTAL"
  
FROM 
  sch_clinica.tbl_ordinternamientodet OID
  INNER JOIN sch_clinica.tbl_ordeninternamiento OI ON (OID.ordinternamientodet_oicod = OI.ordinternamiento_cod)
  INNER JOIN sch_clinica.tbl_ordatencion OA ON (OI.ordinternamiento_oacod = OA.ordatencion_cod)
  INNER JOIN sch_clinica.tbl_paciente PA ON (OA.ordatencion_paciente_cod = PA.paciente_cod)
  INNER JOIN sch_clinica.tbl_persona PE ON (OA.ordatencion_paciente_cod = PE.persona_cod)
  INNER JOIN sch_clinica.tbl_tppaciente TP ON (OA.ordatencion_tpaciente_cod = TP.tppaciente_cod)
  INNER JOIN sch_clinica.tbl_plantrabmed_ejecucion PTME ON (OID.ordinternamientodet_cod = PTME.plantrabmed_ejecucion_oidet_cod)
  LEFT JOIN sch_clinica.tbl_prodfarmadet PFD ON (PTME.plantrabmed_ejecucion_prodfarmadet_cod = PFD.prodfarmadet_prodfarma_cod
  												AND PTME.plantrabmed_ejecucion_prodfarmadet_item = PFD.prodfarmadet_item
                                                )
  LEFT JOIN sch_clinica.tbl_prodfarma PF ON (PFD.prodfarmadet_prodfarma_cod = PF.prodfarma_cod)
  LEFT JOIN sch_clinica.tbl_ffar FF1 ON (PF.prodfarma_ffar_cod = FF1.ffar_cod)
  LEFT JOIN sch_clinica.tbl_fpres FP1 ON (PFD.prodfarmadet_fpres_cod = FP1.fpres_cod)
  LEFt JOIN sch_clinica.tbl_fabr F1 ON (PFD.prodfarmadet_fabr_cod = F1.fabr_cod)
  LEFT JOIN sch_clinica.tbl_producto P1 ON (PF.prodfarma_producto_cod = P1.producto_cod)
WHERE
  OID.ordinternamientodet_tpservicio = 2
  AND PTME.plantrabmed_ejecucion_estado = 1
  AND to_char(OI.ordinternamiento_finicio, 'YYYY-MM-DD') >= '01/01/2023' 
UNION
SELECT
  4 AS orden,
  OA.ordatencion_cod AS "OACOD",
  OI.ordinternamiento_cod AS "OICOD", 
  PA.paciente_hstclinica_cod AS "HC",
  ''  AS "PACIENTE",
  '' AS "TIPO PACIENTE",
  to_char(OI.ordinternamiento_finicio, 'YYYY-MM-DD') as "FECHA",
  P2.producto_cod || ' - ' || COALESCE(P2.producto_dsc,'') || ' | ' ||
  COALESCE(FF2.ffar_dsc,'') || ' | ' || COALESCE( F2.fabr_dsc ,'')|| ' | ' || COALESCE(FP2.fpres_dsc,'') AS "PRODUCTO | F. FARM. | FABR. | F. PRES.",
  CAST(PTM.plantrab_medicamento_cantsuministrada AS VARCHAR) AS "CANTIDAD",
  CAST(ROUND(CAST(OID.ordinternamientodet_precioventa AS NUMERIC), 4) AS VARCHAR) AS "TOTAL"
  
FROM 
  sch_clinica.tbl_ordinternamientodet OID
  INNER JOIN sch_clinica.tbl_ordeninternamiento OI ON (OID.ordinternamientodet_oicod = OI.ordinternamiento_cod)
  INNER JOIN sch_clinica.tbl_ordatencion OA ON (OI.ordinternamiento_oacod = OA.ordatencion_cod)
  INNER JOIN sch_clinica.tbl_paciente PA ON (OA.ordatencion_paciente_cod = PA.paciente_cod)
  INNER JOIN sch_clinica.tbl_persona PE ON (OA.ordatencion_paciente_cod = PE.persona_cod)
  INNER JOIN sch_clinica.tbl_tppaciente TP ON (OA.ordatencion_tpaciente_cod = TP.tppaciente_cod)
  INNER JOIN sch_clinica.tbl_plantrab_medicamento PTM ON (OID.ordinternamientodet_cod = PTM.plantrab_medicamento_oidet_cod)
  LEFT JOIN sch_clinica.tbl_producto P2 ON (PTM.plantrab_medicamento_producto_cod = P2.producto_cod)
  LEFT JOIN sch_clinica.tbl_ffar FF2 ON (P2.producto_ffar_cod = FF2.ffar_cod)
  LEFT JOIN sch_clinica.tbl_fpres FP2 ON (P2.producto_fpres_cod = FP2.fpres_cod)
  LEFt JOIN sch_clinica.tbl_fabr F2 ON (P2.producto_fabricante_cod = F2.fabr_cod)

WHERE
  OID.ordinternamientodet_tpservicio = 2
  AND PTM.plantrab_medicamento_estado = 1
  AND to_char(OI.ordinternamiento_finicio, 'YYYY-MM-DD') >= '01/01/2023'

) AS CONSULTA
ORDER BY
 CONSULTA."HC",
 CONSULTA.orden