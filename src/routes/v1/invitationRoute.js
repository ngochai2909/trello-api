import express from 'express'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddelware'
import { invitationValidation } from '~/validations/invitationValidation'
const Router = express.Router()

Router.route('/board').post(
  authMiddleware.isAuthorized,
  invitationValidation.createNewBoardInvitation,
  invitationController.createNewBoardInvitation
)

export const invitationRoute = Router
