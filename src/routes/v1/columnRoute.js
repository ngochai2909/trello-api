import express from 'express'
import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddelware'
import { columnValidation } from '~/validations/columnValidation'

const Router = express.Router()

Router.route('/').post(
  authMiddleware.isAuthorized,
  columnValidation.createNew,
  columnController.createNew
)

Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    columnValidation.update,
    columnController.update
  )
  .delete(columnValidation.deleteItem, columnController.deleteItem)

export const columnRoute = Router
