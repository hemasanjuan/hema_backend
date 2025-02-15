select * from sch_clinica.tbl_tratamiento_diagnostico 
where tratamiento_diagnostico_tcod 
in (select tratamiento_diagnostico_tcod  from sch_clinica.tbl_tratamiento t inner join sch_clinica.tbl_paciente tp 
on t.tratamiento_paciente_cod = tp.paciente_cod inner join sch_clinica.tbl_persona tp2 
on t.tratamiento_paciente_cod = tp2.persona_cod 
where tp2.persona_nrodoc = '91138924' and tratamiento_fapertura between '01/01/2023' and '31/03/2023')

select * from sch_clinica.tbl_paciente

select * from sch_clinica.tbl_persona







select * from sch_clinica.tbl_tratamiento t inner join sch_clinica.tbl_paciente tp 
on t.tratamiento_paciente_cod = tp.paciente_cod inner join  sch_clinica.tbl_persona tp2 
on t.tratamiento_paciente_cod = tp2.persona_cod 
where tp2.persona_nrodoc = '79551240' and tratamiento_fapertura between '01/07/2023' and '24/07/2023'