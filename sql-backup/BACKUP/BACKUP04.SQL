SELECT 
 P.producto_cod AS codigo,
 P.producto_horacle,
 COALESCE(P.producto_dsc, '') || ' | ' ||
 COALESCE(FF.ffar_dsc, '') AS descripcion, 
 COALESCE(FBR.fabr_dsc, '') AS fabricante,
 FP.fpres_dsc AS fpresentacion,
 CASE WHEN P.producto_afecto_igv = 1 THEN
 	  'AFECTO'
      WHEN P.producto_afecto_igv = 0 THEN
      'INAFECTO'
 END AS afectoigv,
 P.producto_porcion_unidad AS porciunid,
 FLOOR(PS.producto_stock_saldo / P.producto_porcion_unidad) AS saldofp,
 CAST(PS.producto_stock_saldo AS INTEGER) % CAST(P.producto_porcion_unidad AS INTEGER) AS saldounid,
 ROUND(CAST(LPDA.lstpreciodet_precio * (1 + 0.18) AS NUMERIC), 2) AS puasegurado,
 ROUND(CAST(LPDP.lstpreciodet_precio * (1 + 0.18) AS NUMERIC), 2) AS puparticular,
 ROUND(CAST(PC.producto_costo_costoprom AS NUMERIC), 2) AS costopromedio,
 COALESCE(UB.ubicacion, 'FALTA ASIGNAR') AS ubicacion,
CASE WHEN PS.producto_stock_estado = 0 THEN
'ACTIVO'
WHEN  PS.producto_stock_estado = 1 THEN
'INACTIVO'
END AS estado,
CASE WHEN LPB IS NULL THEN 'NO' ELSE 'SI' END AS lstpb,
PRF.producto_familia_desc AS familia,
PRSF.producto_familiasub_desc AS subfamilia
FROM
 sch_clinica.tbl_producto_stock PS
 INNER JOIN sch_clinica.tbl_producto P ON (PS.producto_stock_pcod = P.producto_cod 
 			AND PS.producto_stock_acod = 4 
            --AND P.producto_ctgproducto_cod = categoriacod
            )
 LEFT  JOIN sch_clinica.tbl_lstpreciodet LPDA ON (PS.producto_stock_pcod = LPDA.lstpreciodet_producto_cod
 			AND LPDA.lstpreciodet_cod = 10)
 LEFT  JOIN sch_clinica.tbl_lstpreciodet LPDP ON (PS.producto_stock_pcod = LPDP.lstpreciodet_producto_cod
 			AND LPDP.lstpreciodet_cod = 6)
 INNER JOIN sch_clinica.tbl_producto_costo PC ON PS.producto_stock_pcod = PC.producto_costo_productocod
 LEFT JOIN (SELECT 
  				CP.contenedor_producto_productocod AS prodcod,
  				CA.contenedor_almacen_des AS ubicacion
			FROM 
  				sch_clinica.tbl_contenedor_producto CP
  				INNER JOIN sch_clinica.tbl_contenedor_almacen CA ON CP.contenedor_producto_contalmcod = CA.contenedor_almacen_cod
   			 				AND CA.contenedor_almacen_almcod = 48
             				AND CP.contenedor_producto_tpproducto = 1) UB ON PS.producto_stock_pcod = UB.prodcod
 LEFT  JOIN sch_clinica.tbl_fabr FBR ON (P.producto_fabricante_cod = FBR.fabr_cod)
 LEFT  JOIN sch_clinica.tbl_fpres FP ON (P.producto_fpres_cod = FP.fpres_cod)
 LEFT  JOIN sch_clinica.tbl_ffar FF ON (P.producto_ffar_cod = FF.ffar_cod)
 LEFT  JOIN sch_clinica.tbl_lstpreciobaseprod LPB ON PS.producto_stock_pcod = LPB.lstpreciobaseprod_producto_cod
 			AND LPB.lstpreciobaseprod_estado = 1
 INNER JOIN sch_clinica.tbl_producto_familia PRF ON P.producto_famprod_cod = PRF.producto_familia_cod
 INNER JOIN sch_clinica.tbl_producto_familiasub PRSF ON P.producto_subfamprod_cod = PRSF.producto_familiasub_cod
 GROUP BY 
   codigo,
   P.producto_dsc,
   FBR.fabr_dsc, 
   descripcion, 
   fpresentacion, 
   afectoigv, 
   porciunid, 
   saldofp, 
   saldounid, 
   puasegurado, 
   puparticular, 
   costopromedio, 
   ubicacion, 
   estado, 
   LPB, 
   familia, 
   subfamilia
 ORDER BY FBR.fabr_dsc, P.producto_dsc;