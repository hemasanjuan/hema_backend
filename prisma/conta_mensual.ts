import { PrismaClient } from '@prisma/client'
import fs from 'fs';
import path from 'path';
import { fetchData, mapData, jsonToExcel } from './src/query/utils';
import { getQueryCobranzas, getQueryProvisiones, getQueryVentas } from './src/query/contabilidad/ventas_sql';

const prisma = new PrismaClient()

async function main() {
    const fecha_ini = '2025-01-01';
    const fecha_fin = '2025-01-31';

    try {
        const queryVentas = getQueryVentas(fecha_ini, fecha_fin);
        const resultVentas = await fetchData(queryVentas);
        // filtro de RESULT.nrodoccliente si es 00000000
        const filteredVentas = resultVentas.map(row => {
            if (row.nrodoccliente === '00000000' || row.nrodoccliente === '0') {
                row.nrodoccliente = '-';
            }
            row.cantidad = parseInt(row.cantidad, 10);
            return row;
        });
        const jsonDataVentas = mapData(filteredVentas, {
            NomPaciente: 'nompaciente',
            NumTransaccion: 'numtransaccion',
            FechaTran: 'fechatran',
            TpPago: 'tppago',
            TermPago: 'termpago',
            DscTrans: 'dsctrans',
            NotaLinea: 'notalinea',
            TpDocCliente: 'tpdoccliente',
            NroDocCliente: 'nrodoccliente',
            NomCliente: 'nomcliente',
            DocNumAnt: 'docnumant',
            Planes: 'planes',
            PreFactura: 'prefactura',
            TpDocSunat: 'tpdocsunat',
            TpMoneda: 'tpmoneda',
            CodImpuesto: 'codimpuesto',
            TasaImp: 'tasaimp',
            MntImpuesto: 'mntimpuesto',
            MntNeto: 'mntneto',
            PreUniNeto: 'preunineto',
            PreLstUnit: 'prelstunit',
            Cantidad: 'cantidad',
            CodProducto: 'codproducto',
            CodAlmacen: 'codalmacen',
            DscLinea: 'dsclinea',
            DirCliente: 'dircliente',
            CiuCliente: 'ciucliente',
            ProCliente: 'procliente',
            DisCliente: 'discliente',
            PaiCliente: 'paicliente',
            TpTran: 'tptran',
            Origen: 'origen',
            S1Provincia: 's1provincia',
            S2Capitulo: 's2capitulo',
            S3Cia: 's3cia',
            S4Cuenta: 's4cuenta',
            S5Corporativa: 's5corporativa',
            S6CCosto: 's6ccosto',
            S7Linea: 's7linea',
            S8LineaSer: 's8lineaser',
            S9Unidad: 's9unidad',
            S10Inter: 's10inter',
            S11Convenio: 's11convenio',
            S12Tarifario: 's12tarifario',
            S13Fut1: 's13fut1',
            S14Fut2: 's14fut2',
            IdOrg: 'idorg',
            Procesado: 'procesado',
            IdTranOri: 'idtranori',
            Ordatencion: 'ordatencion',
            NroHistoria: 'nrohistoria',
            FechaAtencion: 'fechaatencion',
            PlanAtencion: 'planatencion',
            EmpContratante: 'empcontratante',
            NroPoliza: 'nropoliza',
            NumLinea: 'numlinea',
            UsrRegistro: 'usrregistro',
            CodCliente: 'codcliente',
            TpNCR: 'tpncr',
            TpND: 'tpnd',
            NumTransaccionRef: 'numtransaccionref',
            TpDocSunatRef: 'tpdocsunatref',
            FechaTranRef: 'fechatranref',
            NumLineaRef: 'numlinearef',
            TpTranRef: 'tptranref',
            TpCliente: 'tpcliente',
            FechaGL: 'fechagl',
            TipoCambio: 'tipocambio',
            Codigo: 'codigo',
            PredocvntTipo: 'predocvnt_tipo',
            TarifariodetDsc: 'tarifariodet_dsc',
            Identificador: 'identificador',
            EspprofatencionHoracle: 'espprofatencion_horacle'
        });


        const queryCobranzas = getQueryCobranzas(fecha_ini, fecha_fin);
        const resultCobranzas = await fetchData(queryCobranzas);
        const jsonDataCobranzas = mapData(resultCobranzas, {
            FechaCobro: 'fechacobro',
            NroTransaccion: 'nrotransaccion',
            TpDocumento: 'tpdocumento',
            NumRecibo: 'numrecibo',
            MntTotal: 'mnttotal',
            TpMoneda: 'tpmoneda',
            CodTpCambio: 'codtpcambio',
            FechaCambio: 'fechacambio',
            TasaCambio: 'tasacambio',
            MntFuncional: 'mntfuncional',
            NomBanco: 'nombanco',
            CtaClinica: 'ctaclinica',
            CodPago: 'codpago',
            TpCobro: 'tpcobro',
            Origen: 'origen',
            IdOrg: 'idorg',
            Procesado: 'procesado',
            TpTransaccion: 'tptransaccion',
            MtRecibo: 'mtrecibo',
            TpFormaPagoDsc: 'tpformapago_dsc',
            TpFormaPagoCod: 'tpformapago_cod',
            DocVntSunatCod: 'docvntsunat_cod',
            CodRecibo: 'codrecibo'
        });

        const queryProvisiones = getQueryProvisiones(fecha_ini, fecha_fin);
        const resultProvisiones = await fetchData(queryProvisiones);
        const filteredProvisiones = resultProvisiones.filter(row => row.ESTADO === 'PENDIENTE');
        const jsonDataProvisiones = mapData(filteredProvisiones, {
            Mes: 'MES',
            Fecha: 'FECHA',
            Dni: 'DNI',
            Paciente: 'PACIENTE',
            Edad: 'EDAD',
            Sexo: 'SEXO',
            TipoPaciente: 'TIPO PACIENTE',
            Negociacion: 'NEGOCIACION',
            Servicio: 'SERVICIO',
            TipoAtencion: 'TIPO ATENCION',
            Estado: 'ESTADO',
            MontoAsegConIgv: 'MONTO ASEG. CON IGV',
            MontoPacConIgv: 'MONTO PAC. CON IGV',
            NroOA: 'NRO. O.A.',
            NroOI: 'NRO. O.I.',
            UsrCreacion: 'ordinternamiento_usrcreacion'
        });


        const fileName = `Reporte_conta_${fecha_ini}_a_${fecha_fin}.xlsx`;
        const filePath = path.join(__dirname, 'excel', fileName);
        const sheets = [
            { sheetName: 'Ventas', data: jsonDataVentas },
            { sheetName: 'Cobranzas', data: jsonDataCobranzas },
            { sheetName: 'Provisiones', data: jsonDataProvisiones }
        ];
        jsonToExcel(sheets, filePath);

        const logData = {
            fecha_ini,
            fecha_fin,
            resultVentas: resultVentas.length,
            resultCobranzas: resultCobranzas.length,
            resultProvisiones: filteredProvisiones.length,
            jsonDataCobranzas,
        };
        fs.writeFileSync(path.join(__dirname, 'excel', 'prod.log'), JSON.stringify(logData, null, 2));
    } catch (error) {
        console.error('Error in main function:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});




