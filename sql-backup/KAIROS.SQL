--kairos
sch_clinica.sp_actualizar_lista_precios_kairos
 select * from sch_clinica.tbl_revista_precios_per


/**************************************************************************************************************************************************
Borrar tablas
/**************************************************************************************************************************************************/


--Elimina el contenido de las tablas para ser repobladas
-- dlazaro

DELETE FROM sch_clinica.tbl_kairo_accter_pro; --7 AccionesTerapeuticasProductos
DELETE FROM sch_clinica.tbl_kairo_accion_terapeutica ; --1 AccionesTerapeuticas
DELETE FROM sch_clinica.tbl_kairo_lab_linea ; --4 Lineas
DELETE FROM sch_clinica.tbl_kairo_laboratorio ; --3 Laboratorios
DELETE FROM sch_clinica.tbl_kairo_precio ; --6 Precios
DELETE FROM sch_clinica.tbl_kairo_pro_presentacion ; --5 Presentaciones
DELETE FROM sch_clinica.tbl_kairo_producto ; --2 Productos

select * from sch_clinica.tbl_kairo_accter_pro ;

/**************************************************************************************************************************************************
ACTUALIZACION de precios
/**************************************************************************************************************************************************/



-- -- KAIRO UPD PASO 1

INSERT INTO sch_clinica.tbl_kairo_historial
(
	kairo_historial_periodo,
	kairo_historial_procod,
	kairo_historial_precod,
	kairo_historial_kairocod,
	kairo_historial_pvs,
	kairo_historial_pvf,
	kairo_historial_fcreacion,
	kairo_historial_usrcreacion,
	kairo_historial_ipcreacion
)

SELECT
	:Periodo,--YYYYMMM
	kairo_precio_procod,
	kairo_precio_precod,
	CAST(kairo_precio_procod AS VARCHAR) ||
	CASE WHEN kairo_precio_precod < 10 THEN '0' || kairo_precio_precod
	ELSE CAST(kairo_precio_precod AS VARCHAR) END,
	kairo_precio_prepub,
	kairo_precio_prefab,
	NOW(),
	:Usuario,
	:Ip

FROM
	sch_clinica.tbl_kairo_precio
;


-- KAIRO UPD PASO 2 - ACTUALIZACION EN KAIRO DESDE KAIRO HISTORIAL
UPDATE
	sch_clinica.tbl_kairo

SET
	kairo_pvs = KH.kairo_historial_pvs,
	kairo_pvf = KH.kairo_historial_pvf,
	kairo_fcreacion = NOW(),
	kairo_usrcreacion = :Usuario,
	kairo_ipcreacion = :Ip,
	kairo_periodo = :Periodo

FROM
	sch_clinica.tbl_kairo_historial KH

WHERE
	kairo_cod = kh.kairo_historial_kairocod
	AND KH.kairo_historial_periodo = :Periodo
;



-- KAIRO UPD PASO 3 - INSERCION DE FALTANTES A KAIRO
--/*
INSERT INTO   sch_clinica.tbl_kairo
(
	 kairo_cod,
	 kairo_nombre,
	 kairo_lab,
	 kairo_pa,
	 kairo_pres,
	 kairo_pvs,
	 kairo_pvf,
	 kairo_fcreacion,
	 kairo_usrcreacion,
	 kairo_ipcreacion,
	 kairo_periodo,
	 kairo_fregistro,
	 kairo_usrregistro,
	 kairo_ipregistro
)
SELECT
	KH.kairo_historial_kairocod,
	P.kairo_producto_dsc,
	L.kairo_laboratorio_abr,
	'',
	KPRE.kairo_pro_presentacion_dsc,
	KH.kairo_historial_pvs,
	KH.kairo_historial_pvf,
	now(),
	:Usuario,
	:Ip,
	:Periodo,
	now(),
	:Usuario,
	:Ip

FROM
	sch_clinica.tbl_kairo_historial KH
	INNER JOIN sch_clinica.tbl_kairo_producto P 					ON P.kairo_producto_cod = kh.kairo_historial_procod
	INNER JOIN sch_clinica.tbl_kairo_pro_presentacion KPRE			ON kh.kairo_historial_procod = kpre.kairo_pro_presentacion_procod
																	AND KH.kairo_historial_precod = KPRE.kairo_pro_presentacion_precod
	INNER JOIN sch_clinica.tbl_kairo_laboratorio L					ON P.kairo_producto_labpro = L.kairo_laboratorio_cod
	LEFT JOIN sch_clinica.tbl_kairo K								ON K.kairo_cod = KH.kairo_historial_kairocod
WHERE
	K.kairo_cod IS NULL
	AND KH.kairo_historial_periodo = :Periodo