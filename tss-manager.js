import config from './utils/config'
import fetch from 'node-fetch'

async function execStep(fn, errorMsg) {
    try {
        return await fn()
    } catch (error) {
        throw new Error(errorMsg)
    }
}

/**
 * @typedef {Object} TSSContractField
 * @property {string} name
 * @property {string} type
 * @property {string} description
 * @property {string} rule
 */

/**
 * @typedef {Object} TSSContract
 * @property {string} contract
 * @property {string} turret
 * @property {string} signer
 * @property {string} fee
 * @property {TSSContractField[]} fields
 */

/**
 * @typedef {Object} TSSData
 * @property {string} turret
 * @property {string} network
 * @property {string} runFee
 * @property {string} uploadFee
 * @property {TSSContract[]} contracts
 */

class TSSServer {
    constructor(url) {
        url = (url || '').replace(/^\/|\/$/g, '')
        if (!url)
            throw new Error('Turing server was not specified.')
        this.url = url
    }

    /**
     * @type {TSSData}
     */
    data

    async update() {
        this.error = undefined
        try {
            const rawResp = await execStep(async () => await fetch(this.url), 'Server is unavailable.')
            if (!rawResp.ok)
                throw new Error(`Unable to obtain data. ${rawResp.status}: ${rawResp.statusText}`)
            this.data = await execStep(async () => await rawResp.json(), 'Server response format is invalid.')
        } catch (err) {
            this.error = err.message
        }
    }
}

export default class TSSManager {
    constructor() {
        this.__updateInterval = config.updateInterval
        this.__servers = config.targetServers.reduce((map, serverUrl) => {
            const server = new TSSServer(serverUrl)
            map[server.url] = server
            return map
        }, {})
    }

    /**
     * @type {{String, TSSServer}}
     */
    __servers = {}

    async update() {
        try {
            const tasks = []
            for (let server of Object.values(this.__servers)) {
                tasks.push(server.update())
            }
            await Promise.all(tasks)
        } catch (err) {
            console.error(err)
        }
    }

    run() {
        if (this.__interval)
            return
        this.__interval = setInterval(async () => {
            await this.update()
        }, this.__updateInterval);
    }

    stop() {
        if (!this.__interval)
            return
        clearInterval(this.__interval)
        this.__interval = undefined
    }

    /**
     * @type {{servers: TSSServer[]}}
     */
    getAllServers() {
        return { servers: Object.values(this.__servers) }
    }

    /**
     * @param {String} serverUrl 
     * @returns {TSSServer}
     */
    getServer(serverUrl) {
        const server = this.__servers[serverUrl]
        if (!server)
            return
        return server.error ? { error: server.error } : server
    }


    getServerContract(serverUrl, contract) {
        const server = this.getServer(serverUrl)
        if (!server)
            return
        if (server.error)
            return { error: server.error }
        const contractData = server.data.contracts.find(c => c.contract === contract)
        if (!contractData)
            return
        const contractResult = Object.assign({}, contractData)
        contractResult.fee = server.data.runFee
        contractResult.turret = server.data.turret
        return contractResult
    }
}