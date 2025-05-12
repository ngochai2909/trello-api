import express from 'express'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddelware'
import { cardValidation } from '~/validations/cardValidation'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  cardValidation.createNew,
  cardController.createNew
)

Router.route('/:cardId').put(
  authMiddleware.isAuthorized,
  cardValidation.update,
  cardController.update
)

export const cardRoute = Router
