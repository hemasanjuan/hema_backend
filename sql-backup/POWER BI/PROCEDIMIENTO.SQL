select
  sch_clinica.sp_mes_letras(date(hp.hstconsulta_procmed_fsolicitud))	as "MES",
  date(hp.hstconsulta_procmed_fsolicitud) as "FECHA ATENCION",
  p.persona_nrodoc as "DNI PACIENTE",
  p.persona_apep || ' ' || p.persona_apem || ' ' || p.persona_nmb1 || ' ' || p.persona_nmb2 as "PACIENTE",
  sch_clinica.sp_edad_porfecha(p.persona_fecnac, hp.hstconsulta_procmed_fsolicitud) as "EDAD",
  p.persona_sexo as "SEXO",
  tp.tppaciente_dsc as "TIPO DE PACIENTE",
  case when tp.tppaciente_cod = 2 then np.negociacionprecio_dsc else tp.tppaciente_dsc end as "DESCRIPCION TIPO PACIENTE",
  sd.segus_det_dsc as "PROCEDIMIENTO",
  em.espprofatencion_dsc AS "ESPECIALIDAD",  
  vm.vw_persona_nombres as "MEDICO",
  case when dvsd.docvntsunatdet_preciouniventa < 0 then dvsd.docvntsunatdet_totneto else dvsd.docvntsunatdet_cantidad * dvsd.docvntsunatdet_preciouniventa end as "VALOR VENTA",  
  hp.hstconsulta_procmed_cantidad as "CANT",
  oa.ordatencion_cod,
  dvs.docvntsunat_serie AS "SERIE",
  dvs.docvntsunat_nro AS "NUMERO",
  DVS.docvntsunat_femision AS "FECHA_EMISION",
  DVS.docvntsunat_totalventa AS "TOTAL_VENTA",
  DVS.docvntsunat_totneto as "TOTAL_NETO"
from
  sch_clinica.tbl_hstconsulta_procmed hp
  inner join sch_clinica.tbl_hcprocmed_prvnt hpv on (hp.hstconsulta_procmed_cod = hpv.hcprocmed_prvnt_pmcod)
  inner join sch_clinica.tbl_docvntsunat dvs on (hpv.hcprocmed_prvnt_prvntcod = dvs.docvntsunat_predocvnt_cod
  and dvs.docvntsunat_anulado = 0 and coalesce(dvs.docvntsunat_tpref, 0) = 0)
  inner join sch_clinica.tbl_docvntsunatdet dvsd on
  dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod
  left join sch_clinica.tbl_predocvnt pv on (dvs.docvntsunat_predocvnt_cod = pv.predocvnt_cod)
  left join sch_clinica.tbl_ordatencion oa on (hp.hstconsulta_procmed_oacod_creador = oa.ordatencion_cod)
  left join sch_clinica.tbl_persona p on (coalesce(case when dvs.docvntsunat_tpcliente != 3 then dvs.docvntsunat_cliente_cod end, oa.ordatencion_paciente_cod, pv.predocvnt_paciente_cod) = p.persona_cod)
  left join sch_clinica.tbl_tppaciente tp on (coalesce(oa.ordatencion_tpaciente_cod, 1) = tp.tppaciente_cod)
  left join sch_clinica.tbl_negociacionprecio np on (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)
  left join sch_clinica.tbl_segus_det sd on (hp.hstconsulta_procmed_detsegus_cod = sd.segus_det_cod)
  left join sch_clinica.vw_persona vm on (hp.hstconsulta_procmed_pacod_ejecucion = vm.vw_persona_cod)
  left join sch_clinica.tbl_espprofatencion em on hp.hstconsulta_procmed_emcod_ejecucion = em.espprofatencion_cod
where
  date(hp.hstconsulta_procmed_fsolicitud) >= :finicio and
  date(hp.hstconsulta_procmed_fsolicitud) <= :ffin
  and sd.segus_det_dsc not in (
  'ALMUERZO', 'COMIDA', 'DESAYUNO', 'INFORME MEDICO')
order by
  hp.hstconsulta_procmed_fsolicitud,  p.persona_nrodoc
  
  
  
  
  
  
  
select
  sch_clinica.sp_mes_letras(date(hp.hstconsulta_procmed_fsolicitud))	as "MES",
  date(hp.hstconsulta_procmed_fsolicitud) as "FECHA ATENCION",
  p.persona_nrodoc as "DNI PACIENTE",
  p.persona_apep || ' ' || p.persona_apem || ' ' || p.persona_nmb1 || ' ' || p.persona_nmb2 as "PACIENTE",
  sch_clinica.sp_edad_porfecha(p.persona_fecnac, hp.hstconsulta_procmed_fsolicitud) as "EDAD",
  p.persona_sexo as "SEXO",
  tp.tppaciente_dsc as "TIPO DE PACIENTE",
  case when tp.tppaciente_cod = 2 then np.negociacionprecio_dsc else tp.tppaciente_dsc end as "DESCRIPCION TIPO PACIENTE",
  sd.segus_det_dsc as "PROCEDIMIENTO",
  em.espprofatencion_dsc AS "ESPECIALIDAD",  
  vm.vw_persona_nombres as "MEDICO",
  case when dvsd.docvntsunatdet_preciouniventa < 0 then dvsd.docvntsunatdet_totneto else dvsd.docvntsunatdet_cantidad * dvsd.docvntsunatdet_preciouniventa end as "VALOR VENTA",  
  hp.hstconsulta_procmed_cantidad as "CANT",
  oa.ordatencion_cod,
  dvs.docvntsunat_serie AS "SERIE",
  dvs.docvntsunat_nro AS "NUMERO",
  DVS.docvntsunat_femision AS "FECHA_EMISION",
  DVS.docvntsunat_totalventa AS "TOTAL_VENTA",
  DVS.docvntsunat_totneto as "TOTAL_NETO"
from
  sch_clinica.tbl_hstconsulta_procmed hp
  inner join sch_clinica.tbl_hcprocmed_prvnt hpv on (hp.hstconsulta_procmed_cod = hpv.hcprocmed_prvnt_pmcod)
  inner join sch_clinica.tbl_docvntsunat dvs on (hpv.hcprocmed_prvnt_prvntcod = dvs.docvntsunat_predocvnt_cod
  and dvs.docvntsunat_anulado = 0 and coalesce(dvs.docvntsunat_tpref, 0) = 0)
  inner join sch_clinica.tbl_docvntsunatdet dvsd on
  dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod
  left join sch_clinica.tbl_predocvnt pv on (dvs.docvntsunat_predocvnt_cod = pv.predocvnt_cod)
  left join sch_clinica.tbl_ordatencion oa on (hp.hstconsulta_procmed_oacod_creador = oa.ordatencion_cod)
  left join sch_clinica.tbl_persona p on (coalesce(case when dvs.docvntsunat_tpcliente != 3 then dvs.docvntsunat_cliente_cod end, oa.ordatencion_paciente_cod, pv.predocvnt_paciente_cod) = p.persona_cod)
  left join sch_clinica.tbl_tppaciente tp on (coalesce(oa.ordatencion_tpaciente_cod, 1) = tp.tppaciente_cod)
  left join sch_clinica.tbl_negociacionprecio np on (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)
  left join sch_clinica.tbl_segus_det sd on (hp.hstconsulta_procmed_detsegus_cod = sd.segus_det_cod)
  left join sch_clinica.vw_persona vm on (hp.hstconsulta_procmed_pacod_ejecucion = vm.vw_persona_cod)
  left join sch_clinica.tbl_espprofatencion em on hp.hstconsulta_procmed_emcod_ejecucion = em.espprofatencion_cod
where
  date(hp.hstconsulta_procmed_fsolicitud) >= :finicio and
  date(hp.hstconsulta_procmed_fsolicitud) <= :ffin
  and sd.segus_det_dsc not in (
  'ALMUERZO', 'COMIDA', 'DESAYUNO', 'INFORME MEDICO')
order by
  hp.hstconsulta_procmed_fsolicitud,  p.persona_nrodoc