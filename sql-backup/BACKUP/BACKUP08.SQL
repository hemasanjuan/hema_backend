select
	case when per.persona_sexo = 'M' then 1 else 2 end as sexo,
    per.persona_sexo AS sexo_c,
    sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) AS grupo_edad,
    CASE WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 1 then 'Menores de 1 anho'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 2 then 'De 1 a 4 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 3 then 'De 5 a 9 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 4 then 'De 10 a 14 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 5 then 'De 15 a 19 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 6 then 'De 20 a 24 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 7 then 'De 25 a 29 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 8 then 'De 30 a 34 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 9 then 'De 35 a 39 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 10 then 'De 40 a 44 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 11 then 'De 45 a 49 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 12 then 'De 50 a 54 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 13 then 'De 55 a 59 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 14 then 'De 60 a 64 anhos'
    WHEN sch_clinica.fn_util_grupo_edad_tramas_seti(per.persona_fecnac, date(cm.citamedica_fhcita)) = 15 then 'De 65 a mas anhos'
    end as grupo_edad_c,
    case when trim(FIN.cie10) = 'M10' then 'M10.9' 
    when lpad(CAST(FIN.cie10 AS VARCHAR), 5, ' ') = 'U16.0' then 'Z00.1' 
    when lpad(CAST(FIN.cie10 AS VARCHAR), 5, ' ') = 'U16.1' then 'Z00.1' else
    lpad(CAST(FIN.cie10 AS VARCHAR), 5, ' ') end,
    count(cm.citamedica_cod) AS atenciones_medicas,
    count(cm.citamedica_cod) AS atenciones_total,
    per.persona_cod
from
	sch_clinica.tbl_citamedica cm
    inner join sch_clinica.tbl_persona per on
    (cm.citamedica_persona_cod = per.persona_cod)
    inner join sch_clinica.tbl_ordatencionamb oaa on
    (cm.citamedica_cod = oaa.ordatencionamb_citamedica_cod)
    inner join sch_clinica.tbl_ordatenciondet oad on
    (oaa.ordatencionamb_ordatenciondet_cod = oad.ordatenciondet_ordatencion_cod and
     oaa.ordatencionamb_ordatenciondet_item = oad.ordatenciondet_item)
    inner join sch_clinica.tbl_docvntsunat dvs on
    (oad.ordatenciondet_predocvnt_cod = dvs.docvntsunat_predocvnt_cod and
     dvs.docvntsunat_anulado = 0 and dvs.docvntsunat_tpref = 0)
    inner join 
    (
    select
        CONS.ordatenciondet_diagnostico_oacod,
        CONS.ordatenciondet_diagnostico_oaitem,
        CONS.cie10
    from
    (
            select
                cie.ordatenciondet_diagnostico_oacod,
                cie.ordatenciondet_diagnostico_oaitem,
                cie.ordatenciondet_diagnostico_ccod as cie10,
                cie.ordatenciondet_diagnostico_fcreacion,
                RANK() OVER (PARTITION BY cie.ordatenciondet_diagnostico_oacod ORDER BY cie.ordatenciondet_diagnostico_fcreacion DESC) AS item
            from
            	sch_clinica.tbl_citamedica cm
                inner join sch_clinica.tbl_persona per on
                (cm.citamedica_persona_cod = per.persona_cod)
                inner join sch_clinica.tbl_ordatencionamb oaa on
                (cm.citamedica_cod = oaa.ordatencionamb_citamedica_cod)
                inner join sch_clinica.tbl_ordatenciondet oad on
                (oaa.ordatencionamb_ordatenciondet_cod = oad.ordatenciondet_ordatencion_cod and
                 oaa.ordatencionamb_ordatenciondet_item = oad.ordatenciondet_item)
                 inner join sch_clinica.tbl_ordatenciondet_diagnostico cie on
                 (oad.ordatenciondet_ordatencion_cod = cie.ordatenciondet_diagnostico_oacod and
                  oad.ordatenciondet_item = cie.ordatenciondet_diagnostico_oaitem)
            where
                cie.ordatenciondet_diagnostico_ccod <> 'Y66.X' and
                cie.ordatenciondet_diagnostico_tpdiagnostico = 2 and
                to_char(cm.citamedica_fhcita, 'yyyyMM') = to_char(date(:mes), 'yyyyMM') and
    			cm.citamedica_estado = 1 AND CM.citamedica_emcod <> 96 and cm.citamedica_emcod <> 94 AND CM.citamedica_emcod <> 37 AND
                cm.citamedica_emcod <> 113
    ) as CONS
    where
        CONS.item = 1
    ) AS FIN on 
    (oad.ordatenciondet_ordatencion_cod = FIN.ordatenciondet_diagnostico_oacod and
     oad.ordatenciondet_item = FIN.ordatenciondet_diagnostico_oaitem)
where
	to_char(cm.citamedica_fhcita, 'yyyyMM') = to_char(date(:mes), 'yyyyMM') and
    cm.citamedica_estado = 1 AND CM.citamedica_emcod <> 96 and cm.citamedica_emcod <> 94 AND CM.citamedica_emcod <> 37 and
    cm.citamedica_emcod <> 113
group by
	1,2,3,4,5,8
order by
	1,3,5