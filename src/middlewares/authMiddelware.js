import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { jwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken

  if (!clientAccessToken) {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized (token not found)')
    )
    return
  }

  try {
    const decoded = await jwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_KEY
    )

    req.jwtDecoded = decoded

    next()
  } catch (error) {
    console.log(error, 'authMiddleware')

    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Token expired'))
      return
    }
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized (token invalid)'))
  }
}

export const authMiddleware = {
  isAuthorized
}
