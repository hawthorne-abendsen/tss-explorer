import express from 'express'
import bodyParser from 'body-parser'
import http from 'http'
import config from './utils/config'
import contractsApi from './api/contracts'
import { handleError } from './utils/errors-helper'
import TSSManager from './tss-manager'

const app = new express()

async function init() {

    app.use(bodyParser.json())

    const tssManager = new TSSManager()

    await tssManager.update()

    tssManager.run()

    contractsApi(app, tssManager)

    // error handler
    app.use((err, req, res, next) => {
        if (err)
            console.error(err)
        if (res.headersSent) {
            return next(err)
        }
        handleError(err, res)
    })

    function normalizePort(val) {
        let port = parseInt(val, 10)
        if (isNaN(port)) {
            return val
        }
        if (port >= 0) {
            return port
        }
        return false
    }

    function onListening() {
        let addr = server.address()
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port
        console.log('Listening on ' + bind)
    }

    const port = normalizePort(config.port)
    app.set('port', port)

    const server = http.createServer(app)
    server.listen(port)

    server.on('listening', onListening)

    function gracefulExit() {
        console.log('Shutdown message received. Disposing...')
        setTimeout(() => process.exit(0), 1000)
    }

    process.on('message', msg => {
        if (msg === 'shutdown') { //message from pm2
            gracefulExit()
        }
    })
    process.on('SIGTERM', gracefulExit)
    process.on('SIGINT', gracefulExit)
}

init()