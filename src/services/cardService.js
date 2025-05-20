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

const update = async (cardId, reqBody, cardCoverFile) => {
  // eslint-disable-next-line no-useless-catch
  try {
    console.log('Updating card:', { cardId, reqBody, cardCoverFile })
    let updateCard = {}
    if (cardCoverFile) {
      console.log('Uploading file to Cloudinary:', {
        originalname: cardCoverFile.originalname,
        mimetype: cardCoverFile.mimetype,
        size: cardCoverFile.size
      })
      const result = await cloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        'card-covers'
      )
      console.log('Cloudinary upload result:', result)
      updateCard = await cardModel.update(cardId, {
        cover: result.secure_url,
        updatedAt: Date.now()
      })
      console.log('Updated card with cover:', updateCard)
    } else {
      updateCard = await cardModel.update(cardId, {
        ...reqBody,
        updatedAt: Date.now()
      })
      console.log('Updated card without cover:', updateCard)
    }

    return updateCard
  } catch (error) {
    console.error('Error updating card:', error)
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
