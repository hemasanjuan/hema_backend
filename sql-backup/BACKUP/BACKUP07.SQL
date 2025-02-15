
select
pfa2.persona_nmb1,
tratamiento_diagnostico_cie10_cod
from sch_clinica.tbl_tratamiento t
inner join sch_clinica.tbl_tratamiento_sesion ts on t.tratamiento_cod = ts.tratamiento_sesion_tcod
left join sch_clinica.tbl_tratamiento_diagnostico td on td.tratamiento_diagnostico_tcod = t.tratamiento_cod
inner join sch_clinica.tbl_persona pfa on ts.tratamiento_sesion_pacod = pfa.persona_cod
INNER JOIN sch_clinica.tbl_paciente pc on t.tratamiento_paciente_cod = pc.paciente_cod
inner join sch_clinica.tbl_persona pfa2 on t.tratamiento_paciente_cod = pfa2.persona_cod
where 
ts.tratamiento_sesion_fprogramada between '01-01-2022' and '26-02-2022'
and pfa2.persona_nrodoc = '91454151'
--and t.tratamiento_estado = 0
--and oa.ordatencion_negprc_emp_aseg_ecod = 317
and ts.tratamiento_sesion_asistencia = 1
--and  td.tratamiento_diagnostico_cie10_cod is null
group by pfa2.persona_nmb1,t.tratamiento_cod, pfa.persona_nmb1 || ' ' || pfa.persona_apep

---- actualizar datos de tratamiento
select T.tratamiento_cod from sch_clinica.tbl_tratamiento_sesion ts
inner join sch_clinica.tbl_tratamiento t on ts.tratamiento_sesion_tcod = t.tratamiento_cod
inner join sch_clinica.tbl_tratamiento_venta TV on T.tratamiento_cod = TV.tratamiento_venta_cod_tratamiento
inner join sch_clinica.tbl_docvntsunat DVS on TV.tratamiento_venta_docvntsunat_cod = DVS.docvntsunat_cod
inner join sch_clinica.tbl_ordatencion OA on dvs.docvntsunat_oa_codigo = OA.ordatencion_cod
inner join sch_clinica.tbl_paciente pa on T.tratamiento_paciente_cod = pa.paciente_cod
WHERE oa.ordatencion_negprc_emp_aseg_ecod = 317
and oa.ordatencion_cod = :orden
group by T.tratamiento_cod

---- actualizar imedico periodo

select 
pac.persona_nmb1 ||' '||pac.persona_apep,
tm.tratamiento_cod,
IM.tratamiento_imedico_comentarios,
im.tratamiento_imedico_finforme,
PE.persona_nmb1 ||' '|| pe.persona_apep 
from sch_clinica.tbl_tratamiento_imedico IM
inner join sch_clinica.tbl_tratamiento TM on IM.tratamiento_imedico_tcod = tm.tratamiento_cod
inner join sch_clinica.tbl_persona PE on (TM.tratamiento_pacod = PE.persona_cod)
inner join sch_clinica.tbl_persona PAC on (TM.tratamiento_paciente_cod = PAC.persona_cod)
where tm.tratamiento_empresacod = 317
--and im.tratamiento_imedico_finforme = '062020'
and TM.tratamiento_fapertura between '26-10-2020' and '26-11-2020'

where 
tratamiento_imedico_finforme = '062020'
tratamiento_cod
54360
54363
54366


SELECT MAX(kairo_precio_cod) FROM SCH_CLINICA.TBL_KAIRO_PRECIO