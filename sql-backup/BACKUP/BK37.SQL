SELECT 
  PFD.prodfarmadet_prodfarma_cod || '-' || PFD.prodfarmadet_item as codigo,
  P.producto_dsc,
  FF.ffar_dsc,
  FP.fpres_dsc,
  pfd.prodfarmadet_porcion_unidad,
  FLOOR(sum( MFD.movalmfar_det_cantidad * 
          CASE WHEN MA.movimiento_almacen_motivo_cod = 4 THEN -1 ELSE 1 END
  )/COALESCE(pfd.prodfarmadet_porcion_unidad, 1)) as SFP,
  mod(CAST(sum(MFD.movalmfar_det_cantidad *
          CASE WHEN MA.movimiento_almacen_motivo_cod = 4 THEN -1 ELSE 1 END
  ) AS NUMERIC), COALESCE(pfd.prodfarmadet_porcion_unidad, 1)) as unidades,
  ROUND(CAST( AVG(MFD.movalmfar_det_preciouni) AS NUMERIC), 2) as preciouni_promediado,
  ROUND(CAST( SUM(MFD.movalmfar_det_preciouni) AS NUMERIC), 2) as preciouni_totalizado
FROM sch_clinica.tbl_movalmfar_det MFD
INNER JOIN sch_clinica.tbl_movimiento_almacen MA ON MA.movimiento_almacen_cod = MFD.movalmfar_det_cod
INNER JOIN sch_clinica.tbl_prodfarma PF ON PF.prodfarma_cod = MFD.movalmfar_det_prodfarma_cod
INNER JOIN sch_clinica.tbl_producto P ON PF.prodfarma_producto_cod = P.producto_cod
INNER JOIN sch_clinica.tbl_ffar FF ON FF.ffar_cod = PF.prodfarma_ffar_cod
INNER JOIN sch_clinica.tbl_prodfarmadet PFD ON PFD.prodfarmadet_prodfarma_cod = MFD.movalmfar_det_prodfarma_cod
		AND PFD.prodfarmadet_item = MFD.movalmfar_det_prodfarma_item
INNER JOIN sch_clinica.tbl_fpres FP ON FP.fpres_cod = PFD.prodfarmadet_fpres_cod
WHERE 
-- MFD.movalmfar_det_acod = #almacen#
 DATE(MA.movimiento_almacen_fmovimiento) >= '01/10/2022'
AND DATE(MA.movimiento_almacen_fmovimiento) <= '30/11/2022'
AND (MA.movimiento_almacen_motivo_cod = 4 OR MA.movimiento_almacen_motivo_cod = 5)

GROUP BY PFD.prodfarmadet_prodfarma_cod || '-' || PFD.prodfarmadet_item,
  P.producto_dsc,  FF.ffar_dsc,  FP.fpres_dsc,  pfd.prodfarmadet_porcion_unidad
ORDER BY sum(MFD.movalmfar_det_cantidad) DESC