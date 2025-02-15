--INGRESO DE SERVICIOS
select
  det2.mes as mes,
  det2.tipo_cliente as tipo_cliente,
  det2.negociacion as negociacion,
  det2.paciente as paciente,
  det2.tipo_servicio as tipo_servicio,
  det2.prof_atencion as medico,
  det2.documento as documento,
  det2.descripcion as descripcion,
  det2.tp_atencion as tipo_atencion,
  det2.cantidad as cantidad,
  round(cast(sum(det2.total) / det2.cantidad as numeric), 2) as valor_unitario,
  round(cast(sum(det2.total) as numeric), 2) as total
from
  (select
    det.mes,
    det.tipo_cliente,
    det.negociacion,
    det.paciente,
    det.tipo_servicio,
    det.prof_atencion,
    det.documento,
    det.descripcion,
    det.tp_atencion,
    sum(det.cantidad) as cantidad,
    round(cast(sum(det.precio_uni) as numeric), 2) as valor_unitario,
    round(cast(sum(det.total) as numeric), 2) as total,
    det.ticket
  from
    (select distinct
      dvs.docvntsunat_cod AS documento,
      to_char(dvs.docvntsunat_femision, 'MM') AS mes,
      coalesce(tpp.tppaciente_dsc, 'PARTICULAR') AS tipo_cliente,
      coalesce(np.negociacionprecio_dsc, 'PARTICULAR') AS negociacion,
      coalesce(vp.vw_persona_nombres, 'EVENTUAL') AS paciente,
      case when dvsd.docvntsunatdet_tpelemento = 0 then
        coalesce(a.area_dsc, NULLIF(t.tarifario_dsc, 'SEGUS'), 'PROCEDIMIENTO MEDICO')
      when dvsd.docvntsunatdet_tpelemento = 1 or dvsd.docvntsunatdet_tpelemento = 2 then
        'FARMACIA'
      end AS tipo_servicio,
      '' AS prof_atencion,
      coalesce(td.tarifariodet_dsc,
      p.producto_dsc || (coalesce(' - ' || pfd.prodfarmadet_caracteristica, ' - ' || p.producto_caracteristica, '')) || ' | ' || coalesce(fp.fpres_dsc, '')) as descripcion,
      case when coalesce(pvnc.predocvnt_tipo, pv.predocvnt_tipo) = 6 then 'REHABILITACIÓN'
      else ta.tpatencion_dsc end as tp_atencion,
      dvsd.docvntsunatdet_cantidad as cantidad,
      dvsd.docvntsunatdet_preciounineto as precio_uni,
      dvsd.docvntsunatdet_totneto as total,
      coalesce(dvs.docvntsunat_ticket, 0) as ticket
    from
      sch_clinica.tbl_docvntsunat dvs
      left join sch_clinica.tbl_predocvnt pv on (dvs.docvntsunat_predocvnt_cod = pv.predocvnt_cod)

      left join sch_clinica.tbl_docvntsunat_referencia dvsr on (dvs.docvntsunat_cod = dvsr.docvntsunat_referencia_cod)
      left join sch_clinica.tbl_docvntsunat dvsnc on (dvsr.docvntsunat_referencia_docref_cod = dvsnc.docvntsunat_cod)
      left join sch_clinica.tbl_predocvnt pvnc on (dvsnc.docvntsunat_predocvnt_cod = pvnc.predocvnt_cod)
      left join sch_clinica.tbl_ordatenciondet oad on (pv.predocvnt_cod = oad.ordatenciondet_predocvnt_cod)
      left join sch_clinica.tbl_rmsegus_prvnt rmsp on (pv.predocvnt_cod = rmsp.rmsegus_prvnt_prvntcod)
      left join sch_clinica.tbl_recetamedsegus rms on (rmsp.rmsegus_prvnt_rscod = rms.recetamedsegus_cod)
      left join sch_clinica.tbl_rmfarma_prvnt rmfp on (pv.predocvnt_cod = rmfp.rmfarma_prvnt_prvntcod)
      left join sch_clinica.tbl_recetamedfarma rmf on (rmfp.rmfarma_prvnt_rfcod = rmf.recetamedfarma_cod)
      left join sch_clinica.tbl_hcprocmed_prvnt hpp on (pv.predocvnt_cod = hpp.hcprocmed_prvnt_prvntcod)
      left join sch_clinica.tbl_hstconsulta_procmed hcp on (hpp.hcprocmed_prvnt_pmcod = hcp.hstconsulta_procmed_cod)
      left join sch_clinica.tbl_tratamiento_venta tv on (pv.predocvnt_cod = tv.tratamiento_venta_predocvnt_cod)
      left join sch_clinica.tbl_tratamiento tt on (tv.tratamiento_venta_cod_tratamiento = tt.tratamiento_cod)
      left join sch_clinica.tbl_recetamed rm on (coalesce(rms.recetamedsegus_rmcod, rmf.recetamedfarma_rmcod) = rm.recetamed_cod)

      left join sch_clinica.tbl_ordatencion oa on (coalesce(dvs.docvntsunat_oa_codigo, oad.ordatenciondet_ordatencion_cod,
      rm.recetamed_ordatenciondet_cod, hcp.hstconsulta_procmed_oacod) = oa.ordatencion_cod)
      left join sch_clinica.tbl_docvntsunatdet dvsd on (dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod)
      left join sch_clinica.tbl_tppaciente tpp on (oa.ordatencion_tpaciente_cod = tpp.tppaciente_cod)
      left join sch_clinica.tbl_tpatencion ta on (coalesce(oa.ordatencion_tpatencion_cod, 5) = ta.tpatencion_cod)
      left join sch_clinica.tbl_negociacionprecio np on (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)
      left join sch_clinica.vw_persona vp on (coalesce(oa.ordatencion_paciente_cod, pv.predocvnt_paciente_cod, case when dvs.docvntsunat_tpcliente != 3 then dvs.docvntsunat_cliente_cod else null end) = vp.vw_persona_cod)
      left join sch_clinica.tbl_tarifariodet td on (dvsd.docvntsunatdet_elemento_cod = td.tarifariodet_cod
      and dvsd.docvntsunatdet_elemento_item = td.tarifariodet_item and dvsd.docvntsunatdet_tpelemento = 0)
      left join sch_clinica.tbl_segus s on (td.tarifariodet_cod = s.segus_tarifariodet_cod
      and td.tarifariodet_item = s.segus_tarifariodet_item)
      left join sch_clinica.tbl_area a on (s.segus_area_cod = a.area_cod)
      left join sch_clinica.tbl_tarifario t on (td.tarifariodet_cod = t.tarifario_cod)
      left join sch_clinica.tbl_lstpreciofarmadet lpfd on (dvsd.docvntsunatdet_elemento_cod = lpfd.lstpreciofarmadet_cod
      and dvsd.docvntsunatdet_elemento_item = lpfd.lstpreciofarmadet_item and dvsd.docvntsunatdet_tpelemento = 1)
      left join sch_clinica.tbl_lstpreciodet lpd on (dvsd.docvntsunatdet_elemento_cod = lpd.lstpreciodet_cod
      and dvsd.docvntsunatdet_elemento_item = lpd.lstpreciodet_item and dvsd.docvntsunatdet_tpelemento = 2)
      left join sch_clinica.tbl_prodfarmadet pfd on (lpfd.lstpreciofarmadet_prodfarmadet_cod = pfd.prodfarmadet_prodfarma_cod
      and lpfd.lstpreciofarmadet_prodfarmadet_item = pfd.prodfarmadet_item)
      left join sch_clinica.tbl_prodfarma pf on (pfd.prodfarmadet_prodfarma_cod = pf.prodfarma_cod)
      left join sch_clinica.tbl_producto p on (coalesce(pf.prodfarma_producto_cod, lpd.lstpreciodet_producto_cod) = p.producto_cod)
      left join sch_clinica.tbl_fpres fp on (coalesce(pfd.prodfarmadet_fpres_cod, p.producto_fpres_cod) = fp.fpres_cod)
      /*left join sch_clinica.tbl_ordatencionamb oaa on (dvs.docvntsunat_oa_codigo = oaa.ordatencionamb_ordatenciondet_cod
      and dvs.docvntsunat_oa_item = oaa.ordatencionamb_ordatenciondet_item)
      left join sch_clinica.tbl_citamedica cm on (oaa.ordatencionamb_citamedica_cod = cm.citamedica_cod)
      left join sch_clinica.vw_persona pa on (cm.citamedica_pacod = vp.vw_persona_cod)*/
    where
      (dvs.docvntsunat_ticket = 1 or dvs.docvntsunat_tpdoc = 12)
      and to_char(dvs.docvntsunat_femision, 'YYYYMM') like :periodo
      and dvs.docvntsunat_anulado = 0
      and dvs.docvntsunat_tpdoc <> 105
      and (dvsd.docvntsunatdet_tpelemento = 1 or dvsd.docvntsunatdet_tpelemento = 2)

    union ALL

    select
      dvs.docvntsunat_cod AS documento,
      to_char(dvs.docvntsunat_femision, 'MM') AS mes,
      coalesce(tpp.tppaciente_dsc, 'PARTICULAR') AS tipo_cliente,
      coalesce(np.negociacionprecio_dsc, 'PARTICULAR') AS negociacion,
      coalesce(vp.vw_persona_nombres, 'EVENTUAL') AS paciente,
      cso.cattpservicio_oid_dsc AS tipo_servicio,
      '' AS prof_atención,
      coalesce(td.tarifariodet_dsc,
      p.producto_dsc || (coalesce(' - ' || pfd.prodfarmadet_caracteristica, ' - ' || p.producto_caracteristica, '')) || ' | ' || fp.fpres_dsc),
      coalesce(ta.tpatencion_dsc, ta2.tpatencion_dsc),
      dvss.docvntsunatsubdet_cantidad,
      /*(dvss.docvntsunatsubdet_total / dvss.docvntsunatsubdet_cantidad),
      case when oafh.ordatencion_factura_historial_tpaciente != 2 then dvss.docvntsunatsubdet_total else 0.00 end,
      case when oafh.ordatencion_factura_historial_tpaciente = 2 then dvss.docvntsunatsubdet_total else 0.00 end,
      dvss.docvntsunatsubdet_total*/
      (dvss.docvntsunatsubdet_total / dvss.docvntsunatsubdet_cantidad),
      dvss.docvntsunatsubdet_total,
      coalesce(dvs.docvntsunat_ticket, 0) as ticket
    from
      sch_clinica.tbl_docvntsunat dvs
      left join sch_clinica.tbl_ordatencion_factura_historial oafh on (dvs.docvntsunat_cod = oafh.ordatencion_factura_historial_docvntsunatcod)
      left join sch_clinica.tbl_ordatencion oa on (oafh.ordatencion_factura_historial_oacod = oa.ordatencion_cod)
      left join sch_clinica.tbl_tpatencion ta on (oa.ordatencion_tpatencion_cod = ta.tpatencion_cod)
      left join sch_clinica.tbl_ordeninternamiento oi on (oafh.ordatencion_factura_historial_oicod = oi.ordinternamiento_cod)
      left join sch_clinica.tbl_tppaciente tpp on (oi.ordinternamiento_tppaciente = tpp.tppaciente_cod)
      left join sch_clinica.tbl_negociacionprecio np on (oi.ordinternamiento_ncod = np.negociacionprecio_cod)
      left join sch_clinica.vw_persona vp on (oa.ordatencion_paciente_cod = vp.vw_persona_cod)
      left join sch_clinica.tbl_docvntsunatsubdet dvss on (dvs.docvntsunat_cod = dvss.docvntsunatsubdet_sv_cod)
      left join sch_clinica.tbl_cattpservicio_oid cso on (dvss.docvntsunatsubdet_tp_detalle = cso.cattpservicio_oid_cod)
      left join sch_clinica.tbl_tarifariodet td on (cast(dvss.docvntsunatsubdet_elemento_cod as integer) = td.tarifariodet_cod
      and cast(dvss.docvntsunatsubdet_elemento_item as integer) = td.tarifariodet_item)
      left join sch_clinica.tbl_prodfarmadet pfd on (dvss.docvntsunatsubdet_pfd_cod = pfd.prodfarmadet_prodfarma_cod
      and dvss.docvntsunatsubdet_pfd_item = pfd.prodfarmadet_item)
      left join sch_clinica.tbl_prodfarma pf on (pfd.prodfarmadet_prodfarma_cod = pf.prodfarma_cod)
      left join sch_clinica.tbl_producto p on (coalesce(pf.prodfarma_producto_cod, cast(dvss.docvntsunatsubdet_pfd_cod as integer)) = p.producto_cod)
      left join sch_clinica.tbl_fpres fp on (coalesce(pfd.prodfarmadet_fpres_cod, p.producto_fpres_cod) = fp.fpres_cod)
      left join sch_clinica.tbl_docvntsunat_referencia dvsr on (dvs.docvntsunat_cod = dvsr.docvntsunat_referencia_cod)
      left join sch_clinica.tbl_ordatencion_factura_historial oafh2 on (dvsr.docvntsunat_referencia_docref_cod = oafh2.ordatencion_factura_historial_docvntsunatcod)
      left join sch_clinica.tbl_ordatencion oa2 on (oafh2.ordatencion_factura_historial_oacod = oa2.ordatencion_cod)
      left join sch_clinica.tbl_tpatencion ta2 on (oa2.ordatencion_tpatencion_cod = ta2.tpatencion_cod)
    where
      (dvs.docvntsunat_ticket = 0 or dvs.docvntsunat_ticket is NULL)
      and dvs.docvntsunat_tpdoc != 12
      and to_char(dvs.docvntsunat_femision, 'YYYYMM') like :periodo
      and dvs.docvntsunat_anulado = 0
      and dvs.docvntsunat_tpdoc <> 105
      and (oafh.ordatencion_factura_historial_oicod is not null or oafh2.ordatencion_factura_historial_oicod is not null)

    union ALL

    select
      dvs.docvntsunat_cod AS documento,
      to_char(dvs.docvntsunat_femision, 'MM') AS mes,
      coalesce(tpp.tppaciente_dsc, 'PARTICULAR') AS tipo_cliente,
      coalesce(np.negociacionprecio_dsc, 'PARTICULAR') AS negociacion,
      coalesce(vp.vw_persona_nombres, 'EVENTUAL') AS paciente,
      case when dvss.docvntsunatsubdet_tp_detalle = 0 then 'CONSULTAS MEDICAS'
      when dvss.docvntsunatsubdet_tp_detalle = 2 or dvss.docvntsunatsubdet_tp_detalle = 6 then 'FARMACIA'
      when dvss.docvntsunatsubdet_tp_detalle = 5 then 'PROCEDIMIENTO MEDICO' else a.area_dsc end AS tipo_servicio,
      '' AS prof_atención,
      coalesce(td.tarifariodet_dsc, td2.tarifariodet_dsc,
      p.producto_dsc || (coalesce(' - ' || pfd.prodfarmadet_caracteristica, ' - ' || p.producto_caracteristica, '')) || ' | ' || fp.fpres_dsc),
      coalesce(ta.tpatencion_dsc, ta2.tpatencion_dsc),
      dvss.docvntsunatsubdet_cantidad,
      /*(dvss.docvntsunatsubdet_total / dvss.docvntsunatsubdet_cantidad),
      case when oafh.ordatencion_factura_historial_tpaciente != 2 then dvs
      s.docvntsunatsubdet_total else 0.00 end,
      case when oafh.ordatencion_factura_historial_tpaciente = 2 then dvss.docvntsunatsubdet_total else 0.00 end,
      dvss.docvntsunatsubdet_total*/
      (dvss.docvntsunatsubdet_total / dvss.docvntsunatsubdet_cantidad),
      dvss.docvntsunatsubdet_total,
      coalesce(dvs.docvntsunat_ticket, 0) as ticket
    from
      sch_clinica.tbl_docvntsunat dvs
      left join sch_clinica.tbl_ordatencion_factura_historial oafh on (dvs.docvntsunat_cod = oafh.ordatencion_factura_historial_docvntsunatcod)
      left join sch_clinica.tbl_ordatencion oa on (oafh.ordatencion_factura_historial_oacod = oa.ordatencion_cod)
      left join sch_clinica.tbl_tpatencion ta on (oa.ordatencion_tpatencion_cod = ta.tpatencion_cod)
      left join sch_clinica.tbl_tppaciente tpp on (oa.ordatencion_tpaciente_cod = tpp.tppaciente_cod)
      left join sch_clinica.tbl_negociacionprecio np on (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)
      left join sch_clinica.vw_persona vp on (oa.ordatencion_paciente_cod = vp.vw_persona_cod)
      left join sch_clinica.tbl_docvntsunatsubdet dvss on (dvs.docvntsunat_cod = dvss.docvntsunatsubdet_sv_cod)
      left join sch_clinica.tbl_espprofatencion em on (cast(dvss.docvntsunatsubdet_elemento_item as integer) = em.espprofatencion_cod
      and dvss.docvntsunatsubdet_tp_detalle = 0)
      left join sch_clinica.tbl_tarifariodet td on (em.espprofatencion_tarifariodet_cod = td.tarifariodet_cod
      and em.espprofatencion_tarifariodet_item = td.tarifariodet_item)
      left join sch_clinica.tbl_tarifariodet td2 on (cast(dvss.docvntsunatsubdet_elemento_cod as integer) = td2.tarifariodet_cod
      and cast(dvss.docvntsunatsubdet_elemento_item as integer) = td2.tarifariodet_item
      and (dvss.docvntsunatsubdet_tp_detalle = 1 or dvss.docvntsunatsubdet_tp_detalle = 5 or dvss.docvntsunatsubdet_tp_detalle = 7))
      left join sch_clinica.tbl_prodfarmadet pfd on (dvss.docvntsunatsubdet_pfd_cod = pfd.prodfarmadet_prodfarma_cod
      and dvss.docvntsunatsubdet_pfd_item = pfd.prodfarmadet_item)
      left join sch_clinica.tbl_prodfarma pf on (pfd.prodfarmadet_prodfarma_cod = pf.prodfarma_cod)
      left join sch_clinica.tbl_producto p on (coalesce(pf.prodfarma_producto_cod, cast(dvss.docvntsunatsubdet_pfd_cod as integer)) = p.producto_cod)
      left join sch_clinica.tbl_fpres fp on (coalesce(pfd.prodfarmadet_fpres_cod, p.producto_fpres_cod) = fp.fpres_cod)
      left join sch_clinica.tbl_docvntsunat_referencia dvsr on (dvs.docvntsunat_cod = dvsr.docvntsunat_referencia_cod)
      left join sch_clinica.tbl_ordatencion_factura_historial oafh2 on (dvsr.docvntsunat_referencia_docref_cod = oafh2.ordatencion_factura_historial_docvntsunatcod)
      left join sch_clinica.tbl_ordatencion oa2 on (oafh2.ordatencion_factura_historial_oacod = oa2.ordatencion_cod)
      left join sch_clinica.tbl_tpatencion ta2 on (oa2.ordatencion_tpatencion_cod = ta2.tpatencion_cod)
      left join sch_clinica.tbl_segus s on (coalesce(td.tarifariodet_cod, td2.tarifariodet_cod) = s.segus_tarifariodet_cod
      and coalesce(td.tarifariodet_item, td2.tarifariodet_item) = s.segus_tarifariodet_item)
      left join sch_clinica.tbl_area a on (s.segus_area_cod = a.area_cod)
    where
      (dvs.docvntsunat_ticket = 0 or dvs.docvntsunat_ticket is NULL)
      and dvs.docvntsunat_tpdoc != 12
      and to_char(dvs.docvntsunat_femision, 'YYYYMM') like :periodo
      and dvs.docvntsunat_anulado = 0
      and dvs.docvntsunat_tpdoc <> 105
      and ((oafh.ordatencion_factura_historial_oacod is not null and oafh.ordatencion_factura_historial_oicod is null)
      OR (oafh2.ordatencion_factura_historial_oacod is not null and oafh2.ordatencion_factura_historial_oicod is null))) as det
  group by
    det.mes,
    det.tipo_cliente,
    det.negociacion,
    det.paciente,
    det.tipo_servicio,
    det.prof_atencion,
    det.documento,
    det.descripcion,
    det.tp_atencion,
    det.ticket
  order by
    det.mes,
    det.tipo_cliente,
    det.negociacion,
    det.paciente,
    det.tipo_servicio,
    det.descripcion) as det2
group by
  det2.mes,
  det2.tipo_cliente,
  det2.negociacion,
  det2.paciente,
  det2.tipo_servicio,
  det2.prof_atencion,
  det2.documento,
  det2.descripcion,
  det2.tp_atencion,
  det2.cantidad
order by
  det2.mes,
  det2.tipo_cliente,
  det2.negociacion,
  det2.paciente,
  det2.tipo_servicio,
  det2.descripcion