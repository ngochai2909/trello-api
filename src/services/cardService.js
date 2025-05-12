import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newCard = {
      ...reqBody
    }

    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      getNewCard.cards = []
      await columnModel.pushCardIdToBoard(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updateCard = await cardModel.update(cardId, {
      ...reqBody,
      updatedAt: Date.now()
    })

    return updateCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
