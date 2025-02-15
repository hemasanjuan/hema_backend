import { join } from 'path'
import { exampleData, leerExcelTarifario, logTxt, modificarExcelTarifario, Negociacion } from './src/query/utils';

async function main() {
    const fileName = `Tarifario_Negociaciones_2025.xlsx`;
    const filePath = join(__dirname, 'excel', fileName);
    const sheetName = ''; // Dejar vacío para leer todas las hojas || Escribir el nombre de la hoja a leer

    try {
        const jsonData: Negociacion[] = await leerExcelTarifario(filePath, sheetName) as Negociacion[];

        logTxt({
            result: jsonData.length,
            jsonData
        });

        // Modificar el archivo Excel
        await modificarExcelTarifario(filePath, exampleData);
    } catch (error) {
        console.error('Error en la función principal:', error);
    }
}

main();


