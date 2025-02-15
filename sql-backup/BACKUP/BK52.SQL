select
	cons."MES",
    cons."FECHA ATENCION",
    cons."DNI PACIENTE",
    cons."PACIENTE",
    cons."EDAD",
    cons."SEXO",    
    cons."TIPO DE PACIENTE",
    cons."DESCRIPCION TIPO PACIENTE",
    cons."LINEA DE NEGOCIO",
    cons."SERVICIO",
    cons."MEDICO",    
    SUM(ROUND(CAST(cons."VALOR VENTA" AS NUMERIC), 2)) AS "VALOR VENTA",
    1 AS "CANTIDAD",
    cons."COD EXAMEN/ORDEN DE ATENCION",
    cons."DISTRITO"
from
(
SELECT DISTINCT
  sch_clinica.sp_mes_letras(date(DVS.docvntsunat_femision))	as "MES",
  TO_CHAR(DVS.docvntsunat_femision, 'dd/MM/yyyy') AS "FECHA ATENCION",
  coalesce(per1.persona_nrodoc, per2.persona_nrodoc) AS "DNI PACIENTE",
  coalesce(per1.persona_apep || ' ' || per1.persona_apem || ' ' || per1.persona_nmb1 || ' ' || per1.persona_nmb2,
           per2.persona_apep || ' ' || per2.persona_apem || ' ' || per2.persona_nmb1 || ' ' || per2.persona_nmb2) AS "PACIENTE",
  (SELECT ANIO FROM 
     sch_clinica.sp_util_diferencia_fecha(coalesce(per1.persona_fecnac, per2.persona_fecnac), DATE(DVS.docvntsunat_femision) - 1)
     AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
  COALESCE(per1.persona_sexo, per2.persona_sexo) as "SEXO",
  COALESCE(TP.tppaciente_dsc, 'EVENTUAL') AS "TIPO DE PACIENTE",
  coalesce(negp.negociacionprecio_dsc, 'PARTICULAR') as "DESCRIPCION TIPO PACIENTE",
  COALESCE(TA.tpatencion_dsc, 'ATENCION EVENTUAL') AS "LINEA DE NEGOCIO",
  'FARMACIA' as "SERVICIO",
  med.vw_persona_nombres AS "MEDICO",  
  (DVSD.docvntsunatdet_cantidad * DVSD.docvntsunatdet_preciouniventa) as "VALOR VENTA",
  1  AS "CANTIDAD",
  OA.ordatencion_cod AS "COD EXAMEN/ORDEN DE ATENCION",
  d.distrito_dsc as "DISTRITO"
  
FROM
  sch_clinica.tbl_docvntsunat DVS
  INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD ON (DVS.docvntsunat_cod = DVSD.docvntsunatdet_cod)
  AND (DVSD.docvntsunatdet_tpelemento = 1 OR DVSD.docvntsunatdet_tpelemento = 2)
  
  LEFT JOIN sch_clinica.tbl_rmfarma_prvnt RCMPV  ON (DVS.docvntsunat_predocvnt_cod = RCMPV.rmfarma_prvnt_prvntcod)
  LEFT JOIN sch_clinica.tbl_recetamedfarma RTMF ON (RCMPV.rmfarma_prvnt_rfcod = RTMF.recetamedfarma_cod)
  LEFT JOIN sch_clinica.tbl_recetamed RM ON (RTMF.recetamedfarma_rmcod = rm.recetamed_cod)

  LEFT JOIN sch_clinica.tbl_ordatencion OA ON (RM.recetamed_ordatenciondet_cod = OA.ordatencion_cod)
  LEFT JOIN sch_clinica.tbl_tpatencion TA ON (OA.ordatencion_tpatencion_cod = TA.tpatencion_cod)
  LEFT JOIN sch_clinica.tbl_tppaciente TP ON (OA.ordatencion_tpaciente_cod = TP.tppaciente_cod)
  LEFT JOIN sch_clinica.tbl_ordatencion_factura_historial OAFH ON (RM.recetamed_ordatenciondet_cod = OAFH.ordatencion_factura_historial_oacod
  AND OAFH.ordatencion_factura_historial_estado = 1 and OAFH.ordatencion_factura_historial_tipo = 1)
  left join sch_clinica.tbl_empresa aseg on (oa.ordatencion_negprc_emp_aseg_acod = aseg.empresa_cod)
  LEFT JOIN sch_clinica.tbl_docvntsunat DVS2 ON (OAFH.ordatencion_factura_historial_docvntsunatcod = DVS2.docvntsunat_cod and
  dvs2.docvntsunat_anulado = 0)
  left join sch_clinica.tbl_negociacionprecio negp on 
  oa.ordatencion_negprc_emp_aseg_ncod = negp.negociacionprecio_cod
   left join sch_clinica.tbl_paciente pac on (oa.ordatencion_paciente_cod = pac.paciente_cod)
   left join sch_clinica.tbl_persona per1 on 
   (oa.ordatencion_paciente_cod = per1.persona_cod)
   
   inner join sch_clinica.tbl_distrito d on per1.persona_ubigeo=d.distrito_cod 
   
   left join sch_clinica.tbl_persona per2 on
   (dvs.docvntsunat_cliente_cod = per2.persona_cod and dvs.docvntsunat_tpcliente <> 3)
   left join sch_clinica.tbl_servicio_ejecucion se on
  (dvs.docvntsunat_cod = se.servicio_ejecucion_docvntsunatdet_cod and
   dvsd.docvntsunatdet_item = se.servicio_ejecucion_docvntsunatdet_item)
  left join sch_clinica.tbl_ordenatencionautoseg oaaut on
  (oa.ordatencion_cod = oaaut.ordenatencionautoseg_cod)
  left join sch_clinica.tbl_ordatencionaseg oaas on
  (oa.ordatencion_cod = oaas.ordatencionaseg_cod)
  left join sch_clinica.tbl_ordatencionamb oaa on
  oa.ordatencion_cod = oaa.ordatencionamb_ordatenciondet_cod
  left join sch_clinica.tbl_citamedica cm on
  oaa.ordatencionamb_citamedica_cod = cm.citamedica_cod
  LEFT JOIN sch_clinica.vw_persona med on
  coalesce(se.servicio_ejecucion_pacod, cm.citamedica_pacod) = med.vw_persona_cod
WHERE
  DATE(DVS.docvntsunat_femision) >= :finicio
  AND DATE(DVS.docvntsunat_femision) <= :ffin and
  dvs.docvntsunat_anulado = 0 and
  dvs.docvntsunat_tpref = 0 and
  coalesce(dvs.docvntsunat_ticket, 1) = 1
) as cons
GROUP BY
	1,2,3,4,5,6,7,8,9,10,11,14,15

UNION ALL

select
	sch_clinica.sp_mes_letras(date(fin.fecha))	as "MES",
	TO_CHAR(fin.fecha, 'dd/MM/yyyy') AS "FECHA ATENCION",
    per.persona_nrodoc AS "DNI PACIENTE",
    per.persona_apep || ' ' || per.persona_apem || ' ' || per.persona_nmb1 || ' ' || per.persona_nmb2 AS "PACIENTE",
    (SELECT ANIO FROM 
       sch_clinica.sp_util_diferencia_fecha(per.persona_fecnac, DATE(fin.fecha) - 1)
       AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
    per.persona_sexo as "SEXO",
    tpac.tppaciente_dsc AS "TIPO DE PACIENTE",
    np.negociacionprecio_dsc AS "DESCRIPCION TIPO PACIENTE",
    tpa.tpatencion_dsc AS "LINEA DE NEGOCIO",
    'FARMACIA' as "SERVICIO",
    med.vw_persona_nombres AS "MEDICO",
    sum(fin.monto) AS "VALOR VENTA",
    count(fin.movimiento_farmacia_cod) AS "CANTIDAD",
    fin.ordinternamiento_oacod AS "COD EXAMEN/ORDEN DE ATENCION",
    d.distrito_dsc as "DISTRITO"
from
(
select
	cons.ordinternamiento_oacod,
    cons.movimiento_farmacia_cod,
    cons.ordinternamiento_tppaciente,
    cons.fecha,
    cons.ordinternamiento_ncod,
    sum(cons.ordinternamientodet_precioventa) as monto
from
(
select
	oi.ordinternamiento_oacod,
    oid.ordinternamientodet_precioventa,
	mf.movimiento_farmacia_cod,
    oi.ordinternamiento_tppaciente,
    oid.ordinternamientodet_cod,
    oi.ordinternamiento_ncod,
    date(oid.ordinternamientodet_fregistro) as fecha
from
	sch_clinica.tbl_movimiento_farmacia mf
    inner join sch_clinica.tbl_movimiento_farmacia_det mfd on
    mf.movimiento_farmacia_cod = mfd.movimiento_farmacia_det_cod
    inner join sch_clinica.tbl_plantrab_medicamento ptm on
    mfd.movimiento_farmacia_det_ptmcod = ptm.plantrab_medicamento_cod
    inner join sch_clinica.tbl_plantrabmed_ejecucion ptme on
    ptm.plantrab_medicamento_cod = ptme.plantrabmed_ejecucion_ptmed_cod
    inner join sch_clinica.tbl_ordinternamientodet oid on
    ptme.plantrabmed_ejecucion_oidet_cod = oid.ordinternamientodet_cod and
    oid.ordinternamientodet_ejecucion_auditoria = 1
    inner join sch_clinica.tbl_ordeninternamiento oi on
    oid.ordinternamientodet_oicod = oi.ordinternamiento_cod
where
	date(oid.ordinternamientodet_fregistro) >= :finicio and
	date(oid.ordinternamientodet_fregistro) <= :ffin    
    
union all

select
	oi.ordinternamiento_oacod,
    oid.ordinternamientodet_precioventa,
	mf.movimiento_farmacia_cod,
    oi.ordinternamiento_tppaciente,
    oid.ordinternamientodet_cod,
    oi.ordinternamiento_ncod,
    date(oid.ordinternamientodet_fregistro)
from
	sch_clinica.tbl_movimiento_farmacia mf
    inner join sch_clinica.tbl_movimiento_farmaciaequi_det mfed on
    mf.movimiento_farmacia_cod = mfed.movimiento_farmaciaequi_det_cod
    inner join sch_clinica.tbl_plantrab_medicamento ptm on
    mfed.movimiento_farmaciaequi_det_ptmcod = ptm.plantrab_medicamento_cod
    inner join sch_clinica.tbl_ordinternamientodet oid on
    ptm.plantrab_medicamento_oidet_cod = oid.ordinternamientodet_cod and
    oid.ordinternamientodet_ejecucion_auditoria = 1
    inner join sch_clinica.tbl_ordeninternamiento oi on
    oid.ordinternamientodet_oicod = oi.ordinternamiento_cod
where
	date(oid.ordinternamientodet_fregistro) >= :finicio and
	date(oid.ordinternamientodet_fregistro) <= :ffin  
    
union all

--QUIROFANO
select
	oi.ordinternamiento_oacod,
    oid.ordinternamientodet_precioventa,
	qm.quirofano_medicamento_cod,
    oi.ordinternamiento_tppaciente,
    oid.ordinternamientodet_cod,
    oi.ordinternamiento_ncod,
    date(oid.ordinternamientodet_fregistro) as fecha
from
	sch_clinica.tbl_quirofano_medicamento qm
    inner join sch_clinica.tbl_ordinternamientodet oid on
    qm.quirofano_medicamento_oidet_cod = oid.ordinternamientodet_cod and
    oid.ordinternamientodet_ejecucion_auditoria = 1
    inner join sch_clinica.tbl_ordeninternamiento oi on
    oid.ordinternamientodet_oicod = oi.ordinternamiento_cod
where
	date(oid.ordinternamientodet_fregistro) >= :finicio and
	date(oid.ordinternamientodet_fregistro) <= :ffin    
    
union all

select
	oi.ordinternamiento_oacod,
    oid.ordinternamientodet_precioventa,
	qe.quirofano_equipo_cod,
    oi.ordinternamiento_tppaciente,
    oid.ordinternamientodet_cod,
    oi.ordinternamiento_ncod,
    date(oid.ordinternamientodet_fregistro)
from
	sch_clinica.tbl_quirofano_equipo qe
    inner join sch_clinica.tbl_ordinternamientodet oid on
    qe.quirofano_equipo_oidet_cod = oid.ordinternamientodet_cod and
    oid.ordinternamientodet_ejecucion_auditoria = 1
    inner join sch_clinica.tbl_ordeninternamiento oi on
    oid.ordinternamientodet_oicod = oi.ordinternamiento_cod
where
	date(oid.ordinternamientodet_fregistro) >= :finicio and
	date(oid.ordinternamientodet_fregistro) <= :ffin  
) as cons
group by
	1,2,3,4,5
) as fin
INNER JOIN sch_clinica.tbl_ordatencion oa on
fin.ordinternamiento_oacod = oa.ordatencion_cod
INNER JOIN sch_clinica.tbl_tppaciente tpac on
fin.ordinternamiento_tppaciente = tpac.tppaciente_cod
INNER JOIN sch_clinica.tbl_persona per on
oa.ordatencion_paciente_cod = per.persona_cod

INNER JOIN sch_clinica.tbl_distrito d on d.distrito_cod=per.persona_ubigeo

INNER JOIN sch_clinica.tbl_tpatencion tpa on
oa.ordatencion_tpatencion_cod = tpa.tpatencion_cod
INNER JOIN sch_clinica.tbl_negociacionprecio np on
fin.ordinternamiento_ncod = np.negociacionprecio_cod
left join sch_clinica.tbl_hospitalizacion hosp on
oa.ordatencion_cod = hosp.hospitalizacion_oacod
left join 
(
    select
            *
        from
        (
        select distinct
            q.quirofano_oacod,
            q.quirofano_oicod,
            qpa.quirofano_profatencion_pacod,
            RANK () OVER ( PARTITION BY q.quirofano_oacod, q.quirofano_oicod ORDER BY qpa.quirofano_profatencion_cod DESC) AS item 
        from
            sch_clinica.tbl_quirofano q 
            inner join sch_clinica.tbl_quirofano_profatencion qpa on
            q.quirofano_cod = qpa.quirofano_profatencion_cod
        where
            qpa.quirofano_profatencion_principal = 1 and
            qpa.quirofano_profatencion_reghabilitado = 1
        ) cons
        where
            cons.item = 1
) AS QUI ON (oa.ordatencion_cod = QUI.quirofano_oacod)
left join sch_clinica.vw_persona med on
coalesce(hosp.hospitalizacion_pacod, QUI.quirofano_profatencion_pacod) = med.vw_persona_cod
group by
	1,2,3,4,5,6,7,8,9,10,11,14,15
order by
	1,2,3