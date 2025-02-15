
  SELECT
  sch_clinica.sp_mes_letras(date(OA.ordatencion_fregistro)) as MES,
  DATE(OA.ordatencion_fregistro) AS "FECHA",
  PR.persona_nrodoc as DNI,
  PR.persona_apep || ' ' || PR.persona_apem || ', ' || PR.persona_nmb1 || ' ' || PR.persona_nmb2 AS "PACIENTE",
  (
    SELECT
      ANIO
    FROM
      sch_clinica.sp_util_diferencia_fecha(
        PR.persona_fecnac,
        DATE(OA.ordatencion_fregistro) - 1
      ) AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)
  ) AS "EDAD",
  PR.persona_sexo as "SEXO",
  TP.tppaciente_dsc AS "TIPO PACIENTE",
  NP.negociacionprecio_dsc AS "NEGOCIACION",
  TS.cattpservicio_oid_dsc as "SERVICIO",
  TA.tpatencion_dsc AS "TIPO ATENCION",
  CASE
    WHEN OI.ordinternamiento_estado_facturacion = 0 THEN 'PENDIENTE'
    WHEN OI.ordinternamiento_estado_facturacion = 1 THEN 'AUDITADA'
    WHEN OI.ordinternamiento_estado_facturacion = 3 THEN 'PAGADA'
  END AS "ESTADO",
  ROUND(
    CAST(
      SUM(
        OID.ordinternamientodet_mtoaseguradora * (
          1 + CASE
            WHEN OID.ordinternamientodet_afecto = 0 THEN OID.ordinternamientodet_igv
            ELSE 0
          END
        )
      ) AS NUMERIC
    ),
    2
  ) AS "MONTO ASEG. CON IGV",
  ROUND(
    CAST(
      SUM(
        OID.ordinternamientodet_mtoasegurado * (
          1 + CASE
            WHEN OID.ordinternamientodet_afecto = 0 THEN OID.ordinternamientodet_igv
            ELSE 0
          END
        )
      ) AS NUMERIC
    ),
    2
  ) AS "MONTO PAC. CON IGV",
  OA.ordatencion_cod AS "NRO. O.A.",
  OI.ordinternamiento_cod AS "NRO. O.I.",
  OI.ordinternamiento_usrcreacion
FROM
  sch_clinica.tbl_ordeninternamiento OI
  INNER JOIN sch_clinica.tbl_ordatencion OA ON (OI.ordinternamiento_oacod = OA.ordatencion_cod)
  INNER JOIN sch_clinica.tbl_paciente P ON (OA.ordatencion_paciente_cod = P.paciente_cod)
  INNER JOIN sch_clinica.tbl_persona PR ON (OA.ordatencion_paciente_cod = PR.persona_cod)
  INNER JOIN sch_clinica.tbl_tpatencion TA ON (
    OA.ordatencion_tpatencion_cod = TA.tpatencion_cod
  )
  INNER JOIN sch_clinica.tbl_tppaciente TP ON (
    OI.ordinternamiento_tppaciente = TP.tppaciente_cod
  )
  INNER JOIN sch_clinica.tbl_negociacionprecio NP ON (
    OI.ordinternamiento_ncod = NP.negociacionprecio_cod
  )
  INNER JOIN sch_clinica.tbl_empresa A ON (OI.ordinternamiento_acod = A.empresa_cod)
  INNER JOIN sch_clinica.tbl_empresa E ON (OI.ordinternamiento_ecod = E.empresa_cod)
  INNER JOIN sch_clinica.tbl_ordinternamientodet OID ON (
    OI.ordinternamiento_cod = OID.ordinternamientodet_oicod
  )
  INNER JOIN sch_clinica.tbl_cattpservicio_oid TS ON (
    OID.ordinternamientodet_tpservicio = TS.cattpservicio_oid_cod
  )
WHERE
  (
    OI.ordinternamiento_estado_facturacion = 0
    OR OI.ordinternamiento_estado_facturacion = 1
    OR OI.ordinternamiento_estado_facturacion = 3
  ) --AND OA.ordatencion_estado = 0 OR OI.ordinternamiento_estado = 1
  AND OID.ordinternamientodet_ejecucion_auditoria = 1 --AND TS.cattpservicio_oid_cod = 9--
  AND OA.ordatencion_fregistro BETWEEN :finicio
  AND :ffinal
GROUP BY
  "TIPO ATENCION",
  "TIPO PACIENTE",
  "NRO. O.A.",
  "NRO. O.I.",
  "SEXO",
  "EDAD",
  PR.persona_nrodoc,
  "PACIENTE",
  "FECHA",
  "ESTADO",
  "NEGOCIACION",
  "SERVICIO"
ORDER BY
  OI.ordinternamiento_finicio ASC,
  TP.tppaciente_dsc ASC
;
