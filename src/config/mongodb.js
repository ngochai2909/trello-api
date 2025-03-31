/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 *tk:hainn29dev
 * pass :Lucas2909%40
 */

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'

let instanceDatabase = null

const mongoCLientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DATABASE = async () => {
  await mongoCLientInstance.connect()
  instanceDatabase = mongoCLientInstance.db(env.DATABASE_NAME)
}

export const CLOSE_DATABASE = async () => {
  await mongoCLientInstance.close()
}

export const GET_DB = () => {
  if (!instanceDatabase) {
    throw new Error('Database not connected pleases connect first')
  }
  return instanceDatabase
}
