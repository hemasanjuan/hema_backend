interface IQuery {
    IQuery(fecha_ini: string, fecha_fin: string): string;
}

export const getQueryVentas: IQuery['IQuery'] = (fecha_ini, fecha_fin) => `
SELECT 
CAST(RESULT.nompaciente AS VARCHAR),
CAST(RESULT.numtransaccion AS VARCHAR),
CAST(RESULT.fechatran AS TIMESTAMP),
CAST(RESULT.tppago AS VARCHAR),
CAST(RESULT.termpago AS VARCHAR),
CAST(RESULT.dsctrans AS VARCHAR),
CAST(RESULT.notalinea AS VARCHAR),
CAST(RESULT.tpdoccliente AS VARCHAR),
CAST(RESULT.nrodoccliente AS VARCHAR),
CAST(RESULT.nomcliente AS VARCHAR),
CAST(RESULT.docnumant AS VARCHAR),
CAST(RESULT.planes AS VARCHAR),
CAST(RESULT.prefactura AS VARCHAR),
CAST(RESULT.tpdocsunat AS VARCHAR),
CAST(RESULT.tpmoneda AS VARCHAR),
CAST(RESULT.codimpuesto AS VARCHAR),
CAST(RESULT.tasaimp AS DOUBLE PRECISION),
CASE WHEN RESULT.tpmoneda != 'PEN' THEN RESULT.mntimpuesto / RESULT.tipocambio ELSE RESULT.mntimpuesto END,
--CAST( AS DOUBLE PRECISION),
CASE WHEN RESULT.tpmoneda != 'PEN' THEN RESULT.mntneto / RESULT.tipocambio ELSE RESULT.mntneto END,
CASE WHEN RESULT.tpmoneda != 'PEN' THEN RESULT.preunineto / RESULT.tipocambio ELSE RESULT.preunineto END,
CASE WHEN RESULT.tpmoneda != 'PEN' THEN RESULT.prelstunit / RESULT.tipocambio ELSE RESULT.prelstunit END,
RESULT.cantidad,
CAST(RESULT.codproducto AS VARCHAR),
CAST(RESULT.codalmacen AS VARCHAR),
CAST(RESULT.dsclinea AS VARCHAR),
CAST(RESULT.dircliente AS VARCHAR),
CAST(RESULT.ciucliente AS VARCHAR),
CAST(RESULT.procliente AS VARCHAR),
CAST(RESULT.discliente AS VARCHAR),
CAST(RESULT.paicliente AS VARCHAR),
CAST(RESULT.tptran AS VARCHAR),
CAST(RESULT.origen AS VARCHAR),
CAST(RESULT.s1provincia AS VARCHAR),
CAST(RESULT.s2capitulo AS VARCHAR),
CAST(RESULT.s3cia AS VARCHAR),
CAST(RESULT.s4cuenta AS VARCHAR),
CAST(RESULT.s5corporativa AS VARCHAR),
CAST(RESULT.s6ccosto AS VARCHAR),
CAST(RESULT.s7linea AS VARCHAR),
CAST(RESULT.s8lineaser AS VARCHAR),
CAST(RESULT.s9unidad AS VARCHAR),
CAST(RESULT.s10inter AS VARCHAR),
CAST(RESULT.s11convenio AS VARCHAR),
CAST(RESULT.s12tarifario AS VARCHAR),
CAST(RESULT.s13fut1 AS VARCHAR),
CAST(RESULT.s14fut2 AS VARCHAR),
RESULT.idorg,
CAST(RESULT.procesado AS VARCHAR),
CAST(RESULT.idtranori AS VARCHAR),	
CAST(RESULT.ordatencion AS VARCHAR),
CAST(RESULT.nrohistoria AS VARCHAR),
CAST(RESULT.fechaatencion AS VARCHAR),
CAST(TRIM(RESULT.planatencion) AS VARCHAR),
CAST(RESULT.empcontratante AS VARCHAR),
CAST(RESULT.nropoliza AS VARCHAR),
CAST(RESULT.numlinea AS INTEGER),
CAST(RESULT.usrregistro AS VARCHAR),
RESULT.codcliente,
CAST(RESULT.tpncr AS VARCHAR),
CAST(RESULT.tpnd AS VARCHAR),
CAST(RESULT.numtransaccionref AS VARCHAR),
CAST(RESULT.tpdocsunatref AS VARCHAR),
CAST(RESULT.fechatranref AS TIMESTAMP),
CAST(CASE WHEN RESULT.numlinearef = 0 THEN NULL ELSE RESULT.numlinearef END AS INTEGER),
CAST(RESULT.tptranref AS VARCHAR),
RESULT.tpcliente,
CAST(RESULT.fechagl AS TIMESTAMP),
CAST(RESULT.tipocambio AS DOUBLE PRECISION),
CAST(RESULT.codigo AS VARCHAR),
RESULT.predocvnt_tipo,
CAST(RESULT.tarifariodet_dsc AS VARCHAR),
CAST(RESULT.identificador AS VARCHAR),
CAST(RESULT.espprofatencion_horacle AS VARCHAR)
FROM(
SELECT DISTINCT
 CASE WHEN PER.persona_cod IS NOT NULL THEN
 TRIM(PER.persona_apep) || ' ' || TRIM(PER.persona_apem) || ', ' || TRIM(PER.persona_nmb1) || ' ' || TRIM(PER.persona_nmb2)
 WHEN PER.persona_cod IS NULL AND CP.persona_cod IS NOT NULL THEN
 TRIM(CP.persona_apep) || ' ' || TRIM(CP.persona_apem) || ', ' || TRIM(CP.persona_nmb1) || ' ' || TRIM(CP.persona_nmb2)
 ELSE '' END AS nompaciente,
 DV.docvntsunat_serie || '-' || SUBSTRING(DV.docvntsunat_nro, 3, 10) AS numtransaccion,
 DV.docvntsunat_femision AS fechatran,
 CASE WHEN PA.coddocvnt IS NOT NULL OR NPT.negociacionprecio_perpago = 0 THEN 'CO' ELSE 'CR' END AS tpPago,
 CASE WHEN PA.coddocvnt IS NOT NULL OR NPT.negociacionprecio_perpago = 0 THEN 'CONTADO' ELSE COALESCE(NPT.negociacionprecio_perpago, 0) || ' DIAS' END AS termpago,
 NULL AS dsctrans,
 NULL AS notalinea,
 
 CASE WHEN CE.empresa_ruc IS NOT NULL THEN CE.empresa_tpidentidad
 WHEN CEP.empresa_ruc IS NOT NULL THEN 6
 WHEN CP.persona_nrodoc IS NOT NULL AND length(TRIM(CP.persona_nrodoc)) > 0 AND CP.persona_tpidentidad IS NOT NULL THEN CP.persona_tpidentidad
 ELSE '0' END AS tpdoccliente,
 
 CASE WHEN CE.empresa_ruc IS NOT NULL THEN CE.empresa_ruc
 WHEN CEP.empresa_ruc IS NOT NULL THEN CEP.empresa_ruc
 WHEN CP.persona_nrodoc IS NOT NULL AND length(TRIM(CP.persona_nrodoc)) > 0 AND CP.persona_tpidentidad IS NOT NULL THEN CP.persona_nrodoc
 ELSE '0' END AS nrodoccliente,
 
 CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_rznsocial
 WHEN CP.persona_cod IS NOT NULL THEN TRIM(CP.persona_apep) || ' ' || TRIM(CP.persona_apem) || ', ' || TRIM(CP.persona_nmb1) || ' ' || TRIM(CP.persona_nmb2)
 ELSE '' END AS nomcliente,
 NULL AS docnumant,
 NULL AS planes,
 COALESCE(PD.predocvnt_cod, '000000000000') AS prefactura,
 LPAD(CAST(DV.docvntsunat_tpdoc AS VARCHAR), 2, '0') AS tpdocsunat,
 --'PEN' AS tpmoneda,
 COALESCE(TM.tpmoneda_iso, 'PEN') AS tpmoneda,
 CASE WHEN DVD.docvntsunatdet_afectoigv = 1 THEN 'PE-IGV 18'
 ELSE 'PE-IGV NO GRAVADO' END AS codimpuesto,
 CASE WHEN DVD.docvntsunatdet_afectoigv = 1 THEN DV.docvntsunat_igv * 100
 ELSE 0.00 END AS tasaimp,
 CASE WHEN DVD.docvntsunatdet_preciounineto != 0 THEN 
   CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL AND DVD.docvntsunatdet_afectoigv = 1 THEN ROUND(CAST(DVSD.docvntsunatsubdet_total AS NUMERIC), 2)
   WHEN DVSD.docvntsunatsubdet_cod IS NULL AND DVD.docvntsunatdet_afectoigv = 1 THEN ROUND(CAST(DVD.docvntsunatdet_totneto AS NUMERIC), 2)
   ELSE 0.00 END * DV.docvntsunat_igv 
 ELSE 0.00 END AS mntimpuesto,
 
 CASE WHEN DVD.docvntsunatdet_preciounineto != 0 THEN 
   CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL THEN ROUND(CAST(DVSD.docvntsunatsubdet_total AS NUMERIC), 2)
   ELSE ROUND(CAST(DVD.docvntsunatdet_totneto AS NUMERIC), 2) END
 ELSE 0.00 END AS mntneto,
 
 CASE WHEN DVD.docvntsunatdet_preciounineto != 0 THEN 
   CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL THEN ROUND(CAST(DVSD.docvntsunatsubdet_total AS NUMERIC), 2) / DVSD.docvntsunatsubdet_cantidad
   ELSE ROUND(CAST(DVD.docvntsunatdet_totneto AS NUMERIC), 2) / DVD.docvntsunatdet_cantidad END 
 ELSE 0.00 END AS preunineto,
 
 CASE WHEN DVD.docvntsunatdet_preciounineto != 0 THEN   
   CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL THEN ROUND(CAST(DVSD.docvntsunatsubdet_total AS NUMERIC), 2) / DVSD.docvntsunatsubdet_cantidad
   ELSE ROUND(CAST(DVD.docvntsunatdet_totneto AS NUMERIC), 2) / DVD.docvntsunatdet_cantidad END 
 ELSE 0.00 END AS prelstunit,
 
 CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL THEN DVSD.docvntsunatsubdet_cantidad
 ELSE ROUND(CAST(DVD.docvntsunatdet_cantidad AS NUMERIC), 2) END AS cantidad,
 
 CASE WHEN PFD.prodfarmadet_horacle IS NOT NULL THEN PFD.prodfarmadet_horacle
 WHEN PRO.producto_horacle IS NOT NULL THEN PRO.producto_horacle
 ELSE NULL END AS codproducto,
 CASE WHEN PFD.prodfarmadet_horacle IS NOT NULL OR PRO.producto_horacle IS NOT NULL THEN 'ACA' ELSE NULL END AS codalmacen,
 CASE WHEN TD.tarifariodet_dsc IS NOT NULL THEN TD.tarifariodet_dsc
 WHEN MED.producto_cod IS NOT NULL THEN MED.producto_dsc
 WHEN PRO.producto_cod IS NOT NULL THEN PRO.producto_dsc
 WHEN TD.tarifariodet_dsc IS NOT NULL THEN TD.tarifariodet_dsc
 WHEN ESP.espprofatencion_dsc IS NOT NULL THEN ESP.espprofatencion_dsc
 ELSE 'SERVICIO' END AS dsclinea,
 
 CASE WHEN CE.empresa_direccion IS NOT NULL AND length(TRIM(CE.empresa_direccion)) > 0 THEN TRIM(CE.empresa_direccion)
 WHEN CP.persona_dir IS NOT NULL AND length(TRIM(CP.persona_dir)) > 0 THEN TRIM(CP.persona_dir)
 ELSE '-' END AS dircliente,
 
 CASE WHEN CE.empresa_cod IS NOT NULL THEN CIE.ciudad_dsc
 WHEN CP.persona_cod IS NOT NULL THEN CIP.ciudad_dsc
 ELSE '' END AS ciucliente,
 CASE WHEN CE.empresa_cod IS NOT NULL THEN PRE.provincia_dsc
 WHEN CP.persona_cod IS NOT NULL THEN PRP.provincia_dsc
 ELSE '' END AS procliente,
 CASE WHEN CE.empresa_cod IS NOT NULL THEN DIE.distrito_dsc
 WHEN CP.persona_cod IS NOT NULL THEN DIP.distrito_dsc
 ELSE '' END AS discliente,
 'PE' AS paicliente,
 DVM.docvntsunatmant_horacle AS tptran,
 'HEMA' AS origen,
 '01' s1provincia,
 'PE' s2capitulo,
 '005' s3cia,
 
 CASE WHEN TD.tarifariodet_coracle17 IS NOT NULL THEN TD.tarifariodet_coracle17
 WHEN MED.producto_cod IS NOT NULL THEN '70111101'
 WHEN PRO.producto_cod IS NOT NULL THEN '70111102'
 WHEN (TD.tarifariodet_cod IS NOT NULL AND TD.tarifariodet_cod = 2) OR (ESP.espprofatencion_cod IS NOT NULL) THEN '70411102'--CONSULTA MEDICA
 WHEN TD.tarifariodet_cod IS NOT NULL AND TD.tarifariodet_cod = 6 THEN '12210101'--PAGO ANTICIPADO
 ELSE '00000000' END AS s4cuenta,
 
 CASE WHEN TD.tarifariodet_coracle17 IS NOT NULL THEN SUBSTRING(TD.tarifariodet_coracle17, 0, length(TD.tarifariodet_coracle17) - 1)
 WHEN MED.producto_cod IS NOT NULL THEN '701111'
 WHEN PRO.producto_cod IS NOT NULL THEN '701111'
 WHEN (TD.tarifariodet_cod IS NOT NULL AND TD.tarifariodet_cod = 2) OR (ESP.espprofatencion_cod IS NOT NULL) THEN '704111'--CONSULTA MEDICA
 WHEN TD.tarifariodet_cod IS NOT NULL AND TD.tarifariodet_cod = 6 THEN '122101'--PAGO ANTICIPADO
 ELSE '000000' END s5corporativa,
 
 '0000' s6ccosto,--HOMOLOGAR CENTRO DE COSTOS
 COALESCE(
 case when dv.docvntsunat_tp_fact <> 0 then '0006' 
      when oat.ordatencion_mtso = 1 then '0007' 
      else  TPA.tpatencion_horacle end, '0002') s7linea,
 
 CASE WHEN TD.tarifariodet_coracle17 IS NOT NULL THEN COALESCE(TD.tarifariodet_s8oracle, '000')
 WHEN MED.producto_cod IS NOT NULL THEN '004'
 WHEN PRO.producto_cod IS NOT NULL THEN '004'
 WHEN (TD.tarifariodet_cod IS NOT NULL AND TD.tarifariodet_cod = 2) OR (ESP.espprofatencion_cod IS NOT NULL) THEN '005'--CONSULTA MEDICA
 WHEN TD.tarifariodet_cod IS NOT NULL AND TD.tarifariodet_cod = 6 THEN '000'--PAGO ANTICIPADO
 ELSE '000' END AS s8lineaser,
 
 COALESCE(ESP.espprofatencion_horacle, '0000') s9unidad, --ESPECIALIDAD
 '000' s10inter,
 COALESCE(case when DV.docvntsunat_tp_fact <> 0 THEN '0000' ELSE NPT.negociacionprecio_horacle END, '0262') s11convenio, --NEGOCIACION
 CASE WHEN SD.identificador IS NOT NULL THEN LPAD(SD.identificador, 8, '0')
 WHEN (TD.tarifariodet_cod IS NOT NULL AND TD.tarifariodet_cod = 2) OR (ESP.espprofatencion_cod IS NOT NULL) THEN '00500101'
 WHEN TD.tarifariodet_cod IS NOT NULL AND TD.tarifariodet_cod = 9 AND S.segus_codsegus IS NOT NULL THEN LPAD(S.segus_codsegus, 8, '0')
 ELSE '00000000' END AS s12tarifario,
 '00000' s13fut1,
 '00000' s14fut2,
 203 AS idorg,
 'U' AS procesado,
 DV.docvntsunat_cod AS idtranori,
 OAT.ordatencion_cod AS ordatencion,
 PAC.paciente_hstclinica_cod AS nrohistoria,
 OAT.ordatencion_fcreacion AS fechaatencion,
 SUBSTRING(NPT.negociacionprecio_dsc, 1, 30) AS planatencion,
 SUBSTRING(ASEGT.empresa_nmbcomercial, 1, 80) AS empcontratante,
 OAAST.ordatencionaseg_poliza_cod AS nropoliza,
 CASE WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL THEN DVSD.docvntsunatsubdet_cod
 ELSE DVD.docvntsunatdet_item END AS numlinea,
 DV.docvntsunat_usrcreacion AS usrregistro,
 
 CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_cod
 WHEN CP.persona_cod IS NOT NULL THEN CP.persona_cod 
 ELSE NULL END AS codcliente, --ID_CLI_ORIG
 TPNC.catgenerico_identificador tpncr,
 NULL tpnd,
 
 CASE WHEN DVNC.docvntsunat_tptoracle IS NOT NULL AND DVNC.docvntsunat_tptoracle = 'AQP_DOC_REG' THEN 
 'DX/' || DVNC.docvntsunat_serie || '-' || SUBSTRING(DVNC.docvntsunat_nro, 3, 10)
 ELSE 
 	CASE WHEN DATE(DVNC.docvntsunat_femision) <= '31-01-2017' THEN DVNC.docvntsunat_serie || '-' || DVNC.docvntsunat_nro
	ELSE DVNC.docvntsunat_serie || '-' || SUBSTRING(DVNC.docvntsunat_nro, 3, 10) END
 END AS numtransaccionref,
 
 --DESCOMENTAR PARA ENVIAR SOLO REFERENCIA DOCUMENTO
 --DVNC.docvntsunat_serie || '-' || SUBSTRING(DVNC.docvntsunat_nro, 3, 10) AS numtransaccionref,
 
 LPAD(CAST(DVNC.docvntsunat_tpdoc AS VARCHAR), 2, '0') AS tpdocsunatref,
 DVNC.docvntsunat_femision AS fechatranref,
  
 CASE WHEN DVNC.docvntsunat_tptoracle IS NOT NULL THEN 1
 WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL THEN DVSD.docvntsunatsubdet_item_referencia
 WHEN DVD.docvntsunatdet_cod IS NOT NULL THEN DVD.docvntsunatdet_item_referencia 
 ELSE 0 END AS numlinearef,
  
 CASE WHEN DVNC.docvntsunat_tptoracle IS NOT NULL THEN DVNC.docvntsunat_tptoracle 
 WHEN DVMNC.docvntsunatmant_horacle IS NOT NULL AND DATE(DVNC.docvntsunat_femision) >= '01-02-2017' THEN DVMNC.docvntsunatmant_horacle
 ELSE NULL END AS tptranref,
 
 CASE WHEN CE.empresa_cod IS NOT NULL THEN 2
 ELSE 1 END AS tpcliente, --TIPO_CLI_ORIG
DV.docvntsunat_femision AS fechagl, 
DV.docvntsunat_tipocambio AS tipocambio,
DV.docvntsunat_cod AS codigo, 
PD.predocvnt_tipo,
TD.tarifariodet_dsc, 
SD.identificador,
ESP.espprofatencion_horacle
FROM
  sch_clinica.tbl_docvntsunat DV
  INNER JOIN sch_clinica.tbl_docvntsunatdet DVD ON (DV.docvntsunat_cod = DVD.docvntsunatdet_cod)
  AND DV.docvntsunat_anulado = 0
  LEFT JOIN sch_clinica.tbl_tpmoneda TM ON (DV.docvntsunat_tpmoneda = TM.tpmoneda_cod)
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
                                           
  /*LEFT JOIN sch_clinica.tbl_persona CP ON (CASE WHEN DV.docvntsunat_cliente_cod IS NULL OR DV.docvntsunat_cliente_cod = 0 THEN 182971 
   										   WHEN CEP.empresa_cod IS NOT NULL THEN CEP.empresa_referencia_persona
                                           WHEN DV.docvntsunat_tpcliente != 3 THEN DV.docvntsunat_cliente_cod END = CP.persona_cod)*/
    
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
  LEFT JOIN sch_clinica.tbl_pais PAE ON (CE.empresa_pais = PAE.pais_cod)
  WHERE
  DATE(DV.docvntsunat_femision) >= '${fecha_ini}' AND DATE(DV.docvntsunat_femision) <= '${fecha_fin}'
  AND (DV.docvntsunat_tpdoc = 12 OR DV.docvntsunat_tpdoc = 1 OR DV.docvntsunat_tpdoc = 3 OR DV.docvntsunat_tpdoc = 7 OR DV.docvntsunat_tpdoc = 8)

UNION ALL --PAGO ANTICIPADO

SELECT DISTINCT
     CASE WHEN PER.persona_cod IS NOT NULL THEN
     TRIM(PER.persona_apep) || ' ' || TRIM(PER.persona_apem) || ', ' || TRIM(PER.persona_nmb1) || ' ' || TRIM(PER.persona_nmb2)
     WHEN PER.persona_cod IS NULL AND CP.persona_cod IS NOT NULL THEN
     TRIM(CP.persona_apep) || ' ' || TRIM(CP.persona_apem) || ', ' || TRIM(CP.persona_nmb1) || ' ' || TRIM(CP.persona_nmb2)
     ELSE '' END AS nompaciente,
     DV.docvntsunat_serie || '-' || SUBSTRING(DV.docvntsunat_nro, 3, 10) AS numtransaccion,
     DV.docvntsunat_femision AS fechatran,
     'CO' AS tpPago,
     'CONTADO' AS termpago,
     NULL AS dsctrans,
     NULL AS notalinea,
     CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_tpidentidad
     WHEN CEP.empresa_cod IS NOT NULL THEN 6
     WHEN CP.persona_cod IS NOT NULL THEN CP.persona_tpidentidad
     ELSE '0' END AS tpdoccliente,
     CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_ruc
     WHEN CEP.empresa_cod IS NOT NULL THEN CEP.empresa_ruc
     WHEN CP.persona_cod IS NOT NULL THEN CP.persona_nrodoc
     ELSE '' END AS nrodoccliente,
     CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_rznsocial
     WHEN CP.persona_cod IS NOT NULL THEN TRIM(CP.persona_apep) || ' ' || TRIM(CP.persona_apem) || ', ' || TRIM(CP.persona_nmb1) || ' ' || TRIM(CP.persona_nmb2)
     ELSE '' END AS nomcliente,
     NULL AS docnumant,
     NULL AS planes,
     COALESCE(PD.predocvnt_cod, '000000000000') AS prefactura,
     LPAD(CAST(DV.docvntsunat_tpdoc AS VARCHAR), 2, '0') AS tpdocsunat,
     --'PEN' AS tpmoneda,
     COALESCE(TM.tpmoneda_iso, 'PEN') AS tpmoneda,
     'PE-IGV 18' AS codimpuesto,
     DV.docvntsunat_igv * 100 AS tasaimp,
     
     ---1 * (ROUND(CAST(PAGO_ANT.monto / (1 + DV.docvntsunat_igv) AS NUMERIC), 2) * DV.docvntsunat_igv) AS mntimpuesto,
     
     -1 * (PAGO_ANT.monto - ROUND(CAST(PAGO_ANT.monto / (1 + DV.docvntsunat_igv) AS NUMERIC), 2)) AS mntimpuesto,
     -1 * ROUND(CAST(PAGO_ANT.monto / (1 + DV.docvntsunat_igv) AS NUMERIC), 2) AS mntneto,
     -1 * ROUND(CAST(PAGO_ANT.monto / (1 + DV.docvntsunat_igv) AS NUMERIC), 2) AS preunineto,
     -1 * ROUND(CAST(PAGO_ANT.monto / (1 + DV.docvntsunat_igv) AS NUMERIC), 2) AS prelstunit,
     1 AS cantidad,
     NULL AS codproducto,
     NULL AS codalmacen,
     'ANTICIPO (' || PAGO_ANT.docvntref  || ')' AS dsclinea,
     
     CASE WHEN CE.empresa_direccion IS NOT NULL AND length(TRIM(CE.empresa_direccion)) > 0 THEN TRIM(CE.empresa_direccion)
 	 WHEN CP.persona_dir IS NOT NULL AND length(TRIM(CP.persona_dir)) > 0 THEN TRIM(CP.persona_dir)
	 ELSE '-' END AS dircliente,
 
     CASE WHEN CE.empresa_cod IS NOT NULL THEN CIE.ciudad_dsc
     WHEN CP.persona_cod IS NOT NULL THEN CIP.ciudad_dsc
     ELSE '' END AS ciucliente,
     CASE WHEN CE.empresa_cod IS NOT NULL THEN PRE.provincia_dsc
     WHEN CP.persona_cod IS NOT NULL THEN PRP.provincia_dsc
     ELSE '' END AS procliente,
     CASE WHEN CE.empresa_cod IS NOT NULL THEN DIE.distrito_dsc
     WHEN CP.persona_cod IS NOT NULL THEN DIP.distrito_dsc
     ELSE '' END AS discliente,
     'PE' AS paicliente,
     DVM.docvntsunatmant_horacle AS tptran,
     'HEMA' AS origen,
     '01' s1provincia,
     'PE' s2capitulo,
     '005' s3cia,
     '12210101' AS s4cuenta,
     '122101' AS s5corporativa,
     '0000' s6ccosto,--HOMOLOGAR CENTRO DE COSTOS
     COALESCE(
     case when dv.docvntsunat_tp_fact <> 0 then '0006' 
          when oat.ordatencion_mtso = 1 then '0007' 
          else  TPA.tpatencion_horacle end, '0002') s7linea,
     '000' s8lineaser,
     COALESCE(ESP.espprofatencion_horacle, '0000') s9unidad, --ESPECIALIDAD
     '000' s10inter,
     COALESCE(case when DV.docvntsunat_tp_fact <> 0 THEN '0000' ELSE NPT.negociacionprecio_horacle END, '0262') s11convenio, --NEGOCIACION
     '00000000' AS s12tarifario,
     '00000' s13fut1,
     '00000' s14fut2,
     203 AS idorg,
     'U' AS procesado,
     DV.docvntsunat_cod AS idtranori,
     OAT.ordatencion_cod AS ordatencion,
     PAC.paciente_hstclinica_cod AS nrohistoria,
     OAT.ordatencion_fcreacion AS fechaatencion,
     SUBSTRING(NPT.negociacionprecio_dsc, 1, 30) AS planatencion,
     SUBSTRING(ASEGT.empresa_nmbcomercial, 1, 80) AS empcontratante,
     OAAST.ordatencionaseg_poliza_cod AS nropoliza,
     RANK() OVER (PARTITION BY DV.docvntsunat_cod ORDER BY PAGO_ANT.docvntref ASC) + 100 AS numlinea,
     DV.docvntsunat_usrcreacion AS usrregistro,
     CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_cod
     WHEN CP.persona_cod IS NOT NULL THEN CP.persona_cod 
     ELSE NULL END AS codcliente, --ID_CLI_ORIG
     
     TPNC.catgenerico_identificador tpncr,
     NULL tpnd,
     /*
     CASE WHEN DVNC.docvntsunat_tptoracle IS NOT NULL AND DVNC.docvntsunat_tptoracle = 'AQP_DOC_REG' THEN 
     'DX/' || DVNC.docvntsunat_serie || '-' || SUBSTRING(DVNC.docvntsunat_nro, 3, 10)
     ELSE DVNC.docvntsunat_serie || '-' || SUBSTRING(DVNC.docvntsunat_nro, 3, 10) END AS numtransaccionref,
     */
     CASE WHEN DVNC.docvntsunat_tptoracle IS NOT NULL AND DVNC.docvntsunat_tptoracle = 'AQP_DOC_REG' THEN 
     'DX/' || DVNC.docvntsunat_serie || '-' || SUBSTRING(DVNC.docvntsunat_nro, 3, 10)
     ELSE 
        CASE WHEN DATE(DVNC.docvntsunat_femision) <= '31-01-2017' THEN DVNC.docvntsunat_serie || '-' || DVNC.docvntsunat_nro
        ELSE DVNC.docvntsunat_serie || '-' || SUBSTRING(DVNC.docvntsunat_nro, 3, 10) END
     END AS numtransaccionref,
     
     LPAD(CAST(DVNC.docvntsunat_tpdoc AS VARCHAR), 2, '0') AS tpdocsunatref,
     DVNC.docvntsunat_femision AS fechatranref,
      
     CASE WHEN DVNC.docvntsunat_tptoracle IS NOT NULL THEN 1
     --WHEN DVSD.docvntsunatsubdet_cod IS NOT NULL THEN DVSD.docvntsunatsubdet_item_referencia
     --WHEN DVD.docvntsunatdet_cod IS NOT NULL THEN DVD.docvntsunatdet_item_referencia 
     ELSE NULL END AS numlinearef,
      
     CASE WHEN DVNC.docvntsunat_tptoracle IS NOT NULL THEN DVNC.docvntsunat_tptoracle 
     WHEN DVMNC.docvntsunatmant_horacle IS NOT NULL AND DATE(DVNC.docvntsunat_femision) >= '01-02-2017' THEN DVMNC.docvntsunatmant_horacle
     ELSE NULL END AS tptranref,

     CASE WHEN CE.empresa_cod IS NOT NULL THEN 2
     ELSE 1 END AS tpcliente, --TIPO_CLI_ORIG
     DV.docvntsunat_femision AS fechagl, 
     DV.docvntsunat_tipocambio AS tipocambio,
    DV.docvntsunat_cod AS codigo, 
    -1,
    '', 
    '',
    ESP.espprofatencion_horacle
FROM
  sch_clinica.tbl_docvntsunat DV
  --PAGO ANT INI--
  INNER JOIN
  (
    SELECT 
      sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_docvntcod AS docventa,
      sch_clinica.tbl_hospitalizacion_pagocuenta.hospitalizacion_pagocuenta_cod_oi as oi_cod,
      sch_clinica.tbl_docvntsunat.docvntsunat_cod AS docvntref,
      sch_clinica.tbl_docvntsunat.docvntsunat_totneto AS monto
    FROM
      sch_clinica.tbl_hospitalizacion_pagocuenta
      INNER JOIN sch_clinica.tbl_docvntsunat ON (sch_clinica.tbl_hospitalizacion_pagocuenta.hospitalizacion_pagocuenta_pdvcod = sch_clinica.tbl_docvntsunat.docvntsunat_predocvnt_cod)
      INNER JOIN sch_clinica.tbl_hospitalizacion_pagoctadet ON (sch_clinica.tbl_hospitalizacion_pagocuenta.hospitalizacion_pagocuenta_cod = sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_pagocuentacod)
      AND (sch_clinica.tbl_hospitalizacion_pagocuenta.hospitalizacion_pagocuenta_item = sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_pagocuentaitem)
    WHERE
      /*sch_clinica.tbl_hospitalizacion_pagocuenta.hospitalizacion_pagocuenta_cod_oi = cod_oi AND
      sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_docvntcod = cod_venta AND*/
      sch_clinica.tbl_docvntsunat.docvntsunat_anulado = 0
    UNION ALL
    SELECT DISTINCT
     sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_docvntcod AS docventa,
     sch_clinica.tbl_entfondo_movimiento_serv.entfondo_movimiento_serv_cod_oi as oi_cod,
     sch_clinica.tbl_docvntsunat.docvntsunat_cod AS docvntref,
     sch_clinica.tbl_entfondo_movimientodet.entfondo_movimientodet_monto AS monto
    FROM
     sch_clinica.tbl_entfondo_movimiento_serv
     INNER JOIN sch_clinica.tbl_docvntsunat ON (sch_clinica.tbl_entfondo_movimiento_serv.entfondo_movimiento_serv_docvntsunat_ref = sch_clinica.tbl_docvntsunat.docvntsunat_cod)
     INNER JOIN sch_clinica.tbl_hospitalizacion_pagoctadet ON (sch_clinica.tbl_entfondo_movimiento_serv.entfondo_movimiento_serv_cod = sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_fmovcod)
     INNER JOIN sch_clinica.tbl_entfondo_movimientodet ON (sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_docvntcod = sch_clinica.tbl_entfondo_movimientodet.entfondo_movimientodet_docvntsunat_cod
     AND sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_fmovcod = sch_clinica.tbl_entfondo_movimientodet.entfondo_movimientodet_movserv_cod)
    WHERE
     /*sch_clinica.tbl_entfondo_movimiento_serv.entfondo_movimiento_serv_cod_oi = cod_oi AND
     sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_docvntcod = cod_venta AND*/
     sch_clinica.tbl_docvntsunat.docvntsunat_anulado = 0 AND
     sch_clinica.tbl_entfondo_movimientodet.entfondo_movimientodet_anulado = 0
    UNION ALL 
    SELECT
     EFMD.entfondo_movimientodet_docvntsunat_cod AS docventa, 
     0 as oi_cod,
     DVS.docvntsunat_cod AS docvntref,
     EFMD.entfondo_movimientodet_monto AS monto
    FROM
     sch_clinica.tbl_entfondo_movimientodet EFMD
     INNER JOIN sch_clinica.tbl_entfondo_movimiento_serv EFMS ON (EFMD.entfondo_movimientodet_movserv_cod = EFMS.entfondo_movimiento_serv_cod)
     INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (EFMS.entfondo_movimiento_serv_docvntsunat_ref = DVS.docvntsunat_cod)
    /*WHERE
     EFMD.entfondo_movimientodet_anulado = 0*/
    
    UNION ALL
      SELECT
        NC.docvntsunat_cod AS docventa,
        0 AS oi_cod,
        EFMS.entfondo_movimiento_serv_docvntsunat_ref AS docvntref,
        -1 * ROUND(CAST(EFMD.entfondo_movimientodet_monto AS NUMERIC), 2) AS monto
      FROM
        sch_clinica.tbl_entfondo_movimientodet EFMD
        INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (EFMD.entfondo_movimientodet_docvntsunat_cod = DVS.docvntsunat_cod)
        LEFT JOIN sch_clinica.tbl_entfondo_movimiento_serv EFMS ON (EFMD.entfondo_movimientodet_movserv_cod = EFMS.entfondo_movimiento_serv_cod)
        LEFT JOIN sch_clinica.tbl_docvntsunat DVS2 ON (EFMS.entfondo_movimiento_serv_docvntsunat_ref = DVS2.docvntsunat_cod)
        INNER JOIN sch_clinica.tbl_docvntsunat_referencia DVSR ON (DVS.docvntsunat_cod = DVSR.docvntsunat_referencia_docref_cod)
        AND (DVSR.docvntsunat_referencia_motivo != 5)
        INNER JOIN sch_clinica.tbl_docvntsunat NC ON (DVSR.docvntsunat_referencia_cod = NC.docvntsunat_cod
        AND NC.docvntsunat_anulado = 0)
      --WHERE NC.docvntsunat_cod IN ('007BC150000000091','007BC080000000009','007BC110000000700','007BC120000001320')--MAY-17
      --WHERE NC.docvntsunat_cod IN ('')--JUN-17
      --WHERE NC.docvntsunat_cod IN ('')--JUL-17
      --WHERE NC.docvntsunat_cod IN ('')--AGO-17
      --WHERE NC.docvntsunat_cod IN ('007BC100000000003')--SET-17
      --WHERE NC.docvntsunat_cod IN ('007BC150000000139','007BC110000001446','007FC110000000057','007FC110000000058')--OCT-17
      --WHERE NC.docvntsunat_cod IN ('007BC120000002917','007BC080000000026')--NOV-17
      --WHERE NC.docvntsunat_cod IN ('007BC080000000030','007BC080000000032','007BC080000000033','007BC120000003244','007FC170000000001')--DIC-17
      --WHERE NC.docvntsunat_cod IN ('007BC080000000043','007BC080000000039','007BC170000000321','007BC020000000248','007BC020000000249','007BC120000003600','007FC050000000096')--ENE-18
      --WHERE NC.docvntsunat_cod IN ('007BC080000000049','007BC080000000054','007BC120000003821','007BC020000000250')--FEB-18
      --WHERE NC.docvntsunat_cod IN ('007BC080000000060','007BC170000000498','007BC080000000062','007BC080000000058','007BC110000001876')--MAR-18
      --WHERE NC.docvntsunat_cod IN ('007FC080000000028','007BC170000000836','007BC170000000818','007BC170000000821','007BC080000000063','007BC080000000064')--ABR-18
      --WHERE NC.docvntsunat_cod IN ('007BC080000000074','007BC080000000072','007BC080000000071','007BC170000000941')--MAY-18
      --WHERE NC.docvntsunat_cod IN ('007FC120000000082','007BC120000004790','007BC080000000077','007BC170000001115','007BC170000001116')--JUN-18
      --WHERE NC.docvntsunat_cod IN ('007BC080000000082')--JUL-18
      --WHERE NC.docvntsunat_cod IN ('007BC080000000083','007FC170000000032','007BC100000000019','007BC080000000084','007BC080000000085','007BC020000000252','007BC170000001473')--AGO-18
      --WHERE NC.docvntsunat_cod IN ('007BC020000000253','007BC020000000254','007BC080000000087','007BC080000000088','007BC110000002282','007FC050000000396','007FC120000000096')--SEP-18
      --WHERE NC.docvntsunat_cod IN ('007BC120000006032')--OCT-18
      --WHERE NC.docvntsunat_cod IN ('007BC080000000091','007BC120000006273','007BC170000001914','007BC200000000895','007BC120000006341','007BC120000006302')--NOV-18
      WHERE NC.docvntsunat_cod IN ('007BC080000000093')--DIC-18
    UNION ALL
     SELECT
        NC.docvntsunat_cod AS docventa,
        0 AS oi_cod,
        DVS2.docvntsunat_cod AS docvntref,
        -1 * ROUND(CAST(DVS2.docvntsunat_totneto AS NUMERIC), 2) AS monto
     FROM
        sch_clinica.tbl_hospitalizacion_pagoctadet HPCD
        INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (HPCD.hospitalizacion_pagoctadet_docvntcod = DVS.docvntsunat_cod
        AND HPCD.hospitalizacion_pagoctadet_pagocuentacod > 0)
        LEFT JOIN sch_clinica.tbl_hospitalizacion_pagocuenta HPC ON (HPCD.hospitalizacion_pagoctadet_pagocuentacod = HPC.hospitalizacion_pagocuenta_cod
        AND HPCD.hospitalizacion_pagoctadet_pagocuentaitem = HPC.hospitalizacion_pagocuenta_item)
        LEFT JOIN sch_clinica.tbl_docvntsunat DVS2 ON (HPC.hospitalizacion_pagocuenta_pdvcod = DVS2.docvntsunat_predocvnt_cod)
        INNER JOIN sch_clinica.tbl_docvntsunat_referencia DVSR ON (DVS.docvntsunat_cod = DVSR.docvntsunat_referencia_docref_cod)
        AND (DVSR.docvntsunat_referencia_motivo != 5)
        INNER JOIN sch_clinica.tbl_docvntsunat NC ON (DVSR.docvntsunat_referencia_cod = NC.docvntsunat_cod
        AND NC.docvntsunat_anulado = 0)
     --WHERE NC.docvntsunat_cod IN ('007BC150000000091','007BC080000000009','007BC110000000700','007BC120000001320')--MAY-17
     --WHERE NC.docvntsunat_cod IN ('')--JUN-17
     --WHERE NC.docvntsunat_cod IN ('')--JUL-17
     --WHERE NC.docvntsunat_cod IN ('')--AGO-17
     --WHERE NC.docvntsunat_cod IN ('007BC100000000003')--SET-17
     --WHERE NC.docvntsunat_cod IN ('007BC150000000139','007BC110000001446','007FC110000000057','007FC110000000058')--OCT-17
     --WHERE NC.docvntsunat_cod IN ('007BC120000002917','007BC080000000026')--NOV-17
     --WHERE NC.docvntsunat_cod IN ('007BC080000000030','007BC080000000032','007BC080000000033','007BC120000003244','007FC170000000001')--DIC-17
     --WHERE NC.docvntsunat_cod IN ('007BC080000000043','007BC080000000039','007BC170000000321','007BC020000000248','007BC020000000249','007BC120000003600','007FC050000000096')--ENE-18
     --WHERE NC.docvntsunat_cod IN ('007BC080000000049','007BC080000000054','007BC120000003821','007BC020000000250')--FEB-18
	 --WHERE NC.docvntsunat_cod IN ('007BC080000000060','007BC170000000498','007BC080000000062','007BC080000000058','007BC110000001876')--MAR-18
     --WHERE NC.docvntsunat_cod IN ('007FC080000000028','007BC170000000836','007BC170000000818','007BC170000000821','007BC080000000063','007BC080000000064')--ABR-18
     --WHERE NC.docvntsunat_cod IN ('007BC080000000074','007BC080000000072','007BC080000000071','007BC170000000941')--MAY-18
     --WHERE NC.docvntsunat_cod IN ('007FC120000000082','007BC120000004790','007BC080000000077','007BC170000001115','007BC170000001116')--JUN-18
     --WHERE NC.docvntsunat_cod IN ('007BC080000000082')--JUL-18      
     --WHERE NC.docvntsunat_cod IN ('007BC080000000083','007FC170000000032','007BC100000000019','007BC080000000084','007BC080000000085','007BC020000000252','007BC170000001473')--AGO-18
     --WHERE NC.docvntsunat_cod IN ('007BC020000000253','007BC020000000254','007BC080000000087','007BC080000000088','007BC110000002282','007FC050000000396','007FC120000000096')--SEP-18
     --WHERE NC.docvntsunat_cod IN ('007BC120000006032')--OCT-18
     --WHERE NC.docvntsunat_cod IN ('007BC080000000091','007BC120000006273','007BC170000001914','007BC200000000895','007BC120000006341','007BC120000006302')--NOV-18
     WHERE NC.docvntsunat_cod IN ('007BC080000000093')--DIC-18
     
  --) AS PAGO_ANT ON (DV.docvntsunat_cod = PAGO_ANT.docventa AND case when PAGO_ANT.oi_cod = 0 THEN TRUE ELSE DV.docvntsunat_oi_codigo = PAGO_ANT.oi_cod END
  ) AS PAGO_ANT ON (DV.docvntsunat_cod = PAGO_ANT.docventa AND CASE WHEN PAGO_ANT.oi_cod IS NULL OR PAGO_ANT.oi_cod = 0 THEN TRUE ELSE DV.docvntsunat_oi_codigo = PAGO_ANT.oi_cod END
 					AND DV.docvntsunat_anulado = 0) 
  --PAGO ANT FIN--
  LEFT JOIN sch_clinica.tbl_tpmoneda TM ON (DV.docvntsunat_tpmoneda = TM.tpmoneda_cod)
  LEFT JOIN sch_clinica.tbl_predocvnt PD ON (DV.docvntsunat_predocvnt_cod = PD.predocvnt_cod)
  LEFT JOIN (
    SELECT DISTINCT
    docvntsunatmant_tpdoc,
    docvntsunatmant_serie,
    docvntsunatmant_horacle
    FROM sch_clinica.tbl_docvntsunatmant
    WHERE docvntsunatmant_horacle IS NOT NULL
  ) DVM ON (DV.docvntsunat_tpdoc = DVM.docvntsunatmant_tpdoc AND DV.docvntsunat_serie = DVM.docvntsunatmant_serie)
  --LEFT JOIN sch_clinica.tbl_pago PA ON (DV.docvntsunat_cod = PA.pago_docvntsunat_cod)
  --LEFT JOIN sch_clinica.tbl_tpformapago FP ON (PA.pago_tpformapago_cod = FP.tpformapago_cod)
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
  /*LEFT JOIN sch_clinica.tbl_persona CP ON (CASE WHEN DV.docvntsunat_cliente_cod IS NULL OR DV.docvntsunat_cliente_cod = 0 THEN 182971 
   										   WHEN CEP.empresa_cod IS NOT NULL THEN CEP.empresa_referencia_persona
                                           WHEN DV.docvntsunat_tpcliente != 3 THEN DV.docvntsunat_cliente_cod END = CP.persona_cod)*/
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
    --WHERE OA.ordatencion_cod = codoa
    LIMIT 1  
  ) CONSULTA ON (DV.docvntsunat_oa_codigo = CONSULTA.codoa)
  LEFT JOIN sch_clinica.tbl_espprofatencion ESP ON (CONSULTA.codespcialidad = ESP.espprofatencion_cod)
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
  LEFT JOIN sch_clinica.tbl_pais PAE ON (CE.empresa_pais = PAE.pais_cod)
WHERE
	DATE(DV.docvntsunat_femision) >= '${fecha_ini}' AND DATE(DV.docvntsunat_femision) <= '${fecha_fin}'
	AND (DV.docvntsunat_tpdoc = 12 OR DV.docvntsunat_tpdoc = 1 OR DV.docvntsunat_tpdoc = 3 OR DV.docvntsunat_tpdoc = 7 OR DV.docvntsunat_tpdoc = 8)

UNION ALL --ANULADOS

 SELECT DISTINCT
 CASE WHEN PER.persona_cod IS NOT NULL THEN
 TRIM(PER.persona_apep) || ' ' || TRIM(PER.persona_apem) || ', ' || TRIM(PER.persona_nmb1) || ' ' || TRIM(PER.persona_nmb2)
 WHEN PER.persona_cod IS NULL AND CP.persona_cod IS NOT NULL THEN
 TRIM(CP.persona_apep) || ' ' || TRIM(CP.persona_apem) || ', ' || TRIM(CP.persona_nmb1) || ' ' || TRIM(CP.persona_nmb2)
 ELSE '' END AS nompaciente,
 DV.docvntsunat_serie || '-' || SUBSTRING(DV.docvntsunat_nro, 3, 10) AS numtransaccion,
 DV.docvntsunat_femision AS fechatran,
 'CO' AS tpPago,
 'CONTADO' AS termpago,
 NULL AS dsctrans,
 NULL AS notalinea,
 CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_tpidentidad
 WHEN CEP.empresa_cod IS NOT NULL THEN 6
 WHEN CP.persona_cod IS NOT NULL THEN CP.persona_tpidentidad
 ELSE '0' END AS tpdoccliente,
 CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_ruc
 WHEN CEP.empresa_cod IS NOT NULL THEN CEP.empresa_ruc
 WHEN CP.persona_cod IS NOT NULL THEN CP.persona_nrodoc
 ELSE '' END AS nrodoccliente,
 CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_rznsocial
 WHEN CP.persona_cod IS NOT NULL THEN TRIM(CP.persona_apep) || ' ' || TRIM(CP.persona_apem) || ', ' || TRIM(CP.persona_nmb1) || ' ' || TRIM(CP.persona_nmb2)
 ELSE '' END AS nomcliente,
 NULL AS docnumant,
 NULL AS planes,
 COALESCE(PD.predocvnt_cod, '000000000000') AS prefactura,
 LPAD(CAST(DV.docvntsunat_tpdoc AS VARCHAR), 2, '0') AS tpdocsunat,
 --'PEN' AS tpmoneda,
 COALESCE(TM.tpmoneda_iso, 'PEN') AS tpmoneda,
 'PE-IGV 18' AS codimpuesto,
 DV.docvntsunat_igv * 100 AS tasaimp,
 0.00 AS mntimpuesto,
 0.00 AS mntneto,--VALIDAR 
 0.00 AS preunineto,
 0.00 AS prelstunit,
 1 AS cantidad,
 NULL AS codproducto,
 NULL AS codalmacen,
 'ANULADO' AS dsclinea,

 CASE WHEN CE.empresa_direccion IS NOT NULL AND length(TRIM(CE.empresa_direccion)) > 0 THEN TRIM(CE.empresa_direccion)
 WHEN CP.persona_dir IS NOT NULL AND length(TRIM(CP.persona_dir)) > 0 THEN TRIM(CP.persona_dir)
 ELSE '-' END AS dircliente,
 
 CASE WHEN CE.empresa_cod IS NOT NULL THEN CIE.ciudad_dsc
 WHEN CP.persona_cod IS NOT NULL THEN CIP.ciudad_dsc
 ELSE '' END AS ciucliente,
 CASE WHEN CE.empresa_cod IS NOT NULL THEN PRE.provincia_dsc
 WHEN CP.persona_cod IS NOT NULL THEN PRP.provincia_dsc
 ELSE '' END AS procliente,
 CASE WHEN CE.empresa_cod IS NOT NULL THEN DIE.distrito_dsc
 WHEN CP.persona_cod IS NOT NULL THEN DIP.distrito_dsc
 ELSE '' END AS discliente,
 'PE' AS paicliente,
 DVM.docvntsunatmant_horacle AS tptran,
 'HEMA' AS origen,
 '01' s1provincia,
 'PE' s2capitulo,
 '005' s3cia,
 '12120101' AS s4cuenta,
 '121201' AS s5corporativa,
 '0000' s6ccosto,--HOMOLOGAR CENTRO DE COSTOS
 '0000' s7linea,
 '000' s8lineaser,
 '0000' s9unidad, --ESPECIALIDAD
 '000' s10inter,
 '0000' s11convenio, --NEGOCIACION
 '00000000' AS s12tarifario,
 '00000' s13fut1,
 '00000' s14fut2,
 203 AS idorg,
 'U' AS procesado,
 DV.docvntsunat_cod AS idtranori,
 OAT.ordatencion_cod AS ordatencion,
 PAC.paciente_hstclinica_cod AS nrohistoria,
 OAT.ordatencion_fcreacion AS fechaatencion,
 NULL AS planatencion,
 SUBSTRING(ASEGT.empresa_nmbcomercial, 1, 80) AS empcontratante,
 OAAST.ordatencionaseg_poliza_cod AS nropoliza,
 1 AS numlinea,
 DV.docvntsunat_usrcreacion AS usrregistro,
 CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_cod
 WHEN CP.persona_cod IS NOT NULL THEN CP.persona_cod 
 ELSE null END AS codcliente, --ID_CLI_ORIG
 NULL tpncr,
 NULL tpnd,
 NULL AS numtransaccionref,
 NULL AS tpdocsunatref,
 DV.docvntsunat_femision AS fechatranref,
 0 AS numlinearef,
 NULL AS tptranref,
 CASE WHEN CE.empresa_cod IS NOT NULL THEN 2
 ELSE 1 END AS tpcliente, --TIPO_CLI_ORIG
 DV.docvntsunat_femision AS fechagl, 
 DV.docvntsunat_tipocambio AS tipocambio,
DV.docvntsunat_cod AS codigo, 
-1,
'', 
'',
''
FROM
  sch_clinica.tbl_docvntsunat DV
  LEFT JOIN sch_clinica.tbl_tpmoneda TM ON (DV.docvntsunat_tpmoneda = TM.tpmoneda_cod)
  LEFT JOIN sch_clinica.tbl_predocvnt PD ON (DV.docvntsunat_predocvnt_cod = PD.predocvnt_cod)
  LEFT JOIN (
    SELECT DISTINCT
    docvntsunatmant_tpdoc,
    docvntsunatmant_serie,
    docvntsunatmant_horacle
    FROM sch_clinica.tbl_docvntsunatmant
    WHERE docvntsunatmant_horacle IS NOT NULL
  ) DVM ON (DV.docvntsunat_tpdoc = DVM.docvntsunatmant_tpdoc AND DV.docvntsunat_serie = DVM.docvntsunatmant_serie)
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
  /*LEFT JOIN sch_clinica.tbl_persona CP ON (CASE WHEN DV.docvntsunat_cliente_cod IS NULL OR DV.docvntsunat_cliente_cod = 0 THEN 182971 
   										   WHEN CEP.empresa_cod IS NOT NULL THEN CEP.empresa_referencia_persona
                                           WHEN DV.docvntsunat_tpcliente != 3 THEN DV.docvntsunat_cliente_cod END = CP.persona_cod)*/
  LEFT JOIN sch_clinica.tbl_ordatencion OAT ON (DV.docvntsunat_oa_codigo = OAT.ordatencion_cod)
  LEFT JOIN sch_clinica.tbl_ordeninternamiento OIT ON (DV.docvntsunat_oi_codigo = OIT.ordinternamiento_cod)
  --LEFT JOIN sch_clinica.tbl_tpatencion TPA ON (OAT.ordatencion_tpatencion_cod = TPA.tpatencion_cod)
  LEFT JOIN sch_clinica.tbl_paciente PAC ON (OAT.ordatencion_paciente_cod = PAC.paciente_cod)
  LEFT JOIN sch_clinica.tbl_persona PER ON (PAC.paciente_cod = PER.persona_cod)
  LEFT JOIN sch_clinica.tbl_ordatencionaseg OAAST ON (OAT.ordatencion_cod = OAAST.ordatencionaseg_cod)
  
  LEFT JOIN sch_clinica.tbl_empresa ASEGT ON (CASE WHEN OIT.ordinternamiento_acod IS NOT NULL THEN OIT.ordinternamiento_acod
  ELSE OAT.ordatencion_negprc_emp_aseg_acod END = ASEGT.empresa_cod)
  /*LEFT JOIN sch_clinica.tbl_negociacionprecio NPT ON (CASE WHEN OIT.ordinternamiento_ncod IS NOT NULL THEN OIT.ordinternamiento_ncod 
  ELSE OAT.ordatencion_negprc_emp_aseg_ncod END = NPT.negociacionprecio_cod)*/
  
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
  LEFT JOIN sch_clinica.tbl_pais PAE ON (CE.empresa_pais = PAE.pais_cod)
  
  WHERE
  DV.docvntsunat_anulado = 1 AND
  DATE(DV.docvntsunat_femision) >= '${fecha_ini}' AND DATE(DV.docvntsunat_femision) <= '${fecha_fin}'
  AND (DV.docvntsunat_tpdoc = 12 OR DV.docvntsunat_tpdoc = 1 OR DV.docvntsunat_tpdoc = 3 OR DV.docvntsunat_tpdoc = 7 OR DV.docvntsunat_tpdoc = 8)

  UNION ALL  --DOCUMENTO TRAMITE
  
SELECT DISTINCT 
  
  CASE WHEN PER.persona_cod IS NOT NULL THEN
  TRIM(PER.persona_apep) || ' ' || TRIM(PER.persona_apem) || ', ' || TRIM(PER.persona_nmb1) || ' ' || TRIM(PER.persona_nmb2)
  WHEN PER.persona_cod IS NULL AND CP.persona_cod IS NOT NULL THEN
  TRIM(CP.persona_apep) || ' ' || TRIM(CP.persona_apem) || ', ' || TRIM(CP.persona_nmb1) || ' ' || TRIM(CP.persona_nmb2)
  ELSE '' END AS nompaciente,
  'DX/' || DV.docvntsunat_serie || '-' || SUBSTRING(DV.docvntsunat_nro, 3, 10) AS numtransaccion,
  DVNC.docvntsunat_femision AS fechatran,
  'CO' AS tpPago,
  'CONTADO' AS termpago,
  NULL AS dsctrans,
  NULL AS notalinea,
  
  CASE WHEN CE.empresa_ruc IS NOT NULL THEN CE.empresa_tpidentidad
  WHEN CEP.empresa_ruc IS NOT NULL THEN 6
  WHEN CP.persona_nrodoc IS NOT NULL AND length(TRIM(CP.persona_nrodoc)) > 0 AND CP.persona_tpidentidad IS NOT NULL THEN CP.persona_tpidentidad
  ELSE '0' END AS tpdoccliente,
 
  CASE WHEN CE.empresa_ruc IS NOT NULL THEN CE.empresa_ruc
  WHEN CEP.empresa_ruc IS NOT NULL THEN CEP.empresa_ruc
  WHEN CP.persona_nrodoc IS NOT NULL AND length(TRIM(CP.persona_nrodoc)) > 0 AND CP.persona_tpidentidad IS NOT NULL THEN CP.persona_nrodoc
  ELSE '0' END AS nrodoccliente,
  /*
  CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_tpidentidad
  WHEN CEP.empresa_cod IS NOT NULL THEN 6
  WHEN CP.persona_cod IS NOT NULL THEN CP.persona_tpidentidad
  ELSE '0' END AS tpdoccliente,
  CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_ruc
  WHEN CEP.empresa_cod IS NOT NULL THEN CEP.empresa_ruc
  WHEN CP.persona_cod IS NOT NULL THEN CP.persona_nrodoc
  ELSE '' END AS nrodoccliente,
  */
  CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_rznsocial
  WHEN CP.persona_cod IS NOT NULL THEN TRIM(CP.persona_apep) || ' ' || TRIM(CP.persona_apem) || ', ' || TRIM(CP.persona_nmb1) || ' ' || TRIM(CP.persona_nmb2)
  ELSE '' END AS nomcliente,
  NULL AS docnumant,
  NULL AS planes,
  COALESCE(PD.predocvnt_cod, '000000000000') AS prefactura,
  LPAD(CAST(DV.docvntsunat_tpdoc AS VARCHAR), 2, '0') AS tpdocsunat,
  --'PEN' AS tpmoneda,
  COALESCE(TM.tpmoneda_iso, 'PEN') AS tpmoneda,
  'PE-SIN IMPUESTO' AS codimpuesto,
  0 AS tasaimp,
  0 AS mntimpuesto,
  ---1 * ROUND(CAST(DVD.totneto + DVD.totimpuesto AS NUMERIC), 2) AS mntneto,
  ---1 * ROUND(CAST(DVD.totneto + DVD.totimpuesto AS NUMERIC), 2) AS preunineto,
  ---1 * ROUND(CAST(DVD.totneto + DVD.totimpuesto AS NUMERIC), 2) AS prelstunit,
  
  --(-1 * ROUND(CAST(DVD.totneto + DVD.totimpuesto AS NUMERIC), 2)) - COALESCE(PAGO_ANT.monto, 0.00) AS mntneto,
  --(-1 * ROUND(CAST(DVD.totneto + DVD.totimpuesto AS NUMERIC), 2)) - COALESCE(PAGO_ANT.monto, 0.00) AS preunineto,
  --(-1 * ROUND(CAST(DVD.totneto + DVD.totimpuesto AS NUMERIC), 2)) - COALESCE(PAGO_ANT.monto, 0.00) AS prelstunit,
  
  (-1 * ROUND(CAST(PA.pago_mtodeltotal AS NUMERIC), 2)) - COALESCE(PAGO_ANT.monto, 0.00) AS mntneto,
  (-1 * ROUND(CAST(PA.pago_mtodeltotal AS NUMERIC), 2)) - COALESCE(PAGO_ANT.monto, 0.00) AS preunineto,
  (-1 * ROUND(CAST(PA.pago_mtodeltotal AS NUMERIC), 2)) - COALESCE(PAGO_ANT.monto, 0.00) AS prelstunit,

  1 AS cantidad,
  NULL AS codproducto,
  NULL AS codalmacen,
  'DOCUMENTO DE TRAMITE' AS dsclinea,
  CASE WHEN CE.empresa_direccion IS NOT NULL AND length(TRIM(CE.empresa_direccion)) > 0 THEN TRIM(CE.empresa_direccion)
  WHEN CP.persona_dir IS NOT NULL AND length(TRIM(CP.persona_dir)) > 0 THEN TRIM(CP.persona_dir)
  ELSE '-' END AS dircliente,
  CASE WHEN CE.empresa_cod IS NOT NULL THEN CIE.ciudad_dsc
  WHEN CP.persona_cod IS NOT NULL THEN CIP.ciudad_dsc
  ELSE '' END AS ciucliente,
  CASE WHEN CE.empresa_cod IS NOT NULL THEN PRE.provincia_dsc
  WHEN CP.persona_cod IS NOT NULL THEN PRP.provincia_dsc
  ELSE '' END AS procliente,
  CASE WHEN CE.empresa_cod IS NOT NULL THEN DIE.distrito_dsc
  WHEN CP.persona_cod IS NOT NULL THEN DIP.distrito_dsc
  ELSE '' END AS discliente,
  'PE' AS paicliente,
  'AQP_DOC_REG' AS tptran,
  'HEMA' AS origen,
  '01' s1provincia,
  'PE' s2capitulo,
  '005' s3cia,
  CASE WHEN PA.pago_tpformapago_cod = 1 AND CC.tpcambiocomercial_cod IS NOT NULL THEN '10110102'
  WHEN PA.pago_tpformapago_cod = 1 AND CC.tpcambiocomercial_cod IS NULL THEN '10110101'
  WHEN TT.tptarjetapago_coracle IS NOT NULL THEN TT.tptarjetapago_coracle --PAGOS CON TARJETA
  WHEN CB.ctabanco_coracle IS NOT NULL THEN CB.ctabanco_coracle --PAGOS DEPOSITOS
  ELSE NULL END AS s4cuenta,
  CASE WHEN PA.pago_tpformapago_cod = 1 AND CC.tpcambiocomercial_cod IS NOT NULL THEN '101101'
  WHEN PA.pago_tpformapago_cod = 1 AND CC.tpcambiocomercial_cod IS NULL THEN '101101'
  WHEN TT.tptarjetapago_coracle IS NOT NULL THEN SUBSTRING(TT.tptarjetapago_coracle, 1, 6) --PAGOS CON TARJETA
  WHEN CB.ctabanco_coracle IS NOT NULL THEN SUBSTRING(CB.ctabanco_coracle, 1, 6) --PAGOS DEPOSITOS
  ELSE NULL END AS s5corporativa,
  '0000' s6ccosto,--HOMOLOGAR CENTRO DE COSTOS
  '0000' s7linea,
  '000' s8lineaser,
  '0000' s9unidad, --ESPECIALIDAD
  '000' s10inter,
  '0000' s11convenio, --NEGOCIACION
  '00000000' AS s12tarifario,
  '00000' s13fut1,
  '00000' s14fut2,
  203 AS idorg,
  'U' AS procesado,
  DV.docvntsunat_cod AS idtranori,
  OAT.ordatencion_cod AS ordatencion,
  PAC.paciente_hstclinica_cod AS nrohistoria,
  OAT.ordatencion_fcreacion AS fechaatencion,
  SUBSTRING(NPT.negociacionprecio_dsc, 1, 30) AS planatencion,
  SUBSTRING(ASEGT.empresa_nmbcomercial, 1, 80) AS empcontratante,
  OAAST.ordatencionaseg_poliza_cod AS nropoliza,
  1 AS numlinea,
  DV.docvntsunat_usrcreacion AS usrregistro,
  CASE WHEN CE.empresa_cod IS NOT NULL THEN CE.empresa_cod
  WHEN CP.persona_cod IS NOT NULL THEN CP.persona_cod 
  ELSE NULL END AS codcliente, --ID_CLI_ORIG
  NULL tpncr,
  NULL tpnd,
  NULL AS numtransaccionref,
  NULL AS tpdocsunatref,
  DV.docvntsunat_femision AS fechatranref,
  0 AS numlinearef,
  NULL AS tptranref,
  CASE WHEN CE.empresa_cod IS NOT NULL THEN 2
  ELSE 1 END AS tpcliente, --TIPO_CLI_ORIG
  DVNC.docvntsunat_femision AS fechagl, 
  DV.docvntsunat_tipocambio AS tipocambio,
  DV.docvntsunat_cod AS codigo, 
  -1,
  '', 
  '',
  NULL
FROM
  sch_clinica.tbl_docvntsunat_referencia DVSR
  INNER JOIN sch_clinica.tbl_docvntsunat DVNC ON (DVSR.docvntsunat_referencia_cod = DVNC.docvntsunat_cod)
  AND DVSR.docvntsunat_referencia_motivo != 5
  INNER JOIN sch_clinica.tbl_docvntsunat DV ON (DVSR.docvntsunat_referencia_docref_cod = DV.docvntsunat_cod)
  INNER JOIN (
     SELECT
      DVDT.docvntsunatdet_cod AS codigo,
      SUM(
      CASE WHEN DVDT.docvntsunatdet_afectoigv = 1 AND DVDT.docvntsunatdet_preciounineto != 0 THEN
        --DVDT.docvntsunatdet_totneto * DVT.docvntsunat_igv
        ROUND(CAST(DVDT.docvntsunatdet_totneto * DVT.docvntsunat_igv AS NUMERIC), 2)
      ELSE 0.00 END) AS totimpuesto,
      SUM(DVDT.docvntsunatdet_totneto) AS totneto
     FROM
      sch_clinica.tbl_docvntsunatdet DVDT
      INNER JOIN sch_clinica.tbl_docvntsunat DVT ON (DVDT.docvntsunatdet_cod = DVT.docvntsunat_cod)
     WHERE
      DVT.docvntsunat_tpdoc = 7
     GROUP BY DVDT.docvntsunatdet_cod
  ) DVD ON (DVNC.docvntsunat_cod = DVD.codigo)
  
  INNER JOIN (
    SELECT MIN(pago_doc_pagocod) AS codigo, 
    pago_doc_doccod AS docventa 
    FROM sch_clinica.tbl_pago_doc
    INNER JOIN sch_clinica.tbl_pago ON (sch_clinica.tbl_pago_doc.pago_doc_pagocod = sch_clinica.tbl_pago.pago_cod)
    WHERE pago_tpformapago_cod != 11
    GROUP BY pago_doc_doccod
  ) PGDV ON (DV.docvntsunat_cod = PGDV.docventa)
  
  INNER JOIN (
    SELECT MAX(pago_cod) AS codigo, 
    pago_docvntsunat_cod AS docventa,
    MAX(pago_fcreacion) AS fcreacion
    FROM sch_clinica.tbl_pago
    WHERE DATE(pago_fcreacion) >= '01-01-2017' AND pago_docvntsunat_cod LIKE '007%'
    GROUP BY pago_docvntsunat_cod
  ) PGNC ON (DVNC.docvntsunat_cod = PGNC.docventa)

	--PAGO ANT INI--
  LEFT JOIN
  (
    SELECT PAGO_ANT_ALL.docventa, PAGO_ANT_ALL.oi_cod, SUM(PAGO_ANT_ALL.monto) AS monto FROM (
      SELECT 
        sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_docvntcod AS docventa,
        COALESCE(sch_clinica.tbl_hospitalizacion_pagocuenta.hospitalizacion_pagocuenta_cod_oi, 0) as oi_cod,
        sch_clinica.tbl_docvntsunat.docvntsunat_cod AS docvntref,
        sch_clinica.tbl_docvntsunat.docvntsunat_totneto AS monto
      FROM
        sch_clinica.tbl_hospitalizacion_pagocuenta
        INNER JOIN sch_clinica.tbl_docvntsunat ON (sch_clinica.tbl_hospitalizacion_pagocuenta.hospitalizacion_pagocuenta_pdvcod = sch_clinica.tbl_docvntsunat.docvntsunat_predocvnt_cod)
        INNER JOIN sch_clinica.tbl_hospitalizacion_pagoctadet ON (sch_clinica.tbl_hospitalizacion_pagocuenta.hospitalizacion_pagocuenta_cod = sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_pagocuentacod)
        AND (sch_clinica.tbl_hospitalizacion_pagocuenta.hospitalizacion_pagocuenta_item = sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_pagocuentaitem)
      WHERE
        /*sch_clinica.tbl_hospitalizacion_pagocuenta.hospitalizacion_pagocuenta_cod_oi = cod_oi AND
        sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_docvntcod = cod_venta AND*/
        sch_clinica.tbl_docvntsunat.docvntsunat_anulado = 0
      UNION ALL
      SELECT DISTINCT
       sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_docvntcod AS docventa,
       COALESCE(sch_clinica.tbl_entfondo_movimiento_serv.entfondo_movimiento_serv_cod_oi, 0) as oi_cod,
       sch_clinica.tbl_docvntsunat.docvntsunat_cod AS docvntref,
       sch_clinica.tbl_entfondo_movimientodet.entfondo_movimientodet_monto AS monto
      FROM
       sch_clinica.tbl_entfondo_movimiento_serv
       INNER JOIN sch_clinica.tbl_docvntsunat ON (sch_clinica.tbl_entfondo_movimiento_serv.entfondo_movimiento_serv_docvntsunat_ref = sch_clinica.tbl_docvntsunat.docvntsunat_cod)
       INNER JOIN sch_clinica.tbl_hospitalizacion_pagoctadet ON (sch_clinica.tbl_entfondo_movimiento_serv.entfondo_movimiento_serv_cod = sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_fmovcod)
       INNER JOIN sch_clinica.tbl_entfondo_movimientodet ON (sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_docvntcod = sch_clinica.tbl_entfondo_movimientodet.entfondo_movimientodet_docvntsunat_cod
       AND sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_fmovcod = sch_clinica.tbl_entfondo_movimientodet.entfondo_movimientodet_movserv_cod)
      WHERE
       /*sch_clinica.tbl_entfondo_movimiento_serv.entfondo_movimiento_serv_cod_oi = cod_oi AND
       sch_clinica.tbl_hospitalizacion_pagoctadet.hospitalizacion_pagoctadet_docvntcod = cod_venta AND*/
       sch_clinica.tbl_docvntsunat.docvntsunat_anulado = 0 AND
       sch_clinica.tbl_entfondo_movimientodet.entfondo_movimientodet_anulado = 0
      /*UNION ALL 
      SELECT
       EFMD.entfondo_movimientodet_docvntsunat_cod AS docventa, 
       0 as oi_cod,
       DVS.docvntsunat_cod AS docvntref,
       EFMD.entfondo_movimientodet_monto AS monto
      FROM
       sch_clinica.tbl_entfondo_movimientodet EFMD
       INNER JOIN sch_clinica.tbl_entfondo_movimiento_serv EFMS ON (EFMD.entfondo_movimientodet_movserv_cod = EFMS.entfondo_movimiento_serv_cod)
       INNER JOIN sch_clinica.tbl_docvntsunat DVS ON (EFMS.entfondo_movimiento_serv_docvntsunat_ref = DVS.docvntsunat_cod)
      WHERE
       EFMD.entfondo_movimientodet_anulado = 0*/
      ) PAGO_ANT_ALL
      --WHERE PAGO_ANT_ALL.docventa NOT IN ('001FH010000000806')--OCT-17
      --WHERE PAGO_ANT_ALL.docventa NOT IN ('001FH010000000973', '003BH0100001916')--DIC-17
      --WHERE PAGO_ANT_ALL.docventa NOT IN ('003BH010000002367')--MAR-18
      --WHERE PAGO_ANT_ALL.docventa NOT IN ('003BH010000002634','003BH010000002729','003BH010000002740')--ABR-18
      --WHERE PAGO_ANT_ALL.docventa NOT IN ('003BH010000002986')--JUN-18
      --WHERE PAGO_ANT_ALL.docventa NOT IN ('001FH010000001771')--AGO-18
      WHERE PAGO_ANT_ALL.docventa NOT IN ('003BH010000003951','003BH010000003875')--NOV-18
      
      GROUP BY PAGO_ANT_ALL.docventa, PAGO_ANT_ALL.oi_cod
      
  ) AS PAGO_ANT ON (DV.docvntsunat_cod = PAGO_ANT.docventa AND CASE WHEN PAGO_ANT.oi_cod IS NULL OR PAGO_ANT.oi_cod = 0 THEN TRUE ELSE DV.docvntsunat_oi_codigo = PAGO_ANT.oi_cod END
 					AND DV.docvntsunat_anulado = 0)

  INNER JOIN sch_clinica.tbl_pago PAVN ON (PGDV.codigo = PAVN.pago_cod AND PAVN.pago_tpformapago_cod != 11 AND PAVN.pago_mtodeltotal > 0.00)
  --INNER JOIN sch_clinica.tbl_pago PA ON (PGNC.codigo = PA.pago_cod AND PA.pago_tpformapago_cod != 11 AND PA.pago_mtodeltotal < 0.00)
  INNER JOIN sch_clinica.tbl_pago PA ON (PA.pago_docvntsunat_cod = DVNC.docvntsunat_cod AND PA.pago_tpformapago_cod != 11 AND PA.pago_tpformapago_cod != 7 AND PA.pago_mtodeltotal < 0.00)
  LEFT JOIN sch_clinica.tbl_tpmoneda TM ON (DV.docvntsunat_tpmoneda = TM.tpmoneda_cod)
  LEFT JOIN sch_clinica.tbl_predocvnt PD ON (DV.docvntsunat_predocvnt_cod = PD.predocvnt_cod)
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
  /*LEFT JOIN sch_clinica.tbl_persona CP ON (CASE WHEN DV.docvntsunat_cliente_cod IS NULL OR DV.docvntsunat_cliente_cod = 0 THEN 182971 
  WHEN CEP.empresa_cod IS NOT NULL THEN CEP.empresa_referencia_persona
  WHEN DV.docvntsunat_tpcliente != 3 THEN DV.docvntsunat_cliente_cod END = CP.persona_cod)*/
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
  LEFT JOIN sch_clinica.tbl_pais PAE ON (CE.empresa_pais = PAE.pais_cod)
  --PAGO TARJETA
  LEFT JOIN sch_clinica.tbl_pagotarjeta PAT ON (PA.pago_cod = PAT.pagotarjeta_cod)
  LEFT JOIN sch_clinica.tbl_tptarjetapago TT ON (PAT.pagotarjeta_tptarjetapago_cod = TT.tptarjetapago_cod)
  --PAGO DEPOSITO
  LEFT JOIN sch_clinica.tbl_pagodeposito PAD ON (PA.pago_cod = PAD.pagodeposito_cod)
  LEFT JOIN sch_clinica.tbl_ctabanco CB ON (PAD.pagodeposito_entfinanciera_cod = CB.ctabanco_bancocod)
  AND (PAD.pagodeposito_nrocuenta = CB.ctabanco_numero)
  LEFT JOIN sch_clinica.tbl_entfinanciera EF ON (CB.ctabanco_bancocod = EF.entfinanciera_cod)
  LEFT JOIN sch_clinica.tbl_tpcambiocomercial CC ON (PA.pago_tpcambiocomercial_cod = CC.tpcambiocomercial_cod)
WHERE
  DATE(DVNC.docvntsunat_femision) >= '${fecha_ini}' AND DATE(DVNC.docvntsunat_femision) <= '${fecha_fin}'
  AND DVNC.docvntsunat_anulado = 0
) RESULT
--WHERE RESULT.tpdocsunat = '07'
--WHERE RESULT.tptran != 'AQP_DOC_REG' AND RESULT.tpdocsunat != '07'
--CAMBIOS SJDDCUSCO
WHERE RESULT.tptran != 'AQP_DOC_REG' 
ORDER BY RESULT.numtransaccion
  `;

export const getQueryCobranzas: IQuery['IQuery'] = (fecha_ini, fecha_fin) => `
SELECT DISTINCT
 PA.pago_fcreacion AS fechacobro,--1
 (DV.docvntsunat_serie || '-' || SUBSTRING(DV.docvntsunat_nro,3 , 10)) AS nrotransaccion,--2
 DV.docvntsunat_tpdoc AS tpdocumento,--3
 PA.pago_doccaja_cod AS numrecibo,--4
 PA.pago_mtodeltotal AS mnttotal,--5
 TM.tpmoneda_iso AS tpmoneda,--6
 'VENTA'AS codtpcambio,--7
 CASE WHEN CC.tpcambiocomercial_cod IS NOT NULL THEN 
 TO_CHAR(CC.tpcambiocomercial_fcambio, 'YYYY-MM-DD')
 ELSE NULL END AS fechacambio,--8
 CASE WHEN CC.tpcambiocomercial_cod IS NOT NULL THEN 
 CC.tpcambiocomercial_venta
 ELSE 0.00 END AS tasacambio,--9
 PA.pago_mtodeltotal AS mntfuncional,--10
 EF.entfinanciera_dsc nombanco,--11
 PAD.pagodeposito_nrocuenta AS ctaclinica,--12
 PA.pago_cod AS codpago,--13
 FP.tpformapago_horacle AS tpcobro,--14
 CAST('HEMA' AS VARCHAR) AS origen,--15
 203 AS idorg,--16
 CAST('U' AS VARCHAR) AS procesado,
 
 --CASE WHEN DV.docvntsunat_tptoracle IS NOT NULL THEN DV.docvntsunat_tptoracle 
 --ELSE DVM.docvntsunatmant_horacle END AS tptransaccion,
 
 CASE WHEN DVM.docvntsunatmant_horacle IS NOT NULL AND DATE(DV.docvntsunat_femision) >= '01-02-2017' THEN DVM.docvntsunatmant_horacle
 WHEN DV.docvntsunat_tptoracle IS NOT NULL THEN DV.docvntsunat_tptoracle 
 ELSE NULL END AS tptransaccion,
 
 CASE WHEN PA.pago_tpformapago_cod = 1 AND CC.tpcambiocomercial_cod IS NOT NULL THEN 'CAJA EFECTIVO M.E CUSCO'
 WHEN PA.pago_tpformapago_cod = 1 AND CC.tpcambiocomercial_cod IS NULL THEN 'CAJA EFECTIVO M.N CUSCO'
 WHEN TT.tptarjetapago_horacle IS NOT NULL THEN TT.tptarjetapago_horacle --PAGOS CON TARJETA
 WHEN CB.ctabanco_horacle IS NOT NULL THEN CB.ctabanco_horacle --PAGOS DEPOSITOS
 ELSE NULL END AS mtrecibo,
 FP.tpformapago_dsc,
 FP.tpformapago_cod,
 DV.docvntsunat_cod,
 PA.pago_doccaja_cod AS codrecibo
 FROM
 sch_clinica.tbl_pago PA
 --INNER JOIN sch_clinica.tbl_pago_doc PGD ON (PA.pago_cod = PGD.pago_doc_pagocod)
 --INNER JOIN sch_clinica.tbl_docvntsunat DV ON (PGD.pago_doc_doccod = DV.docvntsunat_cod)
 INNER JOIN sch_clinica.tbl_docvntsunat DV ON (PA.pago_docvntsunat_cod = DV.docvntsunat_cod)
 AND DV.docvntsunat_anulado = 0 and coalesce(dv.docvntsunat_tpref, 0) = 0
 INNER JOIN sch_clinica.tbl_caja_turno TU ON (PA.pago_cajaturno_cod = TU.caja_turno_cod)
-- AND TU.caja_turno_val_ctb = 1
 LEFT JOIN sch_clinica.tbl_empresa CE ON (DV.docvntsunat_cliente_cod = CE.empresa_cod) 
 AND (DV.docvntsunat_tpcliente = 3)
 LEFT JOIN (
 SELECT DISTINCT
 docvntsunatmant_tpdoc,
 docvntsunatmant_serie,
 docvntsunatmant_horacle
 FROM sch_clinica.tbl_docvntsunatmant
 WHERE docvntsunatmant_horacle IS NOT NULL
 ) DVM ON (DV.docvntsunat_tpdoc = DVM.docvntsunatmant_tpdoc AND DV.docvntsunat_serie = DVM.docvntsunatmant_serie)
 --PAGO TARJETA
 LEFT JOIN sch_clinica.tbl_pagotarjeta PAT ON (PA.pago_cod = PAT.pagotarjeta_cod)
 LEFT JOIN sch_clinica.tbl_tptarjetapago TT ON (PAT.pagotarjeta_tptarjetapago_cod = TT.tptarjetapago_cod)
 --PAGO DEPOSITO
 LEFT JOIN sch_clinica.tbl_pagodeposito PAD ON (PA.pago_cod = PAD.pagodeposito_cod)
 LEFT JOIN sch_clinica.tbl_ctabanco CB ON (PAD.pagodeposito_entfinanciera_cod = CB.ctabanco_bancocod)
 AND (PAD.pagodeposito_nrocuenta = CB.ctabanco_numero)
 LEFT JOIN sch_clinica.tbl_entfinanciera EF ON (CB.ctabanco_bancocod = EF.entfinanciera_cod)
 
 LEFT JOIN sch_clinica.tbl_tpmoneda TM ON (PA.pago_tpmoneda_cod = TM.tpmoneda_cod)
 LEFT JOIN sch_clinica.tbl_tpformapago FP ON (PA.pago_tpformapago_cod = FP.tpformapago_cod)
 LEFT JOIN sch_clinica.tbl_tpcambiocomercial CC ON (PA.pago_tpcambiocomercial_cod = CC.tpcambiocomercial_cod)
 WHERE
 PA.pago_tpformapago_cod != 7 AND PA.pago_tpformapago_cod != 11 AND PA.pago_doccaja_cod IS NOT NULL AND PA.pago_mtodeltotal > 0.00 AND
 DATE(PA.pago_fcreacion) >= '${fecha_ini}' AND DATE(PA.pago_fcreacion) <= '${fecha_fin}'
 AND (DV.docvntsunat_tpdoc = 12 OR DV.docvntsunat_tpdoc = 1 OR DV.docvntsunat_tpdoc = 3)

UNION ALL

SELECT DISTINCT
 PA.pago_fcreacion AS fechacobro,--1
 CAST(DV.docvntsunat_serie || '-' || SUBSTRING(DV.docvntsunat_nro,3 , 10) AS VARCHAR) AS nrotransaccion,--2
 DV.docvntsunat_tpdoc AS tpdocumento,--3
 --PA.pago_doccaja_cod AS numrecibo,--4
 COALESCE(PAD.pagodeposito_nrodeposito, '') || '-' || CAST(DV.docvntsunat_serie || '-' || SUBSTRING(DV.docvntsunat_nro,3 , 10) AS VARCHAR) AS numrecibo,--4
 PGD.pago_doc_monto_pago AS mnttotal,--5
 TM.tpmoneda_iso AS tpmoneda,--6
 CAST('VENTA' AS VARCHAR) AS codtpcambio,--7
 CASE WHEN CC.tpcambiocomercial_cod IS NOT NULL THEN 
 TO_CHAR(CC.tpcambiocomercial_fcambio, 'YYYY-MM-DD')
 ELSE NULL END AS fechacambio,--8
 CASE WHEN CC.tpcambiocomercial_cod IS NOT NULL THEN 
 CC.tpcambiocomercial_venta
 ELSE 0.00 END AS tasacambio,--9
 PA.pago_mtodeltotal AS mntfuncional,--10
 EF.entfinanciera_dsc nombanco,--11
 PAD.pagodeposito_nrocuenta AS ctaclinica,--12
 PA.pago_cod AS codpago,--13
 FP.tpformapago_horacle AS tpcobro,--14
 CAST('HEMA' AS VARCHAR) AS origen,--15
 203 AS idorg,--16
 CAST('U' AS VARCHAR) AS procesado,
 
 --CASE WHEN DV.docvntsunat_tptoracle IS NOT NULL THEN DV.docvntsunat_tptoracle 
 --ELSE DVM.docvntsunatmant_horacle END AS tptransaccion,
 
 CASE WHEN DVM.docvntsunatmant_horacle IS NOT NULL AND DATE(DV.docvntsunat_femision) >= '01-02-2017' THEN DVM.docvntsunatmant_horacle
 WHEN DV.docvntsunat_tptoracle IS NOT NULL THEN DV.docvntsunat_tptoracle 
 ELSE NULL END AS tptransaccion,
 
 CASE WHEN PA.pago_tpformapago_cod = 1 AND CC.tpcambiocomercial_cod IS NOT NULL THEN 'CAJA EFECTIVO M.E CUSCO'
 WHEN PA.pago_tpformapago_cod = 1 AND CC.tpcambiocomercial_cod IS NULL THEN 'CAJA EFECTIVO M.N CUSCO'
 WHEN TT.tptarjetapago_horacle IS NOT NULL THEN TT.tptarjetapago_horacle --PAGOS CON TARJETA
 WHEN CB.ctabanco_horacle IS NOT NULL THEN CB.ctabanco_horacle --PAGOS DEPOSITOS
 ELSE NULL END AS mtrecibo,
 FP.tpformapago_dsc,
 FP.tpformapago_cod,
 DV.docvntsunat_cod,
 PA.pago_doccaja_cod AS codrecibo
 FROM
 sch_clinica.tbl_pago PA
 INNER JOIN sch_clinica.tbl_pago_doc PGD ON (PA.pago_cod = PGD.pago_doc_pagocod)
 AND PA.pago_docvntsunat_cod IS NULL
 INNER JOIN sch_clinica.tbl_docvntsunat DV ON (PGD.pago_doc_doccod = DV.docvntsunat_cod)
 --INNER JOIN sch_clinica.tbl_docvntsunat DV ON (PA.pago_docvntsunat_cod = DV.docvntsunat_cod)
 AND DV.docvntsunat_anulado = 0  and coalesce(dv.docvntsunat_tpref, 0) = 0
 LEFT JOIN sch_clinica.tbl_caja_turno TU ON (PA.pago_cajaturno_cod = TU.caja_turno_cod)
-- AND TU.caja_turno_val_ctb = 1
 LEFT JOIN sch_clinica.tbl_empresa CE ON (DV.docvntsunat_cliente_cod = CE.empresa_cod) 
 AND (DV.docvntsunat_tpcliente = 3)
 LEFT JOIN (
 SELECT DISTINCT
 docvntsunatmant_tpdoc,
 docvntsunatmant_serie,
 docvntsunatmant_horacle
 FROM sch_clinica.tbl_docvntsunatmant
 WHERE docvntsunatmant_horacle IS NOT NULL
 ) DVM ON (DV.docvntsunat_tpdoc = DVM.docvntsunatmant_tpdoc AND DV.docvntsunat_serie = DVM.docvntsunatmant_serie)
 --PAGO TARJETA
 LEFT JOIN sch_clinica.tbl_pagotarjeta PAT ON (PA.pago_cod = PAT.pagotarjeta_cod)
 LEFT JOIN sch_clinica.tbl_tptarjetapago TT ON (PAT.pagotarjeta_tptarjetapago_cod = TT.tptarjetapago_cod)
 --PAGO DEPOSITO
 LEFT JOIN sch_clinica.tbl_pagodeposito PAD ON (PA.pago_cod = PAD.pagodeposito_cod)
 LEFT JOIN sch_clinica.tbl_ctabanco CB ON (PAD.pagodeposito_entfinanciera_cod = CB.ctabanco_bancocod)
 AND (PAD.pagodeposito_nrocuenta = CB.ctabanco_numero)
 LEFT JOIN sch_clinica.tbl_entfinanciera EF ON (CB.ctabanco_bancocod = EF.entfinanciera_cod)
 
 LEFT JOIN sch_clinica.tbl_tpmoneda TM ON (PA.pago_tpmoneda_cod = TM.tpmoneda_cod)
 LEFT JOIN sch_clinica.tbl_tpformapago FP ON (PA.pago_tpformapago_cod = FP.tpformapago_cod)
 LEFT JOIN sch_clinica.tbl_tpcambiocomercial CC ON (PA.pago_tpcambiocomercial_cod = CC.tpcambiocomercial_cod)
 WHERE
 PA.pago_tpformapago_cod != 7 AND PA.pago_tpformapago_cod != 11 AND PA.pago_doccaja_cod IS NOT NULL AND PA.pago_mtodeltotal > 0.00 AND
 DATE(PA.pago_fcreacion) >= '${fecha_ini}' AND DATE(PA.pago_fcreacion) <= '${fecha_fin}'
 AND (DV.docvntsunat_tpdoc = 12 OR DV.docvntsunat_tpdoc = 1 OR DV.docvntsunat_tpdoc = 3)
--   
`;

export const getQueryProvisiones: IQuery['IQuery'] = (fecha_ini, fecha_fin) => `
--PROVISIONES
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
  AND OA.ordatencion_fregistro BETWEEN DATE('${fecha_fin}') - INTERVAL '1 year'
  AND '${fecha_fin}' 
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
`;
