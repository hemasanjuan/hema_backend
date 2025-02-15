select 
to_char(dvs.docvntsunat_femision,'dd/mm/yyyy'),
dvs.docvntsunat_cod,
per.persona_apep ||' '|| per.persona_apem ||' '|| per.persona_nmb1,
dvs.docvntsunat_totneto,
fon.entfondo_movimiento_serv_motivo_dsc
from sch_clinica.tbl_docvntsunat dvs
inner join sch_clinica.tbl_entfondo_movimiento_serv fon on dvs.docvntsunat_cod = fon.entfondo_movimiento_serv_docvntsunat_ref
inner join sch_clinica.tbl_persona per on dvs.docvntsunat_cliente_cod = per.persona_cod
where dvs.docvntsunat_femision between '01/01/2022' and '20/01/2022'


SELECT 
	DVS.docvntsunat_cod,
	DVS.docvntsunat_oa_codigo,
	DVS.docvntsunat_totalventa /1.18,
    DVS.docvntsunat_totneto / 1.18
from sch_clinica.tbl_docvntsunat DVS
	where 
    --DVS.docvntsunat_totalventa = 60.18 and
    DVS.docvntsunat_oa_codigo IN
(
'302559',
'297730',
'301739',
'292688',
'279902',
'309009',
'293166',
'298285',
'297940',
'298573',
'303906',
'273495',
'280462',
'292673',
'299072',
'309193',
'294153',
'304942',
'310202',
'298340',
'299930',
'303469',
'310071',
'294960',
'310106',
'310108',
'310782',
'305514',
'290871',
'295674',
'294957',
'306218',
'311698',
'296235',
'296119',
'296068',
'311533',
'282711',
'296403',
'306497',
'291317',
'307610',
'312149',
'301862',
'288268',
'288267',
'288266',
'292207',
'308132',
'312358',
'312348',
'296912'
 )