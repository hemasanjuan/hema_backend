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
          date(oa.ordatencion_fregistro) between date(:fecha_ini) and date(:fecha_fin)
          and oa.ordatencion_tpatencion_cod <> 2 and oa.ordatencion_tpatencion_cod <> 8
        group by
          1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17