SELECT
  CASE WHEN SVN.td_cod = 1 THEN
    COALESCE(SVN.area_dsc, 'PROCEDIMIENTO MEDICO')
  WHEN SVN.td_cod = 2 THEN
    'CONSULTA MEDICA'
  WHEN SVN.td_cod = 9 THEN
    'HOSPITALIZACION'
  ELSE '' END AS "SERVICIO",
  EM.empresa_rznsocial AS "ASEGURADORA",
  NP.negociacionprecio_dsc AS "NEGOCIACION",
  FC.factor_valor - (NP.negociacionprecio_descuento/100) * FC.factor_valor AS "FACTOR NEGOCIADO",
  CASE WHEN SVN.td_cod = 2 THEN
    '500101'
  ELSE SVN.segus_cod END AS "CODIGO SEGUS",  
  SVN.segus_dsc AS "DESCRIPCION SEGUS",
  SVN.genera_prehonorario AS "GENERA PREHONORARIO",
  SVN.intervencion_quirurgica AS "INTERVENCION QUIR.",
  svn.td_cod || '-' || svn.td_item as "COD TARIFARIO",
  SVN.precio AS "PRECIO",
  SVN.unidades AS "UNIDADES",
  FC.factor_valor AS "FACTOR",
  CASE WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1 AND SVN.unidades > 0 THEN 
    COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, NP.negociacionprecio_descuento)
  WHEN (COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 0) = 0 OR SVN.td_cod = 2) AND SVN.precio > 0 THEN
    COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, NPT.descuento_precio, 0)
  ELSE 0 END AS "DESCUENTO",
  CASE WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1 AND SVN.unidades > 0 THEN 'FACTOR'
  WHEN (COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 0) = 0 OR SVN.td_cod = 2) AND SVN.precio > 0 THEN 'PRECIO'
  ELSE 'SIN PRECIO/SIN UNIDADES' END AS "VALOR",
  CASE WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1 AND SVN.unidades > 0 THEN 
    FC.factor_valor * (1 - (COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, NP.negociacionprecio_descuento) / 100))
  WHEN (COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 0) = 0 OR SVN.td_cod = 2) AND SVN.precio > 0 THEN
    SVN.precio * (1 - (COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, NPT.descuento_precio, 0) / 100))
  ELSE 0 END AS "VALOR DESCONTADO",
  CASE WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1 AND SVN.unidades > 0 THEN 
    ((FC.factor_valor * (1 - (COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, 
    NP.negociacionprecio_descuento) / 100))) * SVN.unidades)
  WHEN (COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 0) = 0 OR SVN.td_cod = 2) AND SVN.precio > 0 THEN
    SVN.precio * (1 - (COALESCE(NPD.negociacionpreciodet_dscto, NPD2.descuento, NPT.descuento_precio, 0) / 100))
  ELSE 0 END AS "PRECIO FINAL"
FROM
  sch_clinica.tbl_negociacionprecio NP
  LEFT JOIN sch_clinica.tbl_empresa EM ON (NP.negociacionprecio_aseguradora_cod = EM.empresa_cod)
  LEFT JOIN sch_clinica.tbl_factor FC ON (NP.negociacionprecio_factor_cod = FC.factor_cod)
  INNER JOIN sch_clinica.vw_servicios_vs_negociaciones SVN ON (NP.negociacionprecio_cod = SVN.negociacion_cod)
  LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_tarifarios NPT ON (NP.negociacionprecio_cod = NPT.negociacion_cod
  AND SVN.td_cod = NPT.tarifario_cod)
  LEFT JOIN sch_clinica.tbl_negociacionpreciodet NPD ON (SVN.negociacion_cod = NPD.negociacionpreciodet_ncod
  AND SVN.td_cod = NPD.negociacionpreciodet_tcod
  AND SVN.td_item = NPD.negociacionpreciodet_tditem
  AND CASE WHEN NPD.negociacionpreciodet_tpmov = 0 THEN SVN.precio > 0 WHEN NPD.negociacionpreciodet_tpmov = 1 THEN SVN.unidades > 0 END)
  LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_padres NPD2 ON (SVN.negociacion_cod = NPD2.negociacion_cod
  AND SVN.td_cod = NPD2.td_cod AND SVN.td_item = NPD2.td_item AND NPD2.item = 1)
WHERE
  (LENGTH(SVN.segus_cod) > 0 OR SVN.td_cod = 2)
  AND NP.negociacionprecio_cod = 22
ORDER BY
  3, SVN.segus_orden