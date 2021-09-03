const Connection = require("tedious").Connection
const Request = require("tedious").Request

// MSQL Server Connection / API

const connectToServer = () => {
    return new Promise((resolve, reject) => {
        const config = {
            server: 'localhost',
            authentication: {
                type: 'default',
                options: {
                    userName: 'electron',
                    password: 'electron'
                }
            },
            options: {
                database: 'AdventureWorks2019',

                // These two settings are really important to make successfull connection
                encrypt: false,
                trustServerCertificate: false,

                // This will allow you to access the rows returned.
                // See 'doneInProc' event below
                rowCollectionOnDone: true
            }
        }

        let connection = new Connection(config)

        connection.connect()

        connection.on('connect', function (err) {
            if (err) {
                console.log('Error: ', err)
                reject(err)
            } else {
                // If no error, then good to go...
                console.log('Connection Successful!')
                resolve(connection)
            }
        })

        connection.on('end', () => { console.log("Connection Closed!") })
    })
}

const readFromDb = (connection, sqlQuery) => {
    return new Promise((resolve, reject) => {
        let products = []

        console.log('Reading rows from the Table...')

        // Read all rows from table
        let request = new Request(sqlQuery, (err, rowCount, rows) => {
            if (err) {
                reject(err)
            } else {
                console.log(rowCount + ' row(s) returned')
                resolve(products)
                connection.close()
            }
        })

        request.on('doneInProc', (rowCount, more, rows) => {
            products = []
            rows.map(row => {
                let result = {}
                row.map(child => {
                    result[child.metadata.colName] = child.value
                })
                products.push(result)
            })
        })

        // Execute SQL statement
        connection.execSql(request)
    })
}

const getProducts = () => {
    return new Promise((resolve, reject) => {
        connectToServer()
            .then(connection => {
                let sqlStr = 'SELECT TOP(2) [Name], [ProductNumber] FROM Production.Product'

                return readFromDb(connection, sqlStr)
            })
            .then(products => resolve(products))
            .catch(err => reject(err))
    })
}

export default getProducts;

