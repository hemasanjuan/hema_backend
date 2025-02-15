

select
    CONS."SESIONES REALIZADAS" as "CANTIDAD"
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
        oid.ordinternamientodet_preciouniventa as "MONTO UNITARIO"
    from
    	sch_clinica.tbl_hospitalizacion_tratamiento ht
        inner join sch_clinica.vw_persona ter on ht.hospitalizacion_tratamiento_pacod = ter.vw_persona_cod
        inner join sch_clinica.tbl_ordatencion oa on ht.hospitalizacion_tratamiento_oacod = oa.ordatencion_cod
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
	1,2,3,4,5,6,7,8,9,10,11,13
    ) AS CONS
  order by 1,2