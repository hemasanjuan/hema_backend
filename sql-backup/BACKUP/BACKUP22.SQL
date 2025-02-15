select
	tmp.indice,
    tmp.value,
    DVS.docvntsunat_femision,
    dvs.docvntsunat_cod,
    dvs.docvntsunat_usrcreacion,
    dvs.docvntsunat_totneto,
    nc.docvntsunat_femision,
    dvsr.docvntsunat_referencia_cod,
    dvsr.docvntsunat_referencia_concepto,
    dvsr.docvntsunat_referencia_usrcreacion
from
	sch_clinica.tmp_historias tmp
    inner join sch_clinica.tbl_docvntsunat dvs on
    tmp.value = dvs.docvntsunat_cod
    inner join sch_clinica.tbl_docvntsunat_referencia dvsr on
    dvs.docvntsunat_cod = dvsr.docvntsunat_referencia_docref_cod
    inner join sch_clinica.tbl_docvntsunat nc on
    dvsr.docvntsunat_referencia_cod = nc.docvntsunat_cod
order by
	1