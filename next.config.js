const produce = require('immer').default
const current = require('immer').current
const _ = require('lodash')

module.exports = (phase, { defaultConfig }) =>
  produce(defaultConfig, (config) => {
    process.env.PUBLIC_PATH && (config.assetPrefix = process.env.PUBLIC_PATH)
  })
