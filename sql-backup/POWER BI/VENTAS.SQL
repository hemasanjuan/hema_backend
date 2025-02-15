SELECT * FROM ( 
 (SELECT 
 coalesce(CASE 
 WHEN (sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 0 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc != 7)
 OR (sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 AND sch_clinica.tbl_docvntsunat.docvntsunat_tpdoc = 7) THEN
 to_char(sch_clinica.tbl_docvntsunat.docvntsunat_femision, 'dd/MM/yyyy')
 WHEN sch_clinica.tbl_doccaja.doccaja_tpmovimiento = 1 THEN
 to_char(sch_clinica.tbl_docvntanulado.docvntanulado_femision, 'dd/MM/yyyy') 
 END,'') as fecha_doc,--1
 
 
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_totalventa AS NUMERIC),3) AS mtototalventa,
 ROUND(CAST(sch_clinica.tbl_pago.pago_mtodeltotal AS NUMERIC),3) as pago_mtodeltotal,--11
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_totalventa - sch_clinica.tbl_pago.pago_mtodeltotal AS NUMERIC),3) AS monto_descuento,
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_igv AS NUMERIC),3) AS igv


 
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
    	date(DVS.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin and DVS.docvntsunat_cliente_cod = '98690'
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
 date(DVS.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin 
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
 date(DVS.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin 
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
 date(DVS.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin
) AS CONSULTA
 ) AS NOMBREPA ON (sch_clinica.tbl_docvntsunat.docvntsunat_cod = NOMBREPA.cod)
 
 LEFT OUTER JOIN (SELECT DVS.docvntsunat_cod AS codigo,
 tppac.tppaciente_dsc as tp_paciente,
 tpcon.cattpconsulta_dsc as tp_consulta,
 NP.negociacionprecio_dsc as np_negociacion
 FROM
 sch_clinica.tbl_docvntsunat DVS 
 INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
 left join sch_clinica.tbl_ordatenciondet oad on (pdv.predocvnt_cod = oad.ordatenciondet_predocvnt_cod)
 left join sch_clinica.tbl_ordatencion oa on (oad.ordatenciondet_ordatencion_cod = oa.ordatencion_cod)
 left join sch_clinica.tbl_tppaciente tppac on (oa.ordatencion_tpaciente_cod = tppac.tppaciente_cod)
 left JOIN sch_clinica.tbl_negociacionprecio NP ON (NP.negociacionprecio_cod = oa.ordatencion_negprc_emp_aseg_ncod)
 left join sch_clinica.tbl_cattpconsulta tpcon on (oad.ordatenciondet_tpcons = tpcon.cattpconsulta_cod)
 WHERE date(DVS.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin and
       pdv.predocvnt_tipo = 0
 ) AS TPPACIENTE ON (sch_clinica.tbl_docvntsunat.docvntsunat_cod = TPPACIENTE.codigo)

 WHERE
 date(sch_clinica.tbl_docvntsunat.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin AND
 CASE WHEN sch_clinica.tbl_docvntsunat_referencia.docvntsunat_referencia_cod IS NOT NULL THEN
 sch_clinica.tbl_docvntsunat_referencia.docvntsunat_referencia_motivo <> 5
 ELSE 
 true 
 END)
 
 UNION
 
 (SELECT 
 TO_CHAR(DD.docdetraccion_foperacion, 'dd/MM/yyyy') as fecha_doc,--1
 
 
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_totalventa AS NUMERIC),3) AS mtototalventa,
 ROUND(CAST(DD.docdetraccion_monto_total AS NUMERIC),3) as pago_mtodeltotal,
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_totalventa - sch_clinica.tbl_pago.pago_mtodeltotal AS NUMERIC),3) AS monto_descuento,
 ROUND(CAST(sch_clinica.tbl_docvntsunat.docvntsunat_igv AS NUMERIC),3) AS igv

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
 WHERE date(DVS.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin ) AS SERVICIO ON (sch_clinica.tbl_docvntsunat.docvntsunat_cod = SERVICIO.codigo)
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
date(DVS.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin
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
date(DVS.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin
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
 date(DVS.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin
) AS CONSULTA
 ) AS NOMBREPA ON (sch_clinica.tbl_docvntsunat.docvntsunat_cod = NOMBREPA.cod)
WHERE
 date(sch_clinica.tbl_docvntsunat.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin
)) AS CONSULTA
ORDER BY
 CONSULTA.fecha_doc
 ASC