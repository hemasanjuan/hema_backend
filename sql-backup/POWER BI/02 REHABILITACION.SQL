SELECT
	CONS."MES",
    CONS."FECHA ATENCION",
    CONS."DNI PACIENTE",
    CONS."PACIENTE",
    CONS."EDAD",
    CONS."SEXO",
    CONS."TIPO DE PACIENTE",
    CONS."DESCRIPCION TIPO PACIENTE",    
    CONS."TIPO SERVICIO",
    CONS."SERVICIO",
    CONS."TECNOLOGO",
    CONS."MODALIDAD" AS "TIPO",
    CONS."SESIONES REALIZADAS" * CONS."MONTO UNITARIO" AS "PRECIO VENTA",
    CONS."SESIONES REALIZADAS" as "CANTIDAD",
    cons."SERIE" AS "SERIE",
    cons."NUMERO" AS "NUMERO",
    cons."FECHA_EMISION" AS "FECHA_EMISION",
    cons."TOTAL_VENTA" AS "TOTAL_VENTA",
    CONS."TOTAL_NETO" AS "TOTAL_NETO",
    cons."OA"
FROM
(
SELECT
   sch_clinica.sp_mes_letras(date(ts.tratamiento_sesion_fprogramada))	as "MES", 
  TO_CHAR(ts.tratamiento_sesion_fprogramada, 'dd/MM/yyyy') AS "FECHA ATENCION",
  P.persona_nrodoc AS "DNI PACIENTE",
  P.persona_apep || ' ' || P.persona_apem || ' ' || P.persona_nmb1 || ' ' || P.persona_nmb2 AS "PACIENTE",
  (SELECT ANIO FROM 
     sch_clinica.sp_util_diferencia_fecha(P.persona_fecnac, DATE(ts.tratamiento_sesion_fprogramada) - 1)
     AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
  P.persona_sexo as "SEXO",
  COALESCE(TP.tppaciente_dsc, 'EVENTUAL') AS "TIPO DE PACIENTE",
  np.negociacionprecio_dsc as "DESCRIPCION TIPO PACIENTE",
  'REHABILITACION' AS "SERVICIO",
  TD.tarifariodet_dsc AS "TIPO SERVICIO",
  VP.vw_persona_nombres AS "TECNOLOGO",
  sum(CASE WHEN ts.tratamiento_sesion_asistencia = 1 then 1 else 0 end) AS "SESIONES REALIZADAS",
  dvsd.docvntsunatdet_preciouniventa AS "MONTO UNITARIO",
  case when coalesce(ts.tratamiento_sesion_modalidad, 0) = 0 then 'PRESENCIAL' ELSE 'VIRTUAL' END AS "MODALIDAD",
  DVS.docvntsunat_serie AS "SERIE",
  DVS.docvntsunat_nro as "NUMERO",
  DVS.docvntsunat_femision AS "FECHA_EMISION",
  dvs.docvntsunat_totalventa AS "TOTAL_VENTA",
  dvs.docvntsunat_totneto AS "TOTAL_NETO",
  DVS.docvntsunat_oa_codigo AS "OA"
FROM
  sch_clinica.tbl_tratamiento_sesion ts
  left join sch_clinica.tbl_tratamiento_venta TTV on
  ts.tratamiento_sesion_tratamiento_venta_cod = ttv.tratamiento_venta_cod
  LEFT JOIN sch_clinica.tbl_docvntsunat DVS ON (TTV.tratamiento_venta_docvntsunat_cod = DVS.docvntsunat_cod)
  LEFT JOIN sch_clinica.tbl_tratamiento T ON (TTV.tratamiento_venta_cod_tratamiento = T.tratamiento_cod)
  LEFT JOIN sch_clinica.tbl_docvntsunatdet dvsd on dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod
  LEFT JOIN sch_clinica.tbl_persona P ON (T.tratamiento_paciente_cod = P.persona_cod)
  LEFT JOIN sch_clinica.tbl_paciente PC ON (P.persona_cod = PC.paciente_cod)
  left join sch_clinica.tbl_tpidensunat tpiden on (p.persona_tpidentidad = tpiden.tpidensunat_cod)
  LEFT JOIN sch_clinica.tbl_espprofatencion ES ON (TS.tratamiento_sesion_emcod = ES.espprofatencion_cod)
  LEFT JOIN sch_clinica.vw_persona VP ON (TS.tratamiento_sesion_pacod = VP.vw_persona_cod)
  LEFT JOIN sch_clinica.tbl_tppaciente TP ON (T.tratamiento_tppaciente_cod = TP.tppaciente_cod)
  LEFT JOIN sch_clinica.tbl_docvntsunat_referencia DVSR ON (DVS.docvntsunat_cod = DVSR.docvntsunat_referencia_docref_cod)
  left join sch_clinica.tbl_negociacionprecio np on (t.tratamiento_negociacion_cod = np.negociacionprecio_cod)
  left join sch_clinica.tbl_paciente_plan pacp on
    (p.persona_cod = pacp.paciente_plan_pcod)
    left join sch_clinica.tbl_polizaplan pp on
    (pacp.paciente_plan_pp_cod = pp.polizaplan_cod)
    left join sch_clinica.tbl_polizaplan_afiliacion_social ppaf on
    (pacp.paciente_plan_ppafcod = ppaf.polizaplan_afiliacion_social_cod)
    INNER JOIN sch_clinica.tbl_segus S ON (DVSD.docvntsunatdet_elemento_cod = S.segus_tarifariodet_cod
  AND DVSD.docvntsunatdet_elemento_item = S.segus_tarifariodet_item AND S.segus_area_cod = 45)
  LEFT JOIN sch_clinica.tbl_tarifariodet TD ON (S.segus_tarifariodet_cod = TD.tarifariodet_cod
  AND S.segus_tarifariodet_item = TD.tarifariodet_item)

WHERE
  DATE(ts.tratamiento_sesion_fprogramada) >= :finicio and
  DATE(ts.tratamiento_sesion_fprogramada) <= :ffin
GROUP BY
	1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20
) AS CONS
where
	cons."SESIONES REALIZADAS" <> 0

union all

select
    	CONS."MES",
    CONS."FECHA ATENCION",
    CONS."DNI PACIENTE",
    CONS."PACIENTE",
    CONS."EDAD",
    CONS."SEXO",
    CONS."TIPO DE PACIENTE",
    CONS."DESCRIPCION TIPO PACIENTE",
    CONS."SERVICIO",
    CONS."TIPO SERVICIO",
    CONS."TECNOLOGO",
    'PRESENCIAL',
    CONS."SESIONES REALIZADAS" * CONS."MONTO UNITARIO" AS "PRECIO VENTA",
    CONS."SESIONES REALIZADAS" as "CANTIDAD",
    cons."SERIE" AS "SERIE",
    cons."NUMERO" AS "NUMERO",
    CONS."FECHA_EMISION" AS "FECHA_EMISION",
    CONS."TOTAL_VENTA" AS "TOTAL_VENTA",
    CONS."TOTAL_NETO" AS "TOTAL_NETO",
    CONS."OA"
    from
    (
    select
        sch_clinica.sp_mes_letras(date(HT.hospitalizacion_tratamiento_fregistro))	as "MES", 
        TO_CHAR(HT.hospitalizacion_tratamiento_fregistro, 'dd/MM/yyyy') AS "FECHA ATENCION",
        per.persona_nrodoc AS "DNI PACIENTE",
        per.persona_apep || ' ' || per.persona_apem || ' ' || per.persona_nmb1 || ' ' || per.persona_nmb2 AS "PACIENTE",
        (SELECT ANIO FROM 
           sch_clinica.sp_util_diferencia_fecha(per.persona_fecnac, DATE(HT.hospitalizacion_tratamiento_fregistro) - 1)
           AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
        per.persona_sexo as "SEXO",
        COALESCE(TP.tppaciente_dsc, 'EVENTUAL') AS "TIPO DE PACIENTE",
        np.negociacionprecio_dsc as "DESCRIPCION TIPO PACIENTE",
        'REHABILITACION' AS "SERVICIO",
        TD.tarifariodet_dsc AS "TIPO SERVICIO",
        ter.vw_persona_nombres AS "TECNOLOGO",
        sum(ht.hospitalizacion_tratamiento_cantidad) AS "SESIONES REALIZADAS",
        oid.ordinternamientodet_preciouniventa as "MONTO UNITARIO",
        dvnt.docvntsunat_serie as "SERIE",
        dvnt.docvntsunat_nro as "NUMERO",
        dvnt.docvntsunat_femision as "FECHA_EMISION",
        dvnt.docvntsunat_totalventa  AS "TOTAL_VENTA",
        dvnt.docvntsunat_totneto AS "TOTAL_NETO",
        dvnt.docvntsunat_oa_codigo as "OA"     
    from
    	sch_clinica.tbl_hospitalizacion_tratamiento ht
        inner join sch_clinica.vw_persona ter on ht.hospitalizacion_tratamiento_pacod = ter.vw_persona_cod
        inner join sch_clinica.tbl_ordatencion oa on ht.hospitalizacion_tratamiento_oacod = oa.ordatencion_cod
        inner join sch_clinica.tbl_docvntsunat dvnt on dvnt.docvntsunat_oa_codigo=oa.ordatencion_cod
        inner join sch_clinica.tbl_persona per on oa.ordatencion_paciente_cod = per.persona_cod
        inner join sch_clinica.tbl_paciente pac on per.persona_cod = pac.paciente_cod
        inner join sch_clinica.tbl_tpidensunat tpiden on per.persona_tpidentidad = tpiden.tpidensunat_cod
        left join sch_clinica.tbl_ordinternamientodet oid on ht.hospitalizacion_tratamiento_oidet_cod = oid.ordinternamientodet_cod
        left join sch_clinica.tbl_espprofatencion es on ht.hospitalizacion_tratamiento_emcod = es.espprofatencion_cod
        left join sch_clinica.tbl_ordeninternamiento oi on oid.ordinternamientodet_oicod = oi.ordinternamiento_cod
        left join sch_clinica.tbl_tppaciente tp on oi.ordinternamiento_tppaciente = tp.tppaciente_cod
        left join sch_clinica.tbl_negociacionprecio np on oi.ordinternamiento_ncod = np.negociacionprecio_cod        
        LEFT JOIN sch_clinica.tbl_tarifariodet TD ON (ht.hospitalizacion_tratamiento_tarifariocod = TD.tarifariodet_cod
        AND ht.hospitalizacion_tratamiento_tarifarioitem = TD.tarifariodet_item)
    where	 
    	date(ht.hospitalizacion_tratamiento_fregistro) >= :finicio and
        date(ht.hospitalizacion_tratamiento_fregistro) <= :ffin
    group by
	1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19
    ) AS CONS
  order by 1,2