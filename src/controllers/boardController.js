import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json({
      message: 'Post: post from controller Create board successfully'
    })
    throw new ApiError('Error from controller')
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew
}
