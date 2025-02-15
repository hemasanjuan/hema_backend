SELECT 
  
  sch_clinica.tbl_persona.persona_nrodoc,
  sch_clinica.tbl_persona.persona_apep ||' '|| sch_clinica.tbl_persona.persona_apem ||', '||
  sch_clinica.tbl_persona.persona_nmb1 ||' '|| sch_clinica.tbl_persona.persona_nmb2 AS PACIENTE,
  to_char(age(clock_timestamp(), sch_clinica.tbl_persona.persona_fecnac),'YY') as edad,
   sch_clinica.tbl_persona.persona_sexo as sexo,
  CAST(sch_clinica.tbl_hospitalizacion.hospitalizacion_oicod_activa AS VARCHAR) AS "OI",
  sch_clinica.tbl_tppaciente.tppaciente_dsc AS "TIPO PACIENTE",
  tbl_empresa1.empresa_nmbcomercial  AS "ASEGURADORA",   
  sch_clinica.tbl_espprofatencion.espprofatencion_dsc AS "ESPECIALIDAD",
  tbl_persona1.persona_apep ||' '|| tbl_persona1.persona_apem ||' , '||
  tbl_persona1.persona_nmb1  AS "MEDICO",
  TO_CHAR(sch_clinica.tbl_ordeninternamiento.ordinternamiento_finicio, 'YYYY-MM-DD') AS "FECHA INGRESO",   
  TO_CHAR(sch_clinica.tbl_ordeninternamiento.ordinternamiento_ffin, 'YYYY-MM-DD') AS "FECHA EGRESO",
  DX.hospitalizacion_diagnostico_cie10 as DX,
  cie.cie10_dsc as diagnostico -- DIAGNOSTICOS DE HOSPITALIZACION
FROM
  sch_clinica.tbl_hospitalizacion
  INNER JOIN sch_clinica.tbl_ordeninternamiento ON (sch_clinica.tbl_hospitalizacion.hospitalizacion_oicod_activa = sch_clinica.tbl_ordeninternamiento.ordinternamiento_cod)
  INNER JOIN sch_clinica.tbl_ordatencion ON (sch_clinica.tbl_hospitalizacion.hospitalizacion_oacod = sch_clinica.tbl_ordatencion.ordatencion_cod)
  INNER JOIN sch_clinica.tbl_tppaciente ON (sch_clinica.tbl_ordeninternamiento.ordinternamiento_tppaciente = sch_clinica.tbl_tppaciente.tppaciente_cod)
  INNER JOIN sch_clinica.tbl_paciente ON (sch_clinica.tbl_ordatencion.ordatencion_paciente_cod = sch_clinica.tbl_paciente.paciente_cod)  
  INNER JOIN sch_clinica.tbl_maprecintodet ON (sch_clinica.tbl_hospitalizacion.hospitalizacion_ubicacion_cod = sch_clinica.tbl_maprecintodet.maprecintodet_cod)
  INNER JOIN sch_clinica.tbl_catpiso ON (sch_clinica.tbl_maprecintodet.maprecintodet_piso = sch_clinica.tbl_catpiso.catpiso_cod)
  INNER JOIN sch_clinica.tbl_persona ON (sch_clinica.tbl_paciente.paciente_cod = sch_clinica.tbl_persona.persona_cod)
  INNER JOIN sch_clinica.tbl_empresa ON (sch_clinica.tbl_ordeninternamiento.ordinternamiento_ecod = sch_clinica.tbl_empresa.empresa_cod)
  INNER JOIN sch_clinica.tbl_empresa tbl_empresa1 ON (sch_clinica.tbl_ordeninternamiento.ordinternamiento_acod = tbl_empresa1.empresa_cod)
  INNER JOIN sch_clinica.tbl_espprofatencion ON (sch_clinica.tbl_hospitalizacion.hospitalizacion_emcod = sch_clinica.tbl_espprofatencion.espprofatencion_cod)
  INNER JOIN sch_clinica.tbl_persona tbl_persona1 ON (sch_clinica.tbl_hospitalizacion.hospitalizacion_pacod = tbl_persona1.persona_cod)
  INNER JOIN sch_clinica.tbl_maprecinto ON (sch_clinica.tbl_maprecintodet.maprecintodet_recinto_cod = sch_clinica.tbl_maprecinto.maprecinto_cod)
  INNER JOIN sch_clinica.tbl_map ON (sch_clinica.tbl_maprecinto.maprecinto_map_cod = sch_clinica.tbl_map.map_cod)
  inner join sch_clinica.tbl_hospitalizacion_diagnostico DX on (tbl_hospitalizacion.hospitalizacion_oacod = DX.hospitalizacion_diagnostico_cod)
  inner join sch_clinica.tbl_cie10 cie on (DX.hospitalizacion_diagnostico_cie10 = cie.cie10_cod)
WHERE
  --tbl_empresa1.empresa_ruc = '20443331396'
      DATE(sch_clinica.tbl_hospitalizacion.hospitalizacion_fingreso) >= :fini
  AND DATE(sch_clinica.tbl_hospitalizacion.hospitalizacion_fingreso) <= :ffin
ORDER BY
  sch_clinica.tbl_persona.persona_apep ASC
  
  ------ quirofano -----
  SELECT 
  sch_clinica.sp_mes_letras(date(QUI.quirofanoamb_fingreso)) as MES,
  TO_CHAR(QUI.quirofanoamb_fingreso, 'DD/MM/YYYY') as FECHA,
  P.persona_nrodoc as DNI,
  COALESCE(P.persona_apep, '') || ' ' || COALESCE(P.persona_apem, '') || ', ' || COALESCE(P.persona_nmb1, '')
	  || ' ' || COALESCE(P.persona_nmb2, '') as paciente,
  (SELECT ANIO FROM 
     sch_clinica.sp_util_diferencia_fecha(P.persona_fecnac, DATE(OA.ordatencion_fregistro) - 1)
     AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)) AS EDAD,
  P.persona_sexo as SEXO,   
 TP.tppaciente_dsc as TIPO,
 NP.negociacionprecio_dsc as negociacion,  
  TA.tpatencion_dsc as tipo_atencion,   
  E.espprofatencion_dsc as especialidad,
   COALESCE(M.persona_apep, '') || ' ' || COALESCE(M.persona_apem, '') || ', ' || COALESCE(M.persona_nmb1, '')
	  || ' ' || COALESCE(M.persona_nmb2, '') as medico,
  (
  	SELECT array_to_string(array_agg(COALESCE(TMRD.maprecintodet_dsc, '') ), '-') FROM sch_clinica.tbl_quirofano TQ 
    INNER JOIN sch_clinica.tbl_maprecintodet TMRD ON TMRD.maprecintodet_cod = TQ.quirofano_sala_cod
    WHERE TQ.quirofano_oacod = OA.ordatencion_cod
  ) as sala,
  PAC.paciente_hstclinica_cod as historia,
  QUI.quirofanoamb_oacod as orden_atencion
FROM sch_clinica.tbl_quirofanoamb QUI
INNER JOIN sch_clinica.tbl_ordatencion OA ON OA.ordatencion_cod = QUI.quirofanoamb_oacod
INNER JOIN sch_clinica.tbl_negociacionprecio NP ON OA.ordatencion_negprc_emp_aseg_ncod = NP.negociacionprecio_cod
INNER JOIN sch_clinica.tbl_tppaciente TP ON OA.ordatencion_tpaciente_cod = TP.tppaciente_cod
INNER JOIN sch_clinica.tbl_espprofatencion E ON qui.quirofanoamb_emcod = E.espprofatencion_cod
INNER JOIN sch_clinica.tbl_persona P ON OA.ordatencion_paciente_cod = P.persona_cod
INNER JOIN sch_clinica.tbl_persona M ON M.persona_cod = QUI.quirofanoamb_pacod
INNER JOIN sch_clinica.tbl_paciente PAC ON PAC.paciente_cod = P.persona_cod
INNER JOIN sch_clinica.tbl_tpatencion TA ON TA.tpatencion_cod = OA.ordatencion_tpatencion_cod
LEFT JOIN sch_clinica.tbl_ordatencion OAP ON OAP.ordatencion_cod = QUI.quirofanoamb_procedencia_oacod
LEFT JOIN sch_clinica.tbl_tpatencion TAP ON TAP.tpatencion_cod = OAP.ordatencion_tpatencion_cod

WHERE DATE(QUI.quirofanoamb_fingreso) >= :finicio AND  DATE(QUI.quirofanoamb_fingreso) <= :ffin
AND NOT EXISTS(
	SELECT 0 FROM sch_clinica.tbl_hospitalizacion TH 
    WHERE TH.hospitalizacion_oacod = OA.ordatencion_cod
)
ORDER BY QUI.quirofanoamb_fingreso

  ----------------------------- FACTURACION QX  --------------------------
  
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



select 
tarifariodet_item, tarifariodet_dsc
 from sch_clinica.tbl_tarifariodet;


  
  ----------------------------- INTERCONSUKLTAS Y CONSULTAS --------------------------
SELECT
  PAP.profatencion_prehonorario_cod 							AS "CODIGO HONORARIO",
  ESP.espprofatencion_dsc 										AS "ESPECIALIDAD",
  PER.vw_persona_nombres 										AS "PROFESIONAL DE ATENCION",    
  HC.paciente_hstclinica_cod ||' - '||PAC.vw_persona_nombres 	AS "PACIENTE", 
  TO_CHAR(PAP.profatencion_prehonorario_fregistro,'DD-MM-YYYY') AS "FECHA", 
  OID.ordinternamientodet_precioventa 							AS "MONTO"
FROM
  sch_clinica.tbl_profatencion_prehonorario PAP
  INNER JOIN sch_clinica.tbl_ordinternamientodet OID ON (PAP.profatencion_prehonorario_oidet_cod = OID.ordinternamientodet_cod)
  INNER JOIN sch_clinica.vw_persona PER ON (PAP.profatencion_prehonorario_pacod = PER.vw_persona_cod)
  INNER JOIN sch_clinica.tbl_espprofatencion ESP ON (PAP.profatencion_prehonorario_emcod = ESP.espprofatencion_cod)	
  INNER JOIN sch_clinica.tbl_ordeninternamiento OI ON (OID.ordinternamientodet_oicod = OI.ordinternamiento_cod )
  LEFT JOIN sch_clinica.tbl_ordatencion OA ON (OI.ordinternamiento_oacod = OA.ordatencion_cod)
  LEFT JOIN sch_clinica.tbl_paciente HC ON (OA.ordatencion_paciente_cod = HC.paciente_cod)
  LEFT JOIN sch_clinica.vw_persona PAC ON (HC.paciente_cod = PAC.vw_persona_cod)
WHERE
  --PAP.profatencion_prehonorario_tphonorario = 1
   PAP.profatencion_prehonorario_estado != 4
  AND DATE(PAP.profatencion_prehonorario_fregistro) >= :fec_ini
  AND DATE(PAP.profatencion_prehonorario_fregistro) <= :fec_fin
  
  ------------------citas medicas---------------------------
  SELECT 
  TO_CHAR(citamedica_fhcita, 'DD-MM-YYYY HH12:MI') AS fh_cita,
  PAS.paciente_hstclinica_cod AS historia,
  PER.persona_apep || ' ' || PER.persona_apem || ' ' || PER.persona_nmb1 || ' ' || PER.persona_nmb2 AS paciente,  
  ESP.espprofatencion_dsc AS especialidad,  
  MED.persona_apep || ' ' || MED.persona_apem || ' ' || MED.persona_nmb1 || ' ' || MED.persona_nmb2 AS medico,  
  TO_CHAR(citamedica_fregistro, 'DD-MM-YYYY HH12:MI') AS fh_registro,
  CM.citamedica_estado AS ESTADO,
  CM.citamedica_asistencia as ASISTENCIA,
  OA.ordatencionamb_ordatenciondet_cod as OAD,
  DVS.docvntsunat_totalventa/1.18 as VENTA
FROM 
  sch_clinica.tbl_citamedica CM
  INNER JOIN sch_clinica.tbl_persona PER ON CM.citamedica_persona_cod = PER.persona_cod
  INNER JOIN sch_clinica.tbl_paciente PAS ON PER.persona_cod = PAS.paciente_cod
  INNER JOIN sch_clinica.tbl_persona MED ON CM.citamedica_pacod = MED.persona_cod
  INNER JOIN sch_clinica.tbl_espprofatencion ESP ON CM.citamedica_emcod = ESP.espprofatencion_cod
  LEFT JOIN sch_clinica.tbl_ordatencionamb OA on CM.citamedica_cod = OA.ordatencionamb_citamedica_cod
  LEFT JOIN sch_clinica.tbl_docvntsunat DVS on OA.ordatencionamb_ordatenciondet_cod = DVS.docvntsunat_oa_codigo
  --LEFT JOIN sch_clinica.tbl_ordatencion OAX on OA.ordatencionamb_ordatenciondet_cod = OAX.
WHERE
 -- citamedica_estado = 0
      DATE(citamedica_fhcita) >= :finicio
  AND DATE(citamedica_fhcita) <= :ffin
  
ORDER BY citamedica_fhcita DESC;