--LIMPIAR TABLA DE INTERFACE

  DELETE
  FROM sch_clinica.tbl_appinterface;
       -- SELECCIONAR ERRORES EN INTERFACE  
  SELECT DISTINCT appinterface_mensaje
  FROM sch_clinica.tbl_appinterface;
  
  ---verificar lote de FARMACOS
  SELECT cl.*
  FROM sch_clinica.tbl_prodfarmadet pfd
       inner join sch_clinica.tbl_contenedor_producto cp on
        pfd.prodfarmadet_prodfarma_cod = CP.contenedor_producto_pfdcod
       INNER JOIN sch_clinica.tbl_contenedor_lote cl on
        cp.contenedor_producto_cod = cl.contenedor_lote_cp_cod
  where cp.contenedor_producto_contalmcod = 48 and
        pfd.prodfarmadet_horacle =  '51.28.41.50.0005';
        ---- VERIFICAR PRODUCTOS
        ---verificar lote de FARMACOS
  SELECT cl.* 
  FROM sch_clinica.tbl_producto p
       inner join sch_clinica.tbl_contenedor_producto cp on p.producto_cod =
        CP.contenedor_producto_productocod
       INNER JOIN sch_clinica.tbl_contenedor_lote cl on
        cp.contenedor_producto_cod = cl.contenedor_lote_cp_cod
  where cp.contenedor_producto_contalmcod = 48 and
        p.producto_horacle = 'IM.11.11.62.0005'
        
        --...ACTUALIXA CONTENDOR ESTADO
  update sch_clinica.tbl_contenedor_lote
  set contenedor_lote_estado = 0
  where contenedor_lote_cod = 56090
        
        --- modificar 
  update sch_clinica.tbl_contenedor_lote
  set 
  contenedor_lote_cantidad = 0
  --contenedor_lote_estado = 1
  where contenedor_lote_cantidad < 0
  
  SELECT * FROM sch_clinica.tbl_contenedor_lote lo
  WHERE lo.contenedor_lote_cantidad < 0 and contenedor_lote_estado = 0
  
  --appinterface_mensaje
El lote: null del producto: 51.39.17.43.0006 está inactivo
  
  
  ---- lista de medicos por fecha de ingreso --- 
  select 
  to_char(E.profatencion_espmedica_fcreacion,'dd/mm/yyyy') as INGRESO,
  P.persona_nrodoc as DNI,
  P.persona_nmb1 ||' '|| P.persona_nmb2 ||' '|| persona_apep ||' '|| persona_apem AS NOMBRE,
  P.persona_tel A¨  S TELEFONO,
  M.profatencion_colegiatura AS COLEGIATURA,
  A.espprofatencion_dsc AS ESPCIALIDAD
   from sch_clinica.tbl_persona P
  inner join sch_clinica.tbl_profatencion M on P.persona_cod = M.profatencion_persona_cod
  inner join sch_clinica.tbl_profatencion_espmedica E on M.profatencion_persona_cod = E.profatencion_espmedica_pacod
  inner join sch_clinica.tbl_espprofatencion A on E.profatencion_espmedica_emcod = A.espprofatencion_cod
  where E.profatencion_espmedica_fcreacion between '01/01/2021' and '20/05/2021'
  order by E.profatencion_espmedica_fcreacion
  
  
  --------------------------------------VER PRODUCTO POR LOTES COD CP------------------
    SELECT 
    cl.contenedor_lote_cod,
    pfd.prodfarmadet_prodfarma_cod AS "CODIGO",
    pro.producto_dsc as "PRODUCTO",
    pfd.prodfarmadet_horacle as "ORACLE",
    cl.contenedor_lote_nro_lote as "LOTE",
    cl.contenedor_lote_cantidad as "CANTIDAD"
  FROM sch_clinica.tbl_prodfarmadet pfd
       inner join sch_clinica.tbl_contenedor_producto cp on (pfd.prodfarmadet_prodfarma_cod = CP.contenedor_producto_pfdcod)
       INNER JOIN sch_clinica.tbl_contenedor_lote cl on (cp.contenedor_producto_cod = cl.contenedor_lote_cp_cod)
       inner join sch_clinica.tbl_prodfarma pf on (pfd.prodfarmadet_prodfarma_cod = pf.prodfarma_cod)
       inner join sch_clinica.tbl_producto pro on (pf.prodfarma_producto_cod = pro.producto_cod)
  where cp.contenedor_producto_contalmcod = 48 
  		--and cl.contenedor_lote_cantidad < 0
        --and cl.contenedor_lote_cod = '55788'
        and pfd.prodfarmadet_horacle =  :codi;
        ---- VERIFICAR PRODUCTOS
        ---verificar lote de FARMACOS