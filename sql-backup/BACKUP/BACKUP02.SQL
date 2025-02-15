/** REALIZADO POR ARTURO MACEDO */
SELECT 
  CEC.centrocosto_dsc AS centro_costo,
  REQ.requerimiento_cod AS requerimiento_codigo,
  VW.vw_producto_cod AS producto_codigo,
  VW.vw_producto_desc AS producto_descripcion,
  TO_CHAR(MA.movimiento_almacen_fmovimiento, 'YYYY-MM-DD') AS fecha_movimiento,
  PRO.producto_porcion_unidad AS porcion_unidad,
  (CAST(MAD.movimiento_almacen_det_cantidad AS INTEGER) / CAST(PRO.producto_porcion_unidad AS INTEGER)) AS cantidad_formapres,
  (CAST(MAD.movimiento_almacen_det_cantidad AS INTEGER) % CAST(PRO.producto_porcion_unidad AS INTEGER)) AS cantidad_unitaria,
  mad.movimiento_almacen_det_saldoanterior AS SALDOANT,
  ROUND(CAST((PRC.producto_costo_costoprom / PRO.producto_porcion_unidad) * MAD.movimiento_almacen_det_cantidad AS NUMERIC), 2) AS costo_promedio_sin_igv
FROM
  sch_clinica.tbl_movimiento_almacen MA
  INNER JOIN sch_clinica.tbl_requerimiento REQ ON (MA.movimiento_almacen_recod = REQ.requerimiento_cod)
  INNER JOIN sch_clinica.tbl_movimiento_almacen_det MAD ON (MA.movimiento_almacen_cod = MAD.movimiento_almacen_det_cod)
  INNER JOIN sch_clinica.tbl_producto_costo PRC ON (MAD.movimiento_almacen_det_pcod = PRC.producto_costo_productocod)
  INNER JOIN sch_clinica.tbl_centrocosto CEC ON REQ.requerimiento_centrocosto_solicitante = CEC.centrocosto_id
  INNER JOIN sch_clinica.vw_producto  VW ON CAST(MAD.movimiento_almacen_det_pcod AS VARCHAR) = VW.vw_producto_cod
  INNER JOIN sch_clinica.tbl_producto PRO ON MAD.movimiento_almacen_det_pcod = PRO.producto_cod
WHERE
  
  --MA.movimiento_almacen_tpmov = :tpmov
   DATE(MA.movimiento_almacen_fmovimiento) >= :finicio
  AND DATE(MA.movimiento_almacen_fmovimiento) <= :ffin
  
UNION

SELECT 
  CEC.centrocosto_dsc AS centrocosto,
  REQ.requerimiento_cod AS requerimiento_codigo,
  VW.vw_producto_cod AS producto_codigo,
  VW.vw_producto_desc AS producto_descripcion,
  TO_CHAR(MA.movimiento_almacen_fmovimiento, 'YYYY-MM-DD') AS fecha_movimiento,
  PFD.prodfarmadet_porcion_unidad AS porcion_unidad,
  (CAST(MAD.movalmfar_det_cantidad AS INTEGER) / CAST(PFD.prodfarmadet_porcion_unidad AS INTEGER)) AS cantidad_formapres,
  (CAST(MAD.movalmfar_det_cantidad AS INTEGER) % CAST(PFD.prodfarmadet_porcion_unidad AS INTEGER)) AS cantidad_unitaria,
    mad.movalmfar_det_saldoanterior AS SALDOANT,
  ROUND(CAST((PRC.producto_costo_costoprom / PFD.prodfarmadet_porcion_unidad) * MAD.movalmfar_det_cantidad AS NUMERIC), 2) AS costo_promedio_sin_igv
FROM
  sch_clinica.tbl_movimiento_almacen  MA
  INNER JOIN sch_clinica.tbl_requerimiento REQ ON (MA.movimiento_almacen_recod = REQ.requerimiento_cod)
  INNER JOIN sch_clinica.tbl_movalmfar_det MAD ON (MA.movimiento_almacen_cod = MAD.movalmfar_det_cod)
  INNER JOIN sch_clinica.tbl_producto_costo PRC ON (MAD.movalmfar_det_prodfarma_cod = PRC.producto_costo_pfdcod)
  AND (MAD.movalmfar_det_prodfarma_item = PRC.producto_costo_pfditem)
  INNER JOIN sch_clinica.tbl_centrocosto CEC ON REQ.requerimiento_centrocosto_solicitante = CEC.centrocosto_id
  INNER JOIN sch_clinica.vw_producto  VW ON (MAD.movalmfar_det_prodfarma_cod || '-' || MAD.movalmfar_det_prodfarma_item) = VW.vw_producto_cod
  INNER JOIN sch_clinica.tbl_prodfarmadet PFD ON MAD.movalmfar_det_prodfarma_cod = PFD.prodfarmadet_prodfarma_cod AND MAD.movalmfar_det_prodfarma_item = PFD.prodfarmadet_item
WHERE
  
  --MA.movimiento_almacen_tpmov = :tpmov
  DATE(MA.movimiento_almacen_fmovimiento) >= :finicio
  AND DATE(MA.movimiento_almacen_fmovimiento) <= :ffin