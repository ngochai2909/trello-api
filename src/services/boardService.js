import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    const createdBoard = await boardModel.createNew(newBoard)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    console.log(getNewBoard)

    return getNewBoard
  } catch (error) {
    throw error
  }
}
const getDetails = async (boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    const resBoard = cloneDeep(board)

    resBoard.columns.forEach((column) => {
      // column.cards = resBoard.cards.filter(
      //   (card) => card.columnId.toString() === column._id.toString()
      // )

      column.cards = resBoard.cards.filter((card) =>
        card.columnId.equals(column._id)
      )
    })

    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails
}
