import { handleError, raise400, raise404 } from '../utils/errors-helper'
import TSSManager from '../tss-manager'

/**
 * 
 * @param {any} app 
 * @param {TSSManager} tssManager 
 */
export default function (app, tssManager) {
    app.get('/api/contracts', async (req, res, next) => {
        try {
            return res.json(tssManager.getAllServers())
        } catch (err) {
            handleError(err, res)
        }
    })

    app.get('/api/contracts/:server', async (req, res, next) => {
        try {
            const server = req.params.server
            if (!server)
                raise400('No server was specified.')
            const serverData = tssManager.getServer(server)
            if (!serverData)
                raise404()
            return res.json(serverData)
        } catch (err) {
            handleError(err, res)
        }
    })

    app.get('/api/contracts/:server/:contract', async (req, res, next) => {
        try {
            const server = req.params.server
            if (!server)
                raise400('No server was specified.')
            const contract = req.params.contract
            if (!contract)
                raise400('No contract was specified.')
            const contractData = tssManager.getServerContract(server, contract)
            if (!contractData)
                raise404()
            return res.json(contractData)
        } catch (err) {
            handleError(err, res)
        }
    })
}