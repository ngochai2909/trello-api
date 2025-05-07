/**
 * Script để đặt lại mật khẩu
 * Sử dụng: node resetPassword.js email@example.com newPassword123
 */

require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')

async function resetPassword() {
  const args = process.argv.slice(2)

  if (args.length !== 2) {
    console.error(
      'Sử dụng: node resetPassword.js email@example.com newPassword123'
    )
    process.exit(1)
  }

  const email = args[0]
  const newPassword = args[1]

  // Kết nối MongoDB
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log('Đã kết nối tới MongoDB')

    const db = client.db(process.env.DATABASE_NAME)
    const usersCollection = db.collection('users')

    // Tìm user theo email
    const user = await usersCollection.findOne({ email })

    if (!user) {
      console.error(`Không tìm thấy người dùng với email: ${email}`)
      process.exit(1)
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = bcrypt.hashSync(newPassword, 8)

    // Cập nhật mật khẩu
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(user._id) },
      { $set: { password: hashedPassword } }
    )

    if (result.modifiedCount === 1) {
      console.log(`Mật khẩu cho ${email} đã được đặt lại thành công!`)
    } else {
      console.error('Không thể cập nhật mật khẩu')
    }
  } catch (error) {
    console.error('Lỗi:', error)
  } finally {
    await client.close()
    console.log('Đã đóng kết nối MongoDB')
  }
}

resetPassword().catch(console.error)
