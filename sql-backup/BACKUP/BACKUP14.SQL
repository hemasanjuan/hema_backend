SELECT DISTINCT
 MA.movimiento_almacen_fmovimiento AS fechamovimiento,
 MA.movimiento_almacen_cod AS codmovimiento,
 TT.catmotivo_movalm_horacle AS dsctransaccion,
 CASE WHEN MA.movimiento_almacen_eoracle = 1 THEN 'REGISTRADO' ELSE 'PENDIENTE' END AS dscestado,
 CONSULTA.almacen AS codsubinv
FROM
 sch_clinica.tbl_movimiento_almacen MA
 INNER JOIN sch_clinica.tbl_catmotivo_movalm TT ON (MA.movimiento_almacen_motivo_cod = TT.catmotivo_movalm_cod)
 LEFT JOIN (
 SELECT DISTINCT
  MA.movimiento_almacen_cod AS codigo,
  ALM.almacen_horacle AS almacen
  FROM
   sch_clinica.tbl_movimiento_almacen MA
   LEFT JOIN sch_clinica.tbl_movimiento_almacen_det MADNF ON (MA.movimiento_almacen_cod = MADNF.movimiento_almacen_det_cod)
   LEFT JOIN sch_clinica.tbl_movalmfar_det MADSF ON MA.movimiento_almacen_cod = MADSF.movalmfar_det_cod
   INNER JOIN sch_clinica.tbl_almacen ALM ON (
   CASE WHEN MADNF.movimiento_almacen_det_acod IS NOT NULL THEN MADNF.movimiento_almacen_det_acod
   WHEN MADSF.movalmfar_det_acod IS NOT NULL THEN MADSF.movalmfar_det_acod END = ALM.almacen_cod) 
  WHERE 
   DATE(MA.movimiento_almacen_fmovimiento) >= '01-05-2019' --MA.movimiento_almacen_eoracle IS NULL OR MA.movimiento_almacen_eoracle = 0
 ) AS CONSULTA ON (MA.movimiento_almacen_cod = CONSULTA.codigo)
WHERE
 CONSULTA.almacen IS NOT NULL
 AND (MA.movimiento_almacen_eoracle IS NULL OR MA.movimiento_almacen_eoracle = 0)
 AND MA.movimiento_almacen_ioracle IS NULL
 AND TT.catmotivo_movalm_toracle = 1 --SOLO TRANSFERIBLE
 AND DATE(MA.movimiento_almacen_fmovimiento) >= '07-05-2019'
ORDER BY codmovimiento ASC
LIMIT 50