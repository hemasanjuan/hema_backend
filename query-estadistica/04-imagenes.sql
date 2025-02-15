select
    cons."FECHA ATENCION",
    cons."DNI PACIENTE",
    cons."PACIENTE",
    cons."EDAD",
    cons."SEXO",
    cons."TIPO DE PACIENTE",
    cons."DESCRIPCION TIPO PACIENTE",
    cons."SERVICIO",
    cons.especialidad as "ESPECIALIDAD",
    cons."MEDICO",
    SUM(cons."VALOR VENTA") AS "VALOR VENTA",
    SUM(cons."CANTIDAD") AS "CANT",
    cons."OA",
    '' as "PROCEDIMIENTO",
    cons.area_dsc as "AREA",
    '' as "TIPO DE SERVICIO",
    '' as "PROVINCIA",
    '' as "CIUDAD",
    '' as "DISTRITO",
    '' as "CONDICION ESTABLECIMIENTO",
    '' as "CONDICION SERVICIO",
    '' as "GRUPO ETARIO",
    cons."LINEA DE NEGOCIO",
    '' as "MODALIDAD",
    '' as "LN INICIAL",
    cons.tp_financiador AS "TP. FINANCIADOR",
    CONS.ruc AS "RUC",
    CONS.empresa AS "Empresa"


from
(
SELECT DISTINCT
  sch_clinica.sp_mes_letras(date(DVS.docvntsunat_femision))	as "MES", 
  TO_CHAR(DVS.docvntsunat_femision, 'dd/MM/yyyy') AS "FECHA ATENCION",
  coalesce(per1.persona_nrodoc, per2.persona_nrodoc) AS "DNI PACIENTE",
  coalesce(per1.persona_apep || ' ' || per1.persona_apem || ' ' || per1.persona_nmb1 || ' ' || per1.persona_nmb2,
           per2.persona_apep || ' ' || per2.persona_apem || ' ' || per2.persona_nmb1 || ' ' || per2.persona_nmb2) AS "PACIENTE",
  (SELECT ANIO FROM 
     sch_clinica.sp_util_diferencia_fecha(coalesce(per1.persona_fecnac, per2.persona_fecnac), DATE(DVS.docvntsunat_femision) - 1)
     AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
  COALESCE(per1.persona_sexo, per2.persona_sexo) as "SEXO",
  ar.area_dsc as "SERVICIO",
  COALESCE(TP.tppaciente_dsc, 'EVENTUAL') AS "TIPO DE PACIENTE",
  coalesce(negp.negociacionprecio_dsc, 'PARTICULAR') as "DESCRIPCION TIPO PACIENTE",
  COALESCE(TA.tpatencion_dsc, 'ATENCION EVENTUAL') AS "LINEA DE NEGOCIO",
  med.vw_persona_nombres AS "MEDICO",
  OA.ordatencion_cod AS "OA",
 
  COALESCE(NEG_PREC.prec_neg * coalesce(DET.cantidad,DVSD.docvntsunatdet_cantidad), (
  coalesce(DET.valor_neto,DVSD.docvntsunatdet_cantidad * DVSD.docvntsunatdet_preciounineto))) as "VALOR VENTA",
  coalesce(DET.cantidad,DVSD.docvntsunatdet_cantidad)  AS "CANTIDAD",
  td.tarifariodet_dsc,
  ar.area_dsc,
  coalesce(oaas.ordatencionaseg_estado, oaaut.ordenatencionautoseg_estado, 0) as estado,
  coalesce(    cg.catgenerico_dsc, 'PARTICULAR') as tp_financiador,
  esp.espprofatencion_dsc as especialidad,
  EMP.empresa_ruc AS ruc,
  EMP.empresa_rznsocial AS empresa
FROM
  sch_clinica.tbl_docvntsunat DVS
  INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD ON (DVS.docvntsunat_cod = DVSD.docvntsunatdet_cod
  AND DVSD.docvntsunatdet_tpelemento = 0)
  INNER JOIN sch_clinica.tbl_segus S ON (DVSD.docvntsunatdet_elemento_cod = S.segus_tarifariodet_cod
  AND DVSD.docvntsunatdet_elemento_item = S.segus_tarifariodet_item AND (S.segus_area_cod = 31 OR S.segus_area_cod =51 OR S.segus_area_cod = 52 or S.segus_area_cod = 57 or S.segus_area_cod = 58))
  LEFT JOIN sch_clinica.tbl_tarifariodet TD ON (S.segus_tarifariodet_cod = TD.tarifariodet_cod
  AND S.segus_tarifariodet_item = TD.tarifariodet_item)
  LEFT JOIN sch_clinica.tbl_rmsegus_prvnt RSP ON (DVS.docvntsunat_predocvnt_cod = RSP.rmsegus_prvnt_prvntcod)
  LEFT JOIN sch_clinica.tbl_recetamedsegus RMS ON (RSP.rmsegus_prvnt_rscod = RMS.recetamedsegus_cod)
  LEFT JOIN sch_clinica.tbl_recetamed RM ON (RMS.recetamedsegus_rmcod = RM.recetamed_cod)
  LEFT JOIN sch_clinica.tbl_ordatencion OA ON (RM.recetamed_ordatenciondet_cod = OA.ordatencion_cod)
  LEFT JOIN sch_clinica.tbl_tpatencion TA ON (OA.ordatencion_tpatencion_cod = TA.tpatencion_cod)
  LEFT JOIN sch_clinica.tbl_tppaciente TP ON (OA.ordatencion_tpaciente_cod = TP.tppaciente_cod)
  LEFT JOIN sch_clinica.tbl_ordatencion_factura_historial OAFH ON (RM.recetamed_ordatenciondet_cod = OAFH.ordatencion_factura_historial_oacod
  AND OAFH.ordatencion_factura_historial_estado = 1 and OAFH.ordatencion_factura_historial_tipo = 1)
  left join sch_clinica.tbl_empresa aseg on (oa.ordatencion_negprc_emp_aseg_acod = aseg.empresa_cod)
  LEFT JOIN sch_clinica.tbl_docvntsunat DVS2 ON (OAFH.ordatencion_factura_historial_docvntsunatcod = DVS2.docvntsunat_cod and
  dvs2.docvntsunat_anulado = 0)
  LEFT JOIN sch_clinica.tbl_area ar on s.segus_area_cod = ar.area_cod
  LEFT JOIN 
  (
  SELECT 
    sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod as oa_cod,
    sch_clinica.tbl_segus_det.segus_det_dsc AS concepto,
    CASE WHEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1 THEN 
      CASE WHEN sch_clinica.tbl_segus.segus_tpejecucion = 1 THEN
          sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad
      ELSE
          SUM(1)
      END 
    END AS cantidad,
    CASE WHEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1 THEN
      (CASE WHEN sch_clinica.tbl_segus.segus_tpejecucion = 1 THEN
          sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad
      ELSE
          SUM(1)
      END) * sch_clinica.tbl_docvntsunatdet.docvntsunatdet_preciouniventa
    END AS valor_neto,
    sch_clinica.tbl_segus_det.segus_det_tdcod  AS elemento_cod,
    sch_clinica.tbl_segus_det.segus_det_tditem AS elemento_item,
    sch_clinica.tbl_docvntsunat.docvntsunat_cod as documento
  FROM
    sch_clinica.tbl_recetamed
    INNER JOIN sch_clinica.tbl_recetamedsegus ON (sch_clinica.tbl_recetamed.recetamed_cod = sch_clinica.tbl_recetamedsegus.recetamedsegus_rmcod)
    INNER JOIN sch_clinica.tbl_segus_det ON (sch_clinica.tbl_recetamedsegus.recetamedsegus_segusdet_cod = sch_clinica.tbl_segus_det.segus_det_cod)
    INNER JOIN sch_clinica.tbl_segus ON (sch_clinica.tbl_segus_det.segus_det_tdcod = sch_clinica.tbl_segus.segus_tarifariodet_cod)
    AND (sch_clinica.tbl_segus_det.segus_det_tditem = sch_clinica.tbl_segus.segus_tarifariodet_item)
    INNER JOIN sch_clinica.tbl_servicio_ejecucion ON (sch_clinica.tbl_recetamedsegus.recetamedsegus_cod = sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_atencion_cod)
    INNER JOIN sch_clinica.tbl_area ON (sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_area_cod = sch_clinica.tbl_area.area_cod)
    INNER JOIN sch_clinica.tbl_docvntsunatdet ON (sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_docvntsunatdet_cod = sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cod)
    AND (sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_docvntsunatdet_item = sch_clinica.tbl_docvntsunatdet.docvntsunatdet_item)
    INNER JOIN sch_clinica.tbl_docvntsunat ON (sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cod = sch_clinica.tbl_docvntsunat.docvntsunat_cod)
    INNER JOIN sch_clinica.tbl_ordatencionasegdet ON (sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod = sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_ordatencion_cod)
    AND (sch_clinica.tbl_recetamed.recetamed_ordatenciondet_item = sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_item)
    LEFT JOIN sch_clinica.tbl_oaexcepcion ON (sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_ordatencion_cod = sch_clinica.tbl_oaexcepcion.oaexcepcion_cod)
    AND (sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_grupo_cod = sch_clinica.tbl_oaexcepcion.oaexcepcion_area)
  WHERE
    sch_clinica.tbl_recetamed.recetamed_tprecetamed = 1 AND
    sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1 AND NOT EXISTS
    (SELECT sch_clinica.tbl_profatencion_prehonorario.profatencion_prehonorario_codserv_ejecucion
     FROM sch_clinica.tbl_profatencion_prehonorario
     WHERE sch_clinica.tbl_profatencion_prehonorario.profatencion_prehonorario_codserv_ejecucion = sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cod
     )
  GROUP BY
  sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod,
  sch_clinica.tbl_segus_det.segus_det_dsc,
    sch_clinica.tbl_docvntsunatdet.docvntsunatdet_preciouniventa,
    sch_clinica.tbl_segus_det.segus_det_tdcod,
    sch_clinica.tbl_segus_det.segus_det_tditem,
    sch_clinica.tbl_docvntsunatdet.docvntsunatdet_preciounineto,
    sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria,
    sch_clinica.tbl_segus.segus_tpejecucion,
    sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad,
    documento
  ) as DET ON (DET.oa_cod = OA.ordatencion_cod AND DET.elemento_cod = TD.tarifariodet_cod AND
                DET.elemento_item = TD.tarifariodet_item and
                DVS.docvntsunat_cod = DET.documento)
  left join sch_clinica.tbl_negociacionprecio negp on 
  oa.ordatencion_negprc_emp_aseg_ncod = negp.negociacionprecio_cod
  LEFT JOIN sch_clinica.tbl_catgenerico CG ON negp.negociacionprecio_tpfinanciador = CG.catgenerico_cod
  left join
  (
      SELECT
        np.negociacionprecio_cod,
        SVN.td_cod,
        SVN.td_item,
      CASE WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1 AND SVN.unidades > 0 THEN 
        ((FC.factor_valor * (1 - (COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, 
        NP.negociacionprecio_descuento) / 100))) * SVN.unidades)
      WHEN (COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 0) = 0 OR SVN.td_cod = 2) AND SVN.precio > 0 THEN
        SVN.precio * (1 - (COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, NPT.descuento_precio, 0) / 100))
      ELSE 0 END AS prec_neg
    FROM
      sch_clinica.tbl_negociacionprecio NP
      LEFT JOIN sch_clinica.tbl_empresa EM ON (NP.negociacionprecio_aseguradora_cod = EM.empresa_cod)
      LEFT JOIN sch_clinica.tbl_factor FC ON (NP.negociacionprecio_factor_cod = FC.factor_cod)
      INNER JOIN sch_clinica.vw_servicios_vs_negociaciones SVN ON (NP.negociacionprecio_cod = SVN.negociacion_cod)
      LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_tarifarios NPT ON (NP.negociacionprecio_cod = NPT.negociacion_cod
      AND SVN.td_cod = NPT.tarifario_cod)
      LEFT JOIN sch_clinica.tbl_negociacionpreciodet NPD ON (SVN.negociacion_cod = NPD.negociacionpreciodet_ncod
      AND SVN.td_cod = NPD.negociacionpreciodet_tcod
      AND SVN.td_item = NPD.negociacionpreciodet_tditem
      AND CASE WHEN NPD.negociacionpreciodet_tpmov = 0 THEN SVN.precio > 0 WHEN NPD.negociacionpreciodet_tpmov = 1 THEN SVN.unidades > 0 END)
      LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_padres NPD2 ON (SVN.negociacion_cod = NPD2.negociacion_cod
      AND SVN.td_cod = NPD2.td_cod AND SVN.td_item = NPD2.td_item AND NPD2.item = 1)
    WHERE
      NP.negociacionprecio_estado = 1
      AND (LENGTH(SVN.segus_cod) > 0 OR SVN.td_cod = 2)
  ) AS NEG_PREC ON 
  (COALESCE(negp.negociacionprecio_cod, 1) = NEG_PREC.negociacionprecio_cod AND
   TD.tarifariodet_cod = NEG_PREC.td_cod AND TD.tarifariodet_item = NEG_PREC.td_item)
   left join sch_clinica.tbl_paciente pac on (oa.ordatencion_paciente_cod = pac.paciente_cod)
   left join sch_clinica.tbl_persona per1 on 
   (oa.ordatencion_paciente_cod = per1.persona_cod)
   left join sch_clinica.tbl_persona per2 on
   (dvs.docvntsunat_cliente_cod = per2.persona_cod and dvs.docvntsunat_tpcliente <> 3)
   left join sch_clinica.tbl_servicio_ejecucion se on
  (dvs.docvntsunat_cod = se.servicio_ejecucion_docvntsunatdet_cod and
   dvsd.docvntsunatdet_item = se.servicio_ejecucion_docvntsunatdet_item)
  left join sch_clinica.tbl_ordenatencionautoseg oaaut on
  (oa.ordatencion_cod = oaaut.ordenatencionautoseg_cod)
  left join sch_clinica.tbl_ordatencionaseg oaas on
  (oa.ordatencion_cod = oaas.ordatencionaseg_cod)
  left join sch_clinica.tbl_ordatencionamb oaa on
  oa.ordatencion_cod = oaa.ordatencionamb_ordatenciondet_cod  and
  rm.recetamed_consulta_oaitem = oaa.ordatencionamb_ordatenciondet_item
  left join sch_clinica.tbl_citamedica cm on
  oaa.ordatencionamb_citamedica_cod = cm.citamedica_cod
  
  LEFT JOIN (
      SELECT DISTINCT
      emergencia_consulta_oacod AS codigo, 
      emergencia_consulta_emcod AS emcod,
      emergencia_consulta_pacod AS pacod
      FROM sch_clinica.tbl_emergencia_consulta
      INNER JOIN (
        SELECT 
        emergencia_consulta_oacod AS codigo, 
        MAX(emergencia_consulta_oaitem) AS item
        FROM sch_clinica.tbl_emergencia_consulta
        GROUP BY emergencia_consulta_oacod
      ) EMG ON (emergencia_consulta_oacod = EMG.codigo AND emergencia_consulta_oaitem = EMG.item)
  ) EMGC ON (OA.ordatencion_cod = EMGC.codigo)
        
  LEFT JOIN sch_clinica.vw_persona med ON (COALESCE(EMGC.pacod, se.servicio_ejecucion_pacod) = med.vw_persona_cod)
  LEFT JOIN sch_clinica.tbl_espprofatencion esp ON (COALESCE(EMGC.emcod, cm.citamedica_emcod) = esp.espprofatencion_cod)
  LEFT JOIN sch_clinica.tbl_empresa EMP ON (OA.ordatencion_negprc_emp_aseg_ecod = EMP.empresa_cod)
WHERE
  DATE(DVS.docvntsunat_femision) >= #fini#
  AND DATE(DVS.docvntsunat_femision) <= #ffin# and
  dvs.docvntsunat_anulado = 0 and
  dvs.docvntsunat_tpref = 0 
             
UNION ALL

--Emergencia
      select
        sch_clinica.sp_mes_letras(date(DVS.docvntsunat_femision))	as "MES", 
  TO_CHAR(DVS.docvntsunat_femision, 'dd/MM/yyyy') AS "FECHA ATENCION",
  coalesce(per1.persona_nrodoc, per2.persona_nrodoc) AS "DNI PACIENTE",
  coalesce(per1.persona_apep || ' ' || per1.persona_apem || ' ' || per1.persona_nmb1 || ' ' || per1.persona_nmb2,
           per2.persona_apep || ' ' || per2.persona_apem || ' ' || per2.persona_nmb1 || ' ' || per2.persona_nmb2) AS "PACIENTE",
  (SELECT ANIO FROM 
     sch_clinica.sp_util_diferencia_fecha(coalesce(per1.persona_fecnac, per2.persona_fecnac), DATE(DVS.docvntsunat_femision) - 1)
     AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
  COALESCE(per1.persona_sexo, per2.persona_sexo) as "SEXO",
  ar.area_dsc as "SERVICIO",
  COALESCE(TP.tppaciente_dsc, 'EVENTUAL') AS "TIPO DE PACIENTE",
  coalesce(negp.negociacionprecio_dsc, 'PARTICULAR') as "DESCRIPCION TIPO PACIENTE",
  COALESCE(TA.tpatencion_dsc, 'ATENCION EVENTUAL') AS "LINEA DE NEGOCIO",
  med.persona_apep || ' ' || med.persona_apem || ' ' || med.persona_nmb1 || ' ' || med.persona_nmb2 AS "MEDICO",
  OA.ordatencion_cod AS "OA",
 
  /*COALESCE(NEG_PREC.prec_neg * coalesce(DET.cantidad,DVSD.docvntsunatdet_cantidad), (*/
  coalesce(DET.valor_neto,DVSD.docvntsunatsubdet_cantidad * 
  case when dvs.docvntsunat_oa_codigo is null then dvsd.docvntsunatsubdet_pu_neto else DVSD.docvntsunatsubdet_pu_venta end) as "VALOR VENTA",
  coalesce(DET.cantidad,DVSD.docvntsunatsubdet_cantidad)  AS "CANTIDAD",
  td.tarifariodet_dsc as examen,
  ar.area_dsc,
  coalesce(oaas.ordatencionaseg_estado, oaaut.ordenatencionautoseg_estado, 0) as estado,
  coalesce(    cg.catgenerico_dsc, 'PARTICULAR') as tp_financiador,
  --cgc.catgenerico_dsc as grupo
  esp.espprofatencion_dsc as especialidad,
  EMP.empresa_ruc AS ruc,
  EMP.empresa_rznsocial AS empresa
      from
        sch_clinica.tbl_docvntsunat dvs
        inner join sch_clinica.tbl_docvntsunatdet dvd on (dvs.docvntsunat_cod = dvd.docvntsunatdet_cod
        and dvd.docvntsunatdet_tpelemento = 1 and (dvd.docvntsunatdet_elemento_item = 31 OR dvd.docvntsunatdet_elemento_item =51 OR dvd.docvntsunatdet_elemento_item = 52 or dvd.docvntsunatdet_elemento_item = 57 or dvd.docvntsunatdet_elemento_item = 58))
        inner join sch_clinica.tbl_docvntsunatsubdet dvsd on (dvd.docvntsunatdet_cod = dvsd.docvntsunatsubdet_sv_cod
        and dvd.docvntsunatdet_item = dvsd.docvntsunatsubdet_sv_item)
        LEFT JOIN sch_clinica.tbl_tarifariodet TD ON (cast(DVSD.docvntsunatsubdet_elemento_cod as integer) = TD.tarifariodet_cod
        AND cast(DVSD.docvntsunatsubdet_elemento_item as integer) = TD.tarifariodet_item)
        left JOIN sch_clinica.tbl_segus S ON (td.tarifariodet_cod = S.segus_tarifariodet_cod
        AND td.tarifariodet_item = S.segus_tarifariodet_item)
        LEFT JOIN sch_clinica.tbl_area ar on s.segus_area_cod = ar.area_cod
        LEFT JOIN sch_clinica.tbl_rmsegus_prvnt RSP ON (dvs.docvntsunat_predocvnt_cod = RSP.rmsegus_prvnt_prvntcod 
        and dvsd.docvntsunatsubdet_tp_servicio = rsp.rmsegus_prvnt_prvntitem)
        LEFT JOIN sch_clinica.tbl_recetamedsegus RMS ON (RSP.rmsegus_prvnt_rscod = RMS.recetamedsegus_cod)
        LEFT JOIN sch_clinica.tbl_recetamed RM ON (RMS.recetamedsegus_rmcod = RM.recetamed_cod)
        LEFT JOIN sch_clinica.tbl_ordatencion OA ON (RM.recetamed_ordatenciondet_cod = OA.ordatencion_cod)
        LEFT JOIN sch_clinica.tbl_tpatencion TA ON (OA.ordatencion_tpatencion_cod = TA.tpatencion_cod)
        LEFT JOIN sch_clinica.tbl_tppaciente TP ON (OA.ordatencion_tpaciente_cod = TP.tppaciente_cod)
        LEFT JOIN sch_clinica.tbl_ordatencion_factura_historial OAFH ON (oa.ordatencion_cod = oafh.ordatencion_factura_historial_oacod
        AND OAFH.ordatencion_factura_historial_estado = 1 and oafh.ordatencion_factura_historial_tipo = 1 and oafh.ordatencion_factura_historial_preventa is null)
        left join sch_clinica.tbl_empresa aseg on (oa.ordatencion_negprc_emp_aseg_acod = aseg.empresa_cod)
        LEFT JOIN sch_clinica.tbl_docvntsunat DVS2 ON (OAFH.ordatencion_factura_historial_docvntsunatcod = DVS2.docvntsunat_cod and
        dvs2.docvntsunat_anulado = 0)
        left join (
          SELECT 
            sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod as oa_cod,
            CASE WHEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1 THEN 
              CASE WHEN sch_clinica.tbl_segus.segus_tpejecucion = 1 THEN
                  sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad
              ELSE
                  SUM(1)
              END 
            END AS cantidad,
            CASE WHEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1 THEN
              (CASE WHEN sch_clinica.tbl_segus.segus_tpejecucion = 1 THEN
                  sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad
              ELSE
                  SUM(1)
              END) * sch_clinica.tbl_predocvntdet.predocvntdet_preciouniventa
            END AS valor_neto,
            sch_clinica.tbl_segus.segus_tarifariodet_cod AS elemento_cod,
            sch_clinica.tbl_segus.segus_tarifariodet_item AS elemento_item,
            sch_clinica.tbl_docvntsunat.docvntsunat_cod as documento
          FROM
            sch_clinica.tbl_recetamed
            INNER JOIN sch_clinica.tbl_recetamedsegus ON (sch_clinica.tbl_recetamed.recetamed_cod = sch_clinica.tbl_recetamedsegus.recetamedsegus_rmcod)
            left join sch_clinica.tbl_segus on (sch_clinica.tbl_recetamedsegus.recetamedsegus_segus_cod = sch_clinica.tbl_segus.segus_tarifariodet_cod
            and sch_clinica.tbl_recetamedsegus.recetamedsegus_segus_item = sch_clinica.tbl_segus.segus_tarifariodet_item)
            INNER JOIN sch_clinica.tbl_rmsegus_prvnt on (sch_clinica.tbl_recetamedsegus.recetamedsegus_cod = sch_clinica.tbl_rmsegus_prvnt.rmsegus_prvnt_rscod)
            INNER JOIN sch_clinica.tbl_servicio_ejecucion ON (sch_clinica.tbl_rmsegus_prvnt.rmsegus_prvnt_prvntcod = sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_predocvnt_cod
            and sch_clinica.tbl_rmsegus_prvnt.rmsegus_prvnt_prvntitem = sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_predocvnt_item)
            INNER JOIN sch_clinica.tbl_predocvntdet on (sch_clinica.tbl_rmsegus_prvnt.rmsegus_prvnt_prvntcod = sch_clinica.tbl_predocvntdet.predocvntdet_cod
            and sch_clinica.tbl_rmsegus_prvnt.rmsegus_prvnt_prvntitem = sch_clinica.tbl_predocvntdet.predocvntdet_item)
            INNER JOIN sch_clinica.tbl_docvntsunat ON (sch_clinica.tbl_rmsegus_prvnt.rmsegus_prvnt_prvntcod = sch_clinica.tbl_docvntsunat.docvntsunat_predocvnt_cod)
            INNER JOIN sch_clinica.tbl_ordatencionasegdet ON (sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod = sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_ordatencion_cod)
            AND (sch_clinica.tbl_recetamed.recetamed_ordatenciondet_item = sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_item)
            LEFT JOIN sch_clinica.tbl_oaexcepcion ON (sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_ordatencion_cod = sch_clinica.tbl_oaexcepcion.oaexcepcion_cod)
            AND (sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_grupo_cod = sch_clinica.tbl_oaexcepcion.oaexcepcion_area)
          WHERE
            sch_clinica.tbl_recetamed.recetamed_tprecetamed = 1 AND
            sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1
          GROUP BY
            sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod,
            sch_clinica.tbl_predocvntdet.predocvntdet_preciouniventa,
            sch_clinica.tbl_segus.segus_tarifariodet_cod,
            sch_clinica.tbl_segus.segus_tarifariodet_item,
            sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria,
            sch_clinica.tbl_segus.segus_tpejecucion,
            sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad,
            sch_clinica.tbl_docvntsunat.docvntsunat_cod) as det on (DET.oa_cod = OA.ordatencion_cod AND DET.elemento_cod = TD.tarifariodet_cod AND
                            DET.elemento_item = TD.tarifariodet_item and
                            DVS.docvntsunat_cod = DET.documento)
        left join sch_clinica.tbl_negociacionprecio negp on (oa.ordatencion_negprc_emp_aseg_ncod = negp.negociacionprecio_cod)
		LEFT JOIN sch_clinica.tbl_catgenerico CG ON negp.negociacionprecio_tpfinanciador = CG.catgenerico_cod
        left join (
          SELECT
            np.negociacionprecio_cod,
            SVN.td_cod,
            SVN.td_item,
            CASE WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1 AND SVN.unidades > 0 THEN 
              ((FC.factor_valor * (1 - (COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, 
              NP.negociacionprecio_descuento) / 100))) * SVN.unidades)
            WHEN (COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 0) = 0 OR SVN.td_cod = 2) AND SVN.precio > 0 THEN
              SVN.precio * (1 - (COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, NPT.descuento_precio, 0) / 100))
            ELSE 0 END AS prec_neg
          FROM
            sch_clinica.tbl_negociacionprecio NP
            LEFT JOIN sch_clinica.tbl_empresa EM ON (NP.negociacionprecio_aseguradora_cod = EM.empresa_cod)
            LEFT JOIN sch_clinica.tbl_factor FC ON (NP.negociacionprecio_factor_cod = FC.factor_cod)
            INNER JOIN sch_clinica.vw_servicios_vs_negociaciones SVN ON (NP.negociacionprecio_cod = SVN.negociacion_cod)
            LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_tarifarios NPT ON (NP.negociacionprecio_cod = NPT.negociacion_cod
            AND SVN.td_cod = NPT.tarifario_cod)
            LEFT JOIN sch_clinica.tbl_negociacionpreciodet NPD ON (SVN.negociacion_cod = NPD.negociacionpreciodet_ncod
            AND SVN.td_cod = NPD.negociacionpreciodet_tcod
            AND SVN.td_item = NPD.negociacionpreciodet_tditem
            AND CASE WHEN NPD.negociacionpreciodet_tpmov = 0 THEN SVN.precio > 0 WHEN NPD.negociacionpreciodet_tpmov = 1 THEN SVN.unidades > 0 END)
            LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_padres NPD2 ON (SVN.negociacion_cod = NPD2.negociacion_cod
            AND SVN.td_cod = NPD2.td_cod AND SVN.td_item = NPD2.td_item AND NPD2.item = 1)
          WHERE
            NP.negociacionprecio_estado = 1
            AND (LENGTH(SVN.segus_cod) > 0 OR SVN.td_cod = 2)
        ) AS NEG_PREC ON (negp.negociacionprecio_cod = NEG_PREC.negociacionprecio_cod AND 
        TD.tarifariodet_cod = NEG_PREC.td_cod AND TD.tarifariodet_item = NEG_PREC.td_item)
        left join sch_clinica.tbl_paciente pac on (oa.ordatencion_paciente_cod = pac.paciente_cod)
        left join sch_clinica.tbl_persona per1 on (oa.ordatencion_paciente_cod = per1.persona_cod)
        left join sch_clinica.tbl_persona per2 on (dvs.docvntsunat_cliente_cod = per2.persona_cod and dvs.docvntsunat_tpcliente <> 3)
        left join sch_clinica.tbl_servicio_ejecucion se on (RSP.rmsegus_prvnt_prvntcod = se.servicio_ejecucion_predocvnt_cod and
        RSP.rmsegus_prvnt_prvntitem = se.servicio_ejecucion_predocvnt_item)
        left join sch_clinica.tbl_ordenatencionautoseg oaaut on (oa.ordatencion_cod = oaaut.ordenatencionautoseg_cod)
        left join sch_clinica.tbl_ordatencionaseg oaas on (oa.ordatencion_cod = oaas.ordatencionaseg_cod)
        left join sch_clinica.tbl_ordatencionamb oaa on
        oa.ordatencion_cod = oaa.ordatencionamb_ordatenciondet_cod
        left join sch_clinica.tbl_citamedica cm on
        oaa.ordatencionamb_citamedica_cod = cm.citamedica_cod
        left join sch_clinica.tbl_emergencia_consulta ec on
        rm.recetamed_consulta_oacod = ec.emergencia_consulta_oacod and
        rm.recetamed_consulta_oaitem = ec.emergencia_consulta_oaitem
        
        LEFT JOIN (
            SELECT DISTINCT
            emergencia_consulta_oacod AS codigo, 
            emergencia_consulta_emcod AS emcod,
            emergencia_consulta_pacod AS pacod
            FROM sch_clinica.tbl_emergencia_consulta
            INNER JOIN (
              SELECT 
              emergencia_consulta_oacod AS codigo, 
              MAX(emergencia_consulta_oaitem) AS item
              FROM sch_clinica.tbl_emergencia_consulta
              GROUP BY emergencia_consulta_oacod
            ) EMG ON (emergencia_consulta_oacod = EMG.codigo AND emergencia_consulta_oaitem = EMG.item)
        ) EMGC ON (OA.ordatencion_cod = EMGC.codigo)
        
        LEFT JOIN sch_clinica.tbl_persona med ON (COALESCE(EMGC.pacod, se.servicio_ejecucion_pacod) = med.persona_cod)
        LEFT JOIN sch_clinica.tbl_espprofatencion esp ON (EMGC.emcod = esp.espprofatencion_cod)
        left join sch_clinica.tbl_catgenerico cgc on (td.tarifariodet_cat_aux = cgc.catgenerico_cod)
        left join sch_clinica.tbl_hospitalizacion hosp on oa.ordatencion_cod = hosp.hospitalizacion_procedencia_oacod and
            tp.tppaciente_cod = 2
        LEFT JOIN sch_clinica.tbl_empresa EMP ON (OA.ordatencion_negprc_emp_aseg_ecod = EMP.empresa_cod)
     where
        DATE(DVS.docvntsunat_femision) between date(#fini#) and date(#ffin#)
        and dvs.docvntsunat_predocvnt_cod is not null
        and dvs.docvntsunat_anulado = 0 
        and dvs.docvntsunat_tpref = 0
        AND HOSP.hospitalizacion_oacod IS NULL

UNION ALL

 SELECT
    sch_clinica.sp_mes_letras(date(OID.ordinternamientodet_fregistro))	as "MES", 
    TO_CHAR(OID.ordinternamientodet_fregistro, 'dd/MM/yyyy') AS fecha_emision,
    per1.persona_nrodoc,
    per1.persona_apep || ' ' || per1.persona_apem || ' ' || per1.persona_nmb1 || ' ' || per1.persona_nmb2,
    (SELECT ANIO FROM 
     sch_clinica.sp_util_diferencia_fecha(per1.persona_fecnac, DATE(OID.ordinternamientodet_fregistro) - 1)
     AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
    per1.persona_sexo as "SEXO",
    ar.area_dsc,
    TP.tppaciente_dsc AS tp_paciente,
    negp.negociacionprecio_dsc as "NEGOCIACION",    
    TA.tpatencion_dsc AS tp_atencion,
    med.vw_persona_nombres,
    OI.ordinternamiento_oacod AS oa_codigo,  
    
    COALESCE(NEG_PREC.prec_neg * OID.ordinternamientodet_cantidad, ROUND(CAST(OID.ordinternamientodet_cantidad * OID.ordinternamientodet_preciouniventa AS NUMERIC), 2)),
    OID.ordinternamientodet_cantidad AS cantidad,
    oiss.descripcion,
    ar.area_dsc,
    OI.ordinternamiento_estado_facturacion,
    cg.catgenerico_dsc AS "TP. FINANCIADOR",
    esp.espprofatencion_dsc,
    EMP.empresa_ruc AS ruc,
    EMP.empresa_rznsocial AS empresa
  FROM
    sch_clinica.vw_oi_servicios_segus OISS
    inner join sch_clinica.tbl_ordinternamientodet oid on
    (oid.ordinternamientodet_cod = OISS.codigo_oid)
    LEFT JOIN sch_clinica.tbl_ordeninternamiento OI ON (oid.ordinternamientodet_oicod = OI.ordinternamiento_cod)
    LEFT JOIN sch_clinica.tbl_ordatencion OA ON (OI.ordinternamiento_oacod = OA.ordatencion_cod)
    LEFT JOIN sch_clinica.tbl_tpatencion TA ON (OA.ordatencion_tpatencion_cod = TA.tpatencion_cod)
    LEFT JOIN sch_clinica.tbl_tppaciente TP ON (OI.ordinternamiento_tppaciente = TP.tppaciente_cod)
    LEFT JOIN sch_clinica.tbl_ordatencion_factura_historial OAFH ON (OI.ordinternamiento_cod = OAFH.ordatencion_factura_historial_oicod
    AND OAFH.ordatencion_factura_historial_estado = 1 AND (OAFH.ordatencion_factura_historial_tipo = 1 OR OAFH.ordatencion_factura_historial_tipo = 2)
    AND OAFH.ordatencion_factura_historial_tporigen = 0)
    LEFT JOIN sch_clinica.tbl_docvntsunat DVS2 ON (OAFH.ordatencion_factura_historial_docvntsunatcod = DVS2.docvntsunat_cod and
    dvs2.docvntsunat_anulado = 0 /*and dvs2.docvntsunat_tpref = 0*/)
    left join sch_clinica.tbl_empresa aseg on (oa.ordatencion_negprc_emp_aseg_acod = aseg.empresa_cod)
    left join sch_clinica.tbl_negociacionprecio negp on oa.ordatencion_negprc_emp_aseg_ncod = negp.negociacionprecio_cod
LEFT JOIN sch_clinica.tbl_catgenerico CG ON negp.negociacionprecio_tpfinanciador = CG.catgenerico_cod
	LEFT JOIN sch_clinica.tbl_area ar on oiss.cod_area = ar.area_cod
    left join
    (
      SELECT
        np.negociacionprecio_cod,
        SVN.td_cod,
        SVN.td_item,
      CASE WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1 AND SVN.unidades > 0 THEN 
        ((FC.factor_valor * (1 - (COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, 
        NP.negociacionprecio_descuento) / 100))) * SVN.unidades)
      WHEN (COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 0) = 0 OR SVN.td_cod = 2) AND SVN.precio > 0 THEN
        SVN.precio * (1 - (COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, NPT.descuento_precio, 0) / 100))
      ELSE 0 END AS prec_neg
    FROM
      sch_clinica.tbl_negociacionprecio NP
      LEFT JOIN sch_clinica.tbl_empresa EM ON (NP.negociacionprecio_aseguradora_cod = EM.empresa_cod)
      LEFT JOIN sch_clinica.tbl_factor FC ON (NP.negociacionprecio_factor_cod = FC.factor_cod)
      INNER JOIN sch_clinica.vw_servicios_vs_negociaciones SVN ON (NP.negociacionprecio_cod = SVN.negociacion_cod)
      LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_tarifarios NPT ON (NP.negociacionprecio_cod = NPT.negociacion_cod
      AND SVN.td_cod = NPT.tarifario_cod)
      LEFT JOIN sch_clinica.tbl_negociacionpreciodet NPD ON (SVN.negociacion_cod = NPD.negociacionpreciodet_ncod
      AND SVN.td_cod = NPD.negociacionpreciodet_tcod
      AND SVN.td_item = NPD.negociacionpreciodet_tditem
      AND CASE WHEN NPD.negociacionpreciodet_tpmov = 0 THEN SVN.precio > 0 WHEN NPD.negociacionpreciodet_tpmov = 1 THEN SVN.unidades > 0 END)
      LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_padres NPD2 ON (SVN.negociacion_cod = NPD2.negociacion_cod
      AND SVN.td_cod = NPD2.td_cod AND SVN.td_item = NPD2.td_item AND NPD2.item = 1)
    WHERE
      NP.negociacionprecio_estado = 1
      AND (LENGTH(SVN.segus_cod) > 0 OR SVN.td_cod = 2)
  ) AS NEG_PREC ON 
  (negp.negociacionprecio_cod = NEG_PREC.negociacionprecio_cod AND
   OISS.tdcod = NEG_PREC.td_cod AND OISS.tditem = NEG_PREC.td_item)
  left join sch_clinica.tbl_paciente pac on (oa.ordatencion_paciente_cod = pac.paciente_cod)
   left join sch_clinica.tbl_persona per1 on 
   (oa.ordatencion_paciente_cod = per1.persona_cod)
   left join sch_clinica.tbl_hospitalizacion h on
   oa.ordatencion_cod = h.hospitalizacion_oacod
   left join 
   (
select
    	*
    from
    (
   	select distinct
    	q.quirofano_oacod,
        q.quirofano_oicod,
        qpa.quirofano_profatencion_pacod,
        qpa.quirofano_profatencion_emcod,
        RANK () OVER ( PARTITION BY q.quirofano_oacod, q.quirofano_oicod ORDER BY qpa.quirofano_profatencion_cod DESC) AS item 
    from
    	sch_clinica.tbl_quirofano q 
   		inner join sch_clinica.tbl_quirofano_profatencion qpa on
        q.quirofano_cod = qpa.quirofano_profatencion_cod
    where
    	qpa.quirofano_profatencion_principal = 1 and
        qpa.quirofano_profatencion_reghabilitado = 1
    ) cons
    where
    	cons.item = 1
   ) AS QUI ON (oi.ordinternamiento_cod = QUI.quirofano_oicod)
   left join sch_clinica.vw_persona med on
   coalesce(h.hospitalizacion_pacod, qui.quirofano_profatencion_pacod) = med.vw_persona_cod
   left join sch_clinica.tbl_espprofatencion esp on
   coalesce(h.hospitalizacion_emcod, qui.quirofano_profatencion_emcod) = esp.espprofatencion_cod
   LEFT JOIN sch_clinica.tbl_empresa EMP ON (OA.ordatencion_negprc_emp_aseg_ecod = EMP.empresa_cod)
WHERE
    (OISS.cod_area = 31 OR
    OISS.cod_area = 52 OR 
    OISS.cod_area = 51 OR
    OISS.cod_area = 57 OR 
    OISS.cod_area = 58) AND
    OID.ordinternamientodet_ejecucion_auditoria = 1
    AND DATE(OID.ordinternamientodet_fregistro) >= #fini#
    AND DATE(OID.ordinternamientodet_fregistro) <= #ffin#
) as cons
WHERE
	cons.estado <> 4
GROUP BY
	--1,2,3,4,5,6,7,8,9,10,11,12,13,16
    1,2,3,4,5,6,7,8,9,10,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28
order by
	1,2,3
            