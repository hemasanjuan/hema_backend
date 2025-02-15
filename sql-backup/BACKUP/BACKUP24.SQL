select distinct
    --mrd.maprecintodet_dsc AS "CONSULTORIO",
	per.vw_persona_nombres AS "MEDICO",
    esp.espprofatencion_dsc AS "ESPECIALIDAD",
    DATE(pat.profatencion_turno_hinicioprog) AS "DIA TURNO",
	to_char(pat.profatencion_turno_hinicioprog, 'HH24:MI') AS "HORA INICIO TURNO",
    to_char(pat.profatencion_turno_hfinprog, 'HH24:MI') AS "HORA FIN TURNO",
    turnos.cantidad AS "TURNOS GENERADOS",
    COALESCE(cupos.cantidad, 0) AS "TURNOS VENDIDOS",
    citas.cit AS "CITAS",
    maxmin.min AS "HORA MIN IMPRESION",
    maxmin.max AS "HORA MAX IMPRESION"
from
	sch_clinica.tbl_profatencion_turno pat
    inner join sch_clinica.tbl_hraprofatencion hra on
    (pat.profatencion_turno_pacod = hra.hraprofatencion_pacod and
     pat.profatencion_turno_emcod = hra.hraprofatencion_emcod)
    inner join sch_clinica.tbl_hraprofatenciondet hrad on
    (hrad.hraprofatenciondet_cod = hra.hraprofatencion_cod and
    hrad.hraprofatenciondet_hinicio >= pat.profatencion_turno_hinicioprog and
    hrad.hraprofatenciondet_hfin <= pat.profatencion_turno_hfinprog)
    inner join sch_clinica.vw_persona per on
    (per.vw_persona_cod = pat.profatencion_turno_pacod)
    inner join sch_clinica.tbl_espprofatencion esp on
    (esp.espprofatencion_cod = pat.profatencion_turno_emcod)
    --inner join sch_clinica.tbl_maprecintodet mrd on
    --(mrd.maprecintodet_cod = hrad.hraprofatenciondet_maprecintodet_cod)
    left join
    (
    	select
        	hra1.hraprofatencion_cod as codigo,
            pat1.profatencion_turno_hinicioprog as fecha1,
            pat1.profatencion_turno_hfinprog as fecha2,
        	count(hrad1.hraprofatenciondet_cod) as cantidad
        from
        	sch_clinica.tbl_hraprofatencion hra1
            inner join sch_clinica.tbl_hraprofatenciondet hrad1 on
            (hra1.hraprofatencion_cod = hrad1.hraprofatenciondet_cod)
            inner join sch_clinica.tbl_profatencion_turno pat1 on
            (pat1.profatencion_turno_pacod = hra1.hraprofatencion_pacod and
             pat1.profatencion_turno_emcod = hra1.hraprofatencion_emcod and
             hrad1.hraprofatenciondet_hinicio >= pat1.profatencion_turno_hinicioprog and
             hrad1.hraprofatenciondet_hfin <= pat1.profatencion_turno_hfinprog)
        where
        	date(hrad1.hraprofatenciondet_hinicio) >= '01/08/2023' and
    		date(hrad1.hraprofatenciondet_hinicio) <= '31/08/2023'
        group by
        	1,2,3
    ) as turnos on (turnos.codigo = hra.hraprofatencion_cod and 
    				turnos.fecha1 = pat.profatencion_turno_hinicioprog and
                    turnos.fecha2 = pat.profatencion_turno_hfinprog)
    left join
    (
    	select
        	cm1.citamedica_pacod as prof,
            cm1.citamedica_emcod as espe,
            pat2.profatencion_turno_hinicioprog as fecha1,
            pat2.profatencion_turno_hfinprog as fecha2,
            count(cm1.citamedica_cod) as cantidad
        from
        	sch_clinica.tbl_citamedica cm1
            inner join sch_clinica.tbl_profatencion_turno pat2 on
            (pat2.profatencion_turno_pacod = cm1.citamedica_pacod and
             pat2.profatencion_turno_emcod = cm1.citamedica_emcod and
             cm1.citamedica_fhcita >= pat2.profatencion_turno_hinicioprog and
             cm1.citamedica_fhcita <= pat2.profatencion_turno_hfinprog)
            inner join sch_clinica.tbl_ordatencionamb oamb on
            (oamb.ordatencionamb_citamedica_cod = cm1.citamedica_cod)
            inner join sch_clinica.tbl_ordatenciondet oad on
            (oad.ordatenciondet_ordatencion_cod = oamb.ordatencionamb_ordatenciondet_cod and
             oad.ordatenciondet_item = oamb.ordatencionamb_ordatenciondet_item)
            inner join sch_clinica.tbl_docvntsunat dvs on
            (dvs.docvntsunat_predocvnt_cod = oad.ordatenciondet_predocvnt_cod and
             dvs.docvntsunat_anulado = 0 and dvs.docvntsunat_tpref = 0)
        where
        	cm1.citamedica_estado = 1 and
        	date(pat2.profatencion_turno_hinicioprog) >= '01/08/2023' and
    		date(pat2.profatencion_turno_hinicioprog) <= '31/08/2023'
        group by
        	1,2,3,4
    ) as cupos on (cupos.fecha1 = pat.profatencion_turno_hinicioprog and 
                   cupos.fecha2 = pat.profatencion_turno_hfinprog and 
                   pat.profatencion_turno_pacod = cupos.prof and
                   pat.profatencion_turno_emcod = cupos.espe)
    left join
    (
    	select
        	fechas.prof,
            fechas.espe,
            fechas.fecha1,
            fechas.fecha2,
            array_to_string(array_agg(TO_CHAR(fechas.fcita, 'dd-MM-yyyy HH:MI')), E' || \r\n') as cit
        from
        (
            select
                cm1.citamedica_pacod as prof,
                cm1.citamedica_emcod as espe,
                pat2.profatencion_turno_hinicioprog as fecha1,
                pat2.profatencion_turno_hfinprog as fecha2,
                cm1.citamedica_fhcita as fcita
            from
                sch_clinica.tbl_citamedica cm1
                inner join sch_clinica.tbl_profatencion_turno pat2 on
                (pat2.profatencion_turno_pacod = cm1.citamedica_pacod and
                 pat2.profatencion_turno_emcod = cm1.citamedica_emcod and
                 cm1.citamedica_fhcita >= pat2.profatencion_turno_hinicioprog and
                 cm1.citamedica_fhcita <= pat2.profatencion_turno_hfinprog)
                inner join sch_clinica.tbl_ordatencionamb oamb on
                (oamb.ordatencionamb_citamedica_cod = cm1.citamedica_cod)
                inner join sch_clinica.tbl_ordatenciondet oad on
                (oad.ordatenciondet_ordatencion_cod = oamb.ordatencionamb_ordatenciondet_cod and
                 oad.ordatenciondet_item = oamb.ordatencionamb_ordatenciondet_item)
                inner join sch_clinica.tbl_docvntsunat dvs on
                (dvs.docvntsunat_predocvnt_cod = oad.ordatenciondet_predocvnt_cod and
                 dvs.docvntsunat_anulado = 0 and dvs.docvntsunat_tpref = 0)
            where
                cm1.citamedica_estado = 1 and
                date(pat2.profatencion_turno_hinicioprog) >= '01/08/2023' and
    			date(pat2.profatencion_turno_hinicioprog) <= '31/08/2023'
            order by
                5
        ) AS fechas
        group by
    		1,2,3,4
    ) as citas on (citas.fecha1 = pat.profatencion_turno_hinicioprog and 
                   citas.fecha2 = pat.profatencion_turno_hfinprog and 
                   pat.profatencion_turno_pacod = citas.prof and
                   pat.profatencion_turno_emcod = citas.espe)
    left join
    (
    	select
        	cm1.citamedica_pacod as prof,
            cm1.citamedica_emcod as espe,
            pat2.profatencion_turno_hinicioprog as fecha1,
            pat2.profatencion_turno_hfinprog as fecha2,
            MIN(con.hstclinica_consulta_fcreacion) as min,
    		MAX(con.hstclinica_consulta_fcreacion) as max
        from
        	sch_clinica.tbl_citamedica cm1
            inner join sch_clinica.tbl_profatencion_turno pat2 on
            (pat2.profatencion_turno_pacod = cm1.citamedica_pacod and
             pat2.profatencion_turno_emcod = cm1.citamedica_emcod and
             cm1.citamedica_fhcita >= pat2.profatencion_turno_hinicioprog and
             cm1.citamedica_fhcita <= pat2.profatencion_turno_hfinprog)
            inner join sch_clinica.tbl_ordatencionamb oamb on
            (oamb.ordatencionamb_citamedica_cod = cm1.citamedica_cod)
            inner join sch_clinica.tbl_ordatenciondet oad on
            (oad.ordatenciondet_ordatencion_cod = oamb.ordatencionamb_ordatenciondet_cod and
             oad.ordatenciondet_item = oamb.ordatencionamb_ordatenciondet_item)
            inner join sch_clinica.tbl_docvntsunat dvs on
            (dvs.docvntsunat_predocvnt_cod = oad.ordatenciondet_predocvnt_cod and
             dvs.docvntsunat_anulado = 0 and dvs.docvntsunat_tpref = 0)
            inner join sch_clinica.tbl_ordatencionamb oaa on
            (oaa.ordatencionamb_citamedica_cod = cm1.citamedica_cod)
            inner join sch_clinica.tbl_hstclinica_consulta con on
            (con.hstclinica_consulta_oadet_cod = oaa.ordatencionamb_ordatenciondet_cod and
             con.hstclinica_consulta_oadet_item = oaa.ordatencionamb_ordatenciondet_item)
        where
        	cm1.citamedica_estado = 1 and
            date(pat2.profatencion_turno_hinicioprog) >= '01/08/2023' and
    		date(pat2.profatencion_turno_hinicioprog) <= '31/08/2023'
        group by
        	1,2,3,4
    ) as maxmin on (maxmin.fecha1 = pat.profatencion_turno_hinicioprog and 
                   maxmin.fecha2 = pat.profatencion_turno_hfinprog and 
                   pat.profatencion_turno_pacod = maxmin.prof and
                   pat.profatencion_turno_emcod = maxmin.espe)
where
	date(pat.profatencion_turno_hinicioprog) >= '01/08/2023' and
    date(pat.profatencion_turno_hinicioprog) <= '31/08/2023'
order by
	2,4