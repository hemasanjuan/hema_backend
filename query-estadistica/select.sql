select
  date(hp.hstconsulta_procmed_fsolicitud) as "FECHA ATENCION",
  p.persona_nrodoc as "DNI PACIENTE",
  p.persona_apep || ' ' || p.persona_apem || ' ' || p.persona_nmb1 || ' ' || p.persona_nmb2 as "PACIENTE",
  sch_clinica.sp_edad_porfecha(
    p.persona_fecnac,
    hp.hstconsulta_procmed_fsolicitud
  ) as "EDAD",
  p.persona_sexo as "SEXO",
  tp.tppaciente_dsc as "TIPO DE PACIENTE",
  case
    when tp.tppaciente_cod = 2 then np.negociacionprecio_dsc
    else tp.tppaciente_dsc
  end as "DESCRIPCION TIPO PACIENTE",
  'PROCEDIMIENTOS MEDICOS' || COALESCE(' ' || TA.tpatencion_idigital, ' AMB') AS "SERVICIO",
  em.espprofatencion_dsc AS "ESPECIALIDAD",
  vm.vw_persona_nombres as "MEDICO",
  case
    when dvsd.docvntsunatdet_preciouniventa < 0 then dvsd.docvntsunatdet_totneto
    else dvsd.docvntsunatdet_cantidad * dvsd.docvntsunatdet_preciouniventa
  end as "VALOR VENTA",
  hp.hstconsulta_procmed_cantidad as "CANT",
  coalesce(oa.ordatencion_cod, 0) AS "OA",
  sd.segus_det_dsc AS "PROCEDIMIENTO",
  '' AS "AREA",
  '' AS "TIPO SERVICIO",
  pro.provincia_dsc AS "PROVINCIA",
  ciu.ciudad_dsc AS "CIUDAD",
  dis.distrito_dsc AS "DISTRITO",
  '' AS "CONDICION ESTABLECIMIENTO",
  '' AS "CONDICION SERVICIO",
  CASE
    WHEN sch_clinica.sp_edad_porfecha(
      p.persona_fecnac,
      hp.hstconsulta_procmed_fsolicitud
    ) >= 0
    AND sch_clinica.sp_edad_porfecha(
      p.persona_fecnac,
      hp.hstconsulta_procmed_fsolicitud
    ) <= 11 THEN 'NIÑO DE 0 -11 AÑOS'
    WHEN sch_clinica.sp_edad_porfecha(
      p.persona_fecnac,
      hp.hstconsulta_procmed_fsolicitud
    ) >= 12
    AND sch_clinica.sp_edad_porfecha(
      p.persona_fecnac,
      hp.hstconsulta_procmed_fsolicitud
    ) <= 17 THEN 'ADOLESCENTES 12-17 AÑOS'
    WHEN sch_clinica.sp_edad_porfecha(
      p.persona_fecnac,
      hp.hstconsulta_procmed_fsolicitud
    ) >= 18
    AND sch_clinica.sp_edad_porfecha(
      p.persona_fecnac,
      hp.hstconsulta_procmed_fsolicitud
    ) <= 29 THEN 'JOVEN 18 -29 AÑOS'
    WHEN sch_clinica.sp_edad_porfecha(
      p.persona_fecnac,
      hp.hstconsulta_procmed_fsolicitud
    ) >= 30
    AND sch_clinica.sp_edad_porfecha(
      p.persona_fecnac,
      hp.hstconsulta_procmed_fsolicitud
    ) <= 59 THEN 'ADULTO 30-59 AÑOS'
    WHEN sch_clinica.sp_edad_porfecha(
      p.persona_fecnac,
      hp.hstconsulta_procmed_fsolicitud
    ) >= 60 THEN 'ADULTO MAYOR 60 +'
    ELSE ''
  END AS "GRUPO ETARIO",
  coalesce(cg.catgenerico_dsc, 'PARTICULAR') AS "TP. FINANCIADOR",
  EMP.empresa_ruc AS "RUC",
  EMP.empresa_rznsocial AS "Empresa"
from
  sch_clinica.tbl_hstconsulta_procmed hp
  inner join sch_clinica.tbl_hcprocmed_prvnt hpv on (
    hp.hstconsulta_procmed_cod = hpv.hcprocmed_prvnt_pmcod
  )
  inner join sch_clinica.tbl_docvntsunat dvs on (
    hpv.hcprocmed_prvnt_prvntcod = dvs.docvntsunat_predocvnt_cod
    and dvs.docvntsunat_anulado = 0
    and coalesce(dvs.docvntsunat_tpref, 0) = 0
  )
  inner join sch_clinica.tbl_docvntsunatdet dvsd on dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod
  left join sch_clinica.tbl_predocvnt pv on (dvs.docvntsunat_predocvnt_cod = pv.predocvnt_cod)
  left join sch_clinica.tbl_ordatencion oa on (
    hp.hstconsulta_procmed_oacod_creador = oa.ordatencion_cod
  )
  LEFT JOIN sch_clinica.tbl_tpatencion TA ON (
    oa.ordatencion_tpatencion_cod = TA.tpatencion_cod
  )
  left join sch_clinica.tbl_persona p on (
    coalesce(
      case
        when dvs.docvntsunat_tpcliente != 3 then dvs.docvntsunat_cliente_cod
      end,
      oa.ordatencion_paciente_cod,
      pv.predocvnt_paciente_cod
    ) = p.persona_cod
  )
  LEFT JOIN sch_clinica.tbl_distrito DIS ON (DIS.distrito_cod = p.persona_ubigeo)
  LEFT JOIN sch_clinica.tbl_provincia PRO ON (
    PRO.provincia_cod = DIS.distrito_provincia_cod
    AND PRO.provincia_ciudad_cod = DIS.distrito_ciudad_cod
    and pro.provincia_pais_cod = dis.distrito_pais_cod
  )
  LEFT JOIN sch_clinica.tbl_ciudad CIU ON (CIU.ciudad_cod = pro.provincia_ciudad_cod)
  AND (CIU.ciudad_pais_cod = pro.provincia_pais_cod)
  left join sch_clinica.tbl_tppaciente tp on (
    coalesce(oa.ordatencion_tpaciente_cod, 1) = tp.tppaciente_cod
  )
  left join sch_clinica.tbl_negociacionprecio np on (
    oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod
  )
  LEFT JOIN sch_clinica.tbl_catgenerico CG ON NP.negociacionprecio_tpfinanciador = CG.catgenerico_cod
  left join sch_clinica.tbl_segus_det sd on (
    hp.hstconsulta_procmed_detsegus_cod = sd.segus_det_cod
  )
  left join sch_clinica.vw_persona vm on (
    hp.hstconsulta_procmed_pacod_ejecucion = vm.vw_persona_cod
  )
  left join sch_clinica.tbl_espprofatencion em on hp.hstconsulta_procmed_emcod_ejecucion = em.espprofatencion_cod
  LEFT JOIN sch_clinica.tbl_empresa EMP ON (
    oa.ordatencion_negprc_emp_aseg_ecod = EMP.empresa_cod
  )
where
  date(hp.hstconsulta_procmed_fsolicitud) >= #finicio# and
  date(hp.hstconsulta_procmed_fsolicitud) <= #ffin#
  and sd.segus_det_dsc not in (
    'ALMUERZO',
    'COMIDA',
    'DESAYUNO',
    'INFORME MEDICO'
  )