SELECT DISTINCT

 DV.docvntsunat_serie || '-' || SUBSTRING(DV.docvntsunat_nro, 3, 10) AS numtransaccion
 
FROM
  sch_clinica.tbl_docvntsunat DV
  INNER JOIN sch_clinica.tbl_docvntsunatdet DVD ON (DV.docvntsunat_cod = DVD.docvntsunatdet_cod)
  --AND DV.docvntsunat_anulado = 0
  /*LEFT JOIN sch_clinica.tbl_tpmoneda TM ON (DV.docvntsunat_tpmoneda = TM.tpmoneda_cod)
  LEFT JOIN sch_clinica.tbl_predocvnt PD ON (DV.docvntsunat_predocvnt_cod = PD.predocvnt_cod)
  LEFT JOIN (
    SELECT DISTINCT
    docvntsunatmant_tpdoc,
    docvntsunatmant_serie,
    docvntsunatmant_horacle
    FROM sch_clinica.tbl_docvntsunatmant
    WHERE docvntsunatmant_horacle IS NOT NULL    
  ) DVM ON (DV.docvntsunat_tpdoc = DVM.docvntsunatmant_tpdoc AND DV.docvntsunat_serie = DVM.docvntsunatmant_serie)
  LEFT JOIN (
    SELECT 
      pago_docvntsunat_cod AS coddocvnt,
      COUNT(pago_docvntsunat_cod) AS cantidad,
      SUM(pago_mtodeltotal) AS monto
    FROM 
      sch_clinica.tbl_pago
    WHERE DATE(pago_fcreacion) >= '01-01-2017'
    GROUP BY pago_docvntsunat_cod  
  ) PA ON (DV.docvntsunat_cod = PA.coddocvnt AND PA.monto >= DV.docvntsunat_totneto)
  
  LEFT JOIN sch_clinica.tbl_empresa CE ON (DV.docvntsunat_cliente_cod = CE.empresa_cod) 
  AND (DV.docvntsunat_tpcliente = 3) AND (CE.empresa_ruc LIKE '20%' OR CE.empresa_tpcontribuyente = 2)
  LEFT JOIN sch_clinica.tbl_empresa CEP ON (DV.docvntsunat_cliente_cod = CEP.empresa_cod) 
  AND (DV.docvntsunat_tpcliente = 3) AND (CEP.empresa_ruc NOT LIKE '20%' AND CEP.empresa_tpcontribuyente != 2)
  
  LEFT JOIN sch_clinica.tbl_persona PT ON (DV.docvntsunat_cliente_cod = PT.persona_cod AND DV.docvntsunat_tpcliente != 3)
  LEFT JOIN sch_clinica.tbl_persona CP ON (CASE WHEN DV.docvntsunat_tpcliente != 3 AND (PT.persona_tpidentidad = 7 OR PT.persona_tpidentidad = 4) THEN PT.persona_cod
  										   WHEN DV.docvntsunat_tpcliente != 3 AND (DV.docvntsunat_cliente_cod IS NULL OR DV.docvntsunat_cliente_cod = 0 OR
  										   PT.persona_tpidentidad IS NULL OR PT.persona_tpidentidad = 0 OR length(TRIM(PT.persona_nrodoc)) != 8) THEN 182971 
   										   WHEN CEP.empresa_cod IS NOT NULL THEN CEP.empresa_referencia_persona
                                           WHEN DV.docvntsunat_tpcliente != 3 THEN DV.docvntsunat_cliente_cod END = CP.persona_cod)                                      
                                           
    
  LEFT JOIN sch_clinica.tbl_docvntsunatsubdet DVSD ON (DVD.docvntsunatdet_cod = DVSD.docvntsunatsubdet_sv_cod)
  AND (DVD.docvntsunatdet_item = DVSD.docvntsunatsubdet_sv_item)
  --FARMACIA INI-- 
  LEFT JOIN sch_clinica.tbl_movimiento_almacen MA ON (DV.docvntsunat_cod = MA.movimiento_almacen_nrodocref)
  LEFT JOIN sch_clinica.tbl_lstpreciofarmadet LPM ON (DVD.docvntsunatdet_elemento_cod = LPM.lstpreciofarmadet_cod)
  AND (DVD.docvntsunatdet_elemento_item = LPM.lstpreciofarmadet_item AND DVD.docvntsunatdet_tpelemento = 1)
  LEFT JOIN sch_clinica.tbl_lstpreciodet LPI ON (DVD.docvntsunatdet_elemento_cod = LPI.lstpreciodet_cod)
  AND (DVD.docvntsunatdet_elemento_item = LPI.lstpreciodet_item AND DVD.docvntsunatdet_tpelemento = 2)
  LEFT JOIN sch_clinica.tbl_prodfarmadet PFD ON (
  CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL AND DVSD.docvntsunatsubdet_tp_detalle = 2 THEN DVSD.docvntsunatsubdet_pfd_cod
  ELSE LPM.lstpreciofarmadet_prodfarmadet_cod END = PFD.prodfarmadet_prodfarma_cod)
  AND (
  CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL AND DVSD.docvntsunatsubdet_tp_detalle = 2 THEN DVSD.docvntsunatsubdet_pfd_item
  ELSE LPM.lstpreciofarmadet_prodfarmadet_item END = PFD.prodfarmadet_item)

  LEFT JOIN sch_clinica.tbl_prodfarma PF ON (PFD.prodfarmadet_prodfarma_cod = PF.prodfarma_cod)
  LEFT JOIN sch_clinica.tbl_producto MED ON (PF.prodfarma_producto_cod = MED.producto_cod)
  LEFT JOIN sch_clinica.tbl_producto PRO ON (
  CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL AND (DVSD.docvntsunatsubdet_tp_detalle = 2 OR DVSD.docvntsunatsubdet_tp_detalle = 6 OR DVSD.docvntsunatsubdet_tp_detalle = 11 OR DVSD.docvntsunatsubdet_tp_detalle = 21) AND DVSD.docvntsunatsubdet_pfd_item IS NULL THEN CAST(DVSD.docvntsunatsubdet_pfd_cod AS INTEGER)
  ELSE LPI.lstpreciodet_producto_cod END = PRO.producto_cod)
  --FARMACIA FIN-- 
  --TARIFARIO INI--
  LEFT JOIN sch_clinica.tbl_tarifariodet TD ON (
  --CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL AND (DVSD.docvntsunatsubdet_tp_detalle = 1 OR DVSD.docvntsunatsubdet_tp_detalle = 3 OR DVSD.docvntsunatsubdet_tp_detalle = 5 OR DVSD.docvntsunatsubdet_tp_detalle = 7 OR DVSD.docvntsunatsubdet_tp_detalle = 9) 
  CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL AND (DVSD.docvntsunatsubdet_tp_detalle != 2 AND DVSD.docvntsunatsubdet_tp_detalle != 11) 
  THEN CAST(DVSD.docvntsunatsubdet_elemento_cod AS INTEGER)
  --ELSE DVD.docvntsunatdet_elemento_cod END = TD.tarifariodet_cod)
  ELSE CASE WHEN DVD.docvntsunatdet_tpelemento != 2 AND PRO.producto_cod IS NULL AND MED.producto_cod IS NULL THEN DVD.docvntsunatdet_elemento_cod END END = TD.tarifariodet_cod)
  AND (
  --CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL AND (DVSD.docvntsunatsubdet_tp_detalle = 1 OR DVSD.docvntsunatsubdet_tp_detalle = 3 OR DVSD.docvntsunatsubdet_tp_detalle = 5 OR DVSD.docvntsunatsubdet_tp_detalle = 7 OR DVSD.docvntsunatsubdet_tp_detalle = 9) 
  CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL AND (DVSD.docvntsunatsubdet_tp_detalle != 2 AND DVSD.docvntsunatsubdet_tp_detalle != 11) 
  THEN CAST(DVSD.docvntsunatsubdet_elemento_item AS INTEGER)
  ELSE CASE WHEN DVD.docvntsunatdet_tpelemento != 2 AND PRO.producto_cod IS NULL AND MED.producto_cod IS NULL THEN DVD.docvntsunatdet_elemento_item END END = TD.tarifariodet_item)
  --TARIFARIO FIN--
  LEFT JOIN sch_clinica.tbl_segus S ON (TD.tarifariodet_cod = S.segus_tarifariodet_cod AND TD.tarifariodet_item = S.segus_tarifariodet_item)
  --SEGUS INI-- 
  LEFT JOIN (
    SELECT DISTINCT
    segus_det_tdcod AS tdcod,
    segus_det_tditem AS tditem,
    MAX(segus_det_identificador) AS identificador
    FROM sch_clinica.tbl_segus_det
    GROUP BY segus_det_tdcod, segus_det_tditem
  ) SD ON (TD.tarifariodet_cod = SD.tdcod AND TD.tarifariodet_item = SD.tditem)
  --SEGUS FIN--
  --ESPECIALIDAD INI--
  LEFT JOIN (
    SELECT OA.ordatencion_cod AS codoa,
    CASE WHEN EMG.emergencia_consulta_emcod IS NOT NULL THEN EMG.emergencia_consulta_emcod
    ELSE CITA.citamedica_emcod END AS codespcialidad
    FROM sch_clinica.tbl_ordatencion OA
    INNER JOIN sch_clinica.tbl_ordatenciondet AD ON (OA.ordatencion_cod = AD.ordatenciondet_ordatencion_cod)
    AND (AD.ordatenciondet_tipodetalle = 0)
    LEFT JOIN sch_clinica.tbl_emergencia_consulta EMG ON (AD.ordatenciondet_ordatencion_cod = EMG.emergencia_consulta_oacod)
    AND (AD.ordatenciondet_item = EMG.emergencia_consulta_oaitem)
    LEFT JOIN sch_clinica.tbl_ordatencionamb AMB ON (AD.ordatenciondet_ordatencion_cod = AMB.ordatencionamb_ordatenciondet_cod)
    AND (AD.ordatenciondet_item = AMB.ordatencionamb_ordatenciondet_item)
    LEFT JOIN sch_clinica.tbl_citamedica CITA ON (AMB.ordatencionamb_citamedica_cod = CITA.citamedica_cod)
    WHERE OA.ordatencion_cod = 0 --CAMBIAR
    LIMIT 1  
  ) CONSULTA ON (DV.docvntsunat_oa_codigo = CONSULTA.codoa)
  
  LEFT JOIN sch_clinica.tbl_espprofatencion ESP ON (
  CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL AND DVSD.docvntsunatsubdet_tp_detalle = 0 THEN
  CAST(DVSD.docvntsunatsubdet_elemento_item AS INTEGER)
  ELSE CONSULTA.codespcialidad END = ESP.espprofatencion_cod)
  --ESPECIALIDAD FIN--
    --NCREDITO INI--
  LEFT JOIN sch_clinica.tbl_docvntsunat_referencia DVR ON (DV.docvntsunat_cod = DVR.docvntsunat_referencia_cod)
  LEFT JOIN sch_clinica.tbl_catgenerico TPNC ON (DVR.docvntsunat_referencia_tp_nc = TPNC.catgenerico_cod AND TPNC.catgenerico_tpcod = 154)
  LEFT JOIN sch_clinica.tbl_docvntsunat DVNC ON (DVR.docvntsunat_referencia_docref_cod = DVNC.docvntsunat_cod)
  LEFT JOIN (
    SELECT DISTINCT
    docvntsunatmant_tpdoc,
    docvntsunatmant_serie,
    docvntsunatmant_horacle
    FROM sch_clinica.tbl_docvntsunatmant
    WHERE docvntsunatmant_horacle IS NOT NULL
  ) DVMNC ON (DVNC.docvntsunat_tpdoc = DVMNC.docvntsunatmant_tpdoc AND DVNC.docvntsunat_serie = DVMNC.docvntsunatmant_serie)
  --NCREDITO INI--
  LEFT JOIN sch_clinica.tbl_ordatencion OAT ON (DV.docvntsunat_oa_codigo = OAT.ordatencion_cod)
  LEFT JOIN sch_clinica.tbl_ordeninternamiento OIT ON (DV.docvntsunat_oi_codigo = OIT.ordinternamiento_cod)
  LEFT JOIN sch_clinica.tbl_tpatencion TPA ON (OAT.ordatencion_tpatencion_cod = TPA.tpatencion_cod)
  LEFT JOIN sch_clinica.tbl_paciente PAC ON (OAT.ordatencion_paciente_cod = PAC.paciente_cod)
  LEFT JOIN sch_clinica.tbl_persona PER ON (PAC.paciente_cod = PER.persona_cod)
  LEFT JOIN sch_clinica.tbl_ordatencionaseg OAAST ON (OAT.ordatencion_cod = OAAST.ordatencionaseg_cod)
  
  LEFT JOIN sch_clinica.tbl_empresa ASEGT ON (CASE WHEN OIT.ordinternamiento_acod IS NOT NULL THEN OIT.ordinternamiento_acod
  ELSE OAT.ordatencion_negprc_emp_aseg_acod END = ASEGT.empresa_cod)
  LEFT JOIN sch_clinica.tbl_negociacionprecio NPT ON (CASE WHEN OIT.ordinternamiento_ncod IS NOT NULL THEN OIT.ordinternamiento_ncod 
  ELSE OAT.ordatencion_negprc_emp_aseg_ncod END = NPT.negociacionprecio_cod)
  
  LEFT JOIN sch_clinica.tbl_distrito DIP ON (CP.persona_ubigeo = DIP.distrito_cod)
  LEFT JOIN sch_clinica.tbl_provincia PRP ON (DIP.distrito_ciudad_cod = PRP.provincia_ciudad_cod)
  AND (DIP.distrito_provincia_cod = PRP.provincia_cod)
  LEFT JOIN sch_clinica.tbl_ciudad CIP ON (CIP.ciudad_pais_cod = PRP.provincia_pais_cod)
  AND (PRP.provincia_ciudad_cod = CIP.ciudad_cod)
  LEFT JOIN sch_clinica.tbl_pais PAP ON (CP.persona_pais = PAP.pais_cod)
     
  LEFT JOIN sch_clinica.tbl_distrito DIE ON (CE.empresa_distrito = DIE.distrito_cod)
  LEFT JOIN sch_clinica.tbl_provincia PRE ON (DIE.distrito_ciudad_cod = PRE.provincia_ciudad_cod)
  AND (DIE.distrito_provincia_cod = PRE.provincia_cod)
  LEFT JOIN sch_clinica.tbl_ciudad CIE ON (CIE.ciudad_pais_cod = PRE.provincia_pais_cod)
  AND (PRE.provincia_ciudad_cod = CIE.ciudad_cod)
  LEFT JOIN sch_clinica.tbl_pais PAE ON (CE.empresa_pais = PAE.pais_cod)*/