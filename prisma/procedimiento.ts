import { PrismaClient } from '@prisma/client'
import fs from 'fs';
import path from 'path';
import { fetchData, mapData, jsonToExcel } from './src/query/utils';
import { getQueryProce, getQueryProceHema } from './src/query/RecursosHumanos/procedimientos';
import { getQueryAmbu } from './src/query/RecursosHumanos/ambulatorios_sql';
import { getQueryImagen } from './src/query/RecursosHumanos/imagenes_sql';

const prisma = new PrismaClient()

async function main() {
    const fecha_ini = '2025-01-01';
    const fecha_fin = '2025-01-31';

    try {
        const queryProce = getQueryProce(fecha_ini, fecha_fin);
        const resultProce = await fetchData(queryProce);
        // 51	ECOGRAFIA
        // 49	LABORATORIO CLINICO
        // 45	MEDICINA FISICA Y REHABILITACIÓN
        // 57	RESONANCIA MAGNETICA
        // 31	RAYOS X
        // 58	DESINTOMETRIA OSEA
        // 52	TOMOGRAFIA
        const filteredResult = resultProce.filter(row => ![51, 49, 45, 57, 31, 58, 52].includes(row.cod_area));
        const resultConcatena = filteredResult.map(row => String(row.concatena).trim());

        const queryHema = getQueryProceHema(fecha_ini, fecha_fin);
        const resultHema = await fetchData(queryHema);
        const setResultConcatena = new Set(resultConcatena);
        const FiltroHema = resultHema.filter(row => !setResultConcatena.has(String(row.concatena).trim()));
        const combinedResults = [...filteredResult, ...FiltroHema];

        const jsonDataProce = mapData(combinedResults, {
            FechaAtencion: 'FECHA ATENCION',
            DniPaciente: 'DNI PACIENTE',
            Paciente: 'PACIENTE',
            Edad: 'EDAD',
            Sexo: 'SEXO',
            TipoPaciente: 'TIPO PACIENTE',
            DescripcionPaciente: 'DESCRIPCION PACIENTE',
            Servicio: 'SERVICIO',
            Especialidad: 'ESPECIALIDAD',
            Medico: 'MEDICO',
            ValorVenta: 'VALOR VENTA',
            Cantidad: 'CANT',
            Oa: 'OA ',
            Procedimiento: 'PROCEDIMIENTO',
            Area: 'AREA',
            TipoServicio: 'TIPO SERVICIO',
            Provincia: 'PROVINCIA',
            Ciudad: 'CIUDAD',
            Distrito: 'DISTRITO',
            CondicionEstablecimiento: 'CONDICION ESTABLECIMIENTO',
            CondicionServicio: 'CONDICION SERVICIO',
            GrupoEtario: 'GRUPO ETARIO',
            Serie: 'SERIE',
            Numero: 'NUMERO',
            Usuario: 'Usuario',
        });

        const queryAmbu = getQueryAmbu(fecha_ini, fecha_fin);
        const resultAmbu = await fetchData(queryAmbu);
        const filteredAmbu = resultAmbu.map(row => {
            if (String(row["SERIE"]).startsWith('00')) {
                row["VALOR VENTA"] = 0.00;
            }
            return row;
        });
        const jsonDataAmbu = mapData(filteredAmbu, {
            FechaAtencion: 'FECHA ATENCION',
            DniPaciente: 'DNI PACIENTE',
            Paciente: 'PACIENTE',
            Edad: 'EDAD',
            Sexo: 'SEXO',
            TipoPaciente: 'TIPO PACIENTE',
            DescripcionPaciente: 'DESCRIPCION PACIENTE',
            Servicio: 'SERVICIO',
            Especialidad: 'ESPECIALIDAD',
            Medico: 'MEDICO',
            ValorVenta: 'VALOR VENTA',
            Cantidad: 'CANT',
            Oa: 'OA ',
            Procedimiento: 'PROCEDIMIENTO',
            Area: 'AREA',
            TipoServicio: 'TIPO SERVICIO',
            Provincia: 'PROVINCIA',
            Ciudad: 'CIUDAD',
            Distrito: 'DISTRITO',
            CondicionEstablecimiento: 'CONDICION ESTABLECIMIENTO',
            CondicionServicio: 'CONDICION SERVICIO',
            GrupoEtario: 'GRUPO ETARIO',
            LineaDeNegocio: 'LINEA DE NEGOCIO',
            Modalidad: 'MODALIDAD',
            LnInicial: 'LN INICIAL',
            CodArea: 'cod_area',
            Serie: 'SERIE',
            Numero: 'NUMERO',
        });

        const queryImagen = getQueryImagen(fecha_ini, fecha_fin);
        const resultImagen = await fetchData(queryImagen);
        const jsonDataImagen = mapData(resultImagen, {
            FechaAtencion: 'FECHA ATENCION',
            DniPaciente: 'DNI PACIENTE',
            Paciente: 'PACIENTE',
            Edad: 'EDAD',
            Sexo: 'SEXO',
            TipoPaciente: 'TIPO DE PACIENTE',
            DescripcionPaciente: 'DESCRIPCION TIPO PACIENTE',
            Servicio: 'SERVICIO',
            Especialidad: 'ESPECIALIDAD',
            Medico: 'MEDICO',
            ValorVenta: 'VALOR VENTA',
            Cantidad: 'CANT',
            Oa: 'OA',
            Procedimiento: 'PROCEDIMIENTO',
            Area: 'AREA',
            TipoServicio: 'TIPO DE SERVICIO',
            Provincia: 'PROVINCIA',
            Ciudad: 'CIUDAD',
            Distrito: 'DISTRITO',
            CondicionEstablecimiento: 'CONDICION ESTABLECIMIENTO',
            CondicionServicio: 'CONDICION SERVICIO',
            GrupoEtario: 'GRUPO ETARIO',
            LineaDeNegocio: 'LINEA DE NEGOCIO',
            Modalidad: 'MODALIDAD',
            LnInicial: 'LN INICIAL',
            Serie: 'SERIE',
            Numero: 'NUMERO',
            Usuario: 'USER'
        });

        const fileName = `Reporte_RH_${fecha_ini}_a_${fecha_fin}.xlsx`;
        const filePath = path.join(__dirname, 'excel', fileName);
        const sheets = [
            { sheetName: 'Ambulatorios', data: jsonDataAmbu },
            { sheetName: 'Imagenes', data: jsonDataImagen },
            { sheetName: 'Procedimientos', data: jsonDataProce },
        ];
        jsonToExcel(sheets, filePath);

        const logData = {
            fecha_ini,
            fecha_fin,
            totalFilteredResult: filteredResult.length,
            totalresultHema: resultHema.length,
            totalCombinedResults: combinedResults.length,
            resultAmbu: resultAmbu.length,
            resultImagen: resultImagen.length
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




