// @flow

import delay from 'delay'
import { RTMClient } from '@slack/client'
import config from 'config'
import axios from 'axios'
import dbApi from './db-api'
import type { DbApi } from 'icarus-backend'; // eslint-disable-line

const { logger } = config.get('server')

function fetchBestBlock(db): Promise<any> {
  return dbApi(db).bestBlock()
}

async function start(db: any) {
  logger.debug('start')
  const token = process.env.SLACK_TOKEN
  const channelId = process.env.SLACK_CHANNEL
  process.env.DATABASE_UNHEALTHY = 'false'
  const rtm = new RTMClient(token)
  rtm.start()

  let healthy = true
  let prevBestBlock = 0

  while (true) { // eslint-disable-line
    const currentBestBlock = Number(await fetchBestBlock(db)) // eslint-disable-line
    // compare block number to the expected value based on the official blockchain explorer data
    const behind = await axios.get('https://cardanoexplorer.com/api/blocks/pages') // eslint-disable-line
      .then(response => {
        const pages = response.data.Right[0]
        const items = response.data.Right[1].length
        const explorerBlock = ((pages - 1) * 10) + items
        return (explorerBlock - currentBestBlock > 3)
      })
      .catch(error => {
        logger.debug(error)
        return false
      })
    // the database is considered up to date if the block number changed and is not too far behind
    const upToDate = !(prevBestBlock === currentBestBlock) && !behind

    if (healthy !== upToDate) {
      process.env.DATABASE_UNHEALTHY = healthy.toString()
      healthy = upToDate
      const message = upToDate ? 'Database is updating again.' : 'Database did not update!'
      logger.info(message)
      rtm.sendMessage(`${process.env.name || 'backend-service'}: ${message}`, channelId)
        .then(() => {
          logger.debug('Message was sent without problems.')
        })
    }

    prevBestBlock = currentBestBlock
    await delay(70000) // eslint-disable-line
  }
}

export default start
