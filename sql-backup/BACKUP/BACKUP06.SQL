select 
T.tratamiento_cod as TXR,
PA.paciente_hstclinica_cod,
IM.tratamiento_imedico_comentarios,
im.tratamiento_imedico_finforme
from sch_clinica.tbl_tratamiento T
inner join sch_clinica.tbl_tratamiento_sesion TS on T.tratamiento_cod = ts.tratamiento_sesion_tcod
inner join sch_clinica.tbl_tratamiento_imedico IM on T.tratamiento_cod = im.tratamiento_imedico_tcod
inner join sch_clinica.tbl_paciente PA on T.tratamiento_paciente_cod = pa.paciente_cod
WHERE
pa.paciente_hstclinica_cod = '36243'
group by 
T.tratamiento_cod,
PA.paciente_hstclinica_cod,
IM.tratamiento_imedico_comentarios,
im.tratamiento_imedico_finforme

--- trtamientos por periosod detimepok
select 
t.tratamiento_cod,
pa.paciente_hstclinica_cod,
OA.ordatencion_cod,
P.persona_apep
from sch_clinica.tbl_tratamiento T
inner join sch_clinica.tbl_tratamiento_sesion TS on T.tratamiento_cod = ts.tratamiento_sesion_tcod
left JOIN sch_clinica.tbl_tratamiento_diagnostico TD on T.tratamiento_cod = TD.tratamiento_diagnostico_tcod
inner join sch_clinica.tbl_tratamiento_venta TV on T.tratamiento_cod = TV.tratamiento_venta_cod_tratamiento
inner join sch_clinica.tbl_docvntsunat DVS on TV.tratamiento_venta_docvntsunat_cod = DVS.docvntsunat_cod
inner join sch_clinica.tbl_ordatencion OA on dvs.docvntsunat_oa_codigo = OA.ordatencion_cod
inner join sch_clinica.tbl_paciente PA on T.tratamiento_paciente_cod = pa.paciente_cod
inner join sch_clinica.tbl_persona P on T.tratamiento_pacod = P.persona_cod
WHERE
--pa.paciente_hstclinica_cod = '86784'and 
OA.ordatencion_negprc_emp_aseg_ecod = 317 and
T.tratamiento_fcreacion between '26-05-2020' and '25-06-2020'
 and td.tratamiento_diagnostico_tcod is null
group by t.tratamiento_cod,
pa.paciente_hstclinica_cod,
OA.ordatencion_cod,
P.persona_apep

---

select 
T.tratamiento_cod as TXR,
OA.ordatencion_cod as orden,
PA.paciente_hstclinica_cod as hisotira,
im.tratamiento_imedico_comentarios,
P.persona_nmb1 || ' ' || P.persona_apep
from sch_clinica.tbl_tratamiento T
inner join sch_clinica.tbl_tratamiento_sesion TS on T.tratamiento_cod = ts.tratamiento_sesion_tcod
left join sch_clinica.tbl_tratamiento_imedico IM on T.tratamiento_cod = im.tratamiento_imedico_tcod
inner join sch_clinica.tbl_tratamiento_diagnostico TD on T.tratamiento_cod = TD.tratamiento_diagnostico_tcod
inner join sch_clinica.tbl_tratamiento_venta TV on T.tratamiento_cod = TV.tratamiento_venta_cod_tratamiento
inner join sch_clinica.tbl_docvntsunat DVS on TV.tratamiento_venta_docvntsunat_cod = DVS.docvntsunat_cod
inner join sch_clinica.tbl_ordatencion OA on dvs.docvntsunat_oa_codigo = OA.ordatencion_cod
inner join sch_clinica.tbl_paciente PA on T.tratamiento_paciente_cod = pa.paciente_cod
inner join sch_clinica.tbl_persona P on T.tratamiento_pacod = P.persona_cod
WHERE
OA.ordatencion_negprc_emp_aseg_ecod = 317 and
T.tratamiento_fcreacion between '26-05-2020' and '25-06-2020'
--and IM.tratamiento_imedico_comentarios is null
group by 
T.tratamiento_cod,OA.ordatencion_cod,PA.paciente_hstclinica_cod,im.tratamiento_imedico_comentarios,
P.persona_nmb1 || ' ' || P.persona_apep

----PACIENTE DATOS DEL PACIENTE
SELECT 
pac.paciente_hstclinica_cod as historia,
pe.persona_apep ||' '|| pe.persona_apem||' '||pe.persona_nmb1 as paciente
from sch_clinica.tbl_paciente pac 
inner join sch_clinica.tbl_persona pe on pac.paciente_cod = pe.persona_cod
where pac.paciente_hstclinica_cod = :historia


--- paciente informe
select 
t.tratamiento_cod,
pa.paciente_hstclinica_cod,
td.tratamiento_diagnostico_cie10_cod,
IM.tratamiento_imedico_comentarios,
P.persona_apep
from sch_clinica.tbl_tratamiento T
inner join sch_clinica.tbl_tratamiento_sesion TS on T.tratamiento_cod = ts.tratamiento_sesion_tcod
left JOIN sch_clinica.tbl_tratamiento_diagnostico TD on TD.tratamiento_diagnostico_tcod = T.tratamiento_cod
left join sch_clinica.tbl_tratamiento_imedico IM on IM.tratamiento_imedico_tcod = T.tratamiento_cod
inner join sch_clinica.tbl_tratamiento_venta TV on T.tratamiento_cod = TV.tratamiento_venta_cod_tratamiento
inner join sch_clinica.tbl_docvntsunat DVS on TV.tratamiento_venta_docvntsunat_cod = DVS.docvntsunat_cod
inner join sch_clinica.tbl_ordatencion OA on dvs.docvntsunat_oa_codigo = OA.ordatencion_cod
inner join sch_clinica.tbl_paciente PA on T.tratamiento_paciente_cod = pa.paciente_cod
inner join sch_clinica.tbl_persona P on T.tratamiento_pacod = P.persona_cod
WHERE
OA.ordatencion_cod = :OAx   --and TD.tratamiento_diagnostico_tcod is null
group by 
t.tratamiento_cod,
pa.paciente_hstclinica_cod,
td.tratamiento_diagnostico_cie10_cod,
IM.tratamiento_imedico_comentarios,
P.persona_ape