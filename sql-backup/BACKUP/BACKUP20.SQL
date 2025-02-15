--insert into sch_clinica.tbl_profatencion_prehonorario (profatencion_prehonorario_cierrecod, profatencion_prehonorario_clase, profatencion_prehonorario_coseg_porcentaje, profatencion_prehonorario_fcreacion, profatencion_prehonorario_ipcreacion, profatencion_prehonorario_usrcreacion, profatencion_prehonorario_emcod, profatencion_prehonorario_estado, profatencion_prehonorario_estado_donacion, profatencion_prehonorario_fanulacion, profatencion_prehonorario_femision, profatencion_prehonorario_fhabilpago, profatencion_prehonorario_fregistro, profatencion_prehonorario_hcod, profatencion_prehonorario_monto, profatencion_prehonorario_nota_credito_cod, profatencion_prehonorario_nro, profatencion_prehonorario_oacod, profatencion_prehonorario_oaitem, profatencion_prehonorario_oidet_cod, profatencion_prehonorario_pacod, profatencion_prehonorario_paciente_cod, profatencion_prehonorario_pago, profatencion_prehonorario_preh_anterior, profatencion_prehonorario_usrregistro, profatencion_prehonorario_serie, profatencion_prehonorario_codserv_ejecucion, profatencion_prehonorario_tarifariodet_cod, profatencion_prehonorario_tarifariodet_item, profatencion_prehonorario_tpatencion, profatencion_prehonorario_tphonorario, profatencion_prehonorario_tporigen, profatencion_prehonorario_totalclinica, profatencion_prehonorario_totaldscto, profatencion_prehonorario_totalhonorario, profatencion_prehonorario_neto, profatencion_prehonorario_totalotros, profatencion_prehonorario_totalventa, profatencion_prehonorario_vntcod, profatencion_prehonorario_cod) values (NULL, NULL, '90.0', '2021-09-15 11:46:49.892000 -05:00:00', '192.168.1.36', 'rchullo', '38', '2', NULL, NULL, '2021-09-15 11:46:49.892000 -05:00:00', '2021-09-15 11:46:49.892000 -05:00:00', '2021-09-15 17:30:00.000000 -05:00:00', NULL, '46.61', NULL, '0000020690', '299860', '1', NULL, '65962', '127906', '0', NULL, 'rchullo', '00040', NULL, NULL, NULL, '1', '3', NULL, '4.66', '0.0', '41.95', '41.95', '0.0', '46.61', '003BT020000058380', '000400000020690')

SELECT DISTINCT
*
FROM (
SELECT
  PA.paciente_hstclinica_cod AS nrohc,
  PE.persona_nrodoc AS nrodoc,
  PE.persona_apep || ' ' || PE.persona_apem || ', ' || PE.persona_nmb1 || ' ' || PE.persona_nmb2 AS nombre,
  TO_CHAR(HC.hstclinica_fcreacion, 'YYYY-MM-DD') AS fecha
FROM
  sch_clinica.tbl_citamedica CM
  INNER JOIN sch_clinica.tbl_paciente PA ON (CM.citamedica_persona_cod = PA.paciente_cod)
  INNER JOIN sch_clinica.tbl_hstclinica HC ON (PA.paciente_hstclinica_cod = HC.hstclinica_cod)
  INNER JOIN sch_clinica.tbl_persona PE ON (PA.paciente_cod = PE.persona_cod)
WHERE DATE(CM.citamedica_fhcita) >= '2020-06-11'

 

UNION ALL

 

SELECT
  PA.paciente_hstclinica_cod AS nrohc,
  PE.persona_nrodoc AS nrodoc,
  PE.persona_apep || ' ' || PE.persona_apem || ', ' || PE.persona_nmb1 || ' ' || PE.persona_nmb2 AS nombre,
  TO_CHAR(HC.hstclinica_fcreacion, 'YYYY-MM-DD') AS fecha
FROM
  sch_clinica.tbl_tratamiento_sesion TS
  INNER JOIN sch_clinica.tbl_tratamiento T ON (TS.tratamiento_sesion_tcod = T.tratamiento_cod)
  INNER JOIN sch_clinica.tbl_paciente PA ON (T.tratamiento_paciente_cod = PA.paciente_cod)
  INNER JOIN sch_clinica.tbl_hstclinica HC ON (PA.paciente_hstclinica_cod = HC.hstclinica_cod)
  INNER JOIN sch_clinica.tbl_persona PE ON (PA.paciente_cod = PE.persona_cod)
WHERE DATE(TS.tratamiento_sesion_fprogramada) >= '2020-06-11'
) AS CONSULTA
ORDER BY CONSULTA.nrodoc