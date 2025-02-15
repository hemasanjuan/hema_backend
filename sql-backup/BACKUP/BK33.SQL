select docvntsunat_serie,docvntsunat_nro,docvntsunat_femision,docvntsunat_totneto,docvntsunat_totalventa,docvntsunat_oa_codigo from sch_clinica.tbl_docvntsunat
where  
date(docvntsunat_femision) >= :ini and
date(docvntsunat_femision) <= :fin