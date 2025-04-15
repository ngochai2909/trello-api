import Joi from 'joi'
import { ObjectId, ReturnDocument } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPE } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'

// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required(),
  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELD = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const createBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(validData)
    return createBoard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: { _id: new ObjectId(id), _destroy: false }
        },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
        }
      ])
      .toArray()

    // const result = await GET_DB()
    //   .collection(BOARD_COLLECTION_NAME)
    //   .findOne({ _id: new ObjectId(id) })

    console.log(result)

    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELD.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(
        (columnId) => new ObjectId(columnId)
      )
    }

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(boardId)
        },

        { $set: updateData },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pushColumnIdToBoard = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(column.boardId)
        },

        { $push: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pullColumnIdToBoard = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(column.boardId)
        },

        { $pull: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

//67eeca3e644244f0269745f1

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnIdToBoard,
  update,
  pullColumnIdToBoard
}
