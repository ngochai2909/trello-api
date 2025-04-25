import bcrypt from 'bcryptjs/dist/bcrypt'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'

const createNew = async (reqBody) => {
  const existUser = await userModel.findOneByEmail(reqBody.email)
  if (existUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
  }
  const nameFromEmail = reqBody.email.split('@')[0]

  const newUser = {
    email: reqBody.email,
    password: bcrypt.hashSync(reqBody.password, 8),
    userName: nameFromEmail,
    displayName: nameFromEmail,
    verifyToken: uuidv4()
  }

  const createdUser = await userModel.createNew(newUser)
  const getNewUser = await userModel.findOneById(createdUser.insertedId)
  return pickUser(getNewUser)
}

export const userService = {
  createNew
}
