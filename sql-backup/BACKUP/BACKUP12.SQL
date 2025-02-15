SELECT 
		tpp.paciente_hstclinica_cod ,
        (SELECT MAX(DVSS.docvntsunat_femision) FROM sch_clinica.tbl_docvntsunat DVSS 
        WHERE  DVSS.docvntsunat_cliente_cod=per.persona_cod) AS "FECHA"--,
    --per.persona_nrodoc,
    --per.persona_nmb1 || ' '  || per.persona_nmb2 || ' '  || PER.persona_apep || ' ' || per.persona_apem as nombre_paciente -- ,
--    dvsd.docvntsunatdet_cantidad,  
--    ROUND(CAST(dvsd.docvntsunatdet_totneto * (1 + dvs.docvntsunat_igv) AS NUMERIC), 2) as monto_cobrado
FROM sch_clinica.tbl_persona per  
    LEFT JOIN sch_clinica.tbl_paciente tpp ON (tpp.paciente_cod=per.persona_cod)
    where per.persona_cod>198658
 
    
select * from sch_clinica.tbl_persona per  

SELECT 
		-- tpp.paciente_hstclinica_cod-- ,
--        (SELECT MAX(DVSS.docvntsunat_femision) FROM sch_clinica.tbl_docvntsunat DVSS 
--        WHERE  DVSS.docvntsunat_cliente_cod=per.persona_cod) AS "FECHA"--,
    --per.persona_nrodoc,
    --per.persona_nmb1 || ' '  || per.persona_nmb2 || ' '  || PER.persona_apep || ' ' || per.persona_apem as nombre_paciente -- ,
--    dvsd.docvntsunatdet_cantidad,  
--    ROUND(CAST(dvsd.docvntsunatdet_totneto * (1 + dvs.docvntsunat_igv) AS NUMERIC), 2) as monto_cobrado
FROM sch_clinica.tbl_docvntsunat DVS 
	INNER JOIN sch_clinica.tbl_persona per ON dvs.docvntsunat_cliente_cod = per.persona_cod
    LEFT JOIN sch_clinica.tbl_paciente tpp ON (tpp.paciente_cod=per.persona_cod)
WHERE
 dvs.docvntsunat_anulado = 0
    AND dvs.docvntsunat_tpref = 0
    AND date(dvs.docvntsunat_femision) < '01/01/2015' 
    group by tpp.paciente_hstclinica_cod 
  
 
 SELECT DVS.docvntsunat_cliente_cod,PER.persona_nmb1,tpp.paciente_hstclinica_cod, date(dvs.docvntsunat_femision)
FROM sch_clinica.tbl_docvntsunat DVS 
	INNER JOIN sch_clinica.tbl_persona per ON dvs.docvntsunat_cliente_cod = per.persona_cod
    LEFT JOIN sch_clinica.tbl_paciente tpp ON (tpp.paciente_cod=per.persona_cod)
    WHERE
 dvs.docvntsunat_anulado = 0
    AND dvs.docvntsunat_tpref = 0
    AND date(dvs.docvntsunat_femision) < '01/01/2015'  
  
 159154