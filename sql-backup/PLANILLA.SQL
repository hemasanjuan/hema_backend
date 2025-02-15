SELECT 
DVS.docvntsunat_femision,
DVS.
 FROM sch_clinica.tbl_docvntsunat DVS
INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD on (DVS.docvntsunat_cod = DVSD.docvntsunatdet_cod)
INNER JOIN sch_clinica.tbl_ordatencion OA on (dvs.docvntsunat_oa_codigo = OA.ordatencion_cod)
INNER JOIN sch_clinica.tbl_persona PE on (DVS.docvntsunat_cliente_cod = PE.persona_cod)