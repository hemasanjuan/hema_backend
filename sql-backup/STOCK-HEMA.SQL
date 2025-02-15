select
	pfd.prodfarmadet_prodfarma_cod || '-' || pfd.prodfarmadet_item,
    pfd.prodfarmadet_horacle as cod_oracle,
    pro.producto_dsc,
    unid.unidad_dsc,
    FFR.ffar_dsc AS "Forma Farmaceútica",
    FPR.fpres_dsc AS "Forma de Presentación",
    alm.almacen_dsc,
    alm.almacen_horacle AS almacen_oracle,
    ca.contenedor_almacen_des as localizador,
    case when pfd.prodfarmadet_coracle = 2 THEN
    cl.contenedor_lote_nro_lote else '' end as lote,
    cl.contenedor_lote_fvencimiento,
    cl.contenedor_lote_cantidad
from
	sch_clinica.tbl_contenedor_lote cl
    inner join sch_clinica.tbl_contenedor_producto cp on
    (cl.contenedor_lote_cp_cod = cp.contenedor_producto_cod)
    inner join sch_clinica.tbl_contenedor_almacen ca on
    (cp.contenedor_producto_contalmcod = ca.contenedor_almacen_cod)
    inner join sch_clinica.tbl_prodfarma pf on
    (cp.contenedor_producto_pfdcod = pf.prodfarma_cod)
    inner join sch_clinica.tbl_prodfarmadet pfd on
    (cp.contenedor_producto_pfdcod = pfd.prodfarmadet_prodfarma_cod and
     cp.contenedor_producto_pfditem = pfd.prodfarmadet_item)
    inner join sch_clinica.tbl_almacen alm on
    (ca.contenedor_almacen_almcod = alm.almacen_cod)
    inner join sch_clinica.tbl_producto pro on
    (pf.prodfarma_producto_cod = pro.producto_cod)
    inner join sch_clinica.tbl_unidad unid on
    (pro.producto_unidad_cod = unid.unidad_cod)
    --INNER JOIN sch_clinica.tbl_producto P ON (PF.prodfarma_producto_cod = P.producto_cod)
    INNER JOIN sch_clinica.tbl_ffar FFR ON (PF.prodfarma_ffar_cod = FFR.ffar_cod)
    INNER JOIN sch_clinica.tbl_fpres FPR ON (PFD.prodfarmadet_fpres_cod = FPR.fpres_cod)
where
	cl.contenedor_lote_cantidad > 0 --and
   -- cp.contenedor_producto_tpproducto = 1 
    

union all

select
	cast(prod.producto_cod as varchar),
    prod.producto_horacle,
    alm.almacen_dsc,
    FFR.ffar_dsc AS "Forma Farmaceútica",
    FPR.fpres_dsc AS "Forma de Presentación",
    alm.almacen_horacle,
    prod.producto_dsc,
    unid.unidad_dsc,
    ca.contenedor_almacen_des,
    case when prod.producto_coracle = 2 then
    cl.contenedor_lote_nro_lote else '' end,
    cl.contenedor_lote_fvencimiento,
    cl.contenedor_lote_cantidad
from
	sch_clinica.tbl_contenedor_lote cl
    inner join sch_clinica.tbl_contenedor_producto cp on
    (cl.contenedor_lote_cp_cod = cp.contenedor_producto_cod)
    inner join sch_clinica.tbl_contenedor_almacen ca on
    (cp.contenedor_producto_contalmcod = ca.contenedor_almacen_cod)
    inner join sch_clinica.tbl_producto prod on
    (cp.contenedor_producto_productocod = prod.producto_cod)
    inner join sch_clinica.tbl_almacen alm on
    (ca.contenedor_almacen_almcod = alm.almacen_cod)
    inner join sch_clinica.tbl_unidad unid on
    (prod.producto_unidad_cod = unid.unidad_cod)
     --INNER JOIN sch_clinica.tbl_producto P ON (PF.prodfarma_producto_cod = P.producto_cod)
    INNER JOIN sch_clinica.tbl_ffar FFR ON (prod.producto_ffar_cod = FFR.ffar_cod)
    INNER JOIN sch_clinica.tbl_fpres FPR ON (prod.producto_fpres_cod = FPR.fpres_cod)
where
	cl.contenedor_lote_cantidad > 0 --and
    --cp.contenedor_producto_tpproducto = 1