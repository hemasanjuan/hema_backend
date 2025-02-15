SELECT
 dvs.docvntsunat_femision as "F. EMISION",
 dvs.docvntsunat_serie || '-' || dvs.docvntsunat_nro as "DOCUMENTO",
    pac.paciente_hstclinica_cod as "HST CLINICA",
    per.vw_persona_nombres as "CLIENTE",
    pfd.prodfarmadet_prodfarma_cod || '-' || pfd.prodfarmadet_item as "COD PRODUCTO",
    prod.producto_dsc AS "PRODUCTO",
    fab.fabr_dsc as "FABRICANTE",
    fpres.fpres_dsc AS "FORMA PRESENTACION",
    dvsd.docvntsunatdet_cantidad as "CANTIDAD",
    case when dvsd.docvntsunatdet_afectoigv = 1 then
     round(cast(dvsd.docvntsunatdet_totneto * (1 + dvs.docvntsunat_igv) as numeric),2)
    else 
     round(cast(dvsd.docvntsunatdet_totneto as numeric),2)
    end AS "TOTAL NETO",
    case when dvsd.docvntsunatdet_afectoigv = 1 then
     round(cast((dvsd.docvntsunatdet_preciouniventa * dvsd.docvntsunatdet_cantidad) * (1 + dvs.docvntsunat_igv) as numeric),2)
    else
     round(cast(dvsd.docvntsunatdet_preciouniventa * dvsd.docvntsunatdet_cantidad as numeric),2)
    end AS "TOTAL VENTA",
    dvs.docvntsunat_oa_codigo as "ORD ATENCION",
    MED.medico AS "MEDICO",
    COALESCE(NP.negociacionprecio_dsc, 'EVENTUAL') AS "NEGOCIACION"
FROM
 sch_clinica.tbl_docvntsunat dvs
    inner join sch_clinica.tbl_docvntsunatdet dvsd on
    (dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod)
    inner join sch_clinica.tbl_lstpreciofarmadet lpfd on
    (dvsd.docvntsunatdet_tpelemento = 1 and
     dvsd.docvntsunatdet_elemento_cod = lpfd.lstpreciofarmadet_cod and
     dvsd.docvntsunatdet_elemento_item = lpfd.lstpreciofarmadet_item)
    inner join sch_clinica.tbl_prodfarmadet pfd on
    (lpfd.lstpreciofarmadet_prodfarmadet_cod = pfd.prodfarmadet_prodfarma_cod and
     lpfd.lstpreciofarmadet_prodfarmadet_item = pfd.prodfarmadet_item)
    inner join sch_clinica.tbl_prodfarma pf on
    (pfd.prodfarmadet_prodfarma_cod = pf.prodfarma_cod)
    inner join sch_clinica.tbl_producto prod on
    (pf.prodfarma_producto_cod = prod.producto_cod)
    left join sch_clinica.tbl_fpres fpres on
    (pfd.prodfarmadet_fpres_cod = fpres.fpres_cod)
    left join sch_clinica.tbl_fabr fab on
    (pf.prodfarma_fabr_cod = fab.fabr_cod)
    left join sch_clinica.vw_persona per on
    (dvs.docvntsunat_cliente_cod = per.vw_persona_cod and
     dvs.docvntsunat_tpcliente <> 3)
    left join sch_clinica.tbl_paciente pac on
    (per.vw_persona_cod = pac.paciente_cod)
    left join sch_clinica.tbl_ordatencion oa on
    (dvs.docvntsunat_oa_codigo = oa.ordatencion_cod)
    left join sch_clinica.tbl_negociacionprecio np on
    (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)
    left join
    (
     select
         oa_amb.ordatencionamb_ordatenciondet_cod,
            med.vw_persona_nombres as medico
        from
         sch_clinica.tbl_ordatencionamb oa_amb
            inner join sch_clinica.tbl_citamedica cm on
            (oa_amb.ordatencionamb_citamedica_cod = cm.citamedica_cod)
            inner join sch_clinica.vw_persona med on
            (cm.citamedica_pacod = med.vw_persona_cod)
        where
         cm.citamedica_estado = 1
    ) as MED ON (dvs.docvntsunat_oa_codigo = MED.ordatencionamb_ordatenciondet_cod)
where
 date(dvs.docvntsunat_femision) >= #finicio# and
    date(dvs.docvntsunat_femision) <= #ffin# and
    dvs.docvntsunat_tpref = 0
    
union all

SELECT
 dvs.docvntsunat_femision,
 dvs.docvntsunat_serie || '-' || dvs.docvntsunat_nro as "DOCUMENTO",
    PAC.paciente_hstclinica_cod,
    per.vw_persona_nombres as "CLIENTE",
    cast(prod.producto_cod as varchar) as "COD PRODUCTO",
    prod.producto_dsc AS "PRODUCTO",
    fab.fabr_dsc as "FABRICANTE",
    fpres.fpres_dsc AS "FORMA PRESENTACION",    
    dvsd.docvntsunatdet_cantidad as "CANTIDAD",
  case when dvsd.docvntsunatdet_afectoigv = 1 then
     round(cast(dvsd.docvntsunatdet_totneto * (1 + dvs.docvntsunat_igv) as numeric),2)
    else 
     round(cast(dvsd.docvntsunatdet_totneto as numeric),2)
    end AS "TOTAL NETO",
    case when dvsd.docvntsunatdet_afectoigv = 1 then
     round(cast((dvsd.docvntsunatdet_preciouniventa * dvsd.docvntsunatdet_cantidad) * (1 + dvs.docvntsunat_igv) as numeric),2)
    else
     round(cast(dvsd.docvntsunatdet_preciouniventa * dvsd.docvntsunatdet_cantidad as numeric),2)
    end AS "TOTAL VENTA",
        dvs.docvntsunat_oa_codigo as "ORD ATENCION",
    MED.medico AS "MEDICO",
    COALESCE(NP.negociacionprecio_dsc, 'EVENTUAL') AS "NEGOCIACION"
FROM
 sch_clinica.tbl_docvntsunat dvs
    inner join sch_clinica.tbl_docvntsunatdet dvsd on
    (dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod)
    inner join sch_clinica.tbl_lstpreciodet lpd on
    (dvsd.docvntsunatdet_tpelemento = 2 and
     dvsd.docvntsunatdet_elemento_cod = lpd.lstpreciodet_cod and
     dvsd.docvntsunatdet_elemento_item = lpd.lstpreciodet_item)
    inner join sch_clinica.tbl_producto prod on
    (lpd.lstpreciodet_producto_cod = prod.producto_cod)
    left join sch_clinica.tbl_fpres fpres on
    (prod.producto_fpres_cod = fpres.fpres_cod)
    left join sch_clinica.tbl_fabr fab on
    (prod.producto_fabricante_cod = fab.fabr_cod)
    left join sch_clinica.vw_persona per on
    (dvs.docvntsunat_cliente_cod = per.vw_persona_cod and
     dvs.docvntsunat_tpcliente <> 3)
    left join sch_clinica.tbl_paciente pac on
    (per.vw_persona_cod = pac.paciente_cod)
left join sch_clinica.tbl_ordatencion oa on
    (dvs.docvntsunat_oa_codigo = oa.ordatencion_cod)
    left join sch_clinica.tbl_negociacionprecio np on
    (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)
    left join
    (
     select
         oa_amb.ordatencionamb_ordatenciondet_cod,
            med.vw_persona_nombres as medico
        from
         sch_clinica.tbl_ordatencionamb oa_amb
            inner join sch_clinica.tbl_citamedica cm on
            (oa_amb.ordatencionamb_citamedica_cod = cm.citamedica_cod)
            inner join sch_clinica.vw_persona med on
            (cm.citamedica_pacod = med.vw_persona_cod)
        where
         cm.citamedica_estado = 1
    ) as MED ON (dvs.docvntsunat_oa_codigo = MED.ordatencionamb_ordatenciondet_cod)
where
 date(dvs.docvntsunat_femision) >= #finicio# and
    date(dvs.docvntsunat_femision) <= #ffin# and
    dvs.docvntsunat_tpref = 0
    
union all
    
select
 ma.movimiento_almacen_fmovimiento,
    '',    
    PAC.paciente_hstclinica_cod,
    per.vw_persona_nombres,
    pfd.prodfarmadet_prodfarma_cod || '-' || pfd.prodfarmadet_item as "COD PRODUCTO",
    prod.producto_dsc AS "PRODUCTO",
    fab.fabr_dsc as "FABRICANTE",
    fpres.fpres_dsc AS "FORMA PRESENTACION",
    mafd.movalmfar_det_cantidad,
    mafd.movalmfar_det_cantidad * mafd.movalmfar_det_preciouni,
    mafd.movalmfar_det_cantidad * mafd.movalmfar_det_preciouni,
        OA.ordatencion_cod as "ORD ATENCION",
    '' AS "MEDICO",
    COALESCE(NP.negociacionprecio_dsc, 'EVENTUAL') AS "NEGOCIACION"
from
 sch_clinica.tbl_movimiento_almacen ma
    inner join sch_clinica.tbl_movimiento_farmacia mf on
    (ma.movimiento_almacen_mfcod = mf.movimiento_farmacia_cod)
    inner join sch_clinica.tbl_ordatencion oa on
    (mf.movimiento_farmacia_oacod = oa.ordatencion_cod)
     left join sch_clinica.tbl_negociacionprecio np on
    (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)
    inner join sch_clinica.vw_persona per on
    (oa.ordatencion_paciente_cod = per.vw_persona_cod)
    inner join sch_clinica.tbl_movalmfar_det mafd on
    (ma.movimiento_almacen_cod = mafd.movalmfar_det_cod)
    inner join sch_clinica.tbl_prodfarmadet pfd on
    (mafd.movalmfar_det_prodfarma_cod = pfd.prodfarmadet_prodfarma_cod and
     mafd.movalmfar_det_prodfarma_item = pfd.prodfarmadet_item)
    inner join sch_clinica.tbl_prodfarma pf on
    (pfd.prodfarmadet_prodfarma_cod = pf.prodfarma_cod)
    inner join sch_clinica.tbl_producto prod on
    (pf.prodfarma_producto_cod = prod.producto_cod)
    left join sch_clinica.tbl_fpres fpres on
    (pfd.prodfarmadet_fpres_cod = fpres.fpres_cod)
    left join sch_clinica.tbl_fabr fab on
    (pf.prodfarma_fabr_cod = fab.fabr_cod)
    left join sch_clinica.tbl_paciente pac on
    (per.vw_persona_cod = pac.paciente_cod)

where
 ma.movimiento_almacen_motivo_cod = 7 AND
    date(ma.movimiento_almacen_fmovimiento) >= #finicio# and
    date(ma.movimiento_almacen_fmovimiento) <= #ffin#
    
union all

select
 ma.movimiento_almacen_fmovimiento,
    '',    
    PAC.paciente_hstclinica_cod,
    per.vw_persona_nombres,
    cast(prod.producto_cod as varchar) as "COD PRODUCTO",
    prod.producto_dsc AS "PRODUCTO",
    fab.fabr_dsc as "FABRICANTE",
    fpres.fpres_dsc AS "FORMA PRESENTACION",
    mad.movimiento_almacen_det_cantidad,
    mad.movimiento_almacen_det_cantidad * mad.movimiento_almacen_det_preciouni,
    mad.movimiento_almacen_det_cantidad * mad.movimiento_almacen_det_preciouni,
        OA.ordatencion_cod as "ORD ATENCION",
    '' AS "MEDICO",
    COALESCE(NP.negociacionprecio_dsc, 'EVENTUAL') AS "NEGOCIACION"
from
 sch_clinica.tbl_movimiento_almacen ma
    inner join sch_clinica.tbl_movimiento_farmacia mf on
    (ma.movimiento_almacen_mfcod = mf.movimiento_farmacia_cod)
    inner join sch_clinica.tbl_ordatencion oa on
    (mf.movimiento_farmacia_oacod = oa.ordatencion_cod)
     left join sch_clinica.tbl_negociacionprecio np on
    (oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod)
    inner join sch_clinica.vw_persona per on
    (oa.ordatencion_paciente_cod = per.vw_persona_cod)
    inner join sch_clinica.tbl_movimiento_almacen_det mad on
    (ma.movimiento_almacen_cod = mad.movimiento_almacen_det_cod)
    inner join sch_clinica.tbl_producto prod on
    (mad.movimiento_almacen_det_pcod = prod.producto_cod)
    left join sch_clinica.tbl_fpres fpres on
    (prod.producto_fpres_cod = fpres.fpres_cod)
    left join sch_clinica.tbl_fabr fab on
    (prod.producto_fabricante_cod = fab.fabr_cod)
        left join sch_clinica.tbl_paciente pac on
    (per.vw_persona_cod = pac.paciente_cod)

where
 ma.movimiento_almacen_motivo_cod = 7 AND
    date(ma.movimiento_almacen_fmovimiento) >= #finicio# and
    date(ma.movimiento_almacen_fmovimiento) <= #ffin# 
order by
 1