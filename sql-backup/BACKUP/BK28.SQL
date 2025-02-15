SELECT 
  negociacionpreciodet_ncod as negociacion,
  S.segus_cod as nivel,
  COALESCE(S.segus_codsegus, '') as codigo_segus,
  TD.tarifariodet_dsc as descripcion,
  negociacionpreciodet_tditem as item,
  CASE WHEN negociacionpreciodet_tpmov = 0 THEN 'PRECIO' 
  	WHEN negociacionpreciodet_tpmov = 1 THEN 'FACTOR' ELSE '' END as tipo_descuento,
  negociacionpreciodet_dscto as descuento,
  td.tarifariodet_prc AS precio_final
  --round(td.tarifariodet_prc::numeric,1) AS precio_final_round
FROM  sch_clinica.tbl_negociacionpreciodet NPT
INNER JOIN sch_clinica.tbl_negociacionprecio NP ON np.negociacionprecio_cod = NPT.negociacionpreciodet_ncod
INNER JOIN sch_clinica.tbl_tarifariodet TD ON TD.tarifariodet_cod = NPT.negociacionpreciodet_tcod
	AND TD.tarifariodet_item = NPT.negociacionpreciodet_tditem
INNER JOIN sch_clinica.tbl_segus S ON TD.tarifariodet_cod = S.segus_tarifariodet_cod
	AND TD.tarifariodet_item = S.segus_tarifariodet_item
WHERE negociacionpreciodet_ncod = :negociacion_codigo    
ORDER BY S.segus_cod