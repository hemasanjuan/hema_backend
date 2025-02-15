SELECT DISTINCT
    'PE-ASISTENCIAL AQP' AS SOURCE_CODE,
    COALESCE(ap.almacen_codorg, '') AS ORGANIZATION_CODE,
    substring(p.producto_horacle, 1, 2) AS SEGMENT1,
    substring(p.producto_horacle, 4, 2) AS SEGMENT2,
    substring(p.producto_horacle, 7, 2) AS SEGMENT3,
    substring(p.producto_horacle, 10, 2) AS SEGMENT4,
    substring(p.producto_horacle, 13, length(p.producto_horacle)) AS SEGMENT5,
    COALESCE(ap.almacen_horacle, '') AS SUBINVENTORY_CODE,
    ca.contenedor_almacen_contenedor AS LOC_SEGMENT1,
    ca.contenedor_almacen_fila  AS LOC_SEGMENT2,
    ca.contenedor_almacen_columna AS LOC_SEGMENT3,
    u.unidad_sbl AS TRANSACTION_UOM,
    COALESCE(PS.producto_stock_saldo, 0) AS TRANSACTION_QUANTITY,
    to_char(now(), 'dd/MM/yyyy') AS TRANSACTION_DATE,
    'OHSJD – CARGA INICIAL' AS TRANSACTION_SOURCE_NAME,
    'Carga Inicial' AS TRANSACTION_TYPE_NAME,
    ROUND(CAST(PC.producto_costo_costoprom_und AS NUMERIC), 4) AS TRANSACTION_COST,-----------------------consultar
    CASE WHEN p.producto_coracle = 2 THEN 'LOTEGEN' ELSE '' END AS LOT_NUMER,
    CASE WHEN p.producto_coracle = 2 THEN '01/05/2019' ELSE '' END AS LOT_EXPIRATION_DATE,
    CAST(P.producto_cod AS VARCHAR) AS COD_HEMA,
    P.producto_dsc AS DSC_PRODUCTO
FROM
    sch_clinica.tbl_producto p
    INNER JOIN sch_clinica.tbl_producto_stock ps ON (p.producto_cod = ps.producto_stock_pcod)
    AND (ps.producto_stock_saldo > 0)
    INNER JOIN sch_clinica.tbl_almacen ap ON (ps.producto_stock_acod = ap.almacen_cod)
    AND (ap.almacen_horacle IS NOT NULL)
    INNER JOIN sch_clinica.tbl_contenedor_producto cp ON (cp.contenedor_producto_tpproducto = 1)
    AND (cp.contenedor_producto_productocod = p.producto_cod)
    INNER JOIN sch_clinica.tbl_contenedor_almacen ca ON (cp.contenedor_producto_contalmcod = ca.contenedor_almacen_cod)
    AND (ap.almacen_cod = ca.contenedor_almacen_almcod)
    INNER JOIN sch_clinica.tbl_unidad u ON (p.producto_unidad_cod = u.unidad_cod)
    LEFT JOIN sch_clinica.tbl_producto_costo PC ON (P.producto_cod = PC.producto_costo_productocod)
WHERE
    p.producto_horacle IS NOT NULL
	AND p.producto_ctgproducto_cod != 44
    AND cp.contenedor_producto_usregistro LIKE 'emorocco'
    
UNION ALL

SELECT DISTINCT
    'PE-ASISTENCIAL AQP' AS SOURCE_CODE,
    COALESCE(af.almacen_codorg, '') AS ORGANIZATION_CODE,
    substring(pfd.prodfarmadet_horacle, 1, 2) AS SEGMENT1,
    substring(pfd.prodfarmadet_horacle, 4, 2) AS SEGMENT2,
    substring(pfd.prodfarmadet_horacle, 7, 2) AS SEGMENT3,
    substring(pfd.prodfarmadet_horacle, 10, 2) AS SEGMENT4,
    substring(pfd.prodfarmadet_horacle, 13, length(pfd.prodfarmadet_horacle)) AS SEGMENT5,
    COALESCE(af.almacen_horacle, '') AS SUBINVENTORY_CODE,
                ca2.contenedor_almacen_contenedor AS LOC_SEGMENT1,
    ca2.contenedor_almacen_fila AS LOC_SEGMENT2,
    ca2.contenedor_almacen_columna AS LOC_SEGMENT3,
    u.unidad_sbl AS TRANSACTION_UOM,
    COALESCE(PFDS.prodfarmadet_stock_saldo, 0) AS TRANSACTION_QUANTITY,
    to_char(now(), 'dd/MM/yyyy') AS TRANSACTION_DATE,
    'OHSJD – CARGA INICIAL' AS TRANSACTION_SOURCE_NAME,
    'Carga Inicial' AS TRANSACTION_TYPE_NAME,
    ROUND(CAST(PC.producto_costo_costoprom_und AS NUMERIC), 4) AS TRANSACTION_COST,-------------------consultar
    CASE WHEN pfd.prodfarmadet_coracle = 2 THEN 'LOTEGEN' ELSE '' END AS LOT_NUMER,
    CASE WHEN pfd.prodfarmadet_coracle = 2 THEN '01/05/2019' ELSE '' END AS LOT_EXPIRATION_DATE,
	pfd.prodfarmadet_prodfarma_cod || '-' || pfd.prodfarmadet_item AS COD_HEMA, 
    p2.producto_dsc AS DSC_PRODUCTO
FROM
	sch_clinica.tbl_prodfarmadet pfd
    INNER JOIN sch_clinica.tbl_prodfarma pf ON (pfd.prodfarmadet_prodfarma_cod = pf.prodfarma_cod)
    INNER JOIN sch_clinica.tbl_producto p2 ON (pf.prodfarma_producto_cod = p2.producto_cod)
    INNER JOIN sch_clinica.tbl_prodfarmadet_stock pfds ON (pfd.prodfarmadet_prodfarma_cod = pfds.prodfarmadet_stock_pfcod)
    AND (pfd.prodfarmadet_item = pfds.prodfarmadet_stock_pfitem)
    AND (pfds.prodfarmadet_stock_saldo > 0)
    INNER JOIN sch_clinica.tbl_almacen af ON (pfds.prodfarmadet_stock_acod = af.almacen_cod)
    AND (af.almacen_horacle IS NOT NULL)
    INNER JOIN sch_clinica.tbl_contenedor_producto cp2 ON (cp2.contenedor_producto_tpproducto = 0)
	AND (pfd.prodfarmadet_prodfarma_cod = cp2.contenedor_producto_pfdcod)
    AND (pfd.prodfarmadet_item = cp2.contenedor_producto_pfditem)
    INNER JOIN sch_clinica.tbl_contenedor_almacen ca2 ON (cp2.contenedor_producto_contalmcod = ca2.contenedor_almacen_cod)
    AND (af.almacen_cod = ca2.contenedor_almacen_almcod)
    INNER JOIN sch_clinica.tbl_unidad u ON (pfd.prodfarmadet_unidad_cod = u.unidad_cod)
    LEFT JOIN sch_clinica.tbl_producto_costo PC ON (pfd.prodfarmadet_prodfarma_cod = pc.producto_costo_pfdcod)
    AND (pfd.prodfarmadet_item = pc.producto_costo_pfditem)
WHERE
	pfd.prodfarmadet_horacle IS NOT NULL
	AND p2.producto_ctgproducto_cod != 44
    AND cp2.contenedor_producto_usregistro LIKE 'emorocco'
    
    ------swdwd-----
    SELECT DISTINCT
    
 
FROM
	sch_clinica.tbl_prodfarmadet pfd
    INNER JOIN sch_clinica.tbl_prodfarma pf ON (pfd.prodfarmadet_prodfarma_cod = pf.prodfarma_cod)
    INNER JOIN sch_clinica.tbl_producto p2 ON (pf.prodfarma_producto_cod = p2.producto_cod)
    INNER JOIN sch_clinica.tbl_prodfarmadet_stock pfds ON (pfd.prodfarmadet_prodfarma_cod = pfds.prodfarmadet_stock_pfcod)
    AND (pfd.prodfarmadet_item = pfds.prodfarmadet_stock_pfitem)
    AND (pfds.prodfarmadet_stock_saldo > 0)
    INNER JOIN sch_clinica.tbl_almacen af ON (pfds.prodfarmadet_stock_acod = af.almacen_cod)
    AND (af.almacen_horacle IS NOT NULL)
    INNER JOIN sch_clinica.tbl_contenedor_producto cp2 ON (cp2.contenedor_producto_tpproducto = 0)
	AND (pfd.prodfarmadet_prodfarma_cod = cp2.contenedor_producto_pfdcod)
    AND (pfd.prodfarmadet_item = cp2.contenedor_producto_pfditem)
    INNER JOIN sch_clinica.tbl_contenedor_almacen ca2 ON (cp2.contenedor_producto_contalmcod = ca2.contenedor_almacen_cod)
    AND (af.almacen_cod = ca2.contenedor_almacen_almcod)
    INNER JOIN sch_clinica.tbl_unidad u ON (pfd.prodfarmadet_unidad_cod = u.unidad_cod)
    LEFT JOIN sch_clinica.tbl_producto_costo PC ON (pfd.prodfarmadet_prodfarma_cod = pc.producto_costo_pfdcod)
    AND (pfd.prodfarmadet_item = pc.producto_costo_pfditem)
WHERE
	pfd.prodfarmadet_horacle IS NOT NULL
	AND p2.producto_ctgproducto_cod != 44