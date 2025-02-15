select
    cons."FECHA ATENCION",
    cons."DNI PACIENTE",
    cons."PACIENTE",
    cons."EDAD",
    cons."SEXO",
    cons."TIPO DE PACIENTE",
    cons."DESCRIPCION TIPO PACIENTE",
    COALESCE(cons."MODALIDAD", cons."SERVICIO") AS "SERVICIO",
    cons."ESPECIALIDAD",
    cons."MEDICO",
    sum(case when cons."VALOR VENTA" <> 0 THEN cons."VALOR VENTA" else cons.precio_negociado end) as "VALOR VENTA",
    cons."CANT",
    cons."OA",
    '' AS "PROCEDIMIENTO",
    '' AS "AREA",
    '' AS "TIPO SERVICIO",
    CONS.provincia_dsc AS "PROVINCIA",
    CONS.ciudad_dsc AS "CIUDAD",
    CONS.distrito_dsc AS "DISTRITO",
    CONS.condicion_establecimiento AS "CONDICION ESTABLECIMIENTO",
    CONS.condicion_servicio AS "CONDICION SERVICIO",
    
    CASE WHEN cons."EDAD" >= 0 AND cons."EDAD" <= 11 THEN 'NIÑO DE 0 -11 AÑOS'
    WHEN cons."EDAD" >= 12 AND cons."EDAD" <= 17 THEN 'ADOLESCENTES 12-17 AÑOS'
    WHEN cons."EDAD" >= 18 AND cons."EDAD" <= 29 THEN 'JOVEN 18 -29 AÑOS'
    WHEN cons."EDAD" >=30 AND cons."EDAD" <= 59 THEN 'ADULTO 30-59 AÑOS'
    WHEN cons."EDAD" >= 60 THEN 'ADULTO MAYOR 60 +'
    ELSE '' 
    END AS "GRUPO ETARIO",
    CONS."CIE10",
    CONS."TP. FINANCIADOR",
    CONS.ruc AS "RUC",
    CONS.empresa AS "Empresa",
    CONS.telefono AS "Telefono",
    CONS.celular AS "Celular",
    CONS.mail AS "Mail"
from
(
SELECT DISTINCT
  sch_clinica.sp_mes_letras(date(cm.citamedica_fhcita))	as "MES",
  to_char( CM.citamedica_fhcita, 'dd/MM/yyyy') as "FECHA ATENCION",
  pper.persona_nrodoc as "DNI PACIENTE",
  COALESCE(PPER.persona_apep, '') || ' ' || COALESCE(PPER.persona_apem, '')
  || ', ' || COALESCE(PPER.persona_nmb1, '') || ', ' || COALESCE(PPER.persona_nmb2, '') as "PACIENTE",
   (SELECT ANIO FROM 
     sch_clinica.sp_util_diferencia_fecha(PPER.persona_fecnac, DATE(CM.citamedica_fhcita) - 1)
     AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
  PPER.persona_sexo as "SEXO",
  TPAC.tppaciente_dsc as "TIPO DE PACIENTE",
  NP.negociacionprecio_dsc as "DESCRIPCION TIPO PACIENTE",
  'CONSULTA AMBULATORIA' as "SERVICIO",
  ESP.espprofatencion_dsc as "ESPECIALIDAD",
  COALESCE(PMED.persona_apep, '') || ' ' || COALESCE(PMED.persona_apem, '')
  || ' ' || COALESCE(PMED.persona_nmb1, '') || ' ' || COALESCE(PMED.persona_nmb2, '') as "MEDICO",  
  CASE WHEN OA.ordatencion_negprc_emp_aseg_ncod = 117 AND oasd.ordatencionasegdet_coaseguro = 100 AND oasd.ordatencionasegdet_deducible = 0 THEN 0 ELSE
  ROUND(CAST(case when (PdV.predocvntdet_preciouniventa - PDV.predocvntdet_preciounineto) <= 0 then pdv.predocvntdet_preciounineto else pdv.predocvntdet_preciouniventa end * pdv.predocvntdet_cantidad AS NUMERIC), 2) END AS "VALOR VENTA",
  1 AS "CANT",
  CASE WHEN OA.ordatencion_negprc_emp_aseg_ncod = 117 AND oasd.ordatencionasegdet_coaseguro = 100 AND oasd.ordatencionasegdet_deducible = 0 THEN 0 ELSE neg_prec.prec_neg END as precio_negociado,
  CASE WHEN coalesce(cm.citamedica_modalidad_cons, 0) = 0 then NULL ELSE 'TELECONSULTA AMBULATORIA' END AS "MODALIDAD",
  oa.ordatencion_cod as "OA",

CASE WHEN OA.ordatencion_negprc_emp_aseg_ncod = 117 AND oasd.ordatencionasegdet_coaseguro = 100 AND oasd.ordatencionasegdet_deducible = 0 THEN
  	'ATC COLABORADOR'
  ELSE
  	''
  END AS "TP ATC",
  CIE.cie10 as "CIE10",
  cg.catgenerico_dsc AS "TP. FINANCIADOR",
    
  pro.provincia_dsc AS provincia_dsc,
  ciu.ciudad_dsc AS ciudad_dsc,
  dis.distrito_dsc AS distrito_dsc,
  CASE WHEN OAD.ordatenciondet_tpcondpaciente_est= 1 THEN 'NUEVO' 
  		WHEN OAD.ordatenciondet_tpcondpaciente_est = 2 THEN 'CONTINUADOR'
        WHEN OAD.ordatenciondet_tpcondpaciente_est = 3 THEN 'REINGRESANTE'
        ELSE '' END as condicion_establecimiento,
  CASE WHEN OAD.ordatenciondet_tpcondpaciente_serv = 1 THEN 'NUEVO' 
  		WHEN OAD.ordatenciondet_tpcondpaciente_serv = 2 THEN 'CONTINUADOR'
        WHEN OAD.ordatenciondet_tpcondpaciente_serv = 3 THEN 'REINGRESANTE'
        ELSE '' END as condicion_servicio,
  emp.empresa_ruc AS ruc,
  emp.empresa_rznsocial AS empresa,
  PPER.persona_tel AS telefono,
  PPER.persona_cel AS celular,
  PPER.persona_mail AS mail
FROM 
sch_clinica.tbl_citamedica cm
INNER JOIN sch_clinica.tbl_ordatencionamb OAMB ON Cm.citamedica_cod = OAMB.ordatencionamb_citamedica_cod
INNER JOIN sch_clinica.tbl_ordatencion OA ON OA.ordatencion_cod = OAMB.ordatencionamb_ordatenciondet_cod
INNER JOIN sch_clinica.tbl_tppaciente TPAC ON TPAC.tppaciente_cod = OA.ordatencion_tpaciente_cod
INNER JOIN sch_clinica.tbl_negociacionprecio NP ON NP.negociacionprecio_cod = OA.ordatencion_negprc_emp_aseg_ncod
LEFT JOIN sch_clinica.tbl_catgenerico CG ON NP.negociacionprecio_tpfinanciador = CG.catgenerico_cod
INNER JOIN sch_clinica.tbl_paciente PAC ON PAC.paciente_cod = OA.ordatencion_paciente_cod
INNER JOIN sch_clinica.tbl_persona PPER ON PPER.persona_cod = OA.ordatencion_paciente_cod

LEFT JOIN sch_clinica.tbl_distrito DIS ON (DIS.distrito_cod = PPER.persona_ubigeo)
LEFT JOIN sch_clinica.tbl_provincia PRO ON (PRO.provincia_cod = DIS.distrito_provincia_cod 
	AND PRO.provincia_ciudad_cod = DIS.distrito_ciudad_cod and pro.provincia_pais_cod = dis.distrito_pais_cod)
LEFT JOIN sch_clinica.tbl_ciudad CIU ON (CIU.ciudad_cod = pro.provincia_ciudad_cod)    
  AND (CIU.ciudad_pais_cod = pro.provincia_pais_cod) 

left join sch_clinica.tbl_tpidensunat tpiden on pper.persona_tpidentidad = tpiden.tpidensunat_cod
INNER JOIN sch_clinica.tbl_ordatenciondet OAD ON OAMB.ordatencionamb_ordatenciondet_cod = oad.ordatenciondet_ordatencion_cod
		AND OAD.ordatenciondet_item = OAMB.ordatencionamb_ordatenciondet_item
left join sch_clinica.tbl_ordatencionasegdet oasd on (oad.ordatenciondet_ordatencion_cod = oasd.ordatencionasegdet_ordatencion_cod and
oad.ordatenciondet_item = oasd.ordatencionasegdet_item)

INNER JOIN sch_clinica.tbl_espprofatencion ESP ON ESP.espprofatencion_cod = cm.citamedica_emcod
INNER JOIN sch_clinica.tbl_persona PMED ON PMED.persona_cod = cm.citamedica_pacod
INNER JOIN sch_clinica.tbl_predocvnt PV ON (OAD.ordatenciondet_predocvnt_cod = PV.predocvnt_cod)
INNER JOIN sch_clinica.tbl_predocvntdet pdv on pv.predocvnt_cod = pdv.predocvntdet_cod
LEFT JOIN sch_clinica.tbl_hstclinica_consulta HCC ON (OAMB.ordatencionamb_ordatenciondet_cod = HCC.hstclinica_consulta_oadet_cod
AND OAMB.ordatencionamb_ordatenciondet_item = HCC.hstclinica_consulta_oadet_item)
LEFT JOIN
(
select
OADX.ordatenciondet_diagnostico_oacod,
OADX.ordatenciondet_diagnostico_oaitem,
  	array_to_string(array_agg(distinct  COALESCE('(' || substring(tpdiag.tpdiagnostico_dsc from 1 for 1) || ') ' || CIE.cie10_cod || ' ' || cie.cie10_dsc, '')   ), ' | ') AS cie10
  from
    sch_clinica.tbl_ordatenciondet_diagnostico OADX 
    LEFT JOIN sch_clinica.tbl_cie10 CIE ON OADX.ordatenciondet_diagnostico_ccod = CIE.cie10_cod    
  	left join sch_clinica.tbl_tpdiagnostico tpdiag on oadx.ordatenciondet_diagnostico_tpdiagnostico = tpdiag.tpdiagnostico_cod
    group by
    	1,2
) AS CIE ON (  	 OAMB.ordatencionamb_ordatenciondet_cod = CIE.ordatenciondet_diagnostico_oacod AND 
     OAMB.ordatencionamb_ordatenciondet_item = CIE.ordatenciondet_diagnostico_oaitem)
  
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
        (np.negociacionprecio_cod = NEG_PREC.negociacionprecio_cod AND
         pdv.predocvntdet_elemento_cod = NEG_PREC.td_cod AND pdv.predocvntdet_elemento_item = NEG_PREC.td_item)
LEFT JOIN sch_clinica.tbl_empresa EMP ON (OA.ordatencion_negprc_emp_aseg_ecod = EMP.empresa_cod)
WHERE 
	CM.citamedica_estado = 1 AND PV.predocvnt_estado = 1 
	AND DATE(CM.citamedica_fhcita) >= #finicio#
	AND DATE(CM.citamedica_fhcita) <= #ffin#
ORDER BY 
	2 ASC, 10, 11
) as cons
WHERE cons."ESPECIALIDAD" IN ('MEDICINA GENERAL', 'MEDICINA DE EMERGENCIA Y URGENCIAS')
group by
	1,2,3,4,5,6,7,8,9,10,12,13, 17,18,19,20,21,22,23,24,CONS.empresa,CONS.ruc,CONS.telefono,CONS.celular,CONS.mail
            