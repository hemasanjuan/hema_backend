--LIMPIAR TABLA DE INTERFACE
El lote: 192409 del producto: 51.17.24.79.0003 está inactivo
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
  where cp.contenedor_producto_contalmcod = 37 and
        pfd.prodfarmadet_horacle =  '42.14.26.00.0035';
        ---- VERIFICAR PRODUCTOS

        ---verificar lote de PRODUCTOS
  SELECT cl.*
  FROM sch_clinica.tbl_producto p
       inner join sch_clinica.tbl_contenedor_producto cp on p.producto_cod =
        CP.contenedor_producto_productocod
       INNER JOIN sch_clinica.tbl_contenedor_lote cl on
        cp.contenedor_producto_cod = cl.contenedor_lote_cp_cod
  where cp.contenedor_producto_contalmcod = 48 and
        p.producto_horacle = '42.14.26.00.0035'
        
        --...ACTUALIXA CONTENDOR ESTADO
  update sch_clinica.tbl_contenedor_lote
  set contenedor_lote_estado = 0
  where contenedor_lote_cod = 10614
        
        --- modificar 
  update sch_clinica.tbl_contenedor_lote
  set 
  contenedor_lote_cantidad = 0
  where contenedor_lote_cantidad < 0
  
  SELECT * FROM sch_clinica.tbl_contenedor_lote lo
  WHERE lo.contenedor_lote_cantidad < 0 and contenedor_lote_estado = 0