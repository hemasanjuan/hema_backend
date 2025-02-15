SELECT 
  sch_clinica.tbl_contenedor_producto.contenedor_producto_productocod,
  sch_clinica.tbl_contenedor_producto.contenedor_producto_pfdcod,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_nro_lote,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_estado,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_cantidad,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_cod
FROM
  sch_clinica.tbl_contenedor_producto
  INNER JOIN sch_clinica.tbl_contenedor_lote ON (sch_clinica.tbl_contenedor_producto.contenedor_producto_cod = sch_clinica.tbl_contenedor_lote.contenedor_lote_cp_cod)
WHERE
  sch_clinica.tbl_contenedor_lote.contenedor_lote_cantidad < 0;
  
  ---- lote contenedor ---------
  SELECT 
  sch_clinica.tbl_contenedor_lote.contenedor_lote_cod,
  sch_clinica.tbl_producto.producto_cod,
  sch_clinica.tbl_producto.producto_dsc,
  sch_clinica.tbl_producto.producto_horacle,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_nro_lote,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_cantidad,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_estado,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_cod,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_cp_cod
FROM
  sch_clinica.tbl_producto
  INNER JOIN sch_clinica.tbl_contenedor_producto ON (sch_clinica.tbl_producto.producto_cod = sch_clinica.tbl_contenedor_producto.contenedor_producto_productocod)
  INNER JOIN sch_clinica.tbl_contenedor_lote ON (sch_clinica.tbl_contenedor_producto.contenedor_producto_cod = sch_clinica.tbl_contenedor_lote.contenedor_lote_cp_cod)
WHERE
  sch_clinica.tbl_contenedor_producto.contenedor_producto_contalmcod = 48 AND 
  sch_clinica.tbl_contenedor_lote.contenedor_lote_estado = 0 AND 
  sch_clinica.tbl_producto.producto_horacle := 'codigo'
    --sch_clinica.tbl_contenedor_lote.contenedor_lote_cantidad < 0
  
  ----- lote contenedor prodfarmaaa ----------
  SELECT 
  sch_clinica.tbl_contenedor_lote.contenedor_lote_cod,
  sch_clinica.tbl_prodfarma.prodfarma_cod,
  sch_clinica.tbl_prodfarmadet.prodfarmadet_horacle,
  sch_clinica.tbl_producto.producto_dsc,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_nro_lote,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_cp_cod,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_cantidad,
  sch_clinica.tbl_contenedor_lote.contenedor_lote_estado
FROM
  sch_clinica.tbl_contenedor_producto
  INNER JOIN sch_clinica.tbl_contenedor_lote ON (sch_clinica.tbl_contenedor_producto.contenedor_producto_cod = sch_clinica.tbl_contenedor_lote.contenedor_lote_cp_cod)
  INNER JOIN sch_clinica.tbl_prodfarma ON (sch_clinica.tbl_prodfarma.prodfarma_cod = sch_clinica.tbl_contenedor_producto.contenedor_producto_pfdcod)
  INNER JOIN sch_clinica.tbl_prodfarmadet ON (sch_clinica.tbl_prodfarmadet.prodfarmadet_prodfarma_cod = sch_clinica.tbl_prodfarma.prodfarma_cod)
  INNER JOIN sch_clinica.tbl_producto ON (sch_clinica.tbl_prodfarma.prodfarma_producto_cod = sch_clinica.tbl_producto.producto_cod)
WHERE
  sch_clinica.tbl_contenedor_producto.contenedor_producto_contalmcod = 48 AND 
  --sch_clinica.tbl_contenedor_lote.contenedor_lote_estado = 0 AND 
  sch_clinica.tbl_prodfarmadet.prodfarmadet_horacle ='41.10.42.13.0002'
  
  ------------- stock -------------
  update sch_clinica.tbl_contenedor_lote
  set
  	contenedor_lote_cantidad = 48
  where
  	contenedor_lote_cod=54495
    
    5290