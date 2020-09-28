
const rawConfig = require('../config') || {}

export class Config {
    /**
     * @type {String}
     */
    port
    
    /**
     * @type {Number}
     */
    updateInterval

    /**
     * @type {String[]}
     */
    targetServers
}

const config = new Config()
Object.assign(config, rawConfig)

config.port = process.env.TSSEXPPORT || config.port || '3000'
config.targetServers = process.env.TSSEXPTARGETSERVERS || config.targetServers
config.updateInterval = process.env.TSSEXPUPDATEINTERVAL || config.updateInterval || 60 * 1000

if (!config.targetServers)
    config.targetServers = []

export default config