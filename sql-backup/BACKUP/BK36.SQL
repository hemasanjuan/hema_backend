SELECT * FROM ( 
 (SELECT coalesce(CASE 
 WHEN (sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 0 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc != 7)
 OR (sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc = 7) THEN
 to_char(sch_clinica.tbl_docvntsunat.docvntsunat_femision, 'dd/MM/yyyy')
 WHEN sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 THEN
 to_char(sch_clinica.tbl_docvntanulado.docvntanulado_femision, 'dd/MM/yyyy') 
 END,'') as fecha_doc,--1
 coalesce(CASE 
 WHEN (sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 0 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc != 7)
 OR (sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc = 7) THEN
 	cast(sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc as varchar)
 WHEN sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 THEN
 	cast(sch_clinica.tbl_docvntanulado.docvntanulado_tpdoc  as varchar)
 END,'') as tpdoc_doc,--2
 coalesce(CASE 
 WHEN (sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 0 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc != 7)
 OR (sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc = 7) THEN
 sch_clinica.tbl_docvntsunat.docvntsunat_serie 
 WHEN sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 THEN
 sch_clinica.tbl_docvntanulado.docvntanulado_serie 
 END,'') as serie_doc,--3
coalesce( CASE 
 WHEN (sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 0 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc != 7)
 OR (sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc = 7) THEN
 sch_clinica.tbl_docvntsunat.docvntsunat_nro
 WHEN sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 THEN
 sch_clinica.tbl_docvntanulado.docvntanulado_nro
 END,'') as numero_doc,--4
---------------------------------------
 CASE WHEN sch_clinica.tbl_paciente.paciente_hstclinica_cod ISNULL
 THEN '0' ELSE sch_clinica.tbl_paciente.paciente_hstclinica_cod
 END as historia_clinica,--5
 CASE
 WHEN sch_clinica.tbl_pago.pago_tpmoneda_cod = 2 AND sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 0 THEN
 'ING. POR CAMBIO MONEDA | $' || 
 ROUND(CAST(ROUND(CAST(sch_clinica.tbl_pago.pago_mtodeltotal AS NUMERIC),2) / 
 (SELECT tpcambiocomercial_compra FROM sch_clinica.tbl_tpcambiocomercial 
 WHERE tpcambiocomercial_cod = sch_clinica.tbl_pago.pago_tpcambiocomercial_cod) AS NUMERIC),2)
 || '(T.C ' || TO_CHAR((SELECT c.tpcambiocomercial_compra FROM sch_clinica.tbl_tpcambiocomercial c WHERE c.tpcambiocomercial_cod = sch_clinica.tbl_pago.pago_tpcambiocomercial_cod),'9.00') || ')'
 WHEN sch_clinica.tbl_pago.pago_tpmoneda_cod = 1 AND sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 0 THEN 
 CASE WHEN sch_clinica.tbl_docvntanulado.docvntanulado_cod IS NOT NULL THEN
 '*************** ANULACION DE DIE ' || COALESCE(sch_clinica.tbl_docvntanulado.docvntanulado_cod,'')
 WHEN sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc = 7 THEN
 '*************** ANULACION DE NC ' || COALESCE(sch_clinica.tbl_docvntsunat.docvntsunat_cod,'') 
 WHEN sch_clinica.tbl_docvntsunat.docvntsunat_tpcliente = 3 THEN
 (SELECT empresa_rznsocial FROM sch_clinica.tbl_empresa WHERE empresa_cod = sch_clinica.tbl_docvntsunat.docvntsunat_cliente_cod)
 WHEN sch_clinica.tbl_docvntsunat.docvntsunat_tpcliente = 0 THEN
 'EVENTUAL'
 ELSE
 (SELECT persona_apep || ' ' || persona_apem || ' ' || persona_nmb1 || ' ' || persona_nmb2
 || CASE WHEN sch_clinica.tbl_predocvnt.predocvnt_tipo IS NULL OR sch_clinica.tbl_predocvnt.predocvnt_tipo <> 9 THEN '' ELSE ' - PC' END -- AGREGADO PAGO CUENTA
 FROM sch_clinica.tbl_persona
 WHERE persona_cod = sch_clinica.tbl_docvntsunat.docvntsunat_cliente_cod)
 END
 WHEN sch_clinica.tbl_pago.pago_tpmoneda_cod = 1 AND sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 THEN 
 CASE WHEN sch_clinica.tbl_docvntanulado.docvntanulado_docvntref_cod IS NOT NULL THEN
 '*************** ANULACION DE DOC ' || COALESCE(sch_clinica.tbl_docvntanulado.docvntanulado_docvntref_cod,'')
 WHEN sch_clinica.tbl_docvntsunat.docvntsunat_anulado = 1 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc != 7 THEN
 '*************** ANULACION DE DOC ' || 
 sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc || ' ' ||
 sch_clinica.tbl_docvntsunat.docvntsunat_serie || '-' ||
 sch_clinica.tbl_docvntsunat.docvntsunat_nro
 WHEN sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc = 7 THEN
 '*************** NOTA DE CREDITO AL DOC  ' || 
 SUBSTRING(sch_clinica.tbl_docvntsunat_referencia.docvntsunat_referencia_docref_cod,1,3) || ' ' ||
 SUBSTRING(sch_clinica.tbl_docvntsunat_referencia.docvntsunat_referencia_docref_cod,4,4) || '-' ||
 SUBSTRING(sch_clinica.tbl_docvntsunat_referencia.docvntsunat_referencia_docref_cod,8,10)
 ELSE 'SAL. POR CAMBIO MONEDA'
 END
 ELSE 'EVENTUAL'
 END as paciente,--6
 coalesce((SELECT ANIO || '' FROM 
 sch_clinica.sp_util_diferencia_fecha(sch_clinica.tbl_persona.persona_fecnac, DATE(sch_clinica.tbl_docvntsunat.docvntsunat_femision) - 1)
 AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)),'') AS edad_anio,--17
 sch_clinica.tbl_persona.persona_sexo as sexo,
 COALESCE(NOMBREPA.nombre,'') AS prof_atencion,--7
 COALESCE(SERVICIO.servicio,'') AS catalogo,--8

 CASE WHEN sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 0
 THEN ROUND(CAST(sch_clinica.tbl_pago.pago_mtodeltotal AS NUMERIC),3)
 ELSE 0
 END as doccaja_ingreso, --9
 CASE WHEN sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1
 THEN ABS(ROUND(CAST(sch_clinica.tbl_pago.pago_mtodeltotal AS NUMERIC),3))
 ELSE 0
 END as doccaja_egreso, --10
 
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_totalventa AS NUMERIC),3) AS mtototalventa,
 ROUND(CAST(sch_clinica.tbl_pago.pago_mtodeltotal AS NUMERIC),3) as pago_mtodeltotal,--11
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_totalventa - sch_clinica.tbl_pago.pago_mtodeltotal AS NUMERIC),3) AS monto_descuento,
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_igv AS NUMERIC),3) AS igv,

  coalesce(sch_clinica.tbl_polizaplan.polizaplan_dsc, '') as categoria,
  COALESCE(SERVICIO.tp_paciente, TPPACIENTE.tp_paciente) AS tp_paciente,
  TPPACIENTE.tp_consulta AS tp_consulta,
  
  pro.provincia_dsc as provincia,
  ciu.ciudad_dsc as ciudad,
  dis.distrito_dsc as distrito,
  
 sch_clinica.tbl_doccaja.doccaja_tpmovimiento AS tp_mov,--12
 sch_clinica.tbl_doccaja.doccaja_usrcreacion AS cajero,
 sch_clinica.tbl_docvntsunat.docvntsunat_oa_codigo AS codigo_oa,
 sch_clinica.tbl_persona.persona_nrodoc as numero_documento_identidad
 
 FROM
 sch_clinica.tbl_pago
 LEFT OUTER JOIN sch_clinica.tbl_docvntsunat ON (sch_clinica.tbl_pago.pago_docvntsunat_cod = sch_clinica.tbl_docvntsunat.docvntsunat_cod)
 INNER JOIN sch_clinica.tbl_doccaja ON (sch_clinica.tbl_pago.pago_doccaja_cod = sch_clinica.tbl_doccaja.doccaja_cod)
 INNER JOIN sch_clinica.tbl_tpformapago ON (sch_clinica.tbl_pago.pago_tpformapago_cod = sch_clinica.tbl_tpformapago.tpformapago_cod)
 INNER JOIN sch_clinica.tbl_tpmoneda ON (sch_clinica.tbl_pago.pago_tpmoneda_cod = sch_clinica.tbl_tpmoneda.tpmoneda_cod)
 LEFT OUTER JOIN sch_clinica.tbl_predocvnt ON (sch_clinica.tbl_docvntsunat.docvntsunat_predocvnt_cod = sch_clinica.tbl_predocvnt.predocvnt_cod)
 LEFT OUTER JOIN sch_clinica.tbl_paciente ON (sch_clinica.tbl_predocvnt.predocvnt_paciente_cod = sch_clinica.tbl_paciente.paciente_cod)
 left join sch_clinica.tbl_paciente_plan on (sch_clinica.tbl_paciente.paciente_cod = sch_clinica.tbl_paciente_plan.paciente_plan_pcod)
 left join sch_clinica.tbl_polizaplan on (sch_clinica.tbl_paciente_plan.paciente_plan_pp_cod = sch_clinica.tbl_polizaplan.polizaplan_cod)
 LEFT OUTER JOIN sch_clinica.tbl_persona ON (sch_clinica.tbl_paciente.paciente_cod = sch_clinica.tbl_persona.persona_cod)
 LEFT JOIN sch_clinica.tbl_distrito DIS ON (DIS.distrito_cod = sch_clinica.tbl_persona.persona_ubigeo)
 LEFT JOIN sch_clinica.tbl_provincia PRO ON (PRO.provincia_cod = DIS.distrito_provincia_cod 
      AND PRO.provincia_ciudad_cod = DIS.distrito_ciudad_cod)
 LEFT JOIN sch_clinica.tbl_ciudad CIU ON (CIU.ciudad_cod = DIS.distrito_ciudad_cod)    
    AND (CIU.ciudad_pais_cod = sch_clinica.tbl_persona.persona_pais)  
 LEFT OUTER JOIN sch_clinica.tbl_docvntanulado ON (sch_clinica.tbl_pago.pago_docvntsunat_cod = sch_clinica.tbl_docvntanulado.docvntanulado_cod) 
 LEFT OUTER JOIN sch_clinica.tbl_docvntsunat_referencia ON ( sch_clinica.tbl_docvntsunat.docvntsunat_cod = sch_clinica.tbl_docvntsunat_referencia.docvntsunat_referencia_cod)
 LEFT OUTER JOIN 
 (
 	SELECT DISTINCT
    	DVS.docvntsunat_cod AS codigo,
 		array_to_string(array_agg(DISTINCT CASE
        	WHEN PDV.predocvnt_tipo = 0 THEN TARIFARIO.servicio
            WHEN PDV.predocvnt_tipo = 1 THEN A.area_dsc || case when td.tarifariodet_dsc is not null then ' - ' || COALESCE(td.tarifariodet_dsc, '') else '' end
            WHEN PDV.predocvnt_tipo = 2 THEN FARMAA.descripcion --'FARMACIA'
            WHEN PDV.predocvnt_tipo = 3 THEN 'QUIROFANO'
            WHEN PDV.predocvnt_tipo = 4 THEN 'VISITA PASTORAL'
            WHEN PDV.predocvnt_tipo = 5 THEN SD.segus_det_dsc
            WHEN PDV.predocvnt_tipo = 6 THEN TARIFARIO.servicio
            WHEN PDV.predocvnt_tipo = 7 THEN PRODUCTO.servicio
            WHEN PDV.predocvnt_tipo = 8 THEN PRODUCTO.servicio
            WHEN PDV.predocvnt_tipo = 9 THEN TARIFARIO.servicio
            WHEN PDV.predocvnt_tipo = 11 THEN 'PAGO ANTICIPADO' ELSE 'ANULADO' END), ' , ') AS servicio,
        tppac.tppaciente_dsc AS tp_paciente
	FROM
       sch_clinica.tbl_docvntsunat DVS 
       INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
       LEFT JOIN sch_clinica.tbl_rmsegus_prvnt RMSPV ON (PDV.predocvnt_cod = RMSPV.rmsegus_prvnt_prvntcod)
       LEFT JOIN sch_clinica.tbl_recetamedsegus RMS ON (RMSPV.rmsegus_prvnt_rscod = RMS.recetamedsegus_cod)
       LEFT JOIN sch_clinica.tbl_recetamed RM ON (RMS.recetamedsegus_rmcod = RM.recetamed_cod)
       left join sch_clinica.tbl_ordatencion oa on (rm.recetamed_ordatenciondet_cod = oa.ordatencion_cod)
       left join sch_clinica.tbl_tratamiento_venta tv on (DVS.docvntsunat_cod = tv.tratamiento_venta_docvntsunat_cod)
       left join sch_clinica.tbl_tratamiento trat on (tv.tratamiento_venta_cod_tratamiento = trat.tratamiento_cod)
       left join sch_clinica.tbl_tppaciente tppac on (coalesce(oa.ordatencion_tpaciente_cod, trat.tratamiento_tppaciente_cod) = tppac.tppaciente_cod)
       LEFT JOIN sch_clinica.tbl_servicio_ejecucion SE ON (DVS.docvntsunat_cod = SE.servicio_ejecucion_docvntsunatdet_cod)
       LEFT JOIN sch_clinica.tbl_area A ON (SE.servicio_ejecucion_area_cod = A.area_cod)
       LEFT JOIN sch_clinica.tbl_tarifariodet td on (se.servicio_ejecucion_tarifariodet_cod = td.tarifariodet_cod and
       												se.servicio_ejecucion_tarifariodet_item = td.tarifariodet_item)
       LEFT JOIN sch_clinica.tbl_hcprocmed_prvnt HCPDV ON (PDV.predocvnt_cod = HCPDV.hcprocmed_prvnt_prvntcod)
       LEFT JOIN sch_clinica.tbl_hstconsulta_procmed PMED ON (HCPDV.hcprocmed_prvnt_pmcod = PMED.hstconsulta_procmed_cod)
       LEFT JOIN sch_clinica.tbl_segus_det SD ON (PMED.hstconsulta_procmed_detsegus_cod = SD.segus_det_cod)
       LEFT JOIN
       (
          SELECT 
              DVST.docvntsunat_cod AS codigo, TD.tarifariodet_dsc AS servicio
          FROM 
              sch_clinica.tbl_docvntsunat DVST 
              INNER JOIN sch_clinica.tbl_predocvnt PDVT ON (DVST.docvntsunat_predocvnt_cod = PDVT.predocvnt_cod)
              LEFT JOIN sch_clinica.tbl_docvntsunatdet DVSD ON (DVST.docvntsunat_cod = DVSD.docvntsunatdet_cod)
              LEFT JOIN sch_clinica.tbl_tarifariodet TD ON (DVSD.docvntsunatdet_elemento_cod = TD.tarifariodet_cod)
              AND (DVSD.docvntsunatdet_elemento_item = TD.tarifariodet_item)
       ) AS TARIFARIO ON (DVS.docvntsunat_cod = TARIFARIO.codigo) 
       LEFT JOIN 
       (
          SELECT 
              DVSP.docvntsunat_cod AS codigo, 
              P.producto_dsc AS servicio
          FROM 
              sch_clinica.tbl_docvntsunat DVSP 
              INNER JOIN sch_clinica.tbl_predocvnt PDVP ON (DVSP.docvntsunat_predocvnt_cod = PDVP.predocvnt_cod)
              INNER JOIN sch_clinica.tbl_docvntsunatdet DVSDP ON (DVSP.docvntsunat_cod = DVSDP.docvntsunatdet_cod)
              LEFT JOIN sch_clinica.tbl_lstpreciodet LPD ON (DVSDP.docvntsunatdet_elemento_cod = LPD.lstpreciodet_cod)
              AND (DVSDP.docvntsunatdet_elemento_item = LPD.lstpreciodet_item)
              LEFT JOIN sch_clinica.tbl_producto P ON (LPD.lstpreciodet_producto_cod = P.producto_cod) 
       ) AS PRODUCTO ON (DVS.docvntsunat_cod = PRODUCTO.codigo)
       LEFT JOIN
       (
         SELECT
           sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cod AS codigo,
           CASE WHEN sch_clinica.tbl_docvntsunatdet.docvntsunatdet_tpelemento = 1 THEN
           		sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cantidad || ' - ' || sch_clinica.tbl_producto.producto_dsc || ' - '|| sch_clinica.tbl_fpres.fpres_dsc
           ELSE
           		sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cantidad || ' - ' || prod.producto_dsc
           END AS descripcion
           
         FROM
           sch_clinica.tbl_docvntsunatdet
           LEFT OUTER JOIN sch_clinica.tbl_lstpreciofarmadet ON (sch_clinica.tbl_docvntsunatdet.docvntsunatdet_elemento_cod = sch_clinica.tbl_lstpreciofarmadet.lstpreciofarmadet_cod)
                AND (sch_clinica.tbl_docvntsunatdet.docvntsunatdet_elemento_item = sch_clinica.tbl_lstpreciofarmadet.lstpreciofarmadet_item)
           LEFT OUTER JOIN sch_clinica.tbl_lstpreciodet ON (sch_clinica.tbl_docvntsunatdet.docvntsunatdet_elemento_cod = sch_clinica.tbl_lstpreciodet.lstpreciodet_cod)
           		AND (sch_clinica.tbl_docvntsunatdet.docvntsunatdet_elemento_item = sch_clinica.tbl_lstpreciodet.lstpreciodet_item)
           LEFT OUTER JOIN sch_clinica.tbl_prodfarmadet ON (sch_clinica.tbl_lstpreciofarmadet.lstpreciofarmadet_prodfarmadet_cod = sch_clinica.tbl_prodfarmadet.prodfarmadet_prodfarma_cod)
                AND (sch_clinica.tbl_lstpreciofarmadet.lstpreciofarmadet_prodfarmadet_item = sch_clinica.tbl_prodfarmadet.prodfarmadet_item)
           LEFT OUTER JOIN sch_clinica.tbl_prodfarma ON (sch_clinica.tbl_prodfarmadet.prodfarmadet_prodfarma_cod = sch_clinica.tbl_prodfarma.prodfarma_cod)
           LEFT OUTER JOIN sch_clinica.tbl_producto ON (sch_clinica.tbl_prodfarma.prodfarma_producto_cod = sch_clinica.tbl_producto.producto_cod)
           LEFT OUTER JOIN sch_clinica.tbl_producto prod ON (sch_clinica.tbl_lstpreciodet.lstpreciodet_producto_cod = prod.producto_cod)
           LEFT OUTER JOIN sch_clinica.tbl_fpres ON (sch_clinica.tbl_prodfarmadet.prodfarmadet_fpres_cod = sch_clinica.tbl_fpres.fpres_cod)
       ) AS FARMAA ON (DVS.docvntsunat_cod = FARMAA.codigo)

    WHERE 
    	date(DVS.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin#
    GROUP BY
    	DVS.docvntsunat_cod, tppac.tppaciente_dsc
  ) AS SERVICIO ON (sch_clinica.tbl_docvntsunat.docvntsunat_cod = SERVICIO.codigo)
 
 LEFT JOIN (
 SELECT
CONSULTA.cod,
CONSULTA.nombre
FROM(
SELECT
DVS.docvntsunat_cod AS cod,
PER.persona_apep ||' '|| PER.persona_apem ||' '||PER.persona_nmb1 as nombre
FROM
 sch_clinica.tbl_predocvnt PDV
 INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (PDV.predocvnt_cod = DVS.docvntsunat_predocvnt_cod)
 INNER JOIN sch_clinica.tbl_tratamiento_venta TRAV ON (DVS.docvntsunat_cod = TRAV.tratamiento_venta_docvntsunat_cod)
 INNER JOIN sch_clinica.tbl_tratamiento TRA ON (TRAV.tratamiento_venta_cod_tratamiento = TRA.tratamiento_cod)
 INNER JOIN sch_clinica.tbl_tratamiento_sesion TRAS ON (TRAV.tratamiento_venta_cod = TRAS.tratamiento_sesion_tratamiento_venta_cod)
 INNER JOIN sch_clinica.tbl_persona PER ON (TRAS.tratamiento_sesion_pacod = PER.persona_cod)
 INNER JOIN sch_clinica.tbl_tppaciente TPP ON (TRA.tratamiento_tppaciente_cod = TPP.tppaciente_cod)
 INNER JOIN sch_clinica.tbl_segus_det SD ON (TRA.tratamiento_segusdet_cod = SD.segus_det_cod)
 INNER JOIN sch_clinica.tbl_espprofatencion ESP ON (TRA.tratamiento_emcod = ESP.espprofatencion_cod)
WHERE
 date(DVS.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin#
UNION 
SELECT
DVS.docvntsunat_cod AS cod,
PA.persona_apep||' '||PA.persona_apem||' '||PA.persona_nmb1 AS nombre
FROM
 sch_clinica.tbl_docvntsunat DVS
 INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
 INNER JOIN sch_clinica.tbl_hcprocmed_prvnt HCPDV ON (PDV.predocvnt_cod = HCPDV.hcprocmed_prvnt_prvntcod)
 INNER JOIN sch_clinica.tbl_hstconsulta_procmed HCPM ON (HCPDV.hcprocmed_prvnt_pmcod = HCPM.hstconsulta_procmed_cod)
 LEFT JOIN sch_clinica.tbl_espprofatencion ESP ON (HCPM.hstconsulta_procmed_emcod_ejecucion = ESP.espprofatencion_cod) 
 LEFT JOIN sch_clinica.tbl_persona PA ON (HCPM.hstconsulta_procmed_pacod_ejecucion = PA.persona_cod) 
WHERE
 date(DVS.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin#
UNION 
SELECT
 DVS.docvntsunat_cod AS cod,
 PA.persona_apep||' '||PA.persona_apem||' '||PA.persona_nmb1 AS nombre
FROM
 sch_clinica.tbl_predocvnt PDV
 INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (PDV.predocvnt_cod = DVS.docvntsunat_predocvnt_cod)
 INNER JOIN sch_clinica.tbl_ordatenciondet OAD ON (PDV.predocvnt_cod = OAD.ordatenciondet_predocvnt_cod)
 INNER JOIN sch_clinica.tbl_ordatencionamb OAM ON (OAD.ordatenciondet_ordatencion_cod = OAM.ordatencionamb_ordatenciondet_cod)
 AND (OAD.ordatenciondet_item = OAM.ordatencionamb_ordatenciondet_item)
 INNER JOIN sch_clinica.tbl_citamedica CM ON (OAM.ordatencionamb_citamedica_cod = CM.citamedica_cod)
 INNER JOIN sch_clinica.tbl_persona PA ON (CM.citamedica_pacod = PA.persona_cod)
WHERE
 date(DVS.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin#
) AS CONSULTA
 ) AS NOMBREPA ON (sch_clinica.tbl_docvntsunat.docvntsunat_cod = NOMBREPA.cod)
 
 LEFT OUTER JOIN (SELECT DVS.docvntsunat_cod AS codigo,
 tppac.tppaciente_dsc as tp_paciente,
 tpcon.cattpconsulta_dsc as tp_consulta
 FROM
 sch_clinica.tbl_docvntsunat DVS 
 INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
 left join sch_clinica.tbl_ordatenciondet oad on (pdv.predocvnt_cod = oad.ordatenciondet_predocvnt_cod)
 left join sch_clinica.tbl_ordatencion oa on (oad.ordatenciondet_ordatencion_cod = oa.ordatencion_cod)
 left join sch_clinica.tbl_tppaciente tppac on (oa.ordatencion_tpaciente_cod = tppac.tppaciente_cod)
 left join sch_clinica.tbl_cattpconsulta tpcon on (oad.ordatenciondet_tpcons = tpcon.cattpconsulta_cod)
 WHERE date(DVS.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin# and
       pdv.predocvnt_tipo = 0
 ) AS TPPACIENTE ON (sch_clinica.tbl_docvntsunat.docvntsunat_cod = TPPACIENTE.codigo)

 WHERE
 date(sch_clinica.tbl_docvntsunat.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin# AND
 CASE WHEN sch_clinica.tbl_docvntsunat_referencia.docvntsunat_referencia_cod IS NOT NULL THEN
 sch_clinica.tbl_docvntsunat_referencia.docvntsunat_referencia_motivo <> 5
 ELSE 
 true 
 END)
 
 UNION
 
 (SELECT 
 TO_CHAR(DD.docdetraccion_foperacion, 'dd/MM/yyyy') as fecha_doc,--1
 '' as tpdoc_doc,--2
 '' as serie_doc,--3
 DD.docdetraccion_nro_constancia as numero_doc,--4
 
 0 as historia_clinica,--5
 'DETRACCION AL DOC. ' ||
 sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc || '-' ||
 sch_clinica.tbl_docvntsunat.docvntsunat_serie || '-' ||
 sch_clinica.tbl_docvntsunat.docvntsunat_nro as paciente,--6
 ''  AS edad_anio,--7
 '' as sexo,--8
 COALESCE(NOMBREPA.nombre,'') AS nombre,--9
 COALESCE(SERVICIO.servicio,'') AS catalogo,--10

 ROUND(CAST(DD.docdetraccion_monto_total AS NUMERIC),3) as doccaja_ingreso, 
 0 as doccaja_egreso, --11
 
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_totalventa AS NUMERIC),3) AS mtototalventa,
 ROUND(CAST(DD.docdetraccion_monto_total AS NUMERIC),3) as pago_mtodeltotal,
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_totalventa - sch_clinica.tbl_pago.pago_mtodeltotal AS NUMERIC),3) AS monto_descuento,
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_igv AS NUMERIC),3) AS igv,
 
 '' as categoria,
 '' as tp_paciente,
 '' as tp_consulta,
 
  '' as provincia,
    '' as ciudad,
    '' as distrito,
    
 sch_clinica.tbl_doccaja.doccaja_tpmovimiento AS tp_mov,
 '',
 sch_clinica.tbl_docvntsunat.docvntsunat_oa_codigo AS codigo_oa,
 null

FROM
 sch_clinica.tbl_pago
 LEFT OUTER JOIN sch_clinica.tbl_docvntsunat ON (sch_clinica.tbl_pago.pago_docvntsunat_cod = sch_clinica.tbl_docvntsunat.docvntsunat_cod)
 LEFT JOIN sch_clinica.tbl_pago_doc PD ON (sch_clinica.tbl_pago.pago_cod = PD.pago_doc_pagocod)
 INNER JOIN sch_clinica.tbl_docdetraccion DD ON (PD.pago_doc_cod = DD.docdetraccion_pago_cod) 
 INNER JOIN sch_clinica.tbl_doccaja ON (sch_clinica.tbl_pago.pago_doccaja_cod = sch_clinica.tbl_doccaja.doccaja_cod) 
 INNER JOIN sch_clinica.tbl_tpmoneda ON (1 = sch_clinica.tbl_tpmoneda.tpmoneda_cod)
 LEFT OUTER JOIN (SELECT 
 	DVS.docvntsunat_cod AS codigo,
 	CASE WHEN PDV.predocvnt_tipo = 0 THEN TARIFARIO.servicio
       WHEN PDV.predocvnt_tipo = 1 THEN A.area_dsc
       WHEN PDV.predocvnt_tipo = 2 THEN FARMAA.descripcion --'FARMACIA'
       WHEN PDV.predocvnt_tipo = 3 THEN 'QUIROFANO'
       WHEN PDV.predocvnt_tipo = 4 THEN 'VISITA PASTORAL'
       WHEN PDV.predocvnt_tipo = 5 THEN SD.segus_det_dsc
       WHEN PDV.predocvnt_tipo = 6 THEN TARIFARIO.servicio
       WHEN PDV.predocvnt_tipo = 7 THEN PRODUCTO.servicio
       WHEN PDV.predocvnt_tipo = 8 THEN PRODUCTO.servicio
       WHEN PDV.predocvnt_tipo = 9 THEN TARIFARIO.servicio ELSE 'ANULADO' END AS servicio
 FROM
   sch_clinica.tbl_docvntsunat DVS 
   INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
   LEFT JOIN sch_clinica.tbl_rmsegus_prvnt RMSPV ON (PDV.predocvnt_cod = RMSPV.rmsegus_prvnt_prvntcod)
   LEFT JOIN sch_clinica.tbl_recetamedsegus RMS ON (RMSPV.rmsegus_prvnt_rscod = RMS.recetamedsegus_cod)
   LEFT JOIN sch_clinica.tbl_recetamed RM ON (RMS.recetamedsegus_rmcod = RM.recetamed_cod)
   LEFT JOIN sch_clinica.tbl_servicio_ejecucion SE ON (DVS.docvntsunat_cod = SE.servicio_ejecucion_docvntsunatdet_cod)
   LEFT JOIN sch_clinica.tbl_area A ON (SE.servicio_ejecucion_area_cod = A.area_cod)
   LEFT JOIN sch_clinica.tbl_hcprocmed_prvnt HCPDV ON (PDV.predocvnt_cod = HCPDV.hcprocmed_prvnt_prvntcod)
   LEFT JOIN sch_clinica.tbl_hstconsulta_procmed PMED ON (HCPDV.hcprocmed_prvnt_pmcod = PMED.hstconsulta_procmed_cod)
   LEFT JOIN sch_clinica.tbl_segus_det SD ON (PMED.hstconsulta_procmed_detsegus_cod = SD.segus_det_cod)
   LEFT JOIN (SELECT DVST.docvntsunat_cod AS codigo, TD.tarifariodet_dsc AS servicio
   FROM sch_clinica.tbl_docvntsunat DVST 
   INNER JOIN sch_clinica.tbl_predocvnt PDVT ON (DVST.docvntsunat_predocvnt_cod = PDVT.predocvnt_cod)
   LEFT JOIN sch_clinica.tbl_docvntsunatdet DVSD ON (DVST.docvntsunat_cod = DVSD.docvntsunatdet_cod)
   LEFT JOIN sch_clinica.tbl_tarifariodet TD ON (DVSD.docvntsunatdet_elemento_cod = TD.tarifariodet_cod)
   AND (DVSD.docvntsunatdet_elemento_item = TD.tarifariodet_item)
   ) AS TARIFARIO ON (DVS.docvntsunat_cod = TARIFARIO.codigo) 
   LEFT JOIN (SELECT DVSP.docvntsunat_cod AS codigo, P.producto_dsc AS servicio
   FROM sch_clinica.tbl_docvntsunat DVSP 
   INNER JOIN sch_clinica.tbl_predocvnt PDVP ON (DVSP.docvntsunat_predocvnt_cod = PDVP.predocvnt_cod)
   INNER JOIN sch_clinica.tbl_docvntsunatdet DVSDP ON (DVSP.docvntsunat_cod = DVSDP.docvntsunatdet_cod)
   LEFT JOIN sch_clinica.tbl_lstpreciodet LPD ON (DVSDP.docvntsunatdet_elemento_cod = LPD.lstpreciodet_cod)
   AND (DVSDP.docvntsunatdet_elemento_item = LPD.lstpreciodet_item)
   LEFT JOIN sch_clinica.tbl_producto P ON (LPD.lstpreciodet_producto_cod = P.producto_cod) ) AS PRODUCTO ON (DVS.docvntsunat_cod = PRODUCTO.codigo)
   LEFT JOIN
       (
         SELECT
           sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cod AS codigo,
           CASE WHEN sch_clinica.tbl_docvntsunatdet.docvntsunatdet_tpelemento = 1 THEN
           		sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cantidad || ' - ' || sch_clinica.tbl_producto.producto_dsc || ' - '|| sch_clinica.tbl_fpres.fpres_dsc
           ELSE
           		sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cantidad || ' - ' || prod.producto_dsc
           END AS descripcion
           
         FROM
           sch_clinica.tbl_docvntsunatdet
           LEFT OUTER JOIN sch_clinica.tbl_lstpreciofarmadet ON (sch_clinica.tbl_docvntsunatdet.docvntsunatdet_elemento_cod = sch_clinica.tbl_lstpreciofarmadet.lstpreciofarmadet_cod)
                AND (sch_clinica.tbl_docvntsunatdet.docvntsunatdet_elemento_item = sch_clinica.tbl_lstpreciofarmadet.lstpreciofarmadet_item)
           LEFT OUTER JOIN sch_clinica.tbl_lstpreciodet ON (sch_clinica.tbl_docvntsunatdet.docvntsunatdet_elemento_cod = sch_clinica.tbl_lstpreciodet.lstpreciodet_cod)
           		AND (sch_clinica.tbl_docvntsunatdet.docvntsunatdet_elemento_item = sch_clinica.tbl_lstpreciodet.lstpreciodet_item)
           LEFT OUTER JOIN sch_clinica.tbl_prodfarmadet ON (sch_clinica.tbl_lstpreciofarmadet.lstpreciofarmadet_prodfarmadet_cod = sch_clinica.tbl_prodfarmadet.prodfarmadet_prodfarma_cod)
                AND (sch_clinica.tbl_lstpreciofarmadet.lstpreciofarmadet_prodfarmadet_item = sch_clinica.tbl_prodfarmadet.prodfarmadet_item)
           LEFT OUTER JOIN sch_clinica.tbl_prodfarma ON (sch_clinica.tbl_prodfarmadet.prodfarmadet_prodfarma_cod = sch_clinica.tbl_prodfarma.prodfarma_cod)
           LEFT OUTER JOIN sch_clinica.tbl_producto ON (sch_clinica.tbl_prodfarma.prodfarma_producto_cod = sch_clinica.tbl_producto.producto_cod)
           LEFT OUTER JOIN sch_clinica.tbl_producto prod ON (sch_clinica.tbl_lstpreciodet.lstpreciodet_producto_cod = prod.producto_cod)
           LEFT OUTER JOIN sch_clinica.tbl_fpres ON (sch_clinica.tbl_prodfarmadet.prodfarmadet_fpres_cod = sch_clinica.tbl_fpres.fpres_cod)
       ) AS FARMAA ON (DVS.docvntsunat_cod = FARMAA.codigo)
 WHERE date(DVS.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin# ) AS SERVICIO ON (sch_clinica.tbl_docvntsunat.docvntsunat_cod = SERVICIO.codigo)
  LEFT JOIN (
 SELECT
CONSULTA.cod,
CONSULTA.nombre
FROM(
SELECT
DVS.docvntsunat_cod AS cod,
PER.persona_apep ||' '|| PER.persona_apem ||' '||PER.persona_nmb1 as nombre
FROM
 sch_clinica.tbl_predocvnt PDV
 INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (PDV.predocvnt_cod = DVS.docvntsunat_predocvnt_cod)
 INNER JOIN sch_clinica.tbl_tratamiento_venta TRAV ON (DVS.docvntsunat_cod = TRAV.tratamiento_venta_docvntsunat_cod)
 INNER JOIN sch_clinica.tbl_tratamiento TRA ON (TRAV.tratamiento_venta_cod_tratamiento = TRA.tratamiento_cod)
 INNER JOIN sch_clinica.tbl_tratamiento_sesion TRAS ON (TRAV.tratamiento_venta_cod = TRAS.tratamiento_sesion_tratamiento_venta_cod)
 INNER JOIN sch_clinica.tbl_persona PER ON (TRAS.tratamiento_sesion_pacod = PER.persona_cod)
 INNER JOIN sch_clinica.tbl_tppaciente TPP ON (TRA.tratamiento_tppaciente_cod = TPP.tppaciente_cod)
 INNER JOIN sch_clinica.tbl_segus_det SD ON (TRA.tratamiento_segusdet_cod = SD.segus_det_cod)
 INNER JOIN sch_clinica.tbl_espprofatencion ESP ON (TRA.tratamiento_emcod = ESP.espprofatencion_cod)
WHERE
date(DVS.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin#
UNION 
SELECT
DVS.docvntsunat_cod AS cod,
PA.persona_apep||' '||PA.persona_apem||' '||PA.persona_nmb1 AS nombre
FROM
 sch_clinica.tbl_docvntsunat DVS
 INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
 INNER JOIN sch_clinica.tbl_hcprocmed_prvnt HCPDV ON (PDV.predocvnt_cod = HCPDV.hcprocmed_prvnt_prvntcod)
 INNER JOIN sch_clinica.tbl_hstconsulta_procmed HCPM ON (HCPDV.hcprocmed_prvnt_pmcod = HCPM.hstconsulta_procmed_cod)
 LEFT JOIN sch_clinica.tbl_espprofatencion ESP ON (HCPM.hstconsulta_procmed_emcod_ejecucion = ESP.espprofatencion_cod) 
 LEFT JOIN sch_clinica.tbl_persona PA ON (HCPM.hstconsulta_procmed_pacod_ejecucion = PA.persona_cod) 
WHERE
date(DVS.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin#
UNION 
SELECT
 DVS.docvntsunat_cod AS cod,
 PA.persona_apep||' '||PA.persona_apem||' '||PA.persona_nmb1 AS nombre
FROM
 sch_clinica.tbl_predocvnt PDV
 INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (PDV.predocvnt_cod = DVS.docvntsunat_predocvnt_cod)
 INNER JOIN sch_clinica.tbl_ordatenciondet OAD ON (PDV.predocvnt_cod = OAD.ordatenciondet_predocvnt_cod)
 INNER JOIN sch_clinica.tbl_ordatencionamb OAM ON (OAD.ordatenciondet_ordatencion_cod = OAM.ordatencionamb_ordatenciondet_cod)
 AND (OAD.ordatenciondet_item = OAM.ordatencionamb_ordatenciondet_item)
 INNER JOIN sch_clinica.tbl_citamedica CM ON (OAM.ordatencionamb_citamedica_cod = CM.citamedica_cod)
 INNER JOIN sch_clinica.tbl_persona PA ON (CM.citamedica_pacod = PA.persona_cod)
WHERE
 date(DVS.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin#
) AS CONSULTA
 ) AS NOMBREPA ON (sch_clinica.tbl_docvntsunat.docvntsunat_cod = NOMBREPA.cod)
WHERE
 date(sch_clinica.tbl_docvntsunat.docvntsunat_femision) BETWEEN #v_finicio# AND #v_ffin#
)) AS CONSULTA
ORDER BY
 CONSULTA.tp_mov, CONSULTA.fecha_doc
 --, CONSULTA.num_doc 
 ASC