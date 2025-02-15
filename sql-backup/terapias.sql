-------- PACIENTES CONTROL O VENTA O ----
SELECT
DVS.docvntsunat_cod,
t.tratamiento_cod,
esp.espprofatencion_dsc,
ts.tratamiento_sesion_fprogramada
from sch_clinica.tbl_tratamiento t
inner join sch_clinica.tbl_tratamiento_sesion ts on t.tratamiento_cod = ts.tratamiento_sesion_tcod
INNER JOIN sch_clinica.tbl_espprofatencion esp on t.tratamiento_emcod = esp.espprofatencion_cod
inner join sch_clinica.tbl_persona pac on t.tratamiento_paciente_cod = pac.persona_cod
inner join sch_clinica.tbl_tratamiento_venta TV on T.tratamiento_cod = TV.tratamiento_venta_cod_tratamiento
inner join sch_clinica.tbl_docvntsunat DVS on TV.tratamiento_venta_docvntsunat_cod = DVS.docvntsunat_cod
where
pac.persona_nrodoc = :dni
and DVS.docvntsunat_cod like '105%'
----- 	
select
esp.espprofatencion_dsc,
pfa.persona_cod || '-' || pfa.persona_nmb1 || ' ' || pfa.persona_apep,
t.tratamiento_cod,
tpp.tppaciente_dsc,
--count(ts.tratamiento_sesion_tcod),
 DVS.docvntsunat_femision,
 DVS.docvntsunat_totneto
from sch_clinica.tbl_tratamiento t
inner join sch_clinica.tbl_tratamiento_sesion ts on t.tratamiento_cod = ts.tratamiento_sesion_tcod
INNER JOIN sch_clinica.tbl_espprofatencion esp on t.tratamiento_emcod = esp.espprofatencion_cod
inner join sch_clinica.tbl_persona pfa on ts.tratamiento_sesion_pacod = pfa.persona_cod
inner join sch_clinica.tbl_tratamiento_venta TV on T.tratamiento_cod = TV.tratamiento_venta_cod_tratamiento
inner join sch_clinica.tbl_docvntsunat DVS on TV.tratamiento_venta_docvntsunat_cod = DVS.docvntsunat_cod
inner join sch_clinica.tbl_ordatencion OA on dvs.docvntsunat_oa_codigo = OA.ordatencion_cod
inner join sch_clinica.tbl_tppaciente tpp on oa.ordatencion_tpaciente_cod = tpp.tppaciente_cod
inner join sch_clinica.tbl_persona PER on t.tratamiento_paciente_cod = PER.persona_cod
where
ts.tratamiento_sesion_fprogramada between '01-08-2021' and '03-08-2021'
--and t.tratamiento_estado = 0
and ts.tratamiento_sesion_asistencia = 1
AND PER.persona_nrodoc = '43832836'
group by
esp.espprofatencion_dsc,
pfa.persona_cod || '-' || pfa.persona_nmb1 || ' ' || pfa.persona_apep,
tpp.tppaciente_dsc
--ts.tratamiento_sesion_tcod

--- sesiones
select
esp.espprofatencion_dsc,
ts.tratamiento_sesion_fprogramada,
t.tratamiento_cod
--pe.persona_nmb1 || ' ' || pe.persona_apep,
--tpp.tppaciente_dsc
from
sch_clinica.tbl_tratamiento_sesion ts
inner join sch_clinica.tbl_tratamiento t on ts.tratamiento_sesion_tcod = t.tratamiento_cod
inner join sch_clinica.tbl_persona pe on ts.tratamiento_sesion_pacod = pe.persona_cod
inner join sch_clinica.tbl_tratamiento_venta TV on T.tratamiento_cod = TV.tratamiento_venta_cod_tratamiento
inner join sch_clinica.tbl_docvntsunat DVS on TV.tratamiento_venta_docvntsunat_cod = DVS.docvntsunat_cod
inner join sch_clinica.tbl_ordatencion OA on dvs.docvntsunat_oa_codigo = OA.ordatencion_cod
inner join sch_clinica.tbl_tppaciente tpp on oa.ordatencion_tpaciente_cod = tpp.tppaciente_cod
INNER JOIN sch_clinica.tbl_espprofatencion esp on t.tratamiento_emcod = esp.espprofatencion_cod
where
--ts.tratamiento_sesion_pacod = '188806'
--esp.espprofatencion_cod = 102
 ts.tratamiento_sesion_fprogramada between '03-06-2021' and '04-06-2021'
and ts.tratamiento_sesion_asistencia = 0
group by esp.espprofatencion_dsc, ts.tratamiento_sesion_fprogramada, t.tratamiento_cod
-----------------------------------CANTIDAD DE TERAPIAS POR ESPECIALIDAD Y TIPO DE PACIENTE ---------------
select
esp.espprofatencion_dsc,
t.tratamiento_tppaciente_cod,
tpp.tppaciente_dsc,
DATE_PART('month',ts.tratamiento_sesion_fprogramada),
count(ts.*)
from
sch_clinica.tbl_tratamiento_sesion ts
inner join sch_clinica.tbl_tratamiento t on ts.tratamiento_sesion_tcod = t.tratamiento_cod
inner join sch_clinica.tbl_espprofatencion esp on t.tratamiento_emcod = esp.espprofatencion_cod
inner join sch_clinica.tbl_tppaciente tpp on t.tratamiento_tppaciente_cod = tpp.tppaciente_cod

where
--ts.tratamiento_sesion_pacod = '188806'
ts.tratamiento_sesion_fprogramada between '01/01/2019 08:00:00' and '31/12/2019 20:00:00'
and ts.tratamiento_sesion_asistencia = 1
--AND t.tratamiento_emcod != 93
--and oa.ordatencion_negprc_emp_aseg_ecod=317
group by 
esp.espprofatencion_dsc,
t.tratamiento_tppaciente_cod,
tpp.tppaciente_dsc,
DATE_PART('month',ts.tratamiento_sesion_fprogramada)
order by 1,2


select pe.* from sch_clinica.tbl_persona pe
inner join sch_clinica.tbl_docvntsunat dvs on pe.persona_cod = dvs.docvntsunat_cliente_cod
inner join sch_clinica.tbl_paciente pac on pe.persona_cod = pac.paciente_cod
where pe.persona_fecnac is null
and dvs.docvntsunat_femision between '01-05-2021' and '28-05-2021'
group by pe.persona_cod

select pe.* from sch_clinica.tbl_persona pe
inner join sch_clinica.tbl_citamedica cm on pe.persona_cod = cm.citamedica_persona_cod
--inner join sch_clinica.tbl_docvntsunat dvs on pe.persona_cod = dvs.docvntsunat_cliente_cod
where pe.persona_sexo is null
and cm.citamedica_fregistro between '01-05-2020' and '25-05-2020'
group by pe.persona_cod

select pe.* from sch_clinica.tbl_persona pe
inner join sch_clinica.tbl_paciente pac on pe.persona_cod = pac.paciente_cod
inner join sch_clinica.tbl_docvntsunat dvs on pe.persona_cod = dvs.docvntsunat_cliente_cod
where pe.persona_fecnac is NULL
and dvs.docvntsunat_femision between '01-05-2020' and '25-05-2020'	
group by pe.persona_cod


--informes medicos terapia vacios
SELECT 
tm.tratamiento_imedico_tcod as tratamiento,
pe.persona_apep || ' ' || pe.persona_nmb1 as paciente,
em.espprofatencion_dsc as area
FROM sch_clinica.tbl_tratamiento_imedico tm
inner join sch_clinica.tbl_tratamiento t on tm.tratamiento_imedico_tcod = t.tratamiento_cod
inner join sch_clinica.tbl_paciente pa on t.tratamiento_paciente_cod = pa.paciente_cod
inner join sch_clinica.tbl_persona pe on pa.paciente_cod = pe.persona_cod
inner join sch_clinica.tbl_espprofatencion em on t.tratamiento_emcod = em.espprofatencion_cod
where tm.tratamiento_imedico_finforme = '062020'
and tm.tratamiento_imedico_comentarios = ''
order by tm.tratamiento_imedico_tcod

--DIAGNOSTICOS medicos terapia vacios
SELECT 
t.tratamiento_cod,
pe.persona_apep || ' ' || pe.persona_nmb1 as paciente,
em.espprofatencion_dsc as area
FROM sch_clinica.tbl_tratamiento_diagnostico td
RIGHT join sch_clinica.tbl_tratamiento t on td.tratamiento_diagnostico_tcod = t.tratamiento_cod
inner join sch_clinica.tbl_tratamiento_sesion ts on t.tratamiento_cod = ts.tratamiento_sesion_tcod
inner join sch_clinica.tbl_persona pe on t.tratamiento_paciente_cod = pe.persona_cod
inner join sch_clinica.tbl_espprofatencion em on t.tratamiento_emcod = em.espprofatencion_cod
where 
td.tratamiento_diagnostico_cie10_cod is null
and ts.tratamiento_sesion_asistencia = 1
and ts.tratamiento_sesion_fprogramada between '26-11-2020' and '26-12-2020'	
order by 
t.tratamiento_cod,
pe.persona_apep || ' ' || pe.persona_nmb1,
em.espprofatencion_dsc 
----- por pacietne
select
esp.espprofatencion_dsc,
--t.tratamiento_tppaciente_cod
t.tratamiento_paciente_cod,
pe.persona_nmb1,
count(ts.*)
from
sch_clinica.tbl_tratamiento_sesion ts
inner join sch_clinica.tbl_tratamiento t on ts.tratamiento_sesion_tcod = t.tratamiento_cod
INNER JOIN sch_clinica.tbl_espprofatencion esp on t.tratamiento_emcod = esp.espprofatencion_cod
inner join sch_clinica.tbl_tppaciente tpp on t.tratamiento_tppaciente_cod = tpp.tppaciente_cod
inner join sch_clinica.tbl_persona pe on(t.tratamiento_paciente_cod = pe.persona_cod)
where
--ts.tratamiento_sesion_pacod = '188806'
ts.tratamiento_sesion_fprogramada between '26/06/2020 08:00:00' and '16/07/2020 20:00:00'
and ts.tratamiento_sesion_asistencia = 1
--AND t.tratamiento_emcod != 93
--and oa.ordatencion_negprc_emp_aseg_ecod=317
group by esp.espprofatencion_dsc, t.tratamiento_paciente_cod, pe.persona_nmb1

--------------CANTIDA DE TERAPIAS POR TIPO DE PACOENTE-------------------------------elect

select
DATE_PART('month',ts.tratamiento_sesion_fprogramada),
esp.espprofatencion_dsc,
 (SELECT ANIO FROM 
     sch_clinica.sp_util_diferencia_fecha(pe.persona_fecnac, DATE(ts.tratamiento_sesion_fprogramada) - 1)
     AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS "EDAD",
tpp.tppaciente_dsc,
np.negociacionprecio_dsc
-- ,
-- COUNT(T.tratamiento_paciente_cod)
from
sch_clinica.tbl_tratamiento_sesion ts
inner join sch_clinica.tbl_tratamiento t on ts.tratamiento_sesion_tcod = t.tratamiento_cod
INNER JOIN sch_clinica.tbl_espprofatencion esp on t.tratamiento_emcod = esp.espprofatencion_cod
inner join sch_clinica.tbl_tppaciente tpp on t.tratamiento_tppaciente_cod = tpp.tppaciente_cod
INNER join sch_clinica.tbl_negociacionprecio np on (t.tratamiento_negociacion_cod = np.negociacionprecio_cod)
INNER JOIN sch_clinica.tbl_persona pe on (t.tratamiento_paciente_cod = pe.persona_cod)
where
--ts.tratamiento_sesion_pacod = '188806'
ts.tratamiento_sesion_fprogramada between '01/08/2021 08:00:00' and '03/08/2021 20:00:00'
and ts.tratamiento_sesion_asistencia = 1
-- GROUP BY
-- DATE_PART('month',ts.tratamiento_sesion_fprogramada),esp.espprofatencion_dsc,"EDAD",tpp.tppaciente_dsc,np.negociacionprecio_dsc


-------------------- TRATAMIENTO POR PACIENTE PAGADO Y SESIONES------------------
SELECT
T.tratamiento_cod as CODIGO,
TS.tratamiento_sesion_fprogramada AS FECHA,
PE.persona_nmb1 ||' '|| PE.persona_nmb2 ||' '|| PE.persona_apep AS PACIENTE,
CASE 
	WHEN TS.tratamiento_sesion_asistencia = 1 THEN 'ASISTIO' 
	WHEN TS.tratamiento_sesion_asistencia = 0 THEN 'PENDIENTE'
END AS ASISTENCIA,
DVS.docvntsunat_cod AS BOLETA,
TS.tratamiento_sesion_predocvnt as PREVENTA,
ESP.espprofatencion_dsc as ESPECIALIDAD,
DVS.docvntsunat_totneto AS PAGO,
PT.persona_nmb1 ||' '|| PT.persona_apep AS TERAPEUTA
FROM sch_clinica.tbl_tratamiento_sesion TS
LEFT JOIN sch_clinica.tbl_tratamiento_venta TV ON (TS.tratamiento_sesion_tratamiento_venta_cod = TV.tratamiento_venta_cod)
LEFT JOIN sch_clinica.tbl_docvntsunat DVS ON (TV.tratamiento_venta_docvntsunat_cod = DVS.docvntsunat_cod)
INNER JOIN sch_clinica.tbl_tratamiento T ON (TS.tratamiento_sesion_tcod = T.tratamiento_cod)
INNER JOIN sch_clinica.tbl_persona PE on (T.tratamiento_paciente_cod = PE.persona_cod)
INNER JOIN sch_clinica.tbl_paciente PA on (PE.persona_cod = PA.paciente_cod)
INNER JOIN sch_clinica.tbl_espprofatencion ESP on T.tratamiento_emcod = ESP.espprofatencion_cod
INNER JOIN sch_clinica.tbl_persona PT on (TS.tratamiento_sesion_pacod = PT.persona_cod)
where 
TS.tratamiento_sesion_pacod = 221051 
and TS.tratamiento_sesion_fprogramada between '21/09/2021' and '22/09/2021'
and TS.tratamiento_sesion_asistencia =1

ORDER BY 2
------cantidad------
SELECT
to_char(TS.tratamiento_sesion_fprogramada,'dd/mm/yyyy') AS FECHA,
(TS.tratamiento_sesion_cod),
T.tratamiento_cod


FROM sch_clinica.tbl_tratamiento_sesion TS
LEFT JOIN sch_clinica.tbl_tratamiento_venta TV ON (TS.tratamiento_sesion_tratamiento_venta_cod = TV.tratamiento_venta_cod)
LEFT JOIN sch_clinica.tbl_docvntsunat DVS ON (TV.tratamiento_venta_docvntsunat_cod = DVS.docvntsunat_cod)
INNER JOIN sch_clinica.tbl_tratamiento T ON (TS.tratamiento_sesion_tcod = T.tratamiento_cod)
INNER JOIN sch_clinica.tbl_persona PE on (T.tratamiento_paciente_cod = PE.persona_cod)
INNER JOIN sch_clinica.tbl_paciente PA on (PE.persona_cod = PA.paciente_cod)
INNER JOIN sch_clinica.tbl_espprofatencion ESP on T.tratamiento_emcod = ESP.espprofatencion_cod
INNER JOIN sch_clinica.tbl_persona PT on (TS.tratamiento_sesion_pacod = PT.persona_cod)
where 
TS.tratamiento_sesion_pacod = 33543 
and TS.tratamiento_sesion_fprogramada between '23/10/2021' and '24/10/2021'
and TS.tratamiento_sesion_asistencia =0
group by
to_char(TS.tratamiento_sesion_fprogramada,'dd/mm/yyyy')
ORDER BY 1