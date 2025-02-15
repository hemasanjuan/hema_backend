
SELECT
	to_char(dvs.docvntsunat_femision, 'dd/MM/yyyy') as FECHA,
    per.persona_nrodoc as DNI,
    per.persona_nmb1 || ' '  || per.persona_nmb2 || ' '  || PER.persona_apep || ' ' || per.persona_apem as PACIENTE,
     (SELECT ANIO FROM 
     sch_clinica.sp_util_diferencia_fecha(per.persona_fecnac, DATE(dvs.docvntsunat_femision) - 1)
     AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
    per.persona_sexo as SEXO, 
    CASE WHEN tpp.tppaciente_dsc is Null THEN 'EVENTUAL' ELSE tpp.tppaciente_dsc END AS "TIPO PACIENTE",
    CASE WHEN np.negociacionprecio_dsc is Null THEN 'PARTICULAR' ELSE np.negociacionprecio_dsc END AS "DESCRIPCION PACIENTE",
    sd.segus_det_dsc as "SERVICIO",
    --case when tpp.tppaciente_cod = 1 then
    --ROUND(CAST(dvsd.docvntsunatdet_totneto * (1 + dvs.docvntsunat_igv) AS NUMERIC), 2)
    --else
	--ROUND(CAST((dvsd.docvntsunatdet_preciouniventa * dvsd.docvntsunatdet_cantidad) * (1 + dvs.docvntsunat_igv) AS NUMERIC), 2)
    --end as monto_total_servicio,
    ROUND(CAST(dvsd.docvntsunatdet_totneto * (1 + dvs.docvntsunat_igv) AS NUMERIC), 2)/1.18 as monto_cobrado,
    dvsd.docvntsunatdet_cantidad,
   	dvs.docvntsunat_oa_codigo as oa_codigo
FROM
	sch_clinica.tbl_docvntsunat dvs
    INNER JOIN 	sch_clinica.tbl_docvntsunatdet dvsd ON (dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod)
    INNER JOIN sch_clinica.tbl_segus_det sd ON (dvsd.docvntsunatdet_elemento_cod = sd.segus_det_tdcod
    									AND dvsd.docvntsunatdet_elemento_item = sd.segus_det_tditem
                                        AND dvsd.docvntsunatdet_tpelemento = 0)
    INNER JOIN sch_clinica.tbl_segus s ON (sd.segus_det_tdcod = s.segus_tarifariodet_cod
    									AND sd.segus_det_tditem = s.segus_tarifariodet_item)
    LEFT JOIN sch_clinica.tbl_ordatencion oa ON (dvs.docvntsunat_oa_codigo = oa.ordatencion_cod)
    LEFT JOIN sch_clinica.tbl_tppaciente tpp ON (oa.ordatencion_tpaciente_cod = tpp.tppaciente_cod)
    INNER JOIN sch_clinica.tbl_persona per ON dvs.docvntsunat_cliente_cod = per.persona_cod
    LEFT JOIN sch_clinica.tbl_negociacionprecio np ON (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)

WHERE
	--(s.segus_area_cod=131 OR s.segus_area_cod=132 OR s.segus_area_cod=69 OR s.segus_area_cod=58 OR
    --s.segus_area_cod=57 OR s.segus_area_cod=60 ) AND
    --AND oa.ordatencion_estado != 1
    dvs.docvntsunat_anulado = 0
    AND dvs.docvntsunat_tpref = 0
    AND date(dvs.docvntsunat_femision) BETWEEN :finicio AND :ffin
    
    --49 laboratook
    --31 rx ok
    --51 ecogra ok
    --131 optica
    --69 topico
    --58 DENSI
    --132 DOCS
    --57 RESONAN
    --60 electroence