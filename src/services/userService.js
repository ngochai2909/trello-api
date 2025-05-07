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
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await jwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_KEY,
      env.REFRESH_TOKEN_LIFE
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
      env.ACCESS_TOKEN_LIFE
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

const update = async (userId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const existUser = await userModel.findOneById(userId)
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    if (!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'User not actived')
    }

    const updateData = { ...reqBody }

    // Loại bỏ các trường password khỏi updateData nếu có
    if (updateData.current_password) delete updateData.current_password
    if (updateData.new_password) delete updateData.new_password

    // Nếu có thay đổi mật khẩu
    if (reqBody.current_password && reqBody.new_password) {
      if (!bcrypt.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          'Current password is incorrect'
        )
      }

      // Thêm mật khẩu mã hóa vào đối tượng cập nhật
      updateData.password = bcrypt.hashSync(reqBody.new_password, 8)
    }

    // Thêm thời gian cập nhật
    updateData.updatedAt = Date.now()

    // Thực hiện cập nhật và đợi kết quả
    const updatedUser = await userModel.update(userId, updateData)

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}
