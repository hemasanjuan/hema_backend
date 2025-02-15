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