import bcrypt from 'bcryptjs/dist/bcrypt'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { jwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
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

    const verifycationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'please verify your email'
    const htmlContent = `
  <h3>here is your verification link</h3>
  <p>${verifycationLink}</p>
  <p>if you did not request this email, please ignore it</p>
  <p>thank you</p>
  `

    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    return pickUser(getNewUser)
  } catch (error) {
    console.log(error)
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    if (existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'User already actived')
    }

    if (existUser.verifyToken !== reqBody.token) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid token')
    }

    await userModel.update(existUser._id, {
      isActive: true,
      verifyToken: null
    })

    return pickUser(existUser)
  } catch (error) {
    console.log(error)
    throw error
  }
}

const login = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'User not actived')
    }
    if (!bcrypt.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your email or password is incorrect'
      )
    }
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_KEY,
      // env.ACCESS_TOKEN_LIFE
      5
    )

    const refreshToken = await jwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_KEY,
      // env.REFRESH_TOKEN_LIFE
      15
    )

    return {
      accessToken,
      refreshToken,
      ...pickUser(existUser)
    }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (refreshToken) => {
  // eslint-disable-next-line no-useless-catch
  try {
    if (!refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token not found')
    }

    const decoded = await jwtProvider.verifyToken(
      refreshToken,
      env.REFRESH_TOKEN_SECRET_KEY
    )
    const userInfo = {
      _id: decoded._id,
      email: decoded.email
    }
    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_KEY,
      // env.ACCESS_TOKEN_LIFE
      5
    )
    return {
      accessToken
    }
  } catch (error) {
    if (error?.message?.includes('jwt expired')) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token expired')
    }
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken
}
