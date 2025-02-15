select
--to_char(oa.ordatencion_fregistro,'dd-mm-yyyy'),
--OA.ordatencion_paciente_cod as Paciente,
pe.persona_fecnac, 
pe.persona_sexo,
oad.ordatenciondet_diagnostico_ccod as cie10,
cie.cie10_dsc as descripcion
--PE.persona_nmb1 ||' '|| PE.persona_apep as Persona,
--PE.persona_fecnac,
--OAD.ordatenciondet_diagnostico_ccod
from sch_clinica.tbl_ordatencion OA 
inner join sch_clinica.tbl_ordatenciondet_diagnostico OAD on OA.ordatencion_cod = OAD.ordatenciondet_diagnostico_oacod
inner join sch_clinica.tbl_cie10 CIE on OAD.ordatenciondet_diagnostico_ccod = CIE.cie10_cod
inner join sch_clinica.tbl_paciente PA on OA.ordatencion_paciente_cod = PA.paciente_cod
inner join sch_clinica.tbl_persona PE on PA.paciente_cod = PE.persona_cod
where 
--OAD.ordatenciondet_diagnostico_ccod ='O62.4'
--OA.ordatencion_negprc_emp_aseg_ecod = 317
 OA.ordatencion_fcreacion between '01-03-2021' and '31-03-2021'