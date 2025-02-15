select
    mes,fecha_atencion,dni_paciente,paciente,edad,sexo,tipo_paciente,dsc_tipo_paciente,servicio,especialidad,medico,modalidad,area,linea,
    case when valor_venta <> 0 THEN valor_venta else cons.precio_negociado end as valor_venta,
    cant,oa,serie,numero,fecha_emi,total_venta,total_neto,nro_doc_med,tipo_cons
from
(
SELECT DISTINCT
  sch_clinica.sp_mes_letras(date(cm.citamedica_fhcita)) as mes,
  CM.citamedica_fhcita as fecha_atencion,
  pper.persona_nrodoc as dni_paciente,
  COALESCE(PPER.persona_apep, '') || ' ' || COALESCE(PPER.persona_apem, '')
  || ', ' || COALESCE(PPER.persona_nmb1, '') || ',' || COALESCE(PPER.persona_nmb2, '') as paciente,
   (SELECT ANIO FROM
     sch_clinica.sp_util_diferencia_fecha(PPER.persona_fecnac, DATE(CM.citamedica_fhcita) - 1)
     AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS edad,
  PPER.persona_sexo as sexo,
  TPAC.tppaciente_dsc as tipo_paciente,
  NP.negociacionprecio_dsc as dsc_tipo_paciente,
  'CONSULTA AMBULATORIA' as servicio,
  ESP.espprofatencion_dsc as especialidad,
  COALESCE(PMED.persona_apep, '') || ' ' || COALESCE(PMED.persona_apem, '')
  || ', ' || COALESCE(PMED.persona_nmb1, '') || ', ' || COALESCE(PMED.persona_nmb2, '') as medico,
  CASE WHEN coalesce(cm.citamedica_modalidad_cons, 0) = 0 then 'PRESENCIAL' ELSE 'VIRTUAL' END AS modalidad,
  'AREA' AS area,
  'LNFN' AS linea,
  ROUND(CAST(sum(case when PdV.predocvntdet_preciouniventa <= 0 then pdv.predocvntdet_preciounineto else pdv.predocvntdet_preciouniventa end * pdv.predocvntdet_cantidad) AS NUMERIC), 2) AS valor_venta,
  1 AS cant,
  sum(neg_prec.prec_neg) as precio_negociado,
  oa.ordatencion_cod as oa,
  v.docvntsunat_serie as serie,
  V.docvntsunat_nro as numero, 
  V.docvntsunat_femision as fecha_emi,
  V.docvntsunat_totalventa as total_venta,
  v.docvntsunat_totneto as total_neto,
  PMED.persona_nrodoc as nro_doc_med,
  OAD.ordatenciondet_tpcons  as tipo_cons
FROM
sch_clinica.tbl_citamedica cm
INNER JOIN sch_clinica.tbl_ordatencionamb OAMB ON Cm.citamedica_cod = OAMB.ordatencionamb_citamedica_cod
INNER JOIN sch_clinica.tbl_ordatencion OA ON OA.ordatencion_cod = OAMB.ordatencionamb_ordatenciondet_cod
INNER JOIN sch_clinica.tbl_tppaciente TPAC ON TPAC.tppaciente_cod = OA.ordatencion_tpaciente_cod
INNER JOIN sch_clinica.tbl_negociacionprecio NP ON NP.negociacionprecio_cod = OA.ordatencion_negprc_emp_aseg_ncod
INNER JOIN sch_clinica.tbl_paciente PAC ON PAC.paciente_cod = OA.ordatencion_paciente_cod
INNER JOIN sch_clinica.tbl_persona PPER ON PPER.persona_cod = OA.ordatencion_paciente_cod
left join sch_clinica.tbl_tpidensunat tpiden on pper.persona_tpidentidad = tpiden.tpidensunat_cod
INNER JOIN sch_clinica.tbl_ordatenciondet OAD ON OAMB.ordatencionamb_ordatenciondet_cod = oad.ordatenciondet_ordatencion_cod
        AND OAD.ordatenciondet_item = OAMB.ordatencionamb_ordatenciondet_item
INNER JOIN sch_clinica.tbl_espprofatencion ESP ON ESP.espprofatencion_cod = cm.citamedica_emcod
INNER JOIN sch_clinica.tbl_persona PMED ON PMED.persona_cod = cm.citamedica_pacod
INNER JOIN sch_clinica.tbl_predocvnt PV ON (OAD.ordatenciondet_predocvnt_cod = PV.predocvnt_cod)
INNER JOIN sch_clinica.tbl_predocvntdet pdv on pv.predocvnt_cod = pdv.predocvntdet_cod
inner join sch_clinica.tbl_docvntsunat v on v.docvntsunat_predocvnt_cod=pv.predocvnt_cod
LEFT JOIN sch_clinica.tbl_hstclinica_consulta HCC ON (OAMB.ordatencionamb_ordatenciondet_cod = HCC.hstclinica_consulta_oadet_cod
AND OAMB.ordatencionamb_ordatenciondet_item = HCC.hstclinica_consulta_oadet_item)
inner join sch_clinica.tbl_cattpconsulta tpcon on OAD.ordatenciondet_tpcons = tpcon.cattpconsulta_cod
left join
        (            SELECT
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
WHERE
    CM.citamedica_estado = 1 AND PV.predocvnt_estado = 1
    AND DATE(CM.citamedica_fhcita) >= :finicio
    AND DATE(CM.citamedica_fhcita) <= :ffin 
     group by
    1,2,3,4,5,6,7,8,9,10,11,12,18,19,20,21,22,23,24,25
    ORDER BY
    2 ASC, 10, 11
) as cons