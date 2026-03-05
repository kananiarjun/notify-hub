import { MongoClient, Db, type Collection, type Document } from "mongodb";

const globalForMongo = globalThis as unknown as {
  client: MongoClient | undefined;
  db: Db | undefined;
};

/**
 * Get MongoDB URI - prefers direct connection, no DNS required
 * Priority: MONGODB_DIRECT_URL > MONGODB_URL (converted if SRV)
 */
function getMongoUri(): string {
  // Direct URL - use as-is, no DNS lookup
  const directUri = process.env.MONGODB_DIRECT_URL;
  if (directUri) {
    console.log("📡 Using direct MongoDB connection (no DNS)");
    return directUri;
  }

  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error(
      "Please define MONGODB_DIRECT_URL or MONGODB_URL environment variable"
    );
  }

  // If SRV format, warn that it needs DNS
  if (uri.startsWith("mongodb+srv://")) {
    console.warn(
      "⚠️  MONGODB_URL uses SRV format which requires DNS.\n" +
        "   Set MONGODB_DIRECT_URL with standard mongodb:// format to skip DNS lookup.\n" +
        "   Get it from Atlas: Connect → Drivers → Node.js → 'mongodb://' option"
    );
  }

  return uri;
}

if (!globalForMongo.client) {
  const uri = getMongoUri();
  globalForMongo.client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
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

export async function getCollection<T extends Document>(
  name: string
): Promise<Collection<T>> {
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
