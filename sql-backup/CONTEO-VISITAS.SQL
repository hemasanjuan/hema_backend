
--@author jmayhua

Select 
  Coalesce (dist.distrito_dsc, 'DESCONOCIDO'),
  Coalesce (ciu.ciudad_dsc, 'DESCONOCIDO'),
  count(per.persona_cod)
from
  sch_clinica.tbl_docvntsunat dvs
  inner join sch_clinica.tbl_persona per on (dvs.docvntsunat_cliente_cod = per.persona_cod )
  left join sch_clinica.tbl_distrito dist on (per.persona_ubigeo = dist.distrito_cod)
  left join sch_clinica.tbl_ciudad ciu on (per.persona_ciudad = ciu.ciudad_cod and dist.distrito_ciudad_cod = ciu.ciudad_cod)

Where
  dvs.docvntsunat_tpcliente <> 3 and
  
  --BUSQUEDA POR AÑO
  	to_char(dvs.docvntsunat_femision , 'yyyy') = '2021'
  --BUSQUEDA POR MES
  	--to_char(dvs.docvntsunat_femision , 'yyyyMM') = '201908'
  --BUSQEUDA POR DIA
  	--to_char(dvs.docvntsunat_femision , 'yyyyMMdd') = '20190801'
  --BUSUQEDA POR INTERVALO
   --to_char(dvs.docvntsunat_femision , 'yyyyMMdd') > '20190801' and to_char(dvs.docvntsunat_femision , 'yyyyMMdd') < '20190810'

group by dist.distrito_dsc, ciu.ciudad_dsc

SELECT  
dvs.docvntsunat_femision,
dvs.docvntsunat_cod,
dvs.docvntsunat_usrcreacion
FROM sch_clinica.tbl_docvntsunat dvs
INNER JOIN sch_clinica.tbl_persona per on dvs.docvntsunat_cliente_cod = per.persona_cod

where --per.persona_nrodoc = '25191222'
To_char(dvs.docvntsunat_femision , 'yyyyMMdd') > '20190101' and to_char(dvs.docvntsunat_femision , 'yyyyMMdd') < '20191231'


select * from