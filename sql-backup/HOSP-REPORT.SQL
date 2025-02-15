select distinct
	sch_clinica.sp_mes_letras(DATE(cons.fecha_ingreso))	as "MES",
  	TO_CHAR(cons.ordinternamiento_finicio, 'dd/MM/yyyy') as "FECHA ATENCION",
  	per.persona_nrodoc as "DNI PACIENTE",
  	COALESCE(per.persona_apep, '') || ' ' || COALESCE(per.persona_apem, '') || ', ' || COALESCE(per.persona_nmb1, '')
	  || ' ' || COALESCE(per.persona_nmb2, '') as "PACIENTE",
     (SELECT ANIO FROM 
     sch_clinica.sp_util_diferencia_fecha(per.persona_fecnac, DATE(cons.fecha_ingreso) - 1)
  	   AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
	per.persona_sexo as "SEXO",
  	TPac.tppaciente_dsc as "TIPO DE PACIENTE",
  	NP.negociacionprecio_dsc as "DESCRIPCION TIPO PACIENTE",  
  	'HOSPITALIZACION' AS "SERVICIO",
    mrd.maprecintodet_dsc as "CAMA",
   	COALESCE(tpa.tpatencion_dsc, '') AS "TIPO SERVICIO",
  	med.vw_persona_nombres as "MEDICO",
  	COALESCE(TO_CHAR(cons.ordinternamiento_ffin, 'dd/MM/yyyy'), '') as "FECHA EGRESO",
  	coalesce(NEG_PREC.prec_neg, 117.65) * ((cons.fecha_alta - cons.fecha_ingreso) + 1)  AS "VALOR VENTA",
  	(cons.fecha_alta - cons.fecha_ingreso) + 1 as "DIAS HOSPI",
    oa.ordatencion_cod as "OA"
    
    
from
(
select 
	oi.ordinternamiento_finicio,
    date(CASE WHEN date(oi.ordinternamiento_finicio) > date(:finicio) then oi.ordinternamiento_finicio else :finicio end) as fecha_ingreso, 
    date(CASE WHEN date(oi.ordinternamiento_ffin) > date(:ffin) then :ffin else oi.ordinternamiento_ffin end) as fecha_alta,
    oi.ordinternamiento_ffin,
	oa.ordatencion_cod,
    hosp.hospitalizacion_ubicacion_cod,
        oi.ordinternamiento_ncod as negociacion,
    mc.mapcama_tarifariodet_cod as td_cod,
    mc.mapcama_tarifariodet_item as td_item,
    hosp.hospitalizacion_pacod,
    oi.ordinternamiento_tppaciente
from
	sch_clinica.tbl_hospitalizacion hosp
    inner join sch_clinica.tbl_ordatencion oa on
    hosp.hospitalizacion_oacod = oa.ordatencion_cod and
    oa.ordatencion_tpatencion_cod = 2
    inner join sch_clinica.tbl_ordeninternamiento oi on
    hosp.hospitalizacion_oacod = oi.ordinternamiento_oacod and
    oi.ordinternamiento_estado_facturacion <> 5
    inner join sch_clinica.tbl_ordinternamientodet oid on
    oi.ordinternamiento_cod = oid.ordinternamientodet_oicod and
    oid.ordinternamientodet_ejecucion_auditoria = 1 and
    oid.ordinternamientodet_tpservicio = 9
    left join sch_clinica.tbl_mapcama mc on
    hosp.hospitalizacion_ubicacion_cod = mc.mapcama_cod
where
	date(oi.ordinternamiento_ffin) >= :finicio and
    date(oi.ordinternamiento_finicio) >= :finicio and
    date(oi.ordinternamiento_finicio) <= :ffin and
    oa.ordatencion_estado <> 2
    
union all

select 
	oi.ordinternamiento_finicio,
    date(CASE WHEN date(oi.ordinternamiento_finicio) > date(:finicio) then oi.ordinternamiento_finicio else :finicio end) as fecha_ingrso, 
	date(CASE WHEN oi.ordinternamiento_ffin is null OR
              date(oi.ordinternamiento_ffin) > date(:ffin) then date(:ffin) else oi.ordinternamiento_ffin end) as fecha_alta,
    oi.ordinternamiento_ffin,
	oa.ordatencion_cod,
    hosp.hospitalizacion_ubicacion_cod,
    oi.ordinternamiento_ncod as negociacion,
    mc.mapcama_tarifariodet_cod as td_cod,
    mc.mapcama_tarifariodet_item as td_item,
hosp.hospitalizacion_pacod,
    oi.ordinternamiento_tppaciente
from
	sch_clinica.tbl_hospitalizacion hosp
    inner join sch_clinica.tbl_ordatencion oa on
    hosp.hospitalizacion_oacod = oa.ordatencion_cod and
    oa.ordatencion_tpatencion_cod = 2 and
    oa.ordatencion_estado <> 2
    inner join sch_clinica.tbl_ordeninternamiento oi on
   hosp.hospitalizacion_oacod = oi.ordinternamiento_oacod and
    oi.ordinternamiento_estado_facturacion <> 5
    inner join sch_clinica.tbl_ordinternamientodet oid on
    oi.ordinternamiento_cod = oid.ordinternamientodet_oicod and
    oid.ordinternamientodet_ejecucion_auditoria = 1 and
    oid.ordinternamientodet_tpservicio = 9
   left join sch_clinica.tbl_mapcama mc on
   hosp.hospitalizacion_ubicacion_cod = mc.mapcama_cod
  
where
	date(oi.ordinternamiento_finicio) >= :finicio and
    date(oi.ordinternamiento_finicio) <= :ffin and
    oa.ordatencion_estado <> 2
    
union all

select 
	oi.ordinternamiento_finicio,
    date(CASE WHEN date(oi.ordinternamiento_finicio) > date(:finicio) then oi.ordinternamiento_finicio else :finicio end) as fecha_ingrso, 
	date(CASE WHEN oi.ordinternamiento_ffin is null OR
              date(oi.ordinternamiento_ffin) > date(:ffin) then date(:ffin) else oi.ordinternamiento_ffin end) as fecha_alta,
    oi.ordinternamiento_ffin,
	oa.ordatencion_cod,
    hosp.hospitalizacion_ubicacion_cod,
    oi.ordinternamiento_ncod as negociacion,
    mc.mapcama_tarifariodet_cod as td_cod,
    mc.mapcama_tarifariodet_item as td_item,
hosp.hospitalizacion_pacod,
    oi.ordinternamiento_tppaciente
from
	sch_clinica.tbl_hospitalizacion hosp
    inner join sch_clinica.tbl_ordatencion oa on
    hosp.hospitalizacion_oacod = oa.ordatencion_cod and
    oa.ordatencion_tpatencion_cod = 2 and
    oa.ordatencion_estado <> 2
    inner join sch_clinica.tbl_ordeninternamiento oi on
   hosp.hospitalizacion_oacod = oi.ordinternamiento_oacod and
    oi.ordinternamiento_estado_facturacion <> 5
        inner join sch_clinica.tbl_ordinternamientodet oid on
    oi.ordinternamiento_cod = oid.ordinternamientodet_oicod and
    oid.ordinternamientodet_ejecucion_auditoria = 1 and
    oid.ordinternamientodet_tpservicio = 9
   left join sch_clinica.tbl_mapcama mc on
   hosp.hospitalizacion_ubicacion_cod = mc.mapcama_cod
  
where
	date(oi.ordinternamiento_ffin) >= :finicio and
    date(oi.ordinternamiento_ffin) <= :ffin and
    oa.ordatencion_estado <> 2
        
union all

select 
    oi.ordinternamiento_finicio,
    date(CASE WHEN date(oi.ordinternamiento_finicio) > date(:finicio) then oi.ordinternamiento_finicio else :finicio end) as fecha_ingrso, 
    date(:ffin),
    oi.ordinternamiento_ffin,
    oa.ordatencion_cod,
    hosp.hospitalizacion_ubicacion_cod,
    oi.ordinternamiento_ncod as negociacion,
    mc.mapcama_tarifariodet_cod as td_cod,
    mc.mapcama_tarifariodet_item as td_item,
    hosp.hospitalizacion_pacod,
    oi.ordinternamiento_tppaciente
from
	sch_clinica.tbl_hospitalizacion hosp
    inner join sch_clinica.tbl_ordatencion oa on
    hosp.hospitalizacion_oacod = oa.ordatencion_cod and
    oa.ordatencion_tpatencion_cod = 2 and
    oa.ordatencion_estado <> 2
    inner join sch_clinica.tbl_ordeninternamiento oi on
    hosp.hospitalizacion_oacod = oi.ordinternamiento_oacod and
    oi.ordinternamiento_estado_facturacion <> 5    
    inner join sch_clinica.tbl_ordinternamientodet oid on
    oi.ordinternamiento_cod = oid.ordinternamientodet_oicod and
    oid.ordinternamientodet_ejecucion_auditoria = 1 and
    oid.ordinternamientodet_tpservicio = 9
    left join sch_clinica.tbl_mapcama mc on
    hosp.hospitalizacion_ubicacion_cod = mc.mapcama_cod
    
where
	date(oi.ordinternamiento_finicio) < :finicio and
    oi.ordinternamiento_ffin is null  and
    oa.ordatencion_estado <> 2
) as cons
inner join sch_clinica.tbl_ordatencion oa on
cons.ordatencion_cod = oa.ordatencion_cod
inner join sch_clinica.tbl_persona per on
oa.ordatencion_paciente_cod = per.persona_cod
left join sch_clinica.vw_persona med on
cons.hospitalizacion_pacod = med.vw_persona_cod
left join sch_clinica.tbl_tppaciente tpac on
cons.ordinternamiento_tppaciente = tpac.tppaciente_cod
left join sch_clinica.tbl_negociacionprecio np ON
cons.negociacion = np.negociacionprecio_cod
inner join sch_clinica.tbl_tpatencion tpa on
oa.ordatencion_tpatencion_cod = tpa.tpatencion_cod
inner join sch_clinica.tbl_hospitalizacion hospi on hospi.hospitalizacion_oacod = oa.ordatencion_cod 
--select * from sch_clinica.tbl_ordatencion
--select * from sch_clinica.tbl_mapcama

--select * from sch_clinica.tbl_hospitalizacion hosp
inner join sch_clinica.tbl_maprecintodet MRD on MRD.maprecintodet_cod =hospi.hospitalizacion_ubicacion_cod

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
        (cons.negociacion = NEG_PREC.negociacionprecio_cod AND
         cons.td_cod = NEG_PREC.td_cod AND cons.td_item = NEG_PREC.td_item)