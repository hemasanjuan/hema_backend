-- 1 LIMPIAR TABLA DE INTERFACE

  DELETE FROM sch_clinica.tbl_appinterface;
  /*--2  SELECCIONAR ERRORES EN INTERFACE  */
       
  SELECT DISTINCT appinterface_mensaje,
         appinterface_detalle
  

  SELECT cl.*
  FROM sch_clinica.tbl_prodfarmadet   /*--- 3 verificar lote de FA    FROM sch_clinica.tbl_appinterface;
pfd
       inner join sch_clinica.tbl_contenRMACOS (medicamentos) si es farmacia*/
edor_producto cp on
        pfd.prodfarmadet_prodfarma_cod = CP.contenedor_producto_pfdcod
       INNER JOIN sch_clinica.tbl_contenedor_lote cl on
        cp.contenedor_producto_cod = cl.contenedor_lote_cp_cod
  where cp.contenedor_producto_contalmcod = 48 and
        pfd.prodfarmadet_horacle =  '42.31.15.52.0002';
  /*3.1
        ---- VERIFICAR PRODUCTOS
        ---  verificar lote de FARMACOS*/
  
  SELECT cl.*
  FROM sch_clinica.tbl_producto p
       inner join sch_clinica.tbl_contenedor_producto cp on p.producto_cod =
        CP.contenedor_producto_productocod
       INNER JOIN sch_clinica.tbl_contenedor_lote cl on
        cp.contenedor_producto_cod = cl.contenedor_lote_cp_cod
  where cp.contenedor_producto_contalmcod = 48 and
        p.producto_horacle = '42.31.15.52.0002'
  
  /* --...ACTUALIXA CONTENDOR ESTADO*/
       
  update sch_clinica.tbl_contenedor_lote
  set contenedor_lote_estado = 0
  where contenedor_lote_cod = 9987
        --- modificar 
  update sch_clinica.tbl_contenedor_lote
  set 
  --contenedor_lote_cantidad = 0,
  contenedor_lote_estado = 1
  where contenedor_lote_cantidad = 0
  
  SELECT * FROM sch_clinica.tbl_contenedor_lote lo
  WHERE lo.contenedor_lote_cantidad = 0 and contenedor_lote_estado = 0
  --El lote: null del producto: 51.45.18.01.0005 está inactivo