select
	cons.oa_codigo as "NUM OA",
    cons.oi_codigo AS "NUM OI",
    cons.fecha_registro AS "FECHA REGISTRO",
    cons.nombre_paciente AS "PACIENTE",
    cons.tipo_paciente AS "TIPO PACIENTE",
    cons.tipo_atencion AS "TIPO ATENCION",
    sum(cons.monto_con_igv_paciente) AS "MONTO PACIENTE CON IGV",
    sum(case when cons.estado_id = 0 or cons.estado_id = 1 then 
    	case when maseg.monto > 0 then maseg.monto else 0 end else case when cons.monto_con_igv_aseguradora > 0 then cons.monto_con_igv_aseguradora else 0 end end) AS "MONTO ASEGURADORA CON IGV",
    cons.seguro AS "SEGURO", 
    cons.estado AS "ESTADO",
    coalesce(cons.coaseguro,0) AS "COASEGURO",
    coalesce(cons.deducible,0) AS "DEDUCIBLE",
    coalesce(cons.coaseguro_consulta,0) AS "COASEGURO CONSULTA",
    round(cast(case when coalesce(PREH.total_prehonorario, 0) > 0 then coalesce(PREH.total_prehonorario, 0) else 0 end as numeric),2) AS "MONTO HONORARIOS",
    cons.negociacion_dsc as "NEGOCIACION",
    med.especialidad as "ESPECIALIDAD",
    med.medico as "MEDICO",
    cons.empresa_dsc as "EMPRESA",
    cons.tp_afiliacion as "TIPO DE AFILIACION",
    round(cast(coalesce(SERVI."AMBULANCIA", 0) as numeric),2) AS "AMBULANCIA SIN IGV",
    round(cast(coalesce(SERVI."CARDIODIAGNOSTICO", 0) as numeric),2) as "CARDIODIAGNOSTICO SIN IGV",
    round(cast(coalesce(SERVI."CONSULTA MEDICA", 0) as numeric),2) as "CONSULTA MEDICA SIN IGV",
    round(cast(coalesce(SERVI."DENSINTOMETRIA OSEA", 0) as numeric),2) as "DENSINTOMETRIA OSEA SIN IGV",
    round(cast(coalesce(SERVI."ECOGRAFIA", 0) as numeric),2) as "ECOGRAFIA SIN IGV",
    round(cast(coalesce(SERVI."ESPIROMETRIA", 0) as numeric),2) as "ESPIROMETRIA SIN IGV",
    round(cast(coalesce(SERVI."FARMACIA", 0) as numeric),2) as "FARMACIA SIN IGV",
    round(cast(coalesce(SERVI."LABORATORIO CLINICO", 0) as numeric),2) as "LABORATORIO CLINICO SIN IGV",
    round(cast(coalesce(SERVI."MEDICINA FISICA Y REHABILITACIÓN", 0) as numeric),2) as "MEDICINA FISICA Y REHABILITACIÓN SIN IGV",
    round(cast(coalesce(SERVI."MEDICINA NUCLEAR", 0) as numeric),2) as "MEDICINA NUCLEAR SIN IGV",
    round(cast(coalesce(SERVI."NEUROFISIOLOGIA", 0) as numeric),2) as "NEUROFISIOLOGIA SIN IGV",
    round(cast(coalesce(SERVI."ODONTOLOGIA", 0) as numeric),2) as "ODONTOLOGIA SIN IGV",
    round(cast(coalesce(SERVI."OFTALMOLOGIA", 0) as numeric),2) as "OFTALMOLOGIA SIN IGV",
    round(cast(coalesce(SERVI."PATOLOGIA", 0) as numeric),2) as "PATOLOGIA SIN IGV",
    round(cast(coalesce(SERVI."PROCEDIMIENTOS", 0) as numeric),2) as "PROCEDIMIENTOS SIN IGV",
    round(cast(coalesce(SERVI."RAYOS X", 0) as numeric),2) as "RAYOS X SIN IGV",
    round(cast(coalesce(SERVI."RESONANCIA MAGNETICA", 0) as numeric),2) as "RESONANCIA MAGNETICA SIN IGV",
    round(cast(coalesce(SERVI."SALA DE YESOS", 0) as numeric),2) as "SALA DE YESOS SIN IGV",
    round(cast(coalesce(SERVI."TOMOGRAFIA", 0) as numeric),2) as "TOMOGRAFIA SIN IGV",
    round(cast(coalesce(SERVI."TOPICO", 0) as numeric),2) as "TOPICO SIN IGV",
    round(cast(coalesce(SERVI."VIDEOENDOSCOPIA", 0) as numeric),2) as "VIDEOENDOSCOPIA SIN IGV"
from
(
        select
          oa.ordatencion_cod as oa_codigo,
          cast(null as integer) as oi_codigo,
          oa.ordatencion_fregistro as fecha_registro,
          vp.vw_persona_nombres as nombre_paciente,
          tp.tppaciente_dsc as tipo_paciente,
          ta.tpatencion_dsc as tipo_atencion,
          round(cast(sum(/*case when oa.ordatencion_tpaciente_cod = 2 then*/
          dvs.docvntsunat_totneto
          /*else dvs.docvntsunat_totneto end*/) as numeric), 2) as monto_con_igv_paciente,
          0 as monto_con_igv_aseguradora,
          a.empresa_rznsocial as seguro,
          case when oa.ordatencion_tpaciente_cod = 2 then
            case when coalesce(oas.ordatencionaseg_estado, oau.ordenatencionautoseg_estado) = 0 then 'pendiente'
            when coalesce(oas.ordatencionaseg_estado, oau.ordenatencionautoseg_estado) = 1 then 'auditada'
            when coalesce(oas.ordatencionaseg_estado, oau.ordenatencionautoseg_estado) = 3 then 'facturada'
            when coalesce(oas.ordatencionaseg_estado, oau.ordenatencionautoseg_estado) = 4 then 'cerrado adm.' end
          else 'facturada' end as estado,
          coalesce(oas.ordatencionaseg_coaseguro, oau.ordenatencionautoseg_coaseguro, 0) as coaseguro,
          (
          select
            ordatencionasegdet_deducible
          from
            sch_clinica.tbl_ordatencionasegdet 
          where
            ordatencionasegdet_ordatencion_cod = oa.ordatencion_cod and
            ordatencionasegdet_item = 1
          ) as deducible,
          (
          select
            sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_coaseguro
          from
            sch_clinica.tbl_ordatencionasegdet 
          where
            ordatencionasegdet_ordatencion_cod = oa.ordatencion_cod and
            ordatencionasegdet_item = 1
          ) as coaseguro_consulta,
          coalesce(oas.ordatencionaseg_estado, oau.ordenatencionautoseg_estado) as estado_id,
          np.negociacionprecio_dsc as negociacion_dsc,
          e.empresa_rznsocial as empresa_dsc,
          case when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 1 then 'REGULAR'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 2 then 'SCTR'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 3 then 'POTESTATIVA'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 4 then 'SCTR INDEPENDIENTE'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 5 then 'COMPLEMENTARIO'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 6 then 'SOAT'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 7 then 'AFOCAT' end as tp_afiliacion
        from
          sch_clinica.tbl_ordatencion oa
          left join sch_clinica.tbl_ordatencionaseg oas on (oa.ordatencion_cod = oas.ordatencionaseg_cod)
          left join sch_clinica.tbl_ordenatencionautoseg oau on (oa.ordatencion_cod = oau.ordenatencionautoseg_cod)
          left join sch_clinica.vw_persona vp on (oa.ordatencion_paciente_cod = vp.vw_persona_cod)
          left join sch_clinica.tbl_tpatencion ta on (oa.ordatencion_tpatencion_cod = ta.tpatencion_cod)
          left join sch_clinica.tbl_tppaciente tp on (oa.ordatencion_tpaciente_cod = tp.tppaciente_cod)
          left join sch_clinica.tbl_empresa a on (oa.ordatencion_negprc_emp_aseg_acod = a.empresa_cod)
          left join sch_clinica.tbl_docvntsunat dvs on (oa.ordatencion_cod = dvs.docvntsunat_oa_codigo)
          left join sch_clinica.tbl_ordatencionasegdet oasd on (dvs.docvntsunat_oa_codigo = oasd.ordatencionasegdet_ordatencion_cod
          and dvs.docvntsunat_oa_item = oasd.ordatencionasegdet_item)
          AND (oasd.ordatencionasegdet_estado = 1)
          left join sch_clinica.tbl_negociacionprecio np on (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)
          left join sch_clinica.tbl_empresa e on (oa.ordatencion_negprc_emp_aseg_ecod = e.empresa_cod)
        where
          date(oa.ordatencion_fregistro) between date(#fec_ini#) and date(#fec_fin#)
          and (dvs.docvntsunat_anulado = 0 and dvs.docvntsunat_tpref = 0)
          and dvs.docvntsunat_ticket = 1
          and oa.ordatencion_tpatencion_cod <> 2 and oa.ordatencion_tpatencion_cod <> 8
        group by
          1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17
          
        union all

        select
          oa.ordatencion_cod as oa_codigo,
          cast(null as integer) as oi_codigo,
          oa.ordatencion_fregistro as fecha_registro,
          vp.vw_persona_nombres as nombre_paciente,
          tp.tppaciente_dsc as tipo_paciente,
          ta.tpatencion_dsc as tipo_atencion,
            0 as monto_con_igv_paciente,
          round(cast(sum(/*case when oa.ordatencion_tpaciente_cod = 2 then*/
          dvs.docvntsunat_totneto
          /*else dvs.docvntsunat_totneto end*/) as numeric), 2) as monto_con_igv_aseguradora,
          a.empresa_rznsocial as seguro,
          case when oa.ordatencion_tpaciente_cod = 2 then
            case when coalesce(oas.ordatencionaseg_estado, oau.ordenatencionautoseg_estado) = 0 then 'pendiente'
            when coalesce(oas.ordatencionaseg_estado, oau.ordenatencionautoseg_estado) = 1 then 'auditada'
            when coalesce(oas.ordatencionaseg_estado, oau.ordenatencionautoseg_estado) = 3 then 'facturada'
            when coalesce(oas.ordatencionaseg_estado, oau.ordenatencionautoseg_estado) = 4 then 'cerrado adm.' end
          else 'facturada' end as estado,
          coalesce(oas.ordatencionaseg_coaseguro, oau.ordenatencionautoseg_coaseguro, 0) as coaseguro,
          (
          select
            ordatencionasegdet_deducible
          from
            sch_clinica.tbl_ordatencionasegdet 
          where
            ordatencionasegdet_ordatencion_cod = oa.ordatencion_cod and
            ordatencionasegdet_item = 1
          ) as deducible,
          (
          select
            sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_coaseguro
          from
            sch_clinica.tbl_ordatencionasegdet 
          where
            ordatencionasegdet_ordatencion_cod = oa.ordatencion_cod and
            ordatencionasegdet_item = 1
          ) as coaseguro_consulta,
          coalesce(oas.ordatencionaseg_estado, oau.ordenatencionautoseg_estado),
          np.negociacionprecio_dsc as negociacion_dsc,
          e.empresa_rznsocial as empresa_dsc,
          case when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 1 then 'REGULAR'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 2 then 'SCTR'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 3 then 'POTESTATIVA'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 4 then 'SCTR INDEPENDIENTE'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 5 then 'COMPLEMENTARIO'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 6 then 'SOAT'
		  when coalesce(oas.ordatencionaseg_tpafiliacion, oau.ordenatencionautoseg_tpafiliacion) = 7 then 'AFOCAT' end as tp_afiliacion
        from
          sch_clinica.tbl_ordatencion oa
          left join sch_clinica.tbl_ordatencionaseg oas on (oa.ordatencion_cod = oas.ordatencionaseg_cod)
          left join sch_clinica.tbl_ordenatencionautoseg oau on (oa.ordatencion_cod = oau.ordenatencionautoseg_cod)
          left join sch_clinica.vw_persona vp on (oa.ordatencion_paciente_cod = vp.vw_persona_cod)
          left join sch_clinica.tbl_tpatencion ta on (oa.ordatencion_tpatencion_cod = ta.tpatencion_cod)
          left join sch_clinica.tbl_tppaciente tp on (oa.ordatencion_tpaciente_cod = tp.tppaciente_cod)
          left join sch_clinica.tbl_empresa a on (oa.ordatencion_negprc_emp_aseg_acod = a.empresa_cod)
          inner join sch_clinica.tbl_ordatencion_factura_historial oa_fh on oa.ordatencion_cod = oa_fh.ordatencion_factura_historial_oacod and
          oa_fh.ordatencion_factura_historial_oicod is null and oa_fh.ordatencion_factura_historial_estado = 1
          AND oa_fh.ordatencion_factura_historial_preventa IS NULL
          left join sch_clinica.tbl_docvntsunat dvs on (oa_fh.ordatencion_factura_historial_docvntsunatcod = dvs.docvntsunat_cod)
          left join sch_clinica.tbl_negociacionprecio np on (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)
          left join sch_clinica.tbl_empresa e on (oa.ordatencion_negprc_emp_aseg_ecod = e.empresa_cod)
        where
          date(oa.ordatencion_fregistro) between date(#fec_ini#) and date(#fec_fin#)
          and oa.ordatencion_tpatencion_cod <> 2 and oa.ordatencion_tpatencion_cod <> 8
        group by
          1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17
) as cons
left join 
  (
  	select
    	pa_pho.profatencion_prehonorario_oacod as num_oa,
        sum(pa_pho.profatencion_prehonorario_totalhonorario) as total_prehonorario
    from
    	sch_clinica.tbl_profatencion_prehonorario pa_pho
    where
    	pa_pho.profatencion_prehonorario_estado != 4 and
        pa_pho.profatencion_prehonorario_oidet_cod is null
    group by
    	1
  ) as PREH ON (cons.oa_codigo = PREH.num_oa)
LEFT JOIN
          (
          	select
            	oa_ad.ordatencionasegdet_ordatencion_cod,
                sum(oa_ad.ordatencionasegdet_montoaseguradora) as monto
            from
            	sch_clinica.tbl_ordatencionasegdet oa_ad
            group by
            	1
          ) AS MASEG ON cons.oa_codigo = maseg.ordatencionasegdet_ordatencion_cod

left join (
	select distinct
	  oad.ordatenciondet_ordatencion_cod as oa_codigo,
	  oad.ordatenciondet_item as oa_item,
	  rank() over(partition by oad.ordatenciondet_ordatencion_cod order by oad.ordatenciondet_ordatencion_cod, oad.ordatenciondet_item) as orden,
	  em.espprofatencion_dsc as especialidad,
	  vp.vw_persona_nombres as medico
	from
	  sch_clinica.tbl_ordatencion oa 
	  left join sch_clinica.tbl_ordatenciondet oad on (oa.ordatencion_cod = oad.ordatenciondet_ordatencion_cod)
	  left join sch_clinica.tbl_docvntsunat dvs on (oad.ordatenciondet_predocvnt_cod = dvs.docvntsunat_predocvnt_cod)
	  left join sch_clinica.tbl_ordatencionamb oaa on (oad.ordatenciondet_ordatencion_cod = oaa.ordatencionamb_ordatenciondet_cod)
	  left join sch_clinica.tbl_citamedica cm on (oaa.ordatencionamb_citamedica_cod = cm.citamedica_cod)
	  left join sch_clinica.tbl_emergencia_consulta ec on (oad.ordatenciondet_ordatencion_cod = ec.emergencia_consulta_oacod
	  and oad.ordatenciondet_item = ec.emergencia_consulta_oaitem)
	  left join sch_clinica.tbl_espprofatencion em on(coalesce(cm.citamedica_emcod, ec.emergencia_consulta_emcod) = em.espprofatencion_cod)
	  left join sch_clinica.vw_persona vp on (coalesce(cm.citamedica_pacod, ec.emergencia_consulta_pacod) = vp.vw_persona_cod)
	where
	  date(oa.ordatencion_fregistro) between date(#fec_ini#) and date(#fec_fin#)
	  and oad.ordatenciondet_predocvnt_cod is not null
	  and dvs.docvntsunat_anulado = 0 
	  and dvs.docvntsunat_tpref = 0
	 order by
	   1,2
) as med on (cons.oa_codigo = med.oa_codigo and med.orden = 1)

/*****************************************************************/
LEFT JOIN
(
  SELECT * FROM sch_clinica.fn_auditoria_gastos_oa_crosstab(
   'SELECT
    DATOS.orden_atencion_cod,
    DATOS.servicio,
    CAST(SUM(DATOS.mnt) AS NUMERIC)
  FROM
  (SELECT
      OA.ordatencion_cod AS orden_atencion_cod,
      ' || quote_literal('CONSULTA MEDICA') || ' as servicio,
      SUM(DVSD.docvntsunatdet_cantidad * CASE WHEN DVSD.docvntsunatdet_afectoigv = 1 THEN (DVSD.docvntsunatdet_preciouniventa * (1+DVS.docvntsunat_igv)) ELSE DVSD.docvntsunatdet_preciouniventa END)  AS mnt
    FROM
      sch_clinica.tbl_ordatencion OA
      INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (OA.ordatencion_cod = DVS.docvntsunat_oa_codigo)
      INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD ON (DVS.docvntsunat_cod = DVSD.docvntsunatdet_cod)
      INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
                                              AND (PDV.predocvnt_estado = 1) 	
      INNER JOIN sch_clinica.tbl_ordatenciondet OAD ON (PDV.predocvnt_cod = OAD.ordatenciondet_predocvnt_cod)                                            
    WHERE
      date(oa.ordatencion_fregistro) between date(' || quote_literal(#fec_ini#) || ') and date(' || quote_literal(#fec_fin#) || ')
    GROUP BY
      OA.ordatencion_cod  
    
     UNION ALL

     SELECT
      OA.ordatencion_cod AS orden_atencion_cod,
      ' || quote_literal('CONSULTA MEDICA') || ' as servicio,
      SUM(DVSD.docvntsunatdet_cantidad * CASE WHEN DVSD.docvntsunatdet_afectoigv = 1 THEN (DVSD.docvntsunatdet_preciouniventa * (1+DVS.docvntsunat_igv)) ELSE DVSD.docvntsunatdet_preciouniventa END)  AS mnt
    FROM
      sch_clinica.tbl_ordatencion OA
      INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (OA.ordatencion_cod = DVS.docvntsunat_oa_codigo)
      INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD ON (DVS.docvntsunat_cod = DVSD.docvntsunatdet_cod)
      AND (DVSD.docvntsunatdet_tpelemento = 3)
      INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
      AND (PDV.predocvnt_estado = 1 AND PDV.predocvnt_tipo = 12) 	
    WHERE
      date(oa.ordatencion_fregistro) between date(' || quote_literal(#fec_ini#) || ') and date(' || quote_literal(#fec_fin#) || ')
    GROUP BY
      OA.ordatencion_cod  
  
  union all

  SELECT
    CONS.oa_cod AS oa_cod,
    ' || quote_literal('PROCEDIMIENTOS') || ',
    ROUND(CAST(SUM(CONS.mnt) AS NUMERIC),2) AS mnt
  FROM (  
    SELECT
      OA.ordatencion_cod AS oa_cod,
      SUM(DVSD.docvntsunatdet_cantidad * CASE WHEN DVSD.docvntsunatdet_afectoigv = 1 THEN (DVSD.docvntsunatdet_preciouniventa * (1+DVS.docvntsunat_igv)) ELSE DVSD.docvntsunatdet_preciouniventa END) AS mnt
    FROM
      sch_clinica.tbl_ordatencion OA
      INNER JOIN sch_clinica.tbl_docvntsunat DVS on (OA.ordatencion_cod = DVS.docvntsunat_oa_codigo)
      INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
      AND (PDV.predocvnt_tipo != 12)
      INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD ON (DVS.docvntsunat_cod = DVSD.docvntsunatdet_cod)
      INNER JOIN sch_clinica.tbl_hcprocmed_prvnt HCPP ON (PDV.predocvnt_cod = HCPP.hcprocmed_prvnt_prvntcod)
      INNER JOIN sch_clinica.tbl_hstconsulta_procmed HCPM ON (HCPP.hcprocmed_prvnt_pmcod = HCPM.hstconsulta_procmed_cod)
      LEFT JOIN sch_clinica.tbl_emergencia EME ON (OA.ordatencion_cod = EME.emergencia_cod)    
    WHERE 
      date(oa.ordatencion_fregistro) between date(' || quote_literal(#fec_ini#) || ') and date(' || quote_literal(#fec_fin#) || ')
    GROUP BY
      1  
    UNION ALL
    SELECT
      OA.ordatencion_cod AS oa_cod,
      SUM(DVSD.docvntsunatdet_cantidad * CASE WHEN DVSD.docvntsunatdet_afectoigv = 1 THEN (DVSD.docvntsunatdet_preciouniventa * (1+DVS.docvntsunat_igv)) ELSE DVSD.docvntsunatdet_preciouniventa END) AS mnt
    FROM
      sch_clinica.tbl_ordatencion OA
      INNER JOIN sch_clinica.tbl_docvntsunat DVS on (OA.ordatencion_cod = DVS.docvntsunat_oa_codigo)
      INNER JOIN sch_clinica.tbl_predocvnt PDV ON (DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod)
      AND (PDV.predocvnt_tipo = 12)
      INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD ON (DVS.docvntsunat_cod = DVSD.docvntsunatdet_cod)
      AND (DVSD.docvntsunatdet_tpelemento = 5)
      INNER JOIN sch_clinica.tbl_hcprocmed_prvnt HCPP ON (PDV.predocvnt_cod = HCPP.hcprocmed_prvnt_prvntcod)
      INNER JOIN sch_clinica.tbl_hstconsulta_procmed HCPM ON (HCPP.hcprocmed_prvnt_pmcod = HCPM.hstconsulta_procmed_cod)
      LEFT JOIN sch_clinica.tbl_emergencia EME ON (OA.ordatencion_cod = EME.emergencia_cod)    
    WHERE 
      date(oa.ordatencion_fregistro) between date(' || quote_literal(#fec_ini#) || ') and date(' || quote_literal(#fec_fin#) || ')
    GROUP BY
      1   
      ) AS CONS
    GROUP BY
      CONS.oa_cod
      
  union all

  SELECT DISTINCT
        OA.ordatencion_cod AS oa_cod,
        ' || quote_literal('FARMACIA') || ',
        SUM(CASE WHEN DVSD1.docvntsunatdet_afectoigv = 1 THEN 
              DVSD1.docvntsunatdet_cantidad * (DVSD1.docvntsunatdet_preciouniventa * (1+DVS.docvntsunat_igv))
            ELSE
              DVSD1.docvntsunatdet_cantidad * DVSD1.docvntsunatdet_preciouniventa
            END)  AS mnt
        FROM 
         sch_clinica.tbl_ordatencion OA
         INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (OA.ordatencion_cod = DVS.docvntsunat_oa_codigo)
         INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD1 ON (DVS.docvntsunat_cod = DVSD1.docvntsunatdet_cod)
         AND (DVSD1.docvntsunatdet_tpelemento = 1 OR DVSD1.docvntsunatdet_tpelemento = 2)
         AND (DVSD1.docvntsunatdet_elemento_cod != 1) 
         INNER JOIN sch_clinica.tbl_predocvnt PV1 ON (DVS.docvntsunat_predocvnt_cod = PV1.predocvnt_cod
          AND PV1.predocvnt_estado = 1 AND (PV1.predocvnt_tipo = 2 OR PV1.predocvnt_tipo = 12))
         WHERE
         date(oa.ordatencion_fregistro) between date(' || quote_literal(#fec_ini#) || ') and date(' || quote_literal(#fec_fin#) || ')
         group by 
          1
          
  union all

  SELECT
    CONS.cod_consulta AS valor,
    cons.area_dsc,
    ROUND(CAST(SUM(CONS.total_farmacia) AS NUMERIC),2) AS monto
  FROM(
    SELECT DISTINCT
      OA.ordatencion_cod AS cod_consulta,
      A.area_dsc,
      SUM(CASE WHEN DVSD1.docvntsunatdet_afectoigv = 1 THEN 
          DVSD1.docvntsunatdet_cantidad * (DVSD1.docvntsunatdet_preciouniventa * (1+DVS.docvntsunat_igv))
        ELSE
          DVSD1.docvntsunatdet_cantidad * DVSD1.docvntsunatdet_preciouniventa
        END)  AS total_farmacia
    FROM 
    sch_clinica.tbl_ordatencion OA 
    INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (OA.ordatencion_cod = DVS.docvntsunat_oa_codigo)
    INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD1 ON (DVS.docvntsunat_cod = DVSD1.docvntsunatdet_cod)
    INNER JOIN sch_clinica.tbl_predocvnt PV1 ON (DVS.docvntsunat_predocvnt_cod = PV1.predocvnt_cod
    AND PV1.predocvnt_estado = 1 AND (PV1.predocvnt_tipo = 1 OR PV1.predocvnt_tipo = 6))
    LEFT JOIN sch_clinica.tbl_segus S ON (DVSD1.docvntsunatdet_elemento_cod = S.segus_tarifariodet_cod AND DVSD1.docvntsunatdet_elemento_item = S.segus_tarifariodet_item)
    LEFT JOIN sch_clinica.tbl_area A ON (S.segus_area_cod = A.area_cod)
  WHERE
    date(oa.ordatencion_fregistro) between date(' || quote_literal(#fec_ini#) || ') and date(' || quote_literal(#fec_fin#) || ')
  GROUP BY
      1,2
  UNION ALL
  SELECT DISTINCT
      OA.ordatencion_cod AS cod_consulta,
      A.area_dsc,
      SUM(CASE WHEN DVSD1.docvntsunatdet_afectoigv = 1 THEN 
          DVSD1.docvntsunatdet_cantidad * (DVSD1.docvntsunatdet_preciouniventa * (1+DVS.docvntsunat_igv))
        ELSE
          DVSD1.docvntsunatdet_cantidad * DVSD1.docvntsunatdet_preciouniventa
        END)  AS total_farmacia
    FROM 
    sch_clinica.tbl_ordatencion OA 
    INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (OA.ordatencion_cod = DVS.docvntsunat_oa_codigo)
    INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD1 ON (DVS.docvntsunat_cod = DVSD1.docvntsunatdet_cod)
    AND DVSD1.docvntsunatdet_tpelemento = 1
    INNER JOIN sch_clinica.tbl_predocvnt PV1 ON (DVS.docvntsunat_predocvnt_cod = PV1.predocvnt_cod
    AND PV1.predocvnt_estado = 1 AND PV1.predocvnt_tipo = 12)
    LEFT JOIN sch_clinica.tbl_area A ON (DVSD1.docvntsunatdet_elemento_item = A.area_cod)
  WHERE
    date(oa.ordatencion_fregistro) between date(' || quote_literal(#fec_ini#) || ') and date(' || quote_literal(#fec_fin#) || ')
  GROUP BY
      1,2
    ) AS CONS
  GROUP BY
  CONS.cod_consulta, cons.area_dsc

  UNION ALL


  SELECT
    OA.ordatencion_cod,
    CTS.catgenerico_dsc,
    0 as monto
  FROM
    sch_clinica.tbl_ordatencion OA 
    LEFT JOIN sch_clinica.tbl_catgenerico CTS ON cts.catgenerico_tpcod = 172
  where
      date(oa.ordatencion_fregistro) between date(' || quote_literal(#fec_ini#) || ') and date(' || quote_literal(#fec_fin#) || ')
  ORDER BY
    1,2) as DATOS GROUP BY 1,2 ORDER BY 1, 2')

) as SERVI on (cons.oa_codigo = SERVI.orden_atencion_cod)
/*****************************************************************/
group by
	1,2,3,4,5,6,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40