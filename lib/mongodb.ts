import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error('Missing MONGO_URI');
}

// type cho cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// khai báo global
declare global {
  var mongoose: MongooseCache | undefined;
}

// lấy cache từ global hoặc tạo mới
const cached = global.mongoose ?? {
  conn: null,
  promise: null,
};

global.mongoose = cached;

export async function connectDB() {
  // nếu đã có connection thì dùng lại
  if (cached.conn) return cached.conn;

  // nếu chưa có promise thì tạo mới
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      dbName: 'stock-db',
      bufferCommands: false,
    });
  }

  // await connection
  cached.conn = await cached.promise;
  return cached.conn;
}
