// @flow

import delay from 'delay'
import { RTMClient } from '@slack/client'
import config from 'config'
import dbApi from './db-api'
import importerApi from './importer-api'
import type { DbApi } from 'icarus-backend'; // eslint-disable-line

const { logger, importerSendTxEndpoint } = config.get('server')
const importer = importerApi(importerSendTxEndpoint)

function fetchBestBlock(db): Promise<number> {
  return dbApi(db).bestBlock()
}

async function txTest(): Promise<boolean> {
  let response
  try {
    // eslint-disable-next-line max-len
    const txBody = '82839f8200d818582482582034b30ffcc37cb23320d01286e444711ceabc74e96c9fe2387f5c3f313942b32900ff9f8282d818584283581c8c0acb0542d176ddbb02678462081194e40204fb622960d188388b64a101581e581c6aedca971f6e65187d53b8315b90dfdb80ac4d6bc72c6bf0b5bad01e001a3c747b481a0007a1208282d818584283581ceb2e580be8db93a736bdd8e9fe0d5f6e8ca50f456bf11834749f98a4a101581e581c6aedca971f6e65187d53bc318a1979025a753c53a2d781e915cc5858001aaf177b461a000503daffa0818200d81858858258409b39227a5c47d594e14b39304af5100a7de7f348d0548b7dc9df49615b9a2de50e6ed2a5ebe9b917cea198cb4c2db24d3829ab4cd7b0345df8aa420d5d7acc6f584004d4d7db6eb5b0f352d3f5ad036ce73968155a539f7f60f85a1d9b264d1cc2bc9e7eef7262fa45b579dd1f30b8d7faff9e362a77a4f51c66074b75e47e15bf06'
    const signedBody = {
      signedTx: Buffer.from(txBody, 'hex').toString('base64'),
    }
    response = await importer.sendTx(signedBody)
    return response.status === 200
  } catch (err) {
    logger.error('[healthcheck] Unexpected tx submission response:')
    logger.error(response)
    logger.error('[healthcheck] Error trying to connect with importer')
    logger.error(err)
    return false
  }
}

async function healthcheck(db: any) {
  logger.debug('start')

  global.instanceUnhealthyFrom = null

  const token = process.env.SLACK_TOKEN
  const channelId = process.env.SLACK_CHANNEL
  const rtm = new RTMClient(token)
  if (token) {
    rtm.start()
  }

  while (true) { // eslint-disable-line
    const currentBestBlock = await fetchBestBlock(db) // eslint-disable-line

    const expectedBlock = await axios.get('https://cardanoexplorer.com/api/blocks/pages') // eslint-disable-line
      .then(response => {
        const pages = response.data.Right[0]
        const items = response.data.Right[1].length
        return ((pages - 1) * 10) + items
      })
      .catch(error => {
        logger.debug(error)
        return 0
      })

    const isDbSynced = (expectedBlock - currentBestBlock <= 5)

    // eslint-disable-next-line no-await-in-loop
    const canSubmitTx = await txTest()

    const isInstanceHealthy = isDbSynced && canSubmitTx
    const wasInstanceHealthy = global.instanceUnhealthyFrom === null

    if (isInstanceHealthy !== wasInstanceHealthy) {
      global.instanceUnhealthyFrom = isInstanceHealthy ? null : currentTime

      const message = isInstanceHealthy ? 'Database is updating again.' : 'Database did not update!'
      logger.info(message)
      rtm.sendMessage(`${process.env.name || 'backend-service'}: ${message}`, channelId)
        .then(() => {
          logger.debug('Message was sent without problems.')
        })
        .catch((e) => {
          logger.error(`Error sending slack message: ${e}`)
        })
    }

    await delay(70000) // eslint-disable-line
  }
}

export default healthcheck
