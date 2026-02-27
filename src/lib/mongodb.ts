  import { MongoClient, Db, type Collection, type Document } from "mongodb";

const globalForMongo = globalThis as unknown as {
  client: MongoClient | undefined;
  db: Db | undefined;
};

if (!globalForMongo.client) {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error("Please define MONGODB_URL environment variable");
  }

  globalForMongo.client = new MongoClient(uri);
}

export const client = globalForMongo.client;

export async function getDatabase(): Promise<Db> {
  if (!globalForMongo.db) {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    globalForMongo.db = client.db("notifyhub");
    console.log("✅ MongoDB connected successfully!");
  }
  return globalForMongo.db;
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const db = await getDatabase();
  return db.collection<T>(name);
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    console.log("🔍 Checking MongoDB connection...");
    const db = await getDatabase();
    await db.admin().ping();
    console.log("✅ MongoDB ping successful!");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    return false;
  }
}
