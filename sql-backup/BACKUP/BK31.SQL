select 
ordatencion_cod as oa,
inte.ordinternamiento_cod as OI,
--ordatencion_paciente_cod,
--data paciente
pc.paciente_hstclinica_cod as historia,
p.persona_nrodoc as nrodoc,
p.persona_apep ||' '|| p.persona_apem ||' '|| p.persona_nmb1 ||' '|| p.persona_nmb2 as paciente, 
p.persona_sexo as sexo,
p.persona_fecnac,

--ordatencion_tpaciente_cod,
tpp.tppaciente_dsc,
ordatencion_fregistro,
ordatencion_fcierre,
--ordatencion_negprc_emp_aseg_ecod,
emp.empresa_ruc ||' '|| emp.empresa_rznsocial as empresa,
emp.empresa_ruc ||' '|| emp.empresa_rznsocial as aseguradora,
--ordatencion_negprc_emp_aseg_acod,
--ordatencion_negprc_emp_aseg_ncod,
neg.negociacionprecio_dsc,
--ordatencion_tpatencion_cod,
tpa.tpatencion_dsc,
--ordatencion_estado, --aplica para hospi
case
	when ordatencion_estado=0 then 'ABIERTA'
	when ordatencion_estado=1 then  'CERRADA'
	when  ordatencion_estado=2 then  'INACTIVO'
end as estado,

ordatencion_aseg_vntcod, -- factura a la aseguradora
ordatencion_cierre_obs, -- motivo de cierrre adm
ordatencion_ffin,
--/venta
vnt.docvntsunat_serie,
vnt.docvntsunat_nro,
vnt.docvntsunat_femision,
vnt.docvntsunat_totneto,
vnt.docvntsunat_totalventa

--select * from sch_clinica.tbl_docvntsunat

from sch_clinica.tbl_ordatencion oa
inner join sch_clinica.tbl_paciente pc on pc.paciente_cod=oa.ordatencion_paciente_cod 
inner join sch_clinica.tbl_persona p on pc.paciente_cod =p.persona_cod 
inner join sch_clinica.tbl_docvntsunat vnt on vnt.docvntsunat_oa_codigo =oa.ordatencion_cod 
inner join sch_clinica.tbl_tppaciente tpp on tpp.tppaciente_cod = oa.ordatencion_tpaciente_cod 
inner join sch_clinica.tbl_empresa emp on emp.empresa_cod = oa.ordatencion_negprc_emp_aseg_ecod 
inner join sch_clinica.tbl_negociacionprecio  neg on neg.negociacionprecio_cod =oa.ordatencion_negprc_emp_aseg_ncod 
inner join sch_clinica.tbl_tpatencion tpa on tpa.tpatencion_cod =oa.ordatencion_tpatencion_cod 
FULL join sch_clinica.tbl_ordeninternamiento inte on inte.ordinternamiento_oacod =oa.ordatencion_cod 
where  
date(oa.ordatencion_fregistro) >= :fechaini and
date(oa.ordatencion_fregistro) <= :fechafin