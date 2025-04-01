/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import { CLOSE_DATABASE, CONNECT_DATABASE } from './config/mongodb'
import exitHook from 'async-exit-hook'

import { env } from './config/environment'
import { API_V1 } from './routes/v1'

const START_SERVER = () => {
  const app = express()

  app.use('/v1', API_V1)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(
      `3.Hello Hai Nguyen, I am running at ${env.APP_PORT}:${env.APP_HOST}/`
    )
  })
  exitHook(() => {
    console.log('disconnecting from database....')
    CLOSE_DATABASE()
    console.log('disconnected from database successfully')
  })
}

;(async () => {
  try {
    console.log('1.Connecting to database....')
    await CONNECT_DATABASE()
    console.log('2.Connected to database....')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

// CONNECT_DATABASE()
//   .then(() => console.log('Connect to database successfully'))
//   .then(() => START_SERVER())
//   .catch((error) => {
//     console.error(error)
//     process.exit(0)
//   })
