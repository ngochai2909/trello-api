import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    const createCard = await cardService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createCard)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const userInfo = req.jwtDecoded
    const updateCard = await cardService.update(
      req.params.cardId,
      req.body,
      req.file,
      userInfo
    )

    res.status(StatusCodes.OK).json(updateCard)
  } catch (error) {
    next(error)
  }
}

export const cardController = {
  createNew,
  update
}
