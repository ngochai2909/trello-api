import { StatusCodes } from 'http-status-codes'
import { sample } from 'lodash'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    const createUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const verifyUser = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(verifyUser)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const loginUser = await userService.login(req.body)

    res.cookie('accessToken', loginUser.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.cookie('refreshToken', loginUser.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(StatusCodes.OK).json(loginUser)
  } catch (error) {
    next(error)
  }
}

const logout = (req, res, next) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({
      logout: true
    })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Please sign in'))
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken
}
