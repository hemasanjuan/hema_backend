select
    
	cons."MES",
    cons."FECHA ATENCION",
    cons."DNI PACIENTE",
    cons."PACIENTE",
    cons."EDAD",
    cons."SEXO",    
    cons."TIPO DE PACIENTE",
    cons."DESCRIPCION TIPO PACIENTE",
    cons."LINEA DE NEGOCIO",
    cons."SERVICIO",
    cons."MEDICO",
    cons.area_dsc as "AREA",
    SUM(cons."VALOR VENTA") AS "VALOR VENTA",
    SUM(cons."CANTIDAD") AS "CANTIDAD",
    cons."COD EXAMEN/ORDEN DE ATENCION",
    cons."SERIE",
    cons."NUMERO",
    cons."FECHA_EMISION",
    cons."VALOR_VENTA",
    cons."VALOR_NETO"
 
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
  'IMÁGENES' as "SERVICIO",
  COALESCE(TP.tppaciente_dsc, 'EVENTUAL') AS "TIPO DE PACIENTE",
  coalesce(negp.negociacionprecio_dsc, 'PARTICULAR') as "DESCRIPCION TIPO PACIENTE",
  COALESCE(TA.tpatencion_dsc, 'ATENCION EVENTUAL') AS "LINEA DE NEGOCIO",
  med.vw_persona_nombres AS "MEDICO",
  OA.ordatencion_cod AS "COD EXAMEN/ORDEN DE ATENCION",

  
 
  COALESCE(NEG_PREC.prec_neg * coalesce(DET.cantidad,DVSD.docvntsunatdet_cantidad), (
  coalesce(DET.valor_neto,DVSD.docvntsunatdet_cantidad * DVSD.docvntsunatdet_preciounineto))) as "VALOR VENTA",
  coalesce(DET.cantidad,DVSD.docvntsunatdet_cantidad)  AS "CANTIDAD",
  td.tarifariodet_dsc,
  ar.area_dsc,
  coalesce(oaas.ordatencionaseg_estado, oaaut.ordenatencionautoseg_estado, 0) as estado,
  DVS.docvntsunat_serie as "SERIE",
  DVS.docvntsunat_nro as "NUMERO",
  DVS.docvntsunat_femision as "FECHA_EMISION",
  DVS.docvntsunat_totalventa as "VALOR_VENTA",
  DVS.docvntsunat_totneto as "VALOR_NETO"
FROM
  sch_clinica.tbl_docvntsunat DVS
  INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD ON (DVS.docvntsunat_cod = DVSD.docvntsunatdet_cod
  AND DVSD.docvntsunatdet_tpelemento = 0)
  INNER JOIN sch_clinica.tbl_segus S ON (DVSD.docvntsunatdet_elemento_cod = S.segus_tarifariodet_cod
  AND DVSD.docvntsunatdet_elemento_item = S.segus_tarifariodet_item AND (S.segus_area_cod = 31 OR S.segus_area_cod =51 OR S.segus_area_cod = 52))
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
  oa.ordatencion_cod = oaa.ordatencionamb_ordatenciondet_cod
  left join sch_clinica.tbl_citamedica cm on
  oaa.ordatencionamb_citamedica_cod = cm.citamedica_cod
  LEFT JOIN sch_clinica.vw_persona med on
  coalesce(se.servicio_ejecucion_pacod, cm.citamedica_pacod) = med.vw_persona_cod
WHERE
  DATE(DVS.docvntsunat_femision) >= :finicio
  AND DATE(DVS.docvntsunat_femision) <= :ffin and
  dvs.docvntsunat_anulado = 0 and
  dvs.docvntsunat_tpref = 0 
             
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
    'IMÁGENES',
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
    DVS2.docvntsunat_serie AS "SERIE",
    DVS2.docvntsunat_nro as "NUMERO",
  	DVS2.docvntsunat_femision as "FECHA_EMISION",
  	DVS2.docvntsunat_totalventa as "VALOR_VENTA",
  	DVS2.docvntsunat_totneto as "VALOR_NETO"
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
WHERE
    OISS.cod_area = 31 AND
    OID.ordinternamientodet_ejecucion_auditoria = 1
    AND DATE(OID.ordinternamientodet_fregistro) >= :finicio
    AND DATE(OID.ordinternamientodet_fregistro) <= :ffin
) as cons
WHERE
	cons.estado <> 4
GROUP BY
	1,2,3,4,5,6,7,8,9,10,11,12,15,16,17,18,19,20
order by
	1,2,3