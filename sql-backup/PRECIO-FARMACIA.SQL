SELECT
 PFD.prodfarmadet_horacle,
 PFD.prodfarmadet_prodfarma_cod ||' - '||PFD.prodfarmadet_item AS "Código del Producto",
 P.producto_dsc AS "Descripción",
 FFR.ffar_dsc AS "Forma Farmaceútica",
 FPR.fpres_dsc AS "Forma de Presentación",
 ROUND(CAST(L.lstpreciofarmadet_precio * (CASE WHEN P.producto_afecto_igv = 1 THEN (1 + CAST(sch_clinica.sp_appparametro_valor('IGV') AS NUMERIC)) ELSE 1 END)
 AS NUMERIC),2) AS precio,
 ROUND(CAST(L.lstpreciofarmadet_precio * (1 + 0.18) AS NUMERIC), 2) AS puparticular
FROM
 sch_clinica.tbl_lstpreciofarmadet L
 INNER JOIN sch_clinica.tbl_prodfarmadet PFD ON (L.lstpreciofarmadet_prodfarmadet_cod = PFD.prodfarmadet_prodfarma_cod)
 									        AND (L.lstpreciofarmadet_prodfarmadet_item = PFD.prodfarmadet_item)
 INNER JOIN sch_clinica.tbl_prodfarma PF ON (PFD.prodfarmadet_prodfarma_cod = PF.prodfarma_cod)                                            
 INNER JOIN sch_clinica.tbl_producto P ON (PF.prodfarma_producto_cod = P.producto_cod)
 INNER JOIN sch_clinica.tbl_ffar FFR ON (PF.prodfarma_ffar_cod = FFR.ffar_cod)
 INNER JOIN sch_clinica.tbl_fpres FPR ON (PFD.prodfarmadet_fpres_cod = FPR.fpres_cod)
WHERE
 L.lstpreciofarmadet_cod = 4
 AND L.lstpreciofarmadet_estado = 0
 AND PFD.prodfarmadet_horacle != ''
ORDER BY
 P.producto_dsc