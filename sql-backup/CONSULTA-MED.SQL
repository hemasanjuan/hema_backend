select
to_char(dvs.docvntsunat_femision, 'dd/MM/yyyy'),
dvs.docvntsunat_tpdoc,
dvs.docvntsunat_serie,
dvs.docvntsunat_nro,
NOMBREPA.nombre,
NOMBREPA.especialidad,
nombrepa.tipopac,
nombrepa.aseguradora,
nombrepa.cliente

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