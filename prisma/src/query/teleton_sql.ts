interface IQueryTeleton {
  getQueryTarifa(fecha_ini: string, fecha_fin: string): string;
}

export const getQueryTarifa: IQueryTeleton['getQueryTarifa'] = (fecha_ini, fecha_fin) => `
select 
td.docvntsunat_cod,
tp.predocvntdet_cod,tp.predocvntdet_item,
(ROUND((tt.tarifariodet_prc*(1-(tn.negociacionpreciodet_dscto/100)))::decimal,2))*1 precio_final,
tp.predocvntdet_preciouniventa
from tbl_ordatencion to2
left join sch_clinica.tbl_docvntsunat td on td.docvntsunat_oa_codigo = to2.ordatencion_cod
left join sch_clinica.tbl_predocvntdet tp on tp.predocvntdet_cod = td.docvntsunat_predocvnt_cod
left join sch_clinica.tbl_tarifariodet tt on tt.tarifariodet_item = tp.predocvntdet_elemento_item
inner join sch_clinica.tbl_negociacionpreciodet tn on tn.negociacionpreciodet_tditem = tt.tarifariodet_item and tn.negociacionpreciodet_ncod = 22
where 
to2.ordatencion_estado = 0 and to2.ordatencion_negprc_emp_aseg_ecod=317 and to2.ordatencion_tpatencion_cod IN(6,1) AND tarifariodet_item in(3547)
--and to2.ordatencion_cod in(454198)
and to2.ordatencion_fcreacion BETWEEN '${fecha_ini}' AND '${fecha_fin}' 
order by to2.ordatencion_cod desc
;
`;

  export const getQueryTarifaSunat: IQueryTeleton['getQueryTarifa'] = (fecha_ini, fecha_fin) => `
  select
td.docvntsunat_cod,
tp.predocvntdet_cod,td2.docvntsunatdet_item,
(ROUND((tt.tarifariodet_prc*(1-(tn.negociacionpreciodet_dscto/100)))::decimal,2))*1 precio_final,
--(tt.tarifariodet_prc*(1-(tn.negociacionpreciodet_dscto/100))) precio_final_deci,
td2.docvntsunatdet_preciouniventa
from tbl_ordatencion to2
left join sch_clinica.tbl_docvntsunat td on td.docvntsunat_oa_codigo = to2.ordatencion_cod
left join sch_clinica.tbl_predocvntdet tp on tp.predocvntdet_cod = td.docvntsunat_predocvnt_cod
left join sch_clinica.tbl_tarifariodet tt on tt.tarifariodet_item = tp.predocvntdet_elemento_item
inner join sch_clinica.tbl_negociacionpreciodet tn on tn.negociacionpreciodet_tditem = tt.tarifariodet_item and tn.negociacionpreciodet_ncod = 22
left join sch_clinica.tbl_docvntsunatdet td2 on td2.docvntsunatdet_cod = td.docvntsunat_cod
where 
to2.ordatencion_estado = 0 and to2.ordatencion_negprc_emp_aseg_ecod=317 
and to2.ordatencion_tpatencion_cod=6
--and to2.ordatencion_cod in(454198)
and to2.ordatencion_fcreacion BETWEEN '${fecha_ini}' AND '${fecha_fin}' 
order by to2.ordatencion_cod desc
;
  `;
  
