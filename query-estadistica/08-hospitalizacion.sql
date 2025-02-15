select
  TO_CHAR(det.fecha_ingreso, 'dd/MM/yyyy') as fecha_atencion,--1
  p.persona_nrodoc as dni_paciente,--2
  COALESCE(p.persona_apep, '') || ' ' || COALESCE(p.persona_apem, '') || ', ' || COALESCE(p.persona_nmb1, '')
	  || ' ' || COALESCE(p.persona_nmb2, '') as paciente,--3
  sch_clinica.sp_edad_porfecha(p.persona_fecnac, DATE(det.fecha_ingreso) - 1) as edad,--4
  p.persona_sexo as sexo,--5
  tp.tppaciente_dsc as tipo_paciente,--6
  np.negociacionprecio_dsc as descripcion_tipo_paciente,--7
  'HOSPITALIZACION' as servicio,--8
  em.espprofatencion_dsc as especialidad,--9
  med.vw_persona_nombres as medico,--10
  TO_CHAR(max(det.fecha_ingreso), 'dd/MM/yyyy') as fecha_egreso,--11
  sum(case when det.identificado_gasto = 0 then det.monto_total else 0 end) as gasto_habitacion,--12
  sum(case when det.identificado_gasto = 0 then det.cantidad else 0 end) as dias_hosp,--13
  sum(det.monto_total) as gasto_servicios,--14
  det.oa_codigo as oa,--15
  null as procedimiento,--16
  null as area,--17
  null as tipo_servicio,--18
  pro.provincia_dsc as provincia,--19
  ciu.ciudad_dsc as ciudad,--20
  dis.distrito_dsc as distrito,--21
  null as condicion_establecimiento,--22
  null as condicion_servicio,--23
  null as grupo_etario,--24
  cg.catgenerico_dsc as tp_financiador,--25
  
  to_char(det.fecha_ingreso, 'YYYY') as anho,--26
  to_char(det.fecha_ingreso, 'MM') as mes,--27
  det.fecha_real_ingreso as fecha_real_ingreso,
  det.maprecintodet_dsc,
  emp.empresa_ruc AS ruc,
  emp.empresa_rznsocial AS empresa
from
  (--Revisar estados cerrados
  --Para gastos de habitación
  (select
    hab.*
  from
    (select
      h.hospitalizacion_oacod as oa_codigo,
      oi.ordinternamiento_cod as oi_codigo,
      generate_series(
        cast(date(oiu.ordinternamiento_ubicacion_fingreso) || ' 23:59:00' as timestamp), 
        cast(date(coalesce(oiu.ordinternamiento_ubicacion_fsalida, h.hospitalizacion_faltamedica, #ffin#)) || ' 00:00:00' as timestamp)
        , '1 day') as fecha_ingreso,
      1 as cantidad,
      oid.ordinternamientodet_preciouniventa as precio_unitario,
      round(cast(oid.ordinternamientodet_preciouniventa as numeric), 2) as monto_total,
      oid.ordinternamientodet_cod as oid_codigo,
      oid.ordinternamientodet_tpservicio as tp_servicio,
      cs.cattpservicio_oid_dsc as servicio_dsc,
      0 as identificado_gasto,
      oi.ordinternamiento_ncod as negociacion_codigo,
      h.hospitalizacion_pacod as medico_tratante_codigo,
      h.hospitalizacion_emcod as especialidad_tratante_codigo,
      oi.ordinternamiento_tppaciente as tp_paciente,
      h.hospitalizacion_fingreso as fecha_real_ingreso,
      mrd.maprecintodet_dsc
    from      
      sch_clinica.tbl_ordinternamiento_ubicacion oiu
      inner join sch_clinica.tbl_ordinternamientodet oid on (oiu.ordinternamiento_ubicacion_oidet_cod = oid.ordinternamientodet_cod
      and oid.ordinternamientodet_ejecucion_auditoria = 1)
      inner join sch_clinica.tbl_ordeninternamiento oi on (oiu.ordinternamiento_ubicacion_cod = oi.ordinternamiento_cod
      and oi.ordinternamiento_estado_facturacion <> 5)
      left join sch_clinica.tbl_cattpservicio_oid cs on (oid.ordinternamientodet_tpservicio = cs.cattpservicio_oid_cod)
      left join sch_clinica.tbl_hospitalizacion h on (oi.ordinternamiento_oacod = h.hospitalizacion_oacod)
      left join sch_clinica.tbl_maprecintodet mrd on mrd.maprecintodet_cod = oiu.ordinternamiento_ubicacion_ubicacion_cod
    where
      date(oiu.ordinternamiento_ubicacion_fingreso) between date(#finicio#) and date(#ffin#)
      or date(coalesce(oiu.ordinternamiento_ubicacion_fsalida, h.hospitalizacion_faltamedica, #ffin#)) between date(#finicio#) and date(#ffin#)
      or (date(oiu.ordinternamiento_ubicacion_fingreso) < date(#finicio#) and 
      date(coalesce(oiu.ordinternamiento_ubicacion_fsalida, h.hospitalizacion_faltamedica, #ffin#)) >= date(#ffin#))
    order by
      1,2,3) as hab
  where
    date(hab.fecha_ingreso) between date(#finicio#) and date(#ffin#))
    
  union

  --Para gastos de hospitalización
  (select
    oi.ordinternamiento_oacod as oa_codigo,
    oi.ordinternamiento_cod as oi_codigo,
    oid.ordinternamientodet_fregistro as fecha_ingreso,
    oid.ordinternamientodet_cantidad as cantidad,
    oid.ordinternamientodet_preciouniventa as precio_unitario,
    round(cast(oid.ordinternamientodet_preciouniventa * oid.ordinternamientodet_cantidad as numeric), 2) as monto_total,
    oid.ordinternamientodet_cod as oid_codigo,
    oid.ordinternamientodet_tpservicio as tp_servicio,
    cs.cattpservicio_oid_dsc as servicio_dsc,
    1 as identificado_gasto,
    oi.ordinternamiento_ncod as negociacion_codigo,
    coalesce(h.hospitalizacion_pacod, qa.quirofanoamb_pacod) as medico_tratante_codigo,
    coalesce(h.hospitalizacion_emcod, qa.quirofanoamb_emcod) as especialidad_tratante_codigo,
    oi.ordinternamiento_tppaciente as tp_paciente,
    coalesce(h.hospitalizacion_fingreso, qa.quirofanoamb_fingreso) as fecha_real_ingreso,
    mrd.maprecintodet_dsc
  from
    sch_clinica.tbl_ordinternamientodet oid  
    inner join sch_clinica.tbl_ordeninternamiento oi on (oid.ordinternamientodet_oicod = oi.ordinternamiento_cod
    and oi.ordinternamiento_estado_facturacion <> 5)
    left join sch_clinica.tbl_cattpservicio_oid cs on (oid.ordinternamientodet_tpservicio = cs.cattpservicio_oid_cod)
    left join sch_clinica.tbl_hospitalizacion h on (oi.ordinternamiento_oacod = h.hospitalizacion_oacod)
    left join sch_clinica.tbl_quirofanoamb qa on (oi.ordinternamiento_oacod = qa.quirofanoamb_oacod)
    left join sch_clinica.tbl_maprecintodet mrd on mrd.maprecintodet_cod = h.hospitalizacion_ubicacion_cod
  where
    date(oid.ordinternamientodet_fregistro) between date(#finicio#) and date(#ffin#)
    and oid.ordinternamientodet_ejecucion_auditoria = 1
    and oid.ordinternamientodet_tpservicio not in (1,2,6,9,5)
    and (oid.ordinternamientodet_tpprocedencia = 2 or oid.ordinternamientodet_tpprocedencia = 3)
  order by
    1,2,3)) as det
  left join sch_clinica.tbl_ordatencion oa on (det.oa_codigo = oa.ordatencion_cod)
  left join sch_clinica.tbl_persona p on (oa.ordatencion_paciente_cod = p.persona_cod)
  left join sch_clinica.tbl_tppaciente tp on (det.tp_paciente = tp.tppaciente_cod)
  left join sch_clinica.tbl_negociacionprecio np on (det.negociacion_codigo = np.negociacionprecio_cod)
  left join sch_clinica.tbl_tpatencion ta on (oa.ordatencion_tpatencion_cod = ta.tpatencion_cod)
  LEFT JOIN sch_clinica.tbl_distrito dis ON (dis.distrito_cod = p.persona_ubigeo)
  LEFT JOIN sch_clinica.tbl_provincia pro ON (pro.provincia_cod = dis.distrito_provincia_cod 
  AND pro.provincia_ciudad_cod = dis.distrito_ciudad_cod and pro.provincia_pais_cod = dis.distrito_pais_cod)
  LEFT JOIN sch_clinica.tbl_ciudad ciu ON (ciu.ciudad_cod = pro.provincia_ciudad_cod)    
  AND (ciu.ciudad_pais_cod = pro.provincia_pais_cod)
  left join sch_clinica.vw_persona med on (det.medico_tratante_codigo = med.vw_persona_cod)
  left join sch_clinica.tbl_espprofatencion em on (det.especialidad_tratante_codigo = em.espprofatencion_cod)
  LEFT JOIN sch_clinica.tbl_catgenerico cg ON (np.negociacionprecio_tpfinanciador = cg.catgenerico_cod)
  LEFT JOIN sch_clinica.tbl_empresa emp ON (oa.ordatencion_negprc_emp_aseg_ecod = emp.empresa_cod)
group by
  1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,21,22,23,24,25,26,27,p.persona_fecnac,28,29,30,31
            