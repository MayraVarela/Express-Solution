const fs = require('fs');
const _ = require('lodash');

function cargarDatos(nombreArchivo) {
    const contenidoArchivo = fs.readFileSync(nombreArchivo);
    const datos = JSON.parse(contenidoArchivo);
    return datos.data; 
}


function buscarStock(propuesta, stock, esEcommerce) {
    let unidadesFaltantes = propuesta;
    const resultado = [];
    const tiposStock = esEcommerce ? ['ZAR', 'MSR', 'SILO'] : ['MSR'];

    for (const tipo of tiposStock) {
        const stockDisponible = stock.filter(item => item.tipoStockDesc === tipo);
        for (const item of stockDisponible) {
            let stockUsar = esEcommerce ? item.stockEm05 : item.stockEm01;
            if (stockUsar >= unidadesFaltantes) {
                resultado.push({
                    key: item.key,
                    idTienda: propuesta.tiendaId,
                    propuesta: unidadesFaltantes,
                    tipoStockDesc: tipo,
                    estadoStock: esEcommerce ? 5 : 1,
                    posicioncompleta: item.posicioncompleta
                });
                unidadesFaltantes = 0;
                break;
            } else {
                resultado.push({
                    key: item.key,
                    idTienda: propuesta.tiendaId,
                    propuesta: stockUsar,
                    tipoStockDesc: tipo,
                    estadoStock: esEcommerce ? 5 : 1,
                    posicioncompleta: item.posicioncompleta
                });
                unidadesFaltantes -= stockUsar;
            }
        }
        if (unidadesFaltantes === 0) break;
    }

    return resultado;
}


function procesarPropuestas(propuestas, stock) {
    const resultado = [];
    for (const propuesta of propuestas) {
        const stockUtilizado = buscarStock(propuesta, stock, propuesta.esEcommerce);
        resultado.push(...stockUtilizado);
    }
    return resultado;
}

function filtrarPropuestas(propuestas) {
    return propuestas.filter(propuesta =>
        propuesta.grupoLocalizacionDesc === "CICLO 2 GRUPO A2" ||
        propuesta.grupoLocalizacionDesc === "CICLO 1 GRUPO B" ||
        propuesta.grupoLocalizacionDesc === "CICLO 1 GRUPO A2"
    );
}


exports.generarTabla = async (req, res) => {
  
    const propuestas = cargarDatos('Prereparto_bruto.json');
    const stock = cargarDatos('Stock_unificado.json');
    const propuestasFiltradas = filtrarPropuestas(propuestas);
    const resultado = procesarPropuestas(propuestasFiltradas, stock);

    const htmlTable = `
        <html>
        <head>
            <title>Tabla de Resultados</title>
            <style>
                table {
                    font-family: Arial, sans-serif;
                    border-collapse: collapse;
                    width: 100%;
                }
                th, td {
                    border: 1px solid #dddddd;
                    text-align: left;
                    padding: 8px;
                }
                th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <h1>Tabla de Resultados</h1>
            <table>
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>idTienda</th>
                        <th>propuesta</th>
                        <th>tipoStockDesc</th>
                        <th>estadoStock</th>
                        <th>posicioncompleta</th>
                    </tr>
                </thead>
                <tbody>
                    ${resultado.map(item => `
                        <tr>
                            <td>${item.key}</td>
                            <td>${item.idTienda}</td>
                            <td>${item.propuesta}</td>
                            <td>${item.tipoStockDesc}</td>
                            <td>${item.estadoStock}</td>
                            <td>${item.posicioncompleta}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    res.send(htmlTable);
}