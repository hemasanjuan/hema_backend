CREATE OR REPLACE FUNCTION sch_clinica.sp_auditoria_hosp_hoja_gastos_oi (
  cod_oi integer
)
RETURNS pg_catalog.refcursor AS
$body$
DECLARE
 cur_resultado refcursor;
BEGIN
OPEN cur_resultado FOR (
SELECT 
CONSULTA.orden,
0 AS cod_tipo,--FARMACIA 
CONSULTA.dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CASE WHEN CONSULTA.tp_producto = 0 THEN
 CONSULTA.cod_hema
WHEN CONSULTA.tp_producto = 1 THEN
 CAST(CONSULTA.cod_producto AS VARCHAR)
END AS codigo,
CONSULTA.dsc_producto AS concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_bruto) - SUM(CONSULTA.val_descuento) AS val_neto,
--SUM(CONSULTA.val_neto) AS val_neto,
CONSULTA.identificador,
CONSULTA.tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_farmacia(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,afecto_igv INTEGER,dsc_area VARCHAR,tp_producto INTEGER,identificador VARCHAR,cod_hema VARCHAR,cod_producto INTEGER,dsc_producto VARCHAR,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,fec_registro DATE,coaseguro NUMERIC, prodfarma_cod VARCHAR, prodfarma_item VARCHAR, pedido INTEGER, precio_uni NUMERIC, procedencia INTEGER)
GROUP BY
CONSULTA.orden,
CONSULTA.dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.tp_producto,
CONSULTA.cod_hema,
CONSULTA.cod_producto,
CONSULTA.dsc_producto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc,
CONSULTA.identificador,
CONSULTA.precio_uni
UNION ALL
SELECT 
CONSULTA.orden,
0 AS cod_tipo,--MATERIAL PROTESICO TRAUMATOLOGICO
'FARMACIA AFECTO' AS dsc_servicio,
0 AS cod_area,
'QUIROFANO MAT-OST' AS dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
1 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_mtpro(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,coaseguro NUMERIC,fec_registro DATE)
GROUP BY
CONSULTA.orden,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION ALL
SELECT 
CONSULTA.orden,
1 AS cod_tipo,--EXAMENES AUXILIARES
'EXA. AUXILIAR: ' || CONSULTA.dsc_area dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_exaauxiliar(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,tarifario_cod INTEGER, tarifario_item INTEGER,coaseguro NUMERIC,fec_solicitud VARCHAR, serv_ejecucion INTEGER, fec_registro VARCHAR)
GROUP BY
CONSULTA.orden,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION ALL
SELECT 
CONSULTA.orden,
2 AS cod_tipo,--HABITACION
'HOSPITALIZACION' dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_habitacion(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,tarifario_cod INTEGER,tarifario_item INTEGER,coaseguro NUMERIC,deducible NUMERIC, fec_registro VARCHAR)
GROUP BY
CONSULTA.orden,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION ALL
SELECT 
CONSULTA.orden,
3 AS cod_tipo,--PROCEDIMIENTOS MEDICOS
'PROCEDIMIENTOS' dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_procmed(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,tarifario_cod INTEGER,tarifario_item INTEGER,coaseguro NUMERIC, fec_registro VARCHAR)
LEFT JOIN sch_clinica.tbl_profatencion_prehonorario ON (CONSULTA.cod_oidetalle = sch_clinica.tbl_profatencion_prehonorario.profatencion_prehonorario_oidet_cod)
AND (sch_clinica.tbl_profatencion_prehonorario.profatencion_prehonorario_estado != 4)
WHERE
sch_clinica.tbl_profatencion_prehonorario.profatencion_prehonorario_estado IS NULL OR
sch_clinica.tbl_profatencion_prehonorario.profatencion_prehonorario_estado = 4
GROUP BY
CONSULTA.orden,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION ALL
SELECT 
CONSULTA.orden,
4 AS cod_tipo,--MEDICINA FISICA
'MEDICINA FISICA' dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_medfis(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,tarifario_cod INTEGER,tarifario_item INTEGER,coaseguro NUMERIC, fec_registro VARCHAR)
GROUP BY
CONSULTA.orden,
CONSULTA.dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION ALL
SELECT 
CONSULTA.orden,
4 AS cod_tipo,--EQUIPO MEDICO
'EQUIPO MEDICO' dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_eqmed(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,tarifario_cod INTEGER,tarifario_item INTEGER,coaseguro NUMERIC, fec_registro VARCHAR)
GROUP BY
CONSULTA.orden,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION all
SELECT 
CONSULTA.orden,
6 AS cod_tipo,--SALAS HOSPITALIZACION
'SALAS HOSPITALIZACION' dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_salas(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,tarifario_cod INTEGER,tarifario_item INTEGER, coaseguro NUMERIC, fec_registro VARCHAR)
GROUP BY
CONSULTA.orden,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc,
CONSULTA.fec_registro
UNION ALL
SELECT 
CONSULTA.orden,
7 AS cod_tipo,--VISITA PASTORAL Y/O OTROS GASTOS
CONSULTA.dsc_servicio dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_otrogastos(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,tarifario_cod INTEGER,tarifario_item INTEGER,coaseguro NUMERIC, fec_registro VARCHAR)
GROUP BY
CONSULTA.orden,
CONSULTA.dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION ALL
SELECT 
CONSULTA.orden,
8 AS cod_tipo,--SERVICIO PERMANENTE DE ENFERMERIA
CONSULTA.dsc_servicio dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_servenf(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,tarifario_cod INTEGER,tarifario_item INTEGER,coaseguro NUMERIC, fec_registro VARCHAR)
GROUP BY
CONSULTA.orden,
CONSULTA.dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION ALL
SELECT 
CONSULTA.orden,
9 AS cod_tipo,--AYUDANTIA
'AYUDANTIA' dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_perayud(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,coaseguro NUMERIC, serie VARCHAR, numero VARCHAR, especialidad INTEGER, fec_registro VARCHAR)
GROUP BY
CONSULTA.orden,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION ALL
SELECT 
CONSULTA.orden,
10 AS cod_tipo,--INSTRUMENTISTA
'INSTRUMENTISTA' dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_perinst(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,tarifario_cod INTEGER,tarifario_item INTEGER,coaseguro NUMERIC, fec_registro VARCHAR)
GROUP BY
CONSULTA.orden,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION ALL
SELECT 
CONSULTA.orden,
11 AS cod_tipo,--CONSULTA MEDICA EMERGENCIA
'CONSULTA MEDICA EMERGENCISTA' dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_conemg(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,coaseguro NUMERIC, serie VARCHAR, numero VARCHAR)
GROUP BY
CONSULTA.orden,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
UNION ALL
SELECT 
CONSULTA.orden,
12 AS cod_tipo,--HONORARIOS MEDICOS
'HONORARIOS MEDICO' dsc_servicio,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
SUM(CONSULTA.cantidad) AS cantidad,
SUM(CONSULTA.val_bruto) AS val_bruto,
CONSULTA.porcentaje_desc,
SUM(CONSULTA.val_descuento) AS val_descuento,
SUM(CONSULTA.val_neto) AS val_neto,
'' AS identificador,
0 AS tp_producto
FROM 
sch_clinica.sp_auditoria_hosp_gastos_record_prehono(cod_oi)
AS CONSULTA(orden INTEGER,dsc_servicio VARCHAR,cod_area INTEGER,dsc_area VARCHAR,codigo VARCHAR,concepto VARCHAR,afecto_igv INTEGER,cantidad NUMERIC,val_bruto NUMERIC,porcentaje_desc NUMERIC,val_descuento NUMERIC,val_neto NUMERIC,cod_oidetalle INTEGER,val_paciente NUMERIC,val_aseguradora NUMERIC,tipo_personal INTEGER,coaseguro NUMERIC,cod_especialidad INTEGER, serie VARCHAR, numero VARCHAR, td_cod INTEGER, td_item INTEGER, td_cod_cta INTEGER, td_item_cta INTEGER)
GROUP BY
CONSULTA.orden,
CONSULTA.cod_area,
CONSULTA.dsc_area, 
CONSULTA.codigo,
CONSULTA.concepto,
CONSULTA.afecto_igv,
CONSULTA.porcentaje_desc
ORDER BY
cod_tipo, afecto_igv DESC, dsc_area, tp_producto, concepto
);
RETURN cur_resultado;
END;
$body$
LANGUAGE 'plpgsql'
VOLATILE
CALLED ON NULL INPUT
SECURITY INVOKER
COST 100;