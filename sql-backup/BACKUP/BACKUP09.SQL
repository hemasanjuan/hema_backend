select
--to_char(dvs.docvntsunat_femision, 'dd/MM/yyyy'),
--dvs.docvntsunat_tpdoc,
--dvs.docvntsunat_serie,
--dvs.docvntsunat_nro,
NOMBREPA.nombre,
NOMBREPA.especialidad,
nombrepa.tipopac,
nombrepa.aseguradora,
count(nombrepa.cliente)

from
	sch_clinica.tbl_docvntsunat dvs
    inner join sch_clinica.tbl_docvntsunatdet dvsd on (dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod)
    inner join sch_clinica.tbl_espprofatencion em on (dvsd.docvntsunatdet_elemento_item = em.espprofatencion_cod
    	and dvsd.docvntsunatdet_tpelemento = 0
        and dvsd.docvntsunatdet_elemento_cod = 2)
    LEFT JOIN (
 SELECT
CONSULTA.cod,
CONSULTA.nombre,
CONSULTA.especialidad,
CONSULTA.tipopac,
CONSULTA.aseguradora,
CONSULTA.cliente
FROM(
SELECT
DVS2.docvntsunat_cod AS cod,
PER.persona_apep ||' '|| PER.persona_apem ||' '||PER.persona_nmb1 as nombre,
ESP.espprofatencion_dsc as especialidad,
tpp.tppaciente_dsc as tipopac,
EP.empresa_rznsocial as aseguradora,
DVS2.docvntsunat_cliente_cod as cliente
FROM
 sch_clinica.tbl_predocvnt PDV
 INNER JOIN sch_clinica.tbl_docvntsunat DVS2 ON (PDV.predocvnt_cod = DVS2.docvntsunat_predocvnt_cod)
 INNER JOIN sch_clinica.tbl_tratamiento_venta TRAV ON (DVS2.docvntsunat_cod = TRAV.tratamiento_venta_docvntsunat_cod)
 INNER JOIN sch_clinica.tbl_tratamiento TRA ON (TRAV.tratamiento_venta_cod_tratamiento = TRA.tratamiento_cod)
 INNER JOIN sch_clinica.tbl_tratamiento_sesion TRAS ON (TRAV.tratamiento_venta_cod = TRAS.tratamiento_sesion_tratamiento_venta_cod)
 INNER JOIN sch_clinica.tbl_persona PER ON (TRAS.tratamiento_sesion_pacod = PER.persona_cod)
 INNER JOIN sch_clinica.tbl_tppaciente TPP ON (TRA.tratamiento_tppaciente_cod = TPP.tppaciente_cod)
 INNER JOIN sch_clinica.tbl_segus_det SD ON (TRA.tratamiento_segusdet_cod = SD.segus_det_cod)
 INNER JOIN sch_clinica.tbl_espprofatencion ESP ON (TRA.tratamiento_emcod = ESP.espprofatencion_cod)
 inner join sch_clinica.tbl_ordatencion OA on (dvs2.docvntsunat_oa_codigo = OA.ordatencion_cod)
 inner join sch_clinica.tbl_empresa EP ON(oa.ordatencion_negprc_emp_aseg_ecod = EP.empresa_cod)
WHERE
 date(DVS2.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin 
UNION
SELECT
DVS2.docvntsunat_cod AS cod,
PA.persona_apep||' '||PA.persona_apem||' '||PA.persona_nmb1 AS nombre,
ESP.espprofatencion_dsc as especialidad,
tpp.tppaciente_dsc as tipopac,
EP.empresa_rznsocial as aseguradora,
DVS2.docvntsunat_cliente_cod as cliente
FROM
 sch_clinica.tbl_docvntsunat DVS2
 INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS2.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
 INNER JOIN sch_clinica.tbl_hcprocmed_prvnt HCPDV ON (PDV.predocvnt_cod = HCPDV.hcprocmed_prvnt_prvntcod)
 INNER JOIN sch_clinica.tbl_hstconsulta_procmed HCPM ON (HCPDV.hcprocmed_prvnt_pmcod = HCPM.hstconsulta_procmed_cod)
 LEFT JOIN sch_clinica.tbl_espprofatencion ESP ON (HCPM.hstconsulta_procmed_emcod_ejecucion = ESP.espprofatencion_cod)
 LEFT JOIN sch_clinica.tbl_persona PA ON (HCPM.hstconsulta_procmed_pacod_ejecucion = PA.persona_cod)
 left join sch_clinica.tbl_ordatencion OA on (dvs2.docvntsunat_oa_codigo = OA.ordatencion_cod)
 left JOIN sch_clinica.tbl_tppaciente TPP ON (oa.ordatencion_tpaciente_cod = TPP.tppaciente_cod)
 left join sch_clinica.tbl_empresa EP ON(oa.ordatencion_negprc_emp_aseg_ecod = EP.empresa_cod)
WHERE
 date(DVS2.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin and DVS2.docvntsunat_tpref !=1 
UNION
SELECT
 DVS2.docvntsunat_cod AS cod,
 PA.persona_apep||' '||PA.persona_apem||' '||PA.persona_nmb1 AS nombre,
 ESP.espprofatencion_dsc as especialidad,
 tpp.tppaciente_dsc as tipopac,
 EP.empresa_rznsocial as aseguradora,
 DVS2.docvntsunat_cliente_cod as cliente
FROM
 sch_clinica.tbl_predocvnt PDV
 INNER JOIN sch_clinica.tbl_docvntsunat DVS2 ON (PDV.predocvnt_cod = DVS2.docvntsunat_predocvnt_cod)
 INNER JOIN sch_clinica.tbl_ordatenciondet OAD ON (PDV.predocvnt_cod = OAD.ordatenciondet_predocvnt_cod)
 INNER JOIN sch_clinica.tbl_ordatencionamb OAM ON (OAD.ordatenciondet_ordatencion_cod = OAM.ordatencionamb_ordatenciondet_cod)
 AND (OAD.ordatenciondet_item = OAM.ordatencionamb_ordatenciondet_item)
 INNER JOIN sch_clinica.tbl_citamedica CM ON (OAM.ordatencionamb_citamedica_cod = CM.citamedica_cod)
 INNER JOIN sch_clinica.tbl_persona PA ON (CM.citamedica_pacod = PA.persona_cod)
 INNER JOIN sch_clinica.tbl_espprofatencion ESP ON (CM.citamedica_emcod = ESP.espprofatencion_cod)
 left join sch_clinica.tbl_ordatencion OA on (dvs2.docvntsunat_oa_codigo = OA.ordatencion_cod)
 left JOIN sch_clinica.tbl_tppaciente TPP ON (oa.ordatencion_tpaciente_cod = TPP.tppaciente_cod)
 left join sch_clinica.tbl_empresa EP ON(oa.ordatencion_negprc_emp_aseg_ecod = EP.empresa_cod)
WHERE
 date(DVS2.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin and DVS2.docvntsunat_tpref !=1  
) AS CONSULTA
 ) AS NOMBREPA ON (dvs.docvntsunat_cod = NOMBREPA.cod)

where
	date(dvs.docvntsunat_femision) BETWEEN :v_finicio AND :v_ffin and DVS.docvntsunat_tpref !=1
group by
NOMBREPA.nombre,
NOMBREPA.especialidad,
nombrepa.tipopac,
nombrepa.aseguradora


----------------------------------------------------------------------------
 SELECT np.negociacionprecio_cod AS negociacion_cod,
         np.negociacionprecio_dsc AS negociacion_dsc,
         td.tarifariodet_cod AS td_cod,
         td.tarifariodet_item AS td_item,
         s.segus_codsegus AS segus_cod,
         s.segus_cod AS segus_orden,
         td.tarifariodet_dsc AS segus_dsc,
         td.tarifariodet_prc AS precio,
         td.tarifariodet_uni AS unidades,
         a.area_dsc,
         CASE
           WHEN npd.negociacionpreciodet_tpmov = 0 OR
            npd.negociacionpreciodet_tcod = 2 THEN 'PRECIO' ::text
           WHEN COALESCE(npd.negociacionpreciodet_tpmov::integer, 1) = 1 THEN
            'FACTOR' ::text
           ELSE NULL::text
         END AS valor,
         round(CASE
                 WHEN npd.negociacionpreciodet_tpmov = 0 OR
                  npd.negociacionpreciodet_tcod = 2 THEN td.tarifariodet_prc *(
                  1::double precision - COALESCE(npd.negociacionpreciodet_dscto,
                   np.negociacionprecio_descuento) / 100::double precision)
                 WHEN COALESCE(npd.negociacionpreciodet_tpmov::integer, 1) = 1
                  THEN fc.factor_valor *(1::double precision - COALESCE(
                  npd.negociacionpreciodet_dscto, np.negociacionprecio_descuento
                  ) / 100::double precision)
                 ELSE NULL::double precision END::numeric, 2) AS nuevo_valor,
         round(CASE
                 WHEN npd.negociacionpreciodet_tpmov = 0 OR
                  npd.negociacionpreciodet_tcod = 2 THEN td.tarifariodet_prc *(
                  1::double precision - COALESCE(npd.negociacionpreciodet_dscto,
                   np.negociacionprecio_descuento) / 100::double precision)
                 WHEN COALESCE(npd.negociacionpreciodet_tpmov::integer, 1) = 1
                  THEN fc.factor_valor *(1::double precision - COALESCE(
                  npd.negociacionpreciodet_dscto, np.negociacionprecio_descuento
                  ) / 100::double precision) * td.tarifariodet_uni
                 ELSE NULL::double precision END::numeric, 2) AS precio_final,
         CASE
           WHEN s.segus_genera_prehonorario = 1 THEN 'SI' ::text
           ELSE 'NO' ::text
         END AS genera_prehonorario,
         CASE
           WHEN s.segus_intquirurgica = 1 THEN 'SI' ::text
           ELSE 'NO' ::text
         END AS intervencion_quirurgica
  FROM sch_clinica.tbl_negociacionprecio np
       LEFT JOIN sch_clinica.tbl_factor fc ON np.negociacionprecio_factor_cod =
        fc.factor_cod
       JOIN sch_clinica.tbl_negociacionprecio_tarifario npt ON
        np.negociacionprecio_cod = npt.negociacionprecio_tarifario_ncod AND
         npt.negociacionprecio_tarifario_lstprecio_cod IS NULL
       LEFT JOIN sch_clinica.tbl_tarifariodet td ON
        npt.negociacionprecio_tarifario_tcod = td.tarifariodet_cod
       LEFT JOIN sch_clinica.tbl_segus s ON td.tarifariodet_cod =
        s.segus_tarifariodet_cod AND td.tarifariodet_item =
         s.segus_tarifariodet_item
       LEFT JOIN sch_clinica.tbl_area a ON s.segus_area_cod = a.area_cod
       LEFT JOIN sch_clinica.tbl_negociacionpreciodet npd ON
        np.negociacionprecio_cod = npd.negociacionpreciodet_ncod AND
         td.tarifariodet_cod = npd.negociacionpreciodet_tcod AND
          td.tarifariodet_item = npd.negociacionpreciodet_tditem
  WHERE np.negociacionprecio_estado = 1 AND
        CASE
          WHEN td.tarifariodet_cod = 1 THEN (td.tarifariodet_item < 4 OR
        td.tarifariodet_item > 16) AND
        td.tarifariodet_item <> 38
          ELSE true
        END;
        
        
        
        

select
persona_cod, persona_nmb1, persona_nmb2, persona_apep, persona_apem, persona_nrodoc, persona_sexo,
persona_dir, persona_tel, persona_cel, persona_mail, persona_fcreacion,
persona_usrcreacion, persona_ocupacion_cod, persona_ordenhospitalaria,
persona_observaciontesoreria, persona_observacionatencionalcliente, persona_fregistro, persona_referencia, persona_seguro,
persona_firma, personal_fingreso, personal_estado,
ta.area_dsc area, tp3.puesto_dsc puesto
from sch_clinica.tbl_persona tp 
inner join sch_clinica.tbl_personal tp2 on tp.persona_cod = tp2.personal_cod 
inner join sch_clinica.tbl_area ta on ta.area_cod = tp2.personal_area_cod 
inner join sch_clinica.tbl_puesto tp3 on tp3.puesto_cod =tp2.personal_puesto_cod  
order by tp.persona_fcreacion desc 



select
persona_cod, persona_nmb1, persona_nmb2, persona_apep, persona_apem, persona_nrodoc,
personal_fingreso, personal_estado,area_dsc area, tp3.puesto_dsc puesto
from sch_clinica.tbl_persona tp 
left join sch_clinica.tbl_personal tp2 on tp.persona_cod = tp2.personal_cod 
left join sch_clinica.tbl_area ta on ta.area_cod = tp2.personal_area_cod 
left join sch_clinica.tbl_puesto tp3 on tp3.puesto_cod =tp2.personal_puesto_cod
order by tp.persona_fcreacion desc 



select
producto_cod, producto_dsc, producto_unidad_cod, producto_fpres_cod, producto_porcion_unidad, producto_estado, producto_unimin_venta, producto_fabricante_cod, producto_stockmin, producto_kairo_cod, producto_ffar_cod, producto_precio_venta_comercial, producto_famprod_cod, producto_subfamprod_cod, producto_identificador, producto_cuenta_contable, producto_facturable, producto_tpactprecio, producto_revper, producto_caracteristica, producto_elemento_cod, producto_ean13, tmp_categorizacion, producto_susalud, producto_horacle, producto_coracle, producto_fregistro, producto_ipregistro, producto_usrregistro, producto_petitorio, producto_unspsc_codigo
from sch_clinica.tbl_producto tp 
inner join sch_clinica.tbl_unidad tu on tu.unidad_cod = tp.producto_unidad_cod 
where
producto_ctgproducto_cod = 1 --  1 = medicamento





select
producto_cod, producto_dsc, tc.ctgproducto_dsc "cat_producto", tu.unidad_dsc unidad, fpres_dsc fpres, tpu.porcion_unidad_valor , producto_estado, 
tf2.fabr_dsc fabricante, producto_stockmin, producto_kairo_cod, tf3.ffar_dsc formula_far, producto_precio_venta_comercial, 
tpf.producto_familia_desc , tpf2.producto_familiasub_desc , producto_identificador, producto_cuenta_contable, 
producto_caracteristica, tpe.producto_elemento_descripcion, producto_susalud, producto_horacle, producto_coracle
from sch_clinica.tbl_producto tp 
inner join sch_clinica.tbl_ctgproducto tc on tc.ctgproducto_cod = tp.producto_ctgproducto_cod 
left join sch_clinica.tbl_unidad tu on tu.unidad_cod = tp.producto_unidad_cod 
left join sch_clinica.tbl_fpres tf on tf.fpres_cod = tp.producto_fpres_cod 
left join sch_clinica.tbl_porcion_unidad tpu on tpu.porcion_unidad_cod = tp.producto_porcion_unidad
left join sch_clinica.tbl_fabr tf2 on tf2.fabr_cod = tp.producto_fabricante_cod 
left join sch_clinica.tbl_ffar tf3 on tf3.ffar_cod = tp.producto_ffar_cod 
left join sch_clinica.tbl_producto_familia tpf on tpf.producto_familia_cod = tp.producto_famprod_cod
left join sch_clinica.tbl_producto_familiasub tpf2 on tpf2.producto_familiasub_cod = tp.producto_subfamprod_cod
left join sch_clinica.tbl_producto_elemento tpe on tpe.producto_elemento_cod =tp.producto_elemento_cod 
order by producto_cod asc