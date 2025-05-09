import { env } from '~/config/environment'
import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
const cloudinaryV2 = cloudinary.v2

cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const streamUpload = cloudinaryV2.uploader.upload_stream(
      {
        folder: folderName
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )

    streamifier.createReadStream(fileBuffer).pipe(streamUpload)
  })
}
export const cloudinaryProvider = {
  streamUpload
}
