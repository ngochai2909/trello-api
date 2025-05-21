import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { cloudinaryProvider } from '~/providers/cloudinaryProvider'

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

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  // eslint-disable-next-line no-useless-catch
  try {
    let updateCard = {}
    if (cardCoverFile) {
      const result = await cloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        'card-covers'
      )
      updateCard = await cardModel.update(cardId, {
        cover: result.secure_url,
        updatedAt: Date.now()
      })
    } else if (reqBody.comment) {
      const commentData = {
        ...reqBody.comment,
        userId: userInfo.userId,
        userEmail: userInfo.email,
        updatedAt: Date.now()
      }

      updateCard = await cardModel.unshiftCommentToCard(cardId, commentData)
    } else {
      updateCard = await cardModel.update(cardId, {
        ...reqBody,
        updatedAt: Date.now()
      })
    }

    return updateCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
