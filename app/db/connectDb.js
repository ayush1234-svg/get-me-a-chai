import mongoose from 'mongoose'

const connectDb = async () => {
  if (mongoose.connection.readyState >= 1) {
    return
  }
  
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tea')
}

export default connectDb
