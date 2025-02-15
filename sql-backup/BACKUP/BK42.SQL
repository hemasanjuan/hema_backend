select * from sch_clinica.tbl_segus_det SD inner join sch_clinica.tbl_segus S ON SD.segus_det_tditem=S.segus_tarifariodet_item
inner join sch_clinica.tbl_tarifariodet td on td.tarifariodet_item=S.segus_tarifariodet_item
where segus_area_cod=45









select * from sch_clinica.tbl_tratamiento_diagnostico where tratamiento_diagnostico_tcod in (select tratamiento_diagnostico_tcod  from sch_clinica.tbl_tratamiento t inner join sch_clinica.tbl_paciente tp 
on t.tratamiento_paciente_cod = tp.paciente_cod inner join sch_clinica.tbl_persona tp2 
on t.tratamiento_paciente_cod = tp2.persona_cod 
where tp2.persona_nrodoc = '91138924' and tratamiento_fapertura between '01/01/2023' and '31/03/2023')






select * from sch_clinica.tbl_hstconsulta_cie10 where hstconsulta_cie10_hc_ccod=10549





SELECT 
  DVS.docvntsunat_cod AS nrodocventa,
  COALESCE(PCI.paciente_hstclinica_cod || '-' || PSN.vw_persona_nombres, 'VENTA EVENTUAL') AS pacientedsc,
  --ARRAY_TO_STRING(ARRAY_AGG(VWPF.producto || '  (' || VWPF.cantidad ||')' ), ',') AS medicamentos,
  VWPF.producto  AS medicamentos,
  VWPF.cantidad as cantidad,
  tpdoc.tpdocsunat_dsc as tipo_documento,

  DVS.docvntsunat_usrcreacion AS usuario,
  TO_CHAR(DVS.docvntsunat_femision, 'YYYY-MM-DD') AS fecha
FROM 
  sch_clinica.tbl_docvntsunat DVS
  INNER JOIN sch_clinica.tbl_predocvnt PDV ON DVS.docvntsunat_predocvnt_cod = PDV.predocvnt_cod
  INNER JOIN sch_clinica.tbl_predocvntdet PDVD ON PDV.predocvnt_cod = PDVD.predocvntdet_cod
  LEFT  JOIN sch_clinica.tbl_paciente PCI ON PDV.predocvnt_paciente_cod = PCI.paciente_cod
  LEFT  JOIN sch_clinica.vw_persona PSN ON PDV.predocvnt_paciente_cod = PSN.vw_persona_cod  
  LEFT  JOIN sch_clinica.vw_prodfarma VWPF ON PDVD.predocvntdet_cod = VWPF.preventa AND PDVD.predocvntdet_item = VWPF.preventa_item
	inner join sch_clinica.tbl_tpdocsunat tpdoc on dvs.docvntsunat_tpdoc = tpdoc.tpdocsunat_cod
WHERE
	dvs.docvntsunat_anulado = 0 and dvs.docvntsunat_tpref = 0 and
  PDV.predocvnt_tipo = 2
  AND DATE(DVS.docvntsunat_femision) >= '01/01/2022'
  AND DATE(DVS.docvntsunat_femision) <= '31/12/2022'
--GROUP BY 
  --nrodocventa, pacientedsc, tipo_documento, usuario, fecha
ORDER BY nrodocventa