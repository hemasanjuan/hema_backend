import * as XLSX from 'xlsx'
import { writeFile, writeFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'
import path from 'path'

const prisma = new PrismaClient()

interface SheetData {
    sheetName: string
    data: any[]
}

export interface DetalleTarifario {
    item_tarifario: number;
    cod_tarifario: number;
    desc_tarifario: string;
    preciodet_dscto: number;
    precio_final: number;
    tpmov: number;
    inafecto_coaseguro: number;
    pfijo: string;
    precio_virtual: string;
}

export interface Negociacion {
    cod_negociacion: number;
    desc_negociacion: string;
    detalle_Tarifario: DetalleTarifario[];
}

export const logTxt = (logData: any) => {
    writeFileSync(path.join(__dirname, 'excel', 'prod.log'), JSON.stringify(logData, null, 2))
}

export const jsonToExcel = (sheets: SheetData[], fileName: string): void => {
    const workbook = XLSX.utils.book_new()

    sheets.forEach(sheet => {
        const worksheet = XLSX.utils.json_to_sheet(sheet.data)
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName)

        // Aplicar estilo a la cabecera
        const range = XLSX.utils.decode_range(worksheet['!ref']!)
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + "1" // Primera fila (cabecera)
            if (!worksheet[address]) continue
            worksheet[address].s = {
                font: {
                    bold: true,
                    color: { rgb: "FFFFFF" }
                },
                fill: {
                    fgColor: { rgb: "4F81BD" }
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                }
            }
        }
    })

    // Escribir el libro de trabajo en un archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
    writeFile(fileName, excelBuffer, (err) => {
        if (err) {
            console.error('Error al guardar el archivo Excel:', err)
        } else {
            console.log(`Archivo Excel "${fileName}" creado exitosamente.`)
        }
    })
}

export async function fetchData(query: string) {
    try {
        return await prisma.$queryRawUnsafe<any[]>(query)
    } catch (error) {
        console.error('Error fetching data:', error)
        throw error
    }
}

export function mapData(result: any[], mappings: { [key: string]: string }) {
    return result.map(row => {
        const mappedRow: { [key: string]: any } = {}
        for (const [key, value] of Object.entries(mappings)) {
            mappedRow[key] = value === 'FECHA ATENCION' ? convertDate(String(row[value])) : row[value]
        }
        return mappedRow
    })
}

export function convertDate(fecha: string): Date {
    return new Date(fecha.split('/').reverse().join('-'))
}

export async function leerExcelSegus(filePath: string, sheetName: string) {
    try {        
        const workbook = XLSX.readFile(filePath)
        const worksheet = workbook.Sheets[sheetName]
        if (!worksheet) {
            throw new Error(`La hoja "${sheetName}" no existe en el archivo.`)
        }
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        return jsonData
    } catch (error) {
        console.error('Error al leer el archivo Excel:', error)
        throw error
    }
}

export async function leerExcelTarifario(filePath: string, sheetName?: string) {
    try {
        const workbook = XLSX.readFile(filePath)
        const sheets = sheetName ? [sheetName] : workbook.SheetNames
        const result: Negociacion[] = []

        sheets.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName]
            if (!worksheet) {
                throw new Error(`La hoja "${sheetName}" no existe en el archivo.`)
            }

            const desc_negociacion = worksheet['B1'] ? worksheet['B1'].v : ''
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).slice(2) // Omitir la primera fila

            const detalle_Tarifario = jsonData.map((row: any) => ({
                item_tarifario: row[0],
                cod_tarifario: row[1],
                desc_tarifario: row[2],
                preciodet_dscto: row[3],
                precio_final: row[4],
                tpmov: row[5],
                inafecto_coaseguro: row[6],
                pfijo: row[7],
                precio_virtual: row[8],
            }))

            result.push({
                cod_negociacion: parseInt(sheetName),
                desc_negociacion,
                detalle_Tarifario
            })
        })

        // Ordenar el resultado por cod_negociacion en orden ascendente
        result.sort((a, b) => a.cod_negociacion - b.cod_negociacion)

        return result
    } catch (error) {
        console.error('Error al leer el archivo Excel:', error)
        throw error
    }
}

export async function modificarExcelTarifario(filePath: string, data: Negociacion[]) {
    try {
        const workbook = XLSX.readFile(filePath)

        data.forEach(item => {
            const sheetName = `${item.cod_negociacion}`
            let worksheet = workbook.Sheets[sheetName]

            // Crear una nueva hoja si no existe
            if (!worksheet) {
                worksheet = XLSX.utils.aoa_to_sheet([])
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
            }

            // Agregar nombre en la celda 1A
            worksheet['A1'] = { v: 'Negociacion' }
            worksheet['B1'] = { v: `${item.desc_negociacion}` }

            // Agregar cabecera de la tabla en la fila 2A
            const headers = [
                'item_tarifario', 'cod_tarifario', 'desc_tarifario',
                'preciodet_dscto', 'precio_final', 'tpmov', 'inafecto_coaseguro', 'pfijo', 'precio_virtual'
            ]
            XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A2' })

            // Agregar datos de ejemplo en la fila 3A
            const negociacion = item.detalle_Tarifario.map(detalle => [
                detalle.item_tarifario, detalle.cod_tarifario, detalle.desc_tarifario,
                detalle.preciodet_dscto, detalle.precio_final, detalle.tpmov, detalle.inafecto_coaseguro, detalle.pfijo, detalle.precio_virtual
            ])
            XLSX.utils.sheet_add_aoa(worksheet, negociacion, { origin: 'A3' })
        })

        // Escribir el archivo Excel
        XLSX.writeFile(workbook, filePath)
        console.log(`Hojas modificadas con éxito.`)
    } catch (error) {
        console.error('Error al modificar el archivo Excel:', error)
        throw error
    }
}

// Datos de ejemplo
export const exampleData: Negociacion[] = [
    {
        cod_negociacion: 1,
        desc_negociacion: 'Negociación 1',
        detalle_Tarifario: [
            {
                item_tarifario: 1,
                cod_tarifario: 314,
                desc_tarifario: 'demo1',
                preciodet_dscto: 5.22,
                precio_final: 15,
                tpmov: 0,
                inafecto_coaseguro: 0,
                pfijo: 'null',
                precio_virtual: 'null'
            },
            {
                item_tarifario: 2,
                cod_tarifario: 134,
                desc_tarifario: 'demo2',
                preciodet_dscto: 5.22,
                precio_final: 15,
                tpmov: 0,
                inafecto_coaseguro: 0,
                pfijo: 'null',
                precio_virtual: 'null'
            },
            {
                item_tarifario: 3,
                cod_tarifario: 13,
                desc_tarifario: 'demo3',
                preciodet_dscto: 5.22,
                precio_final: 25,
                tpmov: 0,
                inafecto_coaseguro: 0,
                pfijo: 'null',
                precio_virtual: 'null'
            },
            {
                item_tarifario: 4,
                cod_tarifario: 12,
                desc_tarifario: 'demo4',
                preciodet_dscto: 5.22,
                precio_final: 2,
                tpmov: 0,
                inafecto_coaseguro: 0,
                pfijo: 'null',
                precio_virtual: 'null'
            },
            {
                item_tarifario: 5,
                cod_tarifario: 44,
                desc_tarifario: 'demo5',
                preciodet_dscto: 5.22,
                precio_final: 5,
                tpmov: 1,
                inafecto_coaseguro: 0,
                pfijo: 'null',
                precio_virtual: 'null'
            }
        ]
    }, {
        cod_negociacion: 3,
        desc_negociacion: 'Negociación 2',
        detalle_Tarifario: [
            {
                item_tarifario: 1,
                cod_tarifario: 314,
                desc_tarifario: 'demo1',
                preciodet_dscto: 5.22,
                precio_final: 15,
                tpmov: 0,
                inafecto_coaseguro: 0,
                pfijo: 'null',
                precio_virtual: 'null'
            },
            {
                item_tarifario: 2,
                cod_tarifario: 134,
                desc_tarifario: 'demo2',
                preciodet_dscto: 5.22,
                precio_final: 15,
                tpmov: 0,
                inafecto_coaseguro: 0,
                pfijo: 'null',
                precio_virtual: 'null'
            },
            {
                item_tarifario: 3,
                cod_tarifario: 13,
                desc_tarifario: 'demo3',
                preciodet_dscto: 5.22,
                precio_final: 25,
                tpmov: 0,
                inafecto_coaseguro: 0,
                pfijo: 'null',
                precio_virtual: 'null'
            },
            {
                item_tarifario: 4,
                cod_tarifario: 12,
                desc_tarifario: 'demo4',
                preciodet_dscto: 5.22,
                precio_final: 2,
                tpmov: 0,
                inafecto_coaseguro: 0,
                pfijo: 'null',
                precio_virtual: 'null'
            },
            {
                item_tarifario: 5,
                cod_tarifario: 44,
                desc_tarifario: 'demo5',
                preciodet_dscto: 5.22,
                precio_final: 5,
                tpmov: 1,
                inafecto_coaseguro: 0,
                pfijo: 'null',
                precio_virtual: 'null'
            }
        ]
    }
]

export const datosPrueba: Negociacion[] = [
    {
        "cod_negociacion": 29,
        "desc_negociacion": "PARTICULAR",
        "detalle_Tarifario": [
            {
                "item_tarifario": 1,
                "cod_tarifario": 4691,
                "desc_tarifario": "BLANQUEAMIENTO DENTAL EXTERNO POR ARCADA ",
                "preciodet_dscto": 0,
                "precio_final": 152.5423729,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2255,
                "desc_tarifario": "AGLUTINACIONES EN LAMINA",
                "preciodet_dscto": 23.638,
                "precio_final": 18.64406779661017,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5191,
                "desc_tarifario": "RX  TEMPORAL MASTOIDES PEÑASCO (4 INCIDENCIAS) BILATERAL F-P",
                "preciodet_dscto": -280.711,
                "precio_final": 39.4,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5122,
                "desc_tarifario": "RX RODILLAS COMPARATIVAS (4P)",
                "preciodet_dscto": 0,
                "precio_final": 76.271,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5123,
                "desc_tarifario": "RX TOBILLO AP + LAT (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1558,
                "desc_tarifario": "ECO-DOPPLER COLOR - ARTERIO-VENOSO EXTREMIDADES BILATERAL",
                "preciodet_dscto": 8.332,
                "precio_final": 305.0796610169492,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2538,
                "desc_tarifario": "ECOGRAFIA OBSTETRICA DEL II TRIMESTRE",
                "preciodet_dscto": -100,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2539,
                "desc_tarifario": "ECOGRAFIA OBSTETRICA DEL III TRIMESTRE",
                "preciodet_dscto": -100,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 31,
                "desc_tarifario": "APLICACION DE INYECTABLE INTRAMUSCULAR",
                "preciodet_dscto": 0,
                "precio_final": 2.54,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4845,
                "desc_tarifario": "TOMOGRAFIA - ANGIOTEM ",
                "preciodet_dscto": 20.551,
                "precio_final": 800,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4769,
                "desc_tarifario": "TERAPIA COMBINADA",
                "preciodet_dscto": -80.002,
                "precio_final": 21.1864406779661,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4885,
                "desc_tarifario": "ELECTROCAUTERIZACION NASAL",
                "preciodet_dscto": 0,
                "precio_final": 127.12,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2998,
                "desc_tarifario": "TOMOGRAFIA ABDOMEN SUPERIOR (HIGADO - BAZO - PANCREAS - RIÑONES -SUPRARRENAL) CON CONTRASTE IONICO",
                "preciodet_dscto": -21.218,
                "precio_final": 222.6371732260845,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1018,
                "desc_tarifario": "EXTRACCION DE CRISTALINO - CATARATA / LESIONES TRAUMATICAS - UNILATERAL",
                "preciodet_dscto": -14.291,
                "precio_final": 593.2203389830509,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2546,
                "desc_tarifario": "ECOGRAFIA PROSTATICA",
                "preciodet_dscto": -100,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1559,
                "desc_tarifario": "ECO-DOPPLER COLOR - ARTERIO-VENOSO EXTREMIDADES UNILATERAL",
                "preciodet_dscto": -83.336,
                "precio_final": 152.54,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3426,
                "desc_tarifario": "RETIRO DE YESO -  GRANDE",
                "preciodet_dscto": -21.212,
                "precio_final": 27.96610169491526,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3427,
                "desc_tarifario": "RETIRO DE YESO - PEQUEÑO",
                "preciodet_dscto": 54.546,
                "precio_final": 18.64406779661017,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1553,
                "desc_tarifario": "ECO-DOPPLER COLOR - VENOSO EXTREMIDADES BILATERAL",
                "preciodet_dscto": 0,
                "precio_final": 279.6610169491526,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4832,
                "desc_tarifario": "ALQUILER ARCO EN \"C\" X 4 ",
                "preciodet_dscto": 0,
                "precio_final": 169.4915254237288,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2545,
                "desc_tarifario": "ECOGRAFIA DE CADERA - LACTANTES",
                "preciodet_dscto": -100,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 78,
                "desc_tarifario": "ESTENOSCOPIO - ARCO EN \"C\" ",
                "preciodet_dscto": -11.11,
                "precio_final": 152.542372881356,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3191,
                "desc_tarifario": "HONORARIOS POR EXAMENES RADIOLOGICOS",
                "preciodet_dscto": 0,
                "precio_final": 350,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3401,
                "desc_tarifario": "TERAPIA DE LENGUAJE ADULTOS",
                "preciodet_dscto": -53.846,
                "precio_final": 22.03389830508475,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1759,
                "desc_tarifario": "NEBULIZACION - CON PRESION POSITIVA INTERMITENTE - POR APLICACION",
                "preciodet_dscto": 27.28,
                "precio_final": 9.322033898305085,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3421,
                "desc_tarifario": "TEST DE EMBARAZO EN SANGRE",
                "preciodet_dscto": 73.964,
                "precio_final": 18.64406779661017,
                "tpmov": 1,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 173,
                "desc_tarifario": "HONORARIOS PRIMER AYUDANTE (25 % DEL HONORARIO DEL CIRUJANO)",
                "preciodet_dscto": -26.981,
                "precio_final": 196.88,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4818,
                "desc_tarifario": "HIDROTERAPIA - CORRIENTE - KINESICA",
                "preciodet_dscto": -0.001,
                "precio_final": 38.13559322033898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4868,
                "desc_tarifario": "INFILTRACIÓN (KENACORT) ",
                "preciodet_dscto": 0,
                "precio_final": 67.8,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2340,
                "desc_tarifario": "BRUCELLA - ROSA DE BENGALA",
                "preciodet_dscto": 0,
                "precio_final": 46.61016949152543,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3488,
                "desc_tarifario": "ECOGRAFIA DOPPLER COLOR ARTERIAL DE VASOS DE CUELLO (BILATERAL)",
                "preciodet_dscto": 0,
                "precio_final": 169.4915254237288,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2890,
                "desc_tarifario": "DENSITOMETRIA OSEA - ESTUDIO COMPLETO",
                "preciodet_dscto": 0,
                "precio_final": 84.7457627118644,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3690,
                "desc_tarifario": "ENDOSCOPIA ALTA",
                "preciodet_dscto": 0,
                "precio_final": 228.81359,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3639,
                "desc_tarifario": "ECOGRAFIA RENO VESICO PROSTATICA",
                "preciodet_dscto": -185.714,
                "precio_final": 29.661,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 983,
                "desc_tarifario": "BLEFAROPLASTIA ENTROPION / ECTROPION - BILATERAL",
                "preciodet_dscto": 42.448,
                "precio_final": 589,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2497,
                "desc_tarifario": "ECOGRAFIA DE TIROIDES",
                "preciodet_dscto": -100,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3377,
                "desc_tarifario": "TERAPIA KINESICA",
                "preciodet_dscto": -4615.28,
                "precio_final": 21.1864406779661,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 32,
                "desc_tarifario": "APLICACION DE INYECTABLE ENDOVENOSO",
                "preciodet_dscto": -42.856,
                "precio_final": 5.932203389830509,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4794,
                "desc_tarifario": "NEUROPSICOLOGIA",
                "preciodet_dscto": -0.005,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4874,
                "desc_tarifario": "IPL ACNE /IPL ROSÁCEA ",
                "preciodet_dscto": 0,
                "precio_final": 101.69,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4861,
                "desc_tarifario": "TRATAMIENTO PLASMA (PRP) ",
                "preciodet_dscto": 0,
                "precio_final": 169.49,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4862,
                "desc_tarifario": "DEPILACIÓN LÁSER POR ZONA ",
                "preciodet_dscto": 0,
                "precio_final": 127.12,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3413,
                "desc_tarifario": "TERAPIA NEUROPSICOLOGICA CC NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 29.6610169491525,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4788,
                "desc_tarifario": "TERAPIA KINESICA - COMPRESAS - MAGNETO",
                "preciodet_dscto": -0.001,
                "precio_final": 38.13559322033898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5190,
                "desc_tarifario": "ASPIRADO DE MEDULA OSEA",
                "preciodet_dscto": 0,
                "precio_final": 288.1359,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5106,
                "desc_tarifario": "RX COLUMNA LUMBAR (FUNCIONAL)",
                "preciodet_dscto": 42.857,
                "precio_final": 118.644,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5108,
                "desc_tarifario": "RX SACRO COXIGEA (PURGADO) (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5113,
                "desc_tarifario": "RX COLUMNA CERVICAL (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5109,
                "desc_tarifario": "RX COLUMNA LUMBO SACRA (PURGADO) (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5119,
                "desc_tarifario": "RX FEMUR O MUSLO (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5121,
                "desc_tarifario": "RX RODILLA AP Y LATERAL (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5114,
                "desc_tarifario": "RX TORAX FRENTE LATERAL (2P)",
                "preciodet_dscto": 0,
                "precio_final": 76.271,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5124,
                "desc_tarifario": "RX PIERNA (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3343,
                "desc_tarifario": "RX PELVIS NIÑO AP ",
                "preciodet_dscto": -83.333,
                "precio_final": 25.4237288135593,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4808,
                "desc_tarifario": "CARNET DE AFILICION ",
                "preciodet_dscto": -8.334,
                "precio_final": 59.32203389830509,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4924,
                "desc_tarifario": "APICOGENESIS - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 42.373,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4921,
                "desc_tarifario": "PULPECTOMÍA ANTERIOR (NECROSIS) - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 169.492,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4889,
                "desc_tarifario": "TORACOCENTESIS + DRENAJE PELURAL",
                "preciodet_dscto": 15.253,
                "precio_final": 300,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4923,
                "desc_tarifario": "PULPECTOMÍA TIPO 3 (POSTERIOR) - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 237.288,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5169,
                "desc_tarifario": "PAQUETE PRE QX BASICO(EKG + RIESGO)",
                "preciodet_dscto": 0,
                "precio_final": 84.74576271,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3159,
                "desc_tarifario": "ECOGRAFIA ABDOMINAL SUPERIOR COMPLETO",
                "preciodet_dscto": -100.004,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4933,
                "desc_tarifario": "PLACAS PALATINAS (PALADAR FISURADO)",
                "preciodet_dscto": 0,
                "precio_final": 169.492,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4925,
                "desc_tarifario": "REVASCULARIZACION - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 50.847,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4912,
                "desc_tarifario": "RESTAURACIÓN ANTERIOR CON IONOMERO SIMPLE - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 25.424,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4910,
                "desc_tarifario": "RESTAURACIÓN ANTERIOR CON GIOMERO COMPUESTA - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 67.797,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4913,
                "desc_tarifario": "RESTAURACIÓN POSTERIOR CON IONOMERO SIMPLE - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 25.424,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2576,
                "desc_tarifario": "RX  SENOS PARANASALES (3 PLACAS)",
                "preciodet_dscto": -96.432,
                "precio_final": 23.72881355932203,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4890,
                "desc_tarifario": "BIOPSIA PLEURAL",
                "preciodet_dscto": 15.255,
                "precio_final": 400,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3559,
                "desc_tarifario": "FRENECTOMIA LINGUAL",
                "preciodet_dscto": -59.091,
                "precio_final": 186.4406779661017,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4948,
                "desc_tarifario": "RESTAURACIÓN ANTERIOR COMPUESTA CON IONOMERO",
                "preciodet_dscto": 0,
                "precio_final": 42.37,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4939,
                "desc_tarifario": "MACROABRASIÓN",
                "preciodet_dscto": 0,
                "precio_final": 127.119,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4938,
                "desc_tarifario": "MICROABRASIÓN",
                "preciodet_dscto": 0,
                "precio_final": 84.746,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2921,
                "desc_tarifario": "RECUBRIMIENTO PULPAR INDIRECTO, POR FRACTURA DE ESMALTE Y DENTINA CON PROXIMIDAD A CAMARA PULPAR",
                "preciodet_dscto": -100.001,
                "precio_final": 42.37288135593221,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4946,
                "desc_tarifario": "RESTAURACIÓN ANTERIOR SIMPLE CON IONOMERO.",
                "preciodet_dscto": 0,
                "precio_final": 33.89,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4944,
                "desc_tarifario": "RESTAURACIÓN ANTERIOR COMPUESTA CON RESINA",
                "preciodet_dscto": 0,
                "precio_final": 59.32,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4901,
                "desc_tarifario": "EXAMEN ODONTOLOGICO COMPLETO",
                "preciodet_dscto": 0,
                "precio_final": 42.37,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4943,
                "desc_tarifario": "RESTAURACION POSTERIOR SIMPLE CON RESINA",
                "preciodet_dscto": 0.006,
                "precio_final": 50.85,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4909,
                "desc_tarifario": "RESTAURACIÓN POSTERIOR CON GIOMERO SIMPLE - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 76.27,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4911,
                "desc_tarifario": "RESTAURACIÓN POSTERIOR CON GIOMERO COMPUESTA - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 84.746,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4931,
                "desc_tarifario": "CORONA DE ACETATO - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 67.797,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4935,
                "desc_tarifario": "RECUBRIMIENTOS PULPARES DIRECTOS",
                "preciodet_dscto": 0,
                "precio_final": 84.746,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4934,
                "desc_tarifario": "SEDACIÓN CONSCIENTE",
                "preciodet_dscto": 0,
                "precio_final": 254.237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4863,
                "desc_tarifario": "DRENAJE LINFÁTICO - POSTCIRUGÍA ",
                "preciodet_dscto": 0,
                "precio_final": 508.47,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 991,
                "desc_tarifario": "EXTRACCION DE CUERPO EXTRAÑO / SUTURA EN LA CONJUNTIVA",
                "preciodet_dscto": -13.906,
                "precio_final": 148.8,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4864,
                "desc_tarifario": "MADERO TERAPIA ",
                "preciodet_dscto": 0,
                "precio_final": 127.12,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4865,
                "desc_tarifario": "LIPODRENAJE ",
                "preciodet_dscto": 0,
                "precio_final": 677.97,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4866,
                "desc_tarifario": "LASER DE CO2 ",
                "preciodet_dscto": 0,
                "precio_final": 762.71,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4937,
                "desc_tarifario": "SELLANTE (GIÓMERO)",
                "preciodet_dscto": 0.007,
                "precio_final": 42.373,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4951,
                "desc_tarifario": "EXODONCIA COMPUESTA",
                "preciodet_dscto": 0,
                "precio_final": 67.796,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 795,
                "desc_tarifario": "EXTRACCION DE MATERIAL DE OSTEOSINTESIS - CLAVO SUPERFICIAL / PERCUTANEO",
                "preciodet_dscto": -41.4,
                "precio_final": 179.8,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4786,
                "desc_tarifario": "TERAPIA KINESICA - COMPRESAS - ULTRASONIDO",
                "preciodet_dscto": -0.001,
                "precio_final": 38.13559322033898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3022,
                "desc_tarifario": "CULTIVO DE SECRECION",
                "preciodet_dscto": 0,
                "precio_final": 33.05084745762712,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2652,
                "desc_tarifario": "RX  MANO F/O (2 P)",
                "preciodet_dscto": -66.667,
                "precio_final": 27.96610169491526,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3526,
                "desc_tarifario": "EVALUACION DE HOMBRO",
                "preciodet_dscto": -249.988,
                "precio_final": 8.474576271186441,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3402,
                "desc_tarifario": "TERAPIA DE LENGUAJE NIÑOS",
                "preciodet_dscto": 0,
                "precio_final": 16.94915254237288,
                "tpmov": 0,
                "inafecto_coaseguro": 1,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2615,
                "desc_tarifario": "RX  BRAZO - HUMERO (2 PLACAS)",
                "preciodet_dscto": -96.429,
                "precio_final": 23.72881355932203,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4236,
                "desc_tarifario": "CLART PNEUMOVIR (HISOPADO NASOFARINGEO).",
                "preciodet_dscto": 95.294,
                "precio_final": 720.3389831,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3467,
                "desc_tarifario": "TERAPIA MIOFACIAL",
                "preciodet_dscto": -6.057,
                "precio_final": 27.96610169491526,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3067,
                "desc_tarifario": "TOMOGRAFIA CEREBRAL CON CONTRASTE",
                "preciodet_dscto": 7.217,
                "precio_final": 411.0169491525424,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4831,
                "desc_tarifario": "ELECTROCARDIOGRAMA PAQUETE QUIRURGICO",
                "preciodet_dscto": 0,
                "precio_final": 16.95,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1567,
                "desc_tarifario": "ECOCARDIOGRAMA DOPPLER COLOR - PEDIATRICO",
                "preciodet_dscto": -27.783,
                "precio_final": 152.54,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4800,
                "desc_tarifario": "PRUEBA DE ESFUERZO CARDIOLOGIA",
                "preciodet_dscto": -53.845,
                "precio_final": 110.1694915254237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3411,
                "desc_tarifario": "INFORME DE NEUROPSICOLOGIA",
                "preciodet_dscto": -53.854,
                "precio_final": 22.03389830508475,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3066,
                "desc_tarifario": "TOMOGRAFIA CEREBRAL SIN CONTRASTE",
                "preciodet_dscto": 22.857,
                "precio_final": 296.610169491525,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4787,
                "desc_tarifario": "TERAPIA KINESICA - COMPRESAS - LASER",
                "preciodet_dscto": -0.001,
                "precio_final": 38.13559322033898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3550,
                "desc_tarifario": "TERAPIA DE VOZ O FONOTERAPIA",
                "preciodet_dscto": -100.01,
                "precio_final": 33.898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4919,
                "desc_tarifario": "PULPOTOMÍA (CON BIODENTINA) - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 152.542,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4920,
                "desc_tarifario": "PULPECTOMÍA ANTERIOR - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 135.593,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4953,
                "desc_tarifario": "EXODONCIA TERCERAS MOLARES+ OSTEOTOMIA",
                "preciodet_dscto": 0,
                "precio_final": 211.864,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4669,
                "desc_tarifario": "APLICACIÓN DE FLÚOR BARNIZ",
                "preciodet_dscto": 58.333,
                "precio_final": 101.6949153,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4942,
                "desc_tarifario": "RESTAURACIÓN FOTOCURABLE DE UNA SUPERFICIE CON RESINA EN PIEZAS DENTARIAS ANTERIORES (PRIMARIAS O PERMANENTES)",
                "preciodet_dscto": 0,
                "precio_final": 42.37,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4940,
                "desc_tarifario": "INACTIVACIÓN DE CARIES ",
                "preciodet_dscto": 0,
                "precio_final": 25.424,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4947,
                "desc_tarifario": "RESTAURACIÓN POSTERIOR SIMPLE CON IONOMERO",
                "preciodet_dscto": 0,
                "precio_final": 33.89,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4949,
                "desc_tarifario": "RESTAURACIÓN POSTERIOR COMPUESTA CON IONOMERO",
                "preciodet_dscto": 0,
                "precio_final": 42.37,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4950,
                "desc_tarifario": "EXODONCIA SIMPLE",
                "preciodet_dscto": 0,
                "precio_final": 42.37,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3033,
                "desc_tarifario": "PRUEBA DE HEMOGLUCOTEST",
                "preciodet_dscto": 15.255,
                "precio_final": 10,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1746,
                "desc_tarifario": "ESPIROMETRIA CON CAPACIDAD VITAL, FLUJO EN UN SEGUNDO, FLUJO ENTRE 25%-75%, VENTILACION VOLUNTARIA MAXIMA Y VOLUMEN TIDAL",
                "preciodet_dscto": -66.667,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1427,
                "desc_tarifario": "AUDIOMETRIA",
                "preciodet_dscto": 0,
                "precio_final": 50.84745762711864,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4954,
                "desc_tarifario": "DIENTE RETENIDO",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3548,
                "desc_tarifario": "TERAPIA DE MOTRICIDAD OROFACIAL EN ADULTOS",
                "preciodet_dscto": -14.295,
                "precio_final": 29.66,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4956,
                "desc_tarifario": "ENDODONCIA RETRATAMIENTO UNIRADICULAR",
                "preciodet_dscto": 0,
                "precio_final": 186.44,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3479,
                "desc_tarifario": "ENDODONCIA MULTIRADICULAR",
                "preciodet_dscto": -8.333,
                "precio_final": 203.3898305084746,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4957,
                "desc_tarifario": "PERNOS DENTALES FIBRA DE VIDRIO",
                "preciodet_dscto": 0,
                "precio_final": 110.169,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4960,
                "desc_tarifario": "PROTESIS PARCIAL",
                "preciodet_dscto": 0,
                "precio_final": 593.22,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5182,
                "desc_tarifario": "SERV. DE ESTERILIZACION CAJA GRANDE",
                "preciodet_dscto": 0,
                "precio_final": 42.37288135593221,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4966,
                "desc_tarifario": "PRÓTESIS INMEDIATA MANDIBULAR",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4967,
                "desc_tarifario": "PROTESIS REMOVIBLE PARCIAL MAXILAR BASE DE ACRÍLICO (TERMOCURADO)",
                "preciodet_dscto": 0,
                "precio_final": 508.474,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4968,
                "desc_tarifario": "PRÓTESIS REMOVIBLE PARCIAL MANDIBULAR BASE DE ACRÍLICO (TERMOCURADO)",
                "preciodet_dscto": 0,
                "precio_final": 0,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4973,
                "desc_tarifario": "INCRUSTACION RESINA",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5185,
                "desc_tarifario": "SERV. DE ESTERILIZACION CAJA MEDIANA",
                "preciodet_dscto": 15.254,
                "precio_final": 40,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5186,
                "desc_tarifario": "SERV. DE ESTERILIZACION CAJA PEQUEÑA",
                "preciodet_dscto": -0.001,
                "precio_final": 25.42372881355932,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5187,
                "desc_tarifario": "SERV. DE ESTERILIZACION CAJA GRANDE SIN EMPAQUETADO",
                "preciodet_dscto": 15.254,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5188,
                "desc_tarifario": "SERV. DE ESTERILIZACION CAJA MEDIANA SIN EMPAQUETADO",
                "preciodet_dscto": 15.254,
                "precio_final": 50,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5189,
                "desc_tarifario": "SERV. DE ESTERILIZACION CAJA PEQUEÑA SIN EMPAQUETADO",
                "preciodet_dscto": 15.254,
                "precio_final": 35,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4969,
                "desc_tarifario": "PRÓTESIS REMOVIBLE PARCIAL MAXILAR BASE METÁLICA ",
                "preciodet_dscto": 0,
                "precio_final": 677.966,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4970,
                "desc_tarifario": "PRÓTESIS REMOVIBLE PARCIAL MANDIBULAR BASE METÁLICA ",
                "preciodet_dscto": 0,
                "precio_final": 677.966,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4975,
                "desc_tarifario": "INCRUSTACION EN IMAX-ZIRCONIO",
                "preciodet_dscto": 0,
                "precio_final": 423.728,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4867,
                "desc_tarifario": "EXTRACCIÓN DE LUNARES Y VERRUGAS X 1 ",
                "preciodet_dscto": 0,
                "precio_final": 127.12,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2937,
                "desc_tarifario": "ECOGRAFIA DE RIÑONES",
                "preciodet_dscto": -25,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2939,
                "desc_tarifario": "ECOGRAFIA DE VEJIGA Y RIÑONES",
                "preciodet_dscto": -25,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3552,
                "desc_tarifario": "ENDODONCIA TRIRADICULAR",
                "preciodet_dscto": 0,
                "precio_final": 220,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5104,
                "desc_tarifario": "RX PANORAMICO MMII",
                "preciodet_dscto": 0,
                "precio_final": 135.593,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5171,
                "desc_tarifario": "EXODONCIA",
                "preciodet_dscto": 0,
                "precio_final": 42.37288136,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3264,
                "desc_tarifario": "PROTESIS TOTAL SUPERIOR",
                "preciodet_dscto": -48.305,
                "precio_final": 400,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1447,
                "desc_tarifario": "EXTRACCION DE CUERPO EXTRAÑO EN OIDO-NARIZ",
                "preciodet_dscto": 18.644,
                "precio_final": 52.08,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3465,
                "desc_tarifario": "EVALUACION SENSORIAL ESPECIALIZADA",
                "preciodet_dscto": 0,
                "precio_final": 46.61016949152543,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4886,
                "desc_tarifario": "REDUCCION DE FRACTURA NASAL ",
                "preciodet_dscto": 0,
                "precio_final": 211.86,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4791,
                "desc_tarifario": "EVALUACION EN PROBLEMAS DEL LENGUAJE",
                "preciodet_dscto": 0,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2382,
                "desc_tarifario": "REHABILITACION DEL LENGUAJE (DISFASIA / AFASIA) - POR SESION ",
                "preciodet_dscto": -118.729,
                "precio_final": 13.56016949152542,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1739,
                "desc_tarifario": "SANGRIA",
                "preciodet_dscto": -36.687,
                "precio_final": 50,
                "tpmov": 1,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1776,
                "desc_tarifario": "ELECTROENCEFALOGRAMA COMPUTARIZADO",
                "preciodet_dscto": 0,
                "precio_final": 296.610169491525,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3463,
                "desc_tarifario": "CERTIFICADO MEDICO",
                "preciodet_dscto": -0.002,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4772,
                "desc_tarifario": "RETIRO DE DIU - GINECOLOGIA",
                "preciodet_dscto": -200,
                "precio_final": 42.3728813559322,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3183,
                "desc_tarifario": "PROTESIS TOTAL INFERIOR",
                "preciodet_dscto": -97.74,
                "precio_final": 300,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4703,
                "desc_tarifario": "CORONA PROVISIONAL",
                "preciodet_dscto": -99.951,
                "precio_final": 16.94915254,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3260,
                "desc_tarifario": "CORONA IVOCRON",
                "preciodet_dscto": -33.332,
                "precio_final": 127.1186440677966,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4724,
                "desc_tarifario": "REBASE DE PRÓTESIS MAXILAR COMPLETA ",
                "preciodet_dscto": 0.001,
                "precio_final": 50.84745763,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2609,
                "desc_tarifario": "RX  CALCANEO F/P (2 P)",
                "preciodet_dscto": -66.667,
                "precio_final": 27.96610169491526,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4727,
                "desc_tarifario": "REBASE DE PRÓTESIS MANDIBULAR PARCIAL",
                "preciodet_dscto": 0.001,
                "precio_final": 50.84745763,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3412,
                "desc_tarifario": "TERAPIA NEUROPSICOLOGICA CC ADULTO",
                "preciodet_dscto": -14.286,
                "precio_final": 29.6610169491525,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1684,
                "desc_tarifario": "COLONOSCOPIA CORTA IZQUIERDA",
                "preciodet_dscto": -6.666,
                "precio_final": 254.2372881355932,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1685,
                "desc_tarifario": "COLONOSCOPIA LARGA DERECHA",
                "preciodet_dscto": -73.437,
                "precio_final": 271.1864,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4723,
                "desc_tarifario": "REMPLAZAR LOS DIENTES PERDIDOS O ROTOS",
                "preciodet_dscto": -66.655,
                "precio_final": 25.42372881,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4725,
                "desc_tarifario": "REBASE DE PRÓTESIS MANDIBULAR COMPLETA ",
                "preciodet_dscto": 0.001,
                "precio_final": 50.84745763,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4726,
                "desc_tarifario": "REBASE DE PRÓTESIS MAXILAR PARCIAL ",
                "preciodet_dscto": 0.001,
                "precio_final": 50.84745763,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4728,
                "desc_tarifario": "ACONDICIONAMIENTO DEL TEJIDO MAXILAR ",
                "preciodet_dscto": -0.001,
                "precio_final": 67.79661017,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4977,
                "desc_tarifario": "BRACKETS METALICOS",
                "preciodet_dscto": 0,
                "precio_final": 508.474,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4978,
                "desc_tarifario": "BIOMETRIA OFTALMOLOGICA",
                "preciodet_dscto": 0,
                "precio_final": 127.119,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4729,
                "desc_tarifario": "ACONDICIONAMIENTO DEL TEJIDO MANDIBULAR ",
                "preciodet_dscto": -0.001,
                "precio_final": 67.79661017,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4976,
                "desc_tarifario": "PROTESIS REMOVIBLE PARCIAL UNILATERAL - UNA PIEZA MOLDEADA DE METAL",
                "preciodet_dscto": 0,
                "precio_final": 84.745,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4979,
                "desc_tarifario": "BRACKETS AUTOLIGANTES",
                "preciodet_dscto": 0,
                "precio_final": 677.966,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4980,
                "desc_tarifario": "BRACKETS ESTETICOS OPCION 1(TD)",
                "preciodet_dscto": 0,
                "precio_final": 593.22,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4981,
                "desc_tarifario": "BRACKETS ESTETICOS OPCION 2 (AO)",
                "preciodet_dscto": 0,
                "precio_final": 847.457,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4982,
                "desc_tarifario": "BRACKETS DE ZAFIRO",
                "preciodet_dscto": 0,
                "precio_final": 1694.915,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4983,
                "desc_tarifario": "RETIRO DE BRACKETS",
                "preciodet_dscto": 0,
                "precio_final": 59.322,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4984,
                "desc_tarifario": "PLACA DE CONTENCION",
                "preciodet_dscto": 0,
                "precio_final": 101.694,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4985,
                "desc_tarifario": "RECEMENTADO DE BANDA",
                "preciodet_dscto": 0,
                "precio_final": 16.949,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4930,
                "desc_tarifario": "PERNO DE RESINA - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 67.797,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4926,
                "desc_tarifario": "APICOFORMACIÓN O APEXIFICACIÓN - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 50.847,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4929,
                "desc_tarifario": "PERNO DE FIBRA DE VIDRIO - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 84.746,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3252,
                "desc_tarifario": "OPERCULECTOMIA",
                "preciodet_dscto": 9.604,
                "precio_final": 75,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4914,
                "desc_tarifario": "RESTAURACIÓN ANTERIOR CON IONOMERO COMPUESTO - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 33.898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4922,
                "desc_tarifario": "PULPECTOMÍA TIPO 1 (POSTERIOR) - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 203.39,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4945,
                "desc_tarifario": "RESTAURACION POSTERIOR COMPUESTA CON RESINA.",
                "preciodet_dscto": 0,
                "precio_final": 67.796,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4986,
                "desc_tarifario": "COLOCACION DE BRACKET",
                "preciodet_dscto": 0,
                "precio_final": 33.898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4918,
                "desc_tarifario": "PULPOTOMÍA (CON FORMOCRESOL) - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 127.119,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4915,
                "desc_tarifario": "RESTAURACIÓN POSTERIOR CON IONOMERO COMPUESTO - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 33.898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4928,
                "desc_tarifario": "FERULIZACIÓN POR PUNTO (TRAUMATISMO) - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 50.847,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4916,
                "desc_tarifario": "EXODONCIA SIMPLE - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 42.373,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4936,
                "desc_tarifario": "SELLANTE (RESINOSO)",
                "preciodet_dscto": 0.024,
                "precio_final": 33.898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3247,
                "desc_tarifario": "FRENECTOMIA LABIAL, LINGUAL",
                "preciodet_dscto": -250,
                "precio_final": 84.74576271186442,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4941,
                "desc_tarifario": "TRA(TRATAMIENTO RESTAURADOR ATRAUMÁTICO)",
                "preciodet_dscto": 0,
                "precio_final": 84.746,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5174,
                "desc_tarifario": "ESTACIONAMIENTO",
                "preciodet_dscto": 0,
                "precio_final": 59.32203389830509,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4987,
                "desc_tarifario": "CONTENCION FIJA POST- TX ORTODONTICO",
                "preciodet_dscto": 0,
                "precio_final": 84.745,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5170,
                "desc_tarifario": "TEST DE LA UREASA",
                "preciodet_dscto": 0,
                "precio_final": 59.3220339,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4988,
                "desc_tarifario": "DIAGNOSTICO - TRATAMIENTO",
                "preciodet_dscto": 0,
                "precio_final": 42.372,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4917,
                "desc_tarifario": "EXODONCIA COMPUESTA - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 84.746,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4932,
                "desc_tarifario": "CORONA MANO ALZADA - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 84.746,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4990,
                "desc_tarifario": "ORTODONCIA PREVENTIVA - EXTRACCIONES SERIADAS",
                "preciodet_dscto": 0,
                "precio_final": 33.898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5002,
                "desc_tarifario": "ORTODONCIA PREVENTIVA - PROTECTOR BUCAL DEPORTIVO (COLOR)",
                "preciodet_dscto": 0,
                "precio_final": 279.661,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4952,
                "desc_tarifario": "EXODONCIA TERCERAS MOLARES",
                "preciodet_dscto": 0,
                "precio_final": 169.49,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2908,
                "desc_tarifario": "ENDODONCIA UNIRADICULAR (PIEZAS ANTERIORES)",
                "preciodet_dscto": -50,
                "precio_final": 101.6949152542373,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4958,
                "desc_tarifario": "PROTESIS TOTAL SUPERIOR MEJORADO",
                "preciodet_dscto": 0,
                "precio_final": 720.339,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5001,
                "desc_tarifario": "ORTODONCIA PREVENTIVA - PROTECTOR BUCAL DEPORTIVO",
                "preciodet_dscto": 0,
                "precio_final": 254.237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5003,
                "desc_tarifario": "ORTODONCIA PREVENTIVA - PROTECTOR BUCAL DEPORTIVO (BICOLOR)",
                "preciodet_dscto": 0,
                "precio_final": 313.559,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4991,
                "desc_tarifario": "TOMOGRAFIA OCULAR MACULA Y NERVIO OPTICO",
                "preciodet_dscto": 0,
                "precio_final": 296.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4959,
                "desc_tarifario": "PROTESIS TOTAL INFERIOR MEJORADO",
                "preciodet_dscto": 0,
                "precio_final": 720.339,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4961,
                "desc_tarifario": "CORONA DE CEROMERO",
                "preciodet_dscto": 0,
                "precio_final": 211.864,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4962,
                "desc_tarifario": "CORONA LIBRE DE METAL",
                "preciodet_dscto": 0,
                "precio_final": 550.847,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4955,
                "desc_tarifario": "ENDODONCIA RETRATAMIENTO MULTIRADICULAR",
                "preciodet_dscto": 0,
                "precio_final": 254.237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4963,
                "desc_tarifario": "CORONA DE METAL PORCELANA POR PIEZA DENTAL",
                "preciodet_dscto": 0,
                "precio_final": 296.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4964,
                "desc_tarifario": "CORONA DE EMAX POR PIEZA DENTAL",
                "preciodet_dscto": 0,
                "precio_final": 677.966,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4994,
                "desc_tarifario": "ORTODONCIA PREVENTIVA - PLACA GUIA",
                "preciodet_dscto": 0,
                "precio_final": 84.745,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5005,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - PLACA HAWLEY",
                "preciodet_dscto": 0,
                "precio_final": 254.237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4965,
                "desc_tarifario": "PROTESIS INMEDIATA MAXILAR",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5006,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - BOTON DE NANCE",
                "preciodet_dscto": 0,
                "precio_final": 254.237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5007,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - MANTENEDOR DE ESPACIO FIJO UNILATERAL",
                "preciodet_dscto": 0,
                "precio_final": 84.745,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5008,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - MANTENEDOR DE ESPACIO FIJO BILATERAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5027,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - REGANADOR DE ESPACIO",
                "preciodet_dscto": 0,
                "precio_final": 169.491,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4856,
                "desc_tarifario": "ALQUILER DE MICROSCOPIO ",
                "preciodet_dscto": 66.665,
                "precio_final": 254.2372881355932,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4993,
                "desc_tarifario": "TOMOGRAFIA OCULAR DE MACULA",
                "preciodet_dscto": 0,
                "precio_final": 211.864,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4971,
                "desc_tarifario": "REPARACIÓN DE FRACTURA DE BASE DE DENTADURA COMPLETA ",
                "preciodet_dscto": 0,
                "precio_final": 42.372,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5097,
                "desc_tarifario": "RX ANTEBRAZO (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4974,
                "desc_tarifario": "INCRUSTACION DE CEROMERO",
                "preciodet_dscto": 0,
                "precio_final": 186.44,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5094,
                "desc_tarifario": "RX HOMOPLATO AP",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5098,
                "desc_tarifario": "RX MANO (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5099,
                "desc_tarifario": "RX MANOS COMPARATIVOS (4P)",
                "preciodet_dscto": -63.637,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5101,
                "desc_tarifario": "INFORME RADIOLOGICO",
                "preciodet_dscto": 0,
                "precio_final": 14.399,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5102,
                "desc_tarifario": "RX PELVIS O CADERAS (ADULTOS)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5103,
                "desc_tarifario": "RX PANORAMICO DE COLUMNA",
                "preciodet_dscto": 0,
                "precio_final": 161.017,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1861,
                "desc_tarifario": "TIEMPO DE TROMBINA",
                "preciodet_dscto": 0,
                "precio_final": 87.28813559322035,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1906,
                "desc_tarifario": "GLUCOSA - TEST TOLERANCIA 2HRS",
                "preciodet_dscto": 40,
                "precio_final": 46.61016949152543,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3070,
                "desc_tarifario": "ECOGRAFIA RENAL VESICAL",
                "preciodet_dscto": -150,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 819,
                "desc_tarifario": "HONORARIOS DEL ANESTESIOLOGO EN SALA DE OPERACIONES - 30% DE HONORARIOS DEL CIRUJANO",
                "preciodet_dscto": -26.984,
                "precio_final": 236.25,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4872,
                "desc_tarifario": "NDYAG BORRADO DE TATUAJE X SESIÓN 1 ",
                "preciodet_dscto": 0,
                "precio_final": 127.12,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4992,
                "desc_tarifario": "TOMOGRAFIA OCULAR DE NERVIO OPTICO",
                "preciodet_dscto": 0,
                "precio_final": 211.864,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4995,
                "desc_tarifario": "FOTOGRAFIA RETINAL",
                "preciodet_dscto": 0,
                "precio_final": 127.119,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5012,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - MANTENEDOR DE ESPACIO REMOVIBLE POSTERIOR",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5024,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - MANTENEDOR DE ESPACIO REMOVIBLE ANTERIOR",
                "preciodet_dscto": 0,
                "precio_final": 152.542,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4989,
                "desc_tarifario": "TOMOGRAFIA OCULAR DE SEGMENTO ANTERIOR",
                "preciodet_dscto": 0,
                "precio_final": 169.492,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5039,
                "desc_tarifario": "BRACKETS AUTOLIGANTES MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5040,
                "desc_tarifario": "BRACKETS ESTETICOS OPCION 1(TD) MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 152.542,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5041,
                "desc_tarifario": "BRACKETS ESTETICOS OPCION 2 (AO) MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 152.542,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5042,
                "desc_tarifario": "BRACKETS DE ZAFIRO MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 211.864,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4998,
                "desc_tarifario": "ORTODONCIA PREVENTIVA - REHABILITACION NEUROOCLUSAL",
                "preciodet_dscto": 0,
                "precio_final": 423.728,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5004,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - PLACA SCHWARTZ",
                "preciodet_dscto": 0,
                "precio_final": 254.237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4997,
                "desc_tarifario": "APLICACION LASER FOTOCOAGULACION EN RETINA  POR SESION",
                "preciodet_dscto": 0,
                "precio_final": 423.729,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5009,
                "desc_tarifario": "CHALAZION SIMPLE",
                "preciodet_dscto": 0,
                "precio_final": 381.356,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5043,
                "desc_tarifario": "ORTODONCIA PREVENTIVA - PLACA GUIA MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 25.423,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5044,
                "desc_tarifario": "ORTODONCIA PREVENTIVA - REHABILITACION NEUROOCLUSAL MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5045,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - PLACA SCHWARTZ MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 67.796,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5046,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - PLACA HAWLEY MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 67.789,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4999,
                "desc_tarifario": "APLICACION LASER FOTOCOAGULACION EN RETINA  3 SESIONES",
                "preciodet_dscto": 0,
                "precio_final": 1016.949,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5038,
                "desc_tarifario": "BRACKETS METALICOS MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 84.745,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4996,
                "desc_tarifario": "PAQUIMETRIA ",
                "preciodet_dscto": 0,
                "precio_final": 127.119,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5047,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - BOTON DE NANCE MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 67.789,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5049,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - MANTENEDOR DE ESPACIO REMOVIBLE ANTERIOR MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 25.423,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5050,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - REGANADOR DE ESPACIO MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 25.423,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5055,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - PLANOS INCLINADOS (BITE PLAN) MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5057,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - PENDULO MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5058,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - DISYUNTOR MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5059,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - PROPULSOR MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5060,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - MASCARA FACIAL MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5010,
                "desc_tarifario": "CHALAZION MULTIPLE",
                "preciodet_dscto": 0,
                "precio_final": 593.22,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5011,
                "desc_tarifario": "CHALAZION NIÑOS",
                "preciodet_dscto": 0,
                "precio_final": 762.712,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5014,
                "desc_tarifario": "QUISTES DE PARPADO COMPLEJO",
                "preciodet_dscto": 0,
                "precio_final": 932.203,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5063,
                "desc_tarifario": "RADIOGRAFIA DE DIAGNOSTICO",
                "preciodet_dscto": 0,
                "precio_final": 12.71,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5048,
                "desc_tarifario": "ORTODONCIA INTERCEPTIVA - MANTENEDOR DE ESPACIO REMOVIBLE POSTERIOR MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 25.423,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5051,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - ACTIVADOR ABIERTO DE KLAMMT MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5052,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - APARATO FRANKL MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5056,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - QUAD HELIX MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5061,
                "desc_tarifario": "PLACA MIORELAJANTE",
                "preciodet_dscto": 0,
                "precio_final": 169.491,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5000,
                "desc_tarifario": "TOPOGRAFIA CORNEAL",
                "preciodet_dscto": 0,
                "precio_final": 211.864,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4721,
                "desc_tarifario": "AJUSTE DE PRÓTESIS PARCIAL MANDIBULAR ",
                "preciodet_dscto": 0.007,
                "precio_final": 42.37288136,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5071,
                "desc_tarifario": "RECUBRIMIENTOS PULPARES INDIRECTOS.",
                "preciodet_dscto": 0,
                "precio_final": 67.797,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5076,
                "desc_tarifario": "UROTEM CON CONTRASTE",
                "preciodet_dscto": 0,
                "precio_final": 720.338,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5080,
                "desc_tarifario": "COPIA DE INFORME MEDICO RADIOLOGICO",
                "preciodet_dscto": 0,
                "precio_final": 25.42,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5053,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - BLOQUES GEMELOS MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5054,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - BIONATOR DE WALTERS MENSUAL",
                "preciodet_dscto": 0,
                "precio_final": 127.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5062,
                "desc_tarifario": "PROFILAXIS DENTAL PARCIAL",
                "preciodet_dscto": 0,
                "precio_final": 67.797,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5065,
                "desc_tarifario": "RADIOGRAFIA DE CONDUCTOMETRIA",
                "preciodet_dscto": 0,
                "precio_final": 25.423,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5069,
                "desc_tarifario": "TOMA DE IMPRESION CON SILICONA",
                "preciodet_dscto": 0,
                "precio_final": 33.898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4719,
                "desc_tarifario": "AJUSTE DE PRÓTESIS COMPLETA MANDIBULAR ",
                "preciodet_dscto": 0.007,
                "precio_final": 42.37288136,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4720,
                "desc_tarifario": "AJUSTE DE PRÓTESIS PARCIAL MAXILAR ",
                "preciodet_dscto": 0.007,
                "precio_final": 42.37288136,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5013,
                "desc_tarifario": "QUISTES DE PARPADO SIMPLE",
                "preciodet_dscto": 0,
                "precio_final": 508.475,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5073,
                "desc_tarifario": "TOMOGRAFIA SIN CONTRASTE",
                "preciodet_dscto": 0,
                "precio_final": 254.237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5066,
                "desc_tarifario": "RADIOGRAFÍA BITEWING",
                "preciodet_dscto": 0,
                "precio_final": 25.42,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5081,
                "desc_tarifario": "COPIA DE PLACA POR UNIDAD",
                "preciodet_dscto": 0,
                "precio_final": 25.42,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5070,
                "desc_tarifario": "AJUSTE OCLUSAL",
                "preciodet_dscto": 0,
                "precio_final": 12.71,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5015,
                "desc_tarifario": "EXPLORACION VIA LAGRIMAL",
                "preciodet_dscto": 0,
                "precio_final": 381.356,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5074,
                "desc_tarifario": "ANGIOTEM",
                "preciodet_dscto": 0,
                "precio_final": 923.728,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5077,
                "desc_tarifario": "TRIFASICA",
                "preciodet_dscto": 0,
                "precio_final": 661.016,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5078,
                "desc_tarifario": "RECONSTRUCCIÓN 3D",
                "preciodet_dscto": 0,
                "precio_final": 84.745,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5079,
                "desc_tarifario": "VENTANA OSEA",
                "preciodet_dscto": 0,
                "precio_final": 84.745,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5064,
                "desc_tarifario": "RADIOGRAFÍA INTRAORAL PERIAPICAL",
                "preciodet_dscto": 0,
                "precio_final": 12.71,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5016,
                "desc_tarifario": "EXPLORACION VIA LAGRIMAL NIÑOS",
                "preciodet_dscto": 0,
                "precio_final": 720.339,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5067,
                "desc_tarifario": "RADIOGRAFÍA INTRAORAL OCLUSAL ",
                "preciodet_dscto": 0,
                "precio_final": 42.37,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5019,
                "desc_tarifario": "SUTURA DE HERIDAS DE PARPADO MODERADO",
                "preciodet_dscto": 0,
                "precio_final": 762.712,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5020,
                "desc_tarifario": "ENTROPION",
                "preciodet_dscto": 0,
                "precio_final": 932.203,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4718,
                "desc_tarifario": "AJUSTE DE PRÓTESIS COMPLETA MAXILAR ",
                "preciodet_dscto": 0.007,
                "precio_final": 42.37288136,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5082,
                "desc_tarifario": "SERVICIO DE RETEN",
                "preciodet_dscto": 0,
                "precio_final": 84.746,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5068,
                "desc_tarifario": "TOMA DE IMPRESIÓN CON ALGINATO",
                "preciodet_dscto": 0,
                "precio_final": 16.949,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5017,
                "desc_tarifario": "BLEFAROPLASTIA",
                "preciodet_dscto": 0,
                "precio_final": 1101.695,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5075,
                "desc_tarifario": "UROTEM SIN CONTRASTE",
                "preciodet_dscto": -26.667,
                "precio_final": 254.237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5018,
                "desc_tarifario": "SUTURA DE HERIDAS DE PARPADO LEVE",
                "preciodet_dscto": 0,
                "precio_final": 423.729,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5028,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - ACTIVADOR ABIERTO DE KLAMMT",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5021,
                "desc_tarifario": "ECTROPION ",
                "preciodet_dscto": 0,
                "precio_final": 932.203,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5025,
                "desc_tarifario": "BIOPSIA DE SUPERFICIE OCULAR  PARPADO",
                "preciodet_dscto": 0,
                "precio_final": 932.203,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5022,
                "desc_tarifario": "TRAUMA OCULAR LEVE",
                "preciodet_dscto": 0,
                "precio_final": 677.966,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5026,
                "desc_tarifario": "PTERIGION SOCIAL",
                "preciodet_dscto": 0,
                "precio_final": 932.203,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5029,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - APARATO FRANKL",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5023,
                "desc_tarifario": "BIOPSIA DE SUPERFICIE OCULAR CONJUNTIVA ",
                "preciodet_dscto": 0,
                "precio_final": 932.203,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5030,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - BLOQUES GEMELOS",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5031,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - BIONATOR DE WALTERS",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5032,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - PLANOS INCLINADOS (BITE PLAN)",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5036,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - PROPULSOR",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5033,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - QUAD HELIX",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5035,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - DISYUNTOR",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5034,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - PENDULO",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5037,
                "desc_tarifario": "ORTOPEDIA FUNCIONAL - MASCARA FACIAL",
                "preciodet_dscto": 0,
                "precio_final": 338.983,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5084,
                "desc_tarifario": "VIDEO LARINGOSCOPIA",
                "preciodet_dscto": 0,
                "precio_final": 152.542,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5087,
                "desc_tarifario": "TIMPANOMETRÍA",
                "preciodet_dscto": 0,
                "precio_final": 84.745,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5086,
                "desc_tarifario": "ENDOSCOPIA NASAL",
                "preciodet_dscto": 0,
                "precio_final": 135.593,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5088,
                "desc_tarifario": "CURACIÓN DE OÍDO",
                "preciodet_dscto": 0,
                "precio_final": 42.372,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4905,
                "desc_tarifario": "RESTAURACION POSTERIOR SIMPLE CON RESINA SIMPLE - NIÑO\r\n",
                "preciodet_dscto": 0,
                "precio_final": 59.32,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4907,
                "desc_tarifario": "RESTAURACION POSTERIOR CON RESINA COMPUESTA - NIÑO\r\n",
                "preciodet_dscto": 0.001,
                "precio_final": 67.797,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3404,
                "desc_tarifario": "TERAPIA DE PSICOMOTRICIDAD",
                "preciodet_dscto": -74.994,
                "precio_final": 16.94915254237288,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3697,
                "desc_tarifario": "COLONOSCOPIA",
                "preciodet_dscto": 0,
                "precio_final": 470.33898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4906,
                "desc_tarifario": "RESTAURACIÓN ANTERIOR CON RESINA COMPUESTA - NIÑO\r\n",
                "preciodet_dscto": -57.143,
                "precio_final": 59.322,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4904,
                "desc_tarifario": "RESTAURACION ANTERIOR CON RESINA SIMPLE - NIÑO\r\n\r\n",
                "preciodet_dscto": 0,
                "precio_final": 42.372,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2092,
                "desc_tarifario": "COLESTEROL - HDL",
                "preciodet_dscto": 0,
                "precio_final": 18.64406779661017,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1568,
                "desc_tarifario": "ECOCARDIOGRAMA DOPPLER COLOR - ADULTO",
                "preciodet_dscto": -38.889,
                "precio_final": 152.5423728813559,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4899,
                "desc_tarifario": "FISIOTERAPIA BUCAL",
                "preciodet_dscto": 0.003,
                "precio_final": 33.898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1151,
                "desc_tarifario": "ENDOSCOPIA NASAL DIAGNOSTICA CON O SIN BIOPSIA",
                "preciodet_dscto": 0,
                "precio_final": 0,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4804,
                "desc_tarifario": "PRUEBAS VESTIBULARES - OTORRINO",
                "preciodet_dscto": 15.25,
                "precio_final": 100,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1445,
                "desc_tarifario": "TAPONAMIENTO NASAL ANTERIOR (INCLUYE CONSULTA)",
                "preciodet_dscto": -8.482,
                "precio_final": 39.06,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1548,
                "desc_tarifario": "ELECTROCARDIOGRAMA HOLTER  POR 24 HORAS ",
                "preciodet_dscto": 0,
                "precio_final": 169.4915254237288,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4850,
                "desc_tarifario": "INSTRUMENTISTA OP. M.",
                "preciodet_dscto": -135.417,
                "precio_final": 36,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3693,
                "desc_tarifario": "ECOGRAFIA PELVICA",
                "preciodet_dscto": -121.117,
                "precio_final": 30.661,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4789,
                "desc_tarifario": "TERAPIA KINESICA - COMPRESAS",
                "preciodet_dscto": 0.003,
                "precio_final": 29.66101694915254,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4817,
                "desc_tarifario": "HIDROTERAPIA - ULTRASONIDO - KINESICA",
                "preciodet_dscto": -0.001,
                "precio_final": 38.13559322033898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4768,
                "desc_tarifario": "TRACCION CERVICAL",
                "preciodet_dscto": -0.005,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4777,
                "desc_tarifario": "EVALUACION EN PROBLEMAS DE LA COMUNICACION",
                "preciodet_dscto": -33.333,
                "precio_final": 25.42372881355932,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4908,
                "desc_tarifario": "RESTAURACIÓN ANTERIOR CON GIOMERO SIMPLE - NIÑO",
                "preciodet_dscto": 0,
                "precio_final": 59.32,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4846,
                "desc_tarifario": "TOMOGRAFIA - TRIFASICO",
                "preciodet_dscto": 0,
                "precio_final": 500,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4847,
                "desc_tarifario": "TOMOGRAFIA - UROTEM",
                "preciodet_dscto": 0,
                "precio_final": 700,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3370,
                "desc_tarifario": "ONDA CORTA",
                "preciodet_dscto": 0,
                "precio_final": 10.16949152542373,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3516,
                "desc_tarifario": "PM - CIRUGIA MENOR - CG",
                "preciodet_dscto": 0,
                "precio_final": 372.8813559322034,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1775,
                "desc_tarifario": "ELECTROENCEFALOGRAMA",
                "preciodet_dscto": 0,
                "precio_final": 211.864406779661,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1428,
                "desc_tarifario": "CAUTERIZACION ELECTRICA / TERMICA / QUIMICA DE FARINGE ",
                "preciodet_dscto": 2.362,
                "precio_final": 52.08,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1072,
                "desc_tarifario": "REDUCCION ABIERTA DE FRACTURA DE LOS HUESOS NASALES",
                "preciodet_dscto": 48.42,
                "precio_final": 328.6,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3021,
                "desc_tarifario": "ECOGRAFIA DE VIAS URINARIAS COMPLETAS",
                "preciodet_dscto": -150,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2534,
                "desc_tarifario": "ECOGRAFIA DE VEJIGA (PRE Y POST MICCIONAL)",
                "preciodet_dscto": -25,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4815,
                "desc_tarifario": "TERAPIA KINESICA - COMPRESAS - HIDROTERAPIA",
                "preciodet_dscto": 9.999,
                "precio_final": 0.06779661016949153,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2362,
                "desc_tarifario": "AGENTES FISICOS - ELECTROTERAPIA / ULTRASONIDO  / DIATERMIA / INFRARROJOS / ONDA CORTA / ULTRAVIOLETA / LASER / PARAFINA / TRACCION - POR SESION",
                "preciodet_dscto": -1.695,
                "precio_final": 12.4,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 36,
                "desc_tarifario": "APLICACION DE ENEMA EVACUANTE",
                "preciodet_dscto": 9.097,
                "precio_final": 9.322033898305085,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 996,
                "desc_tarifario": "EXTRACCION DE CUERPO EXTRAÑO EN LA CORNEA",
                "preciodet_dscto": 0,
                "precio_final": 84.74576271186442,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3362,
                "desc_tarifario": "CORRIENTE ANALGESICAS O ESTIMULANTES",
                "preciodet_dscto": -45.455,
                "precio_final": 9.322033898305085,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4687,
                "desc_tarifario": "RESTAURACIÓN FOTOCURABLE DE UNA SUPERFICIE CON RESINA EN PIEZAS DENTARIAS POSTERIOR (PRIMARIAS O PERMANENTES)",
                "preciodet_dscto": -0.005,
                "precio_final": 33.89830508,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2902,
                "desc_tarifario": "RADIOGRAFIA PERIAPICAL",
                "preciodet_dscto": 0.015,
                "precio_final": 12.71186440677966,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4853,
                "desc_tarifario": "TERAPIA - BONIFICACION",
                "preciodet_dscto": 0,
                "precio_final": 0.08,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1431,
                "desc_tarifario": "LARINGOSCOPIA DIRECTA CON O SIN BIOPSIA",
                "preciodet_dscto": 0,
                "precio_final": 152.542372881356,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2658,
                "desc_tarifario": "RX  HOMBRO (2 PLACAS)",
                "preciodet_dscto": -10,
                "precio_final": 42.37288135593221,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4852,
                "desc_tarifario": "BONIFICACION - TERAPIA",
                "preciodet_dscto": 0,
                "precio_final": 25.42,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3692,
                "desc_tarifario": "TEST DEL ALIENTO",
                "preciodet_dscto": 0,
                "precio_final": 152.542372,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1392,
                "desc_tarifario": "CURVA DE PRESION INTRAOCULAR (POR CADA TONOMETRIA)",
                "preciodet_dscto": 0,
                "precio_final": 84.74576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2602,
                "desc_tarifario": "RX  CLAVICULA (1 PLACA)",
                "preciodet_dscto": -96.428,
                "precio_final": 23.72881355932203,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5100,
                "desc_tarifario": "RX MUÑECA (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5091,
                "desc_tarifario": "RX HOMBRO (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5095,
                "desc_tarifario": "RX BRAZO AP (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5110,
                "desc_tarifario": "RX COLUMNA LUMBAR (PURGADO) (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5120,
                "desc_tarifario": "RX RODILLA AP (1P)",
                "preciodet_dscto": 29.2,
                "precio_final": 46.61016949152543,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5111,
                "desc_tarifario": "RX COLUMNA DORSOLUMBAR (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1543,
                "desc_tarifario": "ELECTROCARDIOGRAMA",
                "preciodet_dscto": -24.991,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5116,
                "desc_tarifario": "RX ABDOMEN DE PIE",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5118,
                "desc_tarifario": "RX PIE COMPARATIVOS (4P)",
                "preciodet_dscto": 0,
                "precio_final": 76.271,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4903,
                "desc_tarifario": "INACTIVACION DE CARIES",
                "preciodet_dscto": 39.996,
                "precio_final": 42.37,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5172,
                "desc_tarifario": "CURACION COMPUESTA",
                "preciodet_dscto": 0,
                "precio_final": 67.7966101694915,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5112,
                "desc_tarifario": "RX COLUMNA DORSAL (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5117,
                "desc_tarifario": "RX MADURACION OSEA + INFORME",
                "preciodet_dscto": 0,
                "precio_final": 84.746,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5096,
                "desc_tarifario": "RX CODO AP (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5090,
                "desc_tarifario": "RX CRANEO FRONTAL Y PERFIL",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5092,
                "desc_tarifario": "RX PIE (2P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5093,
                "desc_tarifario": "RX CLAVICULA (1P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5115,
                "desc_tarifario": "RX TORAX (1P)",
                "preciodet_dscto": 0,
                "precio_final": 46.61,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4793,
                "desc_tarifario": "TERAPIA FISICA EN CASA",
                "preciodet_dscto": -0.005,
                "precio_final": 0.06779661016949153,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4790,
                "desc_tarifario": "TERAPIA KINESICA - HIDROTERAPIA",
                "preciodet_dscto": -0.005,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 133,
                "desc_tarifario": "USO DE AMBULANCIA",
                "preciodet_dscto": 0,
                "precio_final": 200,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3378,
                "desc_tarifario": "TINA HIDROMASAJE",
                "preciodet_dscto": 0,
                "precio_final": 22.03389830508475,
                "tpmov": 0,
                "inafecto_coaseguro": 1,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1778,
                "desc_tarifario": "ELECTROMIOGRAFIA",
                "preciodet_dscto": 0,
                "precio_final": 296.610169491525,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3562,
                "desc_tarifario": "HIDROTERAPIA DE MIEMBRO SUPERIOR",
                "preciodet_dscto": -71.429,
                "precio_final": 21.1864406779661,
                "tpmov": 0,
                "inafecto_coaseguro": 1,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4821,
                "desc_tarifario": "AGENTES - COMPRESAS",
                "preciodet_dscto": 0.003,
                "precio_final": 29.66101694915254,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4860,
                "desc_tarifario": " RADIOFRECUENCIA FACIAL ",
                "preciodet_dscto": 0,
                "precio_final": 84.75,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3047,
                "desc_tarifario": "CURACION PEQUEÑA",
                "preciodet_dscto": -122.222,
                "precio_final": 7.627118644067797,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1556,
                "desc_tarifario": "ECO-DOPPLER COLOR - ARTERIA Y VENA RENAL",
                "preciodet_dscto": 0,
                "precio_final": 169.4915254237288,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4784,
                "desc_tarifario": "ALQUILER DE LAPAROSCOPIO",
                "preciodet_dscto": -38.886,
                "precio_final": 152.5423728813559,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2094,
                "desc_tarifario": "COLESTEROL - TOTAL",
                "preciodet_dscto": -16.184,
                "precio_final": 14.40677966101695,
                "tpmov": 1,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2600,
                "desc_tarifario": "RX  PELVIS (1 PLACA)  ADULTO",
                "preciodet_dscto": -66.667,
                "precio_final": 27.96610169491526,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3547,
                "desc_tarifario": "LENGUAJE Y MOTRICIDAD OROFACIAL",
                "preciodet_dscto": -6.061,
                "precio_final": 29.6610169491525,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3409,
                "desc_tarifario": "TERAPIA DE PSICOLOGIA NIÑOS",
                "preciodet_dscto": -75,
                "precio_final": 16.94915254237288,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4887,
                "desc_tarifario": "EXERESIS O BIOPSIA DE TUMOR",
                "preciodet_dscto": 0,
                "precio_final": 67.8,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3431,
                "desc_tarifario": "LAVADO DE OIDO",
                "preciodet_dscto": -66.666,
                "precio_final": 25.4237288135593,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4888,
                "desc_tarifario": "RE-EVALUACION MEDICINA FISICA Y REHABILITACION",
                "preciodet_dscto": 15.24,
                "precio_final": 50,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2537,
                "desc_tarifario": "ECOGRAFIA OBSTETRICA DEL I TRIMESTRE",
                "preciodet_dscto": -0.012,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2942,
                "desc_tarifario": "ECOGRAFIA TRANSVAGINAL",
                "preciodet_dscto": -100,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1552,
                "desc_tarifario": "ECO-DOPPLER COLOR - ARTERIAL EXTREMIDADES UNILATERAL",
                "preciodet_dscto": 0,
                "precio_final": 152.5423728813559,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2906,
                "desc_tarifario": "PULPECTOMIA",
                "preciodet_dscto": -66.675,
                "precio_final": 101.6949152542373,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1542,
                "desc_tarifario": "RIESGO QUIRURGICO, INCLUYE CONSULTA",
                "preciodet_dscto": -0.005,
                "precio_final": 84.74576271186442,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2385,
                "desc_tarifario": "TRATAMIENTO SIMULTANEO CON TRES O MAS AGENTES FISICOS",
                "preciodet_dscto": -51.869,
                "precio_final": 19.53,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4900,
                "desc_tarifario": "PROFILAXIS TOTAL NIÑOS",
                "preciodet_dscto": 0.004,
                "precio_final": 67.8,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2093,
                "desc_tarifario": "COLESTEROL - LDL",
                "preciodet_dscto": 33.609,
                "precio_final": 14.40677966101695,
                "tpmov": 1,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2547,
                "desc_tarifario": "ECOGRAFIA DE HOMBRO",
                "preciodet_dscto": -100,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2022,
                "desc_tarifario": "TRIGLICERIDOS",
                "preciodet_dscto": 36.019,
                "precio_final": 18.64406779661017,
                "tpmov": 1,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 811,
                "desc_tarifario": "CONSULTA ANESTESICA PREOPERATORIA",
                "preciodet_dscto": -563.545,
                "precio_final": 76.63,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3500,
                "desc_tarifario": "CANALIZACION DE VIA",
                "preciodet_dscto": -19.999,
                "precio_final": 8.474576271186441,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3704,
                "desc_tarifario": "SUTURA DE PUNTOS (CADA PUNTO)",
                "preciodet_dscto": -100.014,
                "precio_final": 4.2372,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3360,
                "desc_tarifario": "COMPRESAS CALIENTES",
                "preciodet_dscto": -14.295,
                "precio_final": 10.1694915254237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3114,
                "desc_tarifario": "ESPIROMETRIA,QUE INCLUYA: CAPAC. VITAL,FLUJO EN 1 SEG.",
                "preciodet_dscto": 95.294,
                "precio_final": 30,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1929,
                "desc_tarifario": "INSULINA POSTPANDRIAL",
                "preciodet_dscto": 0,
                "precio_final": 46.61016949152543,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2369,
                "desc_tarifario": "TRATAMIENTO SIMULTANEO CON TRES O MAS PROCEDIMIENTOS TERAPEUTICOS FISICOS",
                "preciodet_dscto": 0,
                "precio_final": 13.56,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 5166,
                "desc_tarifario": "LABORATORIO PRE QX BASICO(UREA, CREATININA, TIEMPO TROMBO, TIEMPO PROTOM, HEMO, GLUCO, GRUPO FACTOR)",
                "preciodet_dscto": 0,
                "precio_final": 76.27118644067797,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3311,
                "desc_tarifario": "TRATAMIENTO SIMULTANEO (PARTICULAR S/.16.00) CON TRES O MAS PROCEDIMIENTOS TERAPEUTICOS FISICOS",
                "preciodet_dscto": -118.732,
                "precio_final": 13.56,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3312,
                "desc_tarifario": "TRATAMIENTO SIMULTANEO (PARTICULAR S/.10.00) CON TRES O MAS PROCEDIMIENTOS TERAPEUTICOS FISICOS",
                "preciodet_dscto": 0.003,
                "precio_final": 8.48,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3484,
                "desc_tarifario": "TERAPIA OCUPACIONAL",
                "preciodet_dscto": 0.003,
                "precio_final": 10.16949152542373,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2550,
                "desc_tarifario": "ECOGRAFIA LUMBO SACRA - MUSCULAR Y PARTES BLANDAS",
                "preciodet_dscto": -100,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1448,
                "desc_tarifario": "CAUTERIZACION QUIMICA / ELECTRICA DE VARICES DE TABIQUE NASAL ",
                "preciodet_dscto": 21.889,
                "precio_final": 65.10000000000001,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1430,
                "desc_tarifario": "INFILTRACION DE CORNETES",
                "preciodet_dscto": -1266.935,
                "precio_final": 58.59,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4876,
                "desc_tarifario": "MESOTERAPIA FACIAL Y CORPORAL ",
                "preciodet_dscto": 0,
                "precio_final": 847.46,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3502,
                "desc_tarifario": "PM - DRENAJE DE HEMATOMAS - TRAU",
                "preciodet_dscto": 27.269,
                "precio_final": 93.22033898305085,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4746,
                "desc_tarifario": "PROFILAXIS DENTAL",
                "preciodet_dscto": -0.005,
                "precio_final": 67.79661017,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4667,
                "desc_tarifario": "PROTECTOR OCLUSAL (FERULA MIORELAJANTE)",
                "preciodet_dscto": 0,
                "precio_final": 211.8644068,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4671,
                "desc_tarifario": "RADIOGRAFÍA INTRAORAL PERIAPICAL",
                "preciodet_dscto": -0.064,
                "precio_final": 12.71186441,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4672,
                "desc_tarifario": "RADIOGRAFÍA BITEWING",
                "preciodet_dscto": -0.025,
                "precio_final": 25.42372881,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4673,
                "desc_tarifario": "RADIOGRAFÍA INTRAORAL OCLUSAL ",
                "preciodet_dscto": -0.017,
                "precio_final": 42.37288136,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4692,
                "desc_tarifario": "BLANQUEAMIENTO DENTAL EXTERNO POR DIENTE ",
                "preciodet_dscto": -0.013,
                "precio_final": 59.3220339,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4693,
                "desc_tarifario": "BLANQUEAMIENTO INTERNO POR DIENTE",
                "preciodet_dscto": -0.017,
                "precio_final": 84.74576271,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4684,
                "desc_tarifario": "RESTAURACIÓN FOTOCURABLE DE UNA SUPERFICIE CON RESINA EN PIEZAS DENTARIAS ANTERIORES (PRIMARIAS O PERMANENTES)",
                "preciodet_dscto": -25.021,
                "precio_final": 33.89830508,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4652,
                "desc_tarifario": "PAPANICOLAOU",
                "preciodet_dscto": -82.609,
                "precio_final": 19.4915,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4767,
                "desc_tarifario": "TRACCION LUMBAR",
                "preciodet_dscto": -0.005,
                "precio_final": 33.89830508474576,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1557,
                "desc_tarifario": "ECO-DOPPLER COLOR - ARTERIAL EXTREMIDADES BILATERAL",
                "preciodet_dscto": 0,
                "precio_final": 279.6610169491526,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4785,
                "desc_tarifario": "TERAPIA KINESICA - COMPRESAS - CORRIENTES ANALGESICAS",
                "preciodet_dscto": -0.001,
                "precio_final": 38.13559322033898,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3369,
                "desc_tarifario": "MASOTERAPIA",
                "preciodet_dscto": 0,
                "precio_final": 5.932203389830509,
                "tpmov": 0,
                "inafecto_coaseguro": 1,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3497,
                "desc_tarifario": "DHIDRO EPIANDROTERONA - DHEAS",
                "preciodet_dscto": -0.012,
                "precio_final": 79.66101694915254,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4775,
                "desc_tarifario": "TERAPIA DE AUDICION, VOZ Y LENGUAJE",
                "preciodet_dscto": -14.286,
                "precio_final": 29.6610169491525,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1549,
                "desc_tarifario": "MONITOREO AMBULATORIO DE PRESION ARTERIAL 24 HORAS - M.A.P.A.",
                "preciodet_dscto": 0,
                "precio_final": 169.4915254237288,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4833,
                "desc_tarifario": "ALQUILER ARCO EN \"C\" X 6",
                "preciodet_dscto": 16.664,
                "precio_final": 254.2372881355932,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1554,
                "desc_tarifario": "ECO-DOPPLER COLOR - VENOSO EXTREMIDADES UNILATERAL",
                "preciodet_dscto": 0,
                "precio_final": 152.5423728813559,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4783,
                "desc_tarifario": "PRUEBA RAPIDA COVID19",
                "preciodet_dscto": 36,
                "precio_final": 105.9322033898305,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2596,
                "desc_tarifario": "RX  COLUMNA LUMBO SACRA F/P",
                "preciodet_dscto": 8.333,
                "precio_final": 50.8474576271186,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1006,
                "desc_tarifario": "TRATAMIENTO QUIRURGICO DEL GLAUCOMA - IRIDECTOMIA / GONIOTOMIA -  UNILATERAL",
                "preciodet_dscto": 0,
                "precio_final": 593.2203389830509,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3578,
                "desc_tarifario": "PROCEDIMIENTO EN TERAPIA FISICA Y REHABILITACION",
                "preciodet_dscto": 7.216,
                "precio_final": 29.5,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3549,
                "desc_tarifario": "TERAPIA DE APRENDIZAJE",
                "preciodet_dscto": 28.571,
                "precio_final": 27.118,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 360,
                "desc_tarifario": "LIGADURA HEMORROIDES",
                "preciodet_dscto": 0,
                "precio_final": 474.576271186441,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4803,
                "desc_tarifario": "ALQUILER SALA DE PROCEDIMIENTOS",
                "preciodet_dscto": 16.666,
                "precio_final": 152.5423728813559,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3410,
                "desc_tarifario": "TERAPIA PSICOLOGICA ADULTOS",
                "preciodet_dscto": -53.846,
                "precio_final": 22.03389830508475,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3406,
                "desc_tarifario": "TERAPIA DE NIÑOS - CEMS",
                "preciodet_dscto": -74.994,
                "precio_final": 16.94915254237288,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4773,
                "desc_tarifario": "ALQUILER DE SALA DE CIRUGIA",
                "preciodet_dscto": -12.003,
                "precio_final": 211.86,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3576,
                "desc_tarifario": "EXTRACCION DE CRISTALINO / CATARATA",
                "preciodet_dscto": 0,
                "precio_final": 593.220338983051,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 52,
                "desc_tarifario": "SALA DE RECUPERACION",
                "preciodet_dscto": -7.619,
                "precio_final": 94.5,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4809,
                "desc_tarifario": "ANTIGENO SARS-COV-2 (HISOPADO NASOFARINGEO) DIRECTO",
                "preciodet_dscto": -41.243,
                "precio_final": 45,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4869,
                "desc_tarifario": "EXCLERO VARICES ",
                "preciodet_dscto": 0,
                "precio_final": 152.54,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 1786,
                "desc_tarifario": "PAPANICOLAOU - PAP",
                "preciodet_dscto": -0.005,
                "precio_final": 35.59322033898305,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3483,
                "desc_tarifario": "CIRUGIA DE QUISTE CONJUNTIVAL",
                "preciodet_dscto": -16.663,
                "precio_final": 180,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4766,
                "desc_tarifario": "ONDA DE CHOQUE",
                "preciodet_dscto": -55.556,
                "precio_final": 38.135593220339,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3480,
                "desc_tarifario": "INSPECCION DE VIAS LAGRIMALES",
                "preciodet_dscto": -358.342,
                "precio_final": 101.6949152542373,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4882,
                "desc_tarifario": "SERVICIOS VARIOS PRODUCTOS DERMATOLOGIA",
                "preciodet_dscto": 0,
                "precio_final": 0.8475,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4897,
                "desc_tarifario": "TOMOGRAFIA TORAX SIMPLE - PARRILLA COSTAL",
                "preciodet_dscto": 0,
                "precio_final": 228.81,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3691,
                "desc_tarifario": "PROCTOSCOPIA",
                "preciodet_dscto": 0,
                "precio_final": 152.542,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 3046,
                "desc_tarifario": "CURACION GRANDE",
                "preciodet_dscto": -53.845,
                "precio_final": 11.01694915254237,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4883,
                "desc_tarifario": "OTOSCOPIA",
                "preciodet_dscto": 0,
                "precio_final": 42.37,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4884,
                "desc_tarifario": "COLOCACION TUBO DE VENTILACION",
                "preciodet_dscto": 0,
                "precio_final": 338.98,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4871,
                "desc_tarifario": "HOLIWOOD PELLING NDYAG ",
                "preciodet_dscto": 0,
                "precio_final": 169.49,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4873,
                "desc_tarifario": "LASER EXIMER VILIGO Y PSORIASIS ",
                "preciodet_dscto": 0,
                "precio_final": 152.54,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 4875,
                "desc_tarifario": "MESOTERAPIA ACNE Y ROSACEA ",
                "preciodet_dscto": 0,
                "precio_final": 76.27,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 1,
                "cod_tarifario": 2381,
                "desc_tarifario": "TERAPIA OCUPACIONAL POR DISCAPACIDAD POR SESION",
                "preciodet_dscto": -85.375,
                "precio_final": 16,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 51,
                "desc_tarifario": "UROLOGIA",
                "preciodet_dscto": -13,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 61,
                "desc_tarifario": "MEDICINA DE EMERGENCIA Y URGENCIAS",
                "preciodet_dscto": 1.133,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 107,
                "desc_tarifario": "MEDICINA FISICA Y REHABILITACION",
                "preciodet_dscto": 1.133,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 37,
                "desc_tarifario": "NEUROLOGIA",
                "preciodet_dscto": -13,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 11,
                "desc_tarifario": "CIRUGIA DE CABEZA Y CUELLO",
                "preciodet_dscto": -69.492,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 32,
                "desc_tarifario": "TECNOLOGIA MEDICA / REHABILITACION",
                "preciodet_dscto": 53.39,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 102,
                "desc_tarifario": "OFTALMOLOGIA-MTSO",
                "preciodet_dscto": 22.317,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 92,
                "desc_tarifario": "ODONTOLOGIA",
                "preciodet_dscto": 71.75,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 120,
                "desc_tarifario": "OFTALMOLOGIA - OP. MILAGRO - ESPINAR",
                "preciodet_dscto": 0,
                "precio_final": 50,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 39,
                "desc_tarifario": "OFTALMOLOGIA",
                "preciodet_dscto": 15.25,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 63,
                "desc_tarifario": "MEDICINA OCUPACIONAL",
                "preciodet_dscto": 15.25,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 93,
                "desc_tarifario": "TECNOLOGIA MEDICA / TERAPIA LENGUAJE",
                "preciodet_dscto": 43.503,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 119,
                "desc_tarifario": "RE EVALUACION  EN TERAPIA FISICA Y REHABILITACION ",
                "preciodet_dscto": -42.886,
                "precio_final": 29.66,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 4976,
                "desc_tarifario": "OBESIDAD Y SOBREPESO(COS)",
                "preciodet_dscto": 15.255,
                "precio_final": 80,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 9,
                "desc_tarifario": "CARDIOLOGIA",
                "preciodet_dscto": -5.933,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 91,
                "desc_tarifario": "PSICOLOGIA",
                "preciodet_dscto": 43.503,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 114,
                "desc_tarifario": "ESTIMULACION TEMPRANA",
                "preciodet_dscto": 78.813,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 40,
                "desc_tarifario": "ONCOLOGIA MEDICA",
                "preciodet_dscto": -69.483,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 12,
                "desc_tarifario": "CIRUGIA PEDIATRICA",
                "preciodet_dscto": 1.133,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 22,
                "desc_tarifario": "GINECOLOGIA Y OBSTETRICIA",
                "preciodet_dscto": -13,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 125,
                "desc_tarifario": "MEDICINA GENERAL ESTETICA",
                "preciodet_dscto": 15.25,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 34,
                "desc_tarifario": "NEFROLOGIA",
                "preciodet_dscto": -69.492,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 66,
                "desc_tarifario": "NEFROLOGIA PEDIATRICA",
                "preciodet_dscto": 36.441,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 21,
                "desc_tarifario": "GASTROENTEROLOGIA",
                "preciodet_dscto": -13,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 38,
                "desc_tarifario": "NUTRICION",
                "preciodet_dscto": 15.25,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 13,
                "desc_tarifario": "CIRUGIA PLASTICA Y REPARADORA",
                "preciodet_dscto": -27.117,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 122,
                "desc_tarifario": "ALERGOLOGIA",
                "preciodet_dscto": 0,
                "precio_final": 48,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 35,
                "desc_tarifario": "NEUMOLOGIA",
                "preciodet_dscto": -13,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 45,
                "desc_tarifario": "PEDIATRIA",
                "preciodet_dscto": 1.133,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 15,
                "desc_tarifario": "ENDOCRINOLOGIA",
                "preciodet_dscto": -13,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 94,
                "desc_tarifario": "OBSTETRICIA",
                "preciodet_dscto": 53.39,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 25,
                "desc_tarifario": "HEMATOLOGIA",
                "preciodet_dscto": -69.492,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 99,
                "desc_tarifario": "TECNOLOGIA MEDICA / OCUPACIONAL",
                "preciodet_dscto": 53.39,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 100,
                "desc_tarifario": "GINECOLOGIA ONCOLOGICA-MTSO",
                "preciodet_dscto": 30.085,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 1,
                "desc_tarifario": "MEDICINA GENERAL",
                "preciodet_dscto": 36.442,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 112,
                "desc_tarifario": "PSICOMOTRICIDAD",
                "preciodet_dscto": 43.5,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 113,
                "desc_tarifario": "CEMS (CENTRO DE ESTIMULACION MULTISENSORIAL)",
                "preciodet_dscto": 43.5,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 101,
                "desc_tarifario": "MEDICINA INTERNA-MTSO",
                "preciodet_dscto": 15.253,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 111,
                "desc_tarifario": "NEUROPSICOLOGIA",
                "preciodet_dscto": 43.503,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 8,
                "desc_tarifario": "CIRUGIA TORACCICA Y CARDIOVASCULAR",
                "preciodet_dscto": -12.994,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 42,
                "desc_tarifario": "ORTOPEDIA Y TRAUMATOLOGIA",
                "preciodet_dscto": 1.133,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 4898,
                "desc_tarifario": "ODONTOPEDIATRIA",
                "preciodet_dscto": 15.255,
                "precio_final": 40,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 36,
                "desc_tarifario": "NEUROCIRUGIA",
                "preciodet_dscto": -69.492,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 43,
                "desc_tarifario": "OTORRINOLARINGOLOGIA",
                "preciodet_dscto": -13,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 30,
                "desc_tarifario": "MEDICINA INTERNA",
                "preciodet_dscto": -13,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 14,
                "desc_tarifario": "DERMATOLOGIA",
                "preciodet_dscto": 1.133,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 49,
                "desc_tarifario": "REUMATOLOGIA",
                "preciodet_dscto": -13,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 121,
                "desc_tarifario": "CONSULTA PSICOLOGIA",
                "preciodet_dscto": 0,
                "precio_final": 33.9,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 123,
                "desc_tarifario": "TELECONSULTA DE SEGUIMIENTO",
                "preciodet_dscto": 0,
                "precio_final": 100,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 124,
                "desc_tarifario": "CONSULTA DE CONTROL O SEGUIMIENTO (MEDICINA GENERAL)",
                "preciodet_dscto": 0,
                "precio_final": 80,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 110,
                "desc_tarifario": "PODOLOGIA",
                "preciodet_dscto": 85.876,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 46,
                "desc_tarifario": "PSIQUIATRIA",
                "preciodet_dscto": 1.133,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 23,
                "desc_tarifario": "GERIATRIA",
                "preciodet_dscto": -13,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            },
            {
                "item_tarifario": 2,
                "cod_tarifario": 10,
                "desc_tarifario": "CIRUGIA GENERAL",
                "preciodet_dscto": 1.133,
                "precio_final": 60,
                "tpmov": 0,
                "inafecto_coaseguro": 0,
                "pfijo": "",
                "precio_virtual": ""
            }
        ]
    }
]