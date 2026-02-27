import { getCollection } from "@/lib/mongodb";
import type { User } from "@/lib/schema";

async function main() {
  const usersCollection = await getCollection<User>("users");
  const users = await usersCollection.find({}).sort({ createdAt: 1 }).toArray();

  if (users.length === 0) {
    console.log("No users found. Please register an account first.");
    return;
  }

  const user = users[users.length - 1]; // Let's upgrade the last created user

  const now = new Date();
  await usersCollection.updateOne(
    { id: user.id },
    {
      $set: {
        role: "ADMIN",
        plan: "PREMIUM",
        emailUsed: 0,
        smsUsed: 0,
        updatedAt: now,
      },
    }
  );
  const updatedUser = await usersCollection.findOne({ id: user.id });

  if (!updatedUser) {
    console.log("Failed to update user");
    return;
  }

  console.log(`Updated user ${updatedUser.email} to ADMIN with PREMIUM plan!`);
}

main()
  .catch((e) => {
    console.error("❌ Runtime Error:");
    console.error(JSON.stringify(e, null, 2));
    if (e.cause) {
      console.error("🔍 Cause:");
      console.error(JSON.stringify(e.cause, null, 2));
    }
    process.exit(1);
  })
  .finally(() => {});
