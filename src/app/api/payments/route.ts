import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import type { Payment, User } from "@/lib/schema";
import { randomUUID } from "crypto";

// GET /api/payments - List user's payments
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = { userId: session.user.id };
    if (status && status !== "all") {
      where.status = status;
    }

    const paymentsCollection = await getCollection<Payment>("payments");

    const [payments, total] = await Promise.all([
      paymentsCollection
        .find(where)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      paymentsCollection.countDocuments(where),
    ]);

    // Calculate summary stats
    const statsAgg = await paymentsCollection
      .aggregate([
        { $match: { userId: session.user.id, status: "completed" } },
        { $group: { _id: null, totalSpent: { $sum: "$amount" }, completedCount: { $sum: 1 } } },
      ])
      .toArray();
    const stats = statsAgg[0] as { totalSpent?: number; completedCount?: number } | undefined;

    return NextResponse.json({
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalSpent: stats?.totalSpent || 0,
        completedCount: stats?.completedCount || 0,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create a new payment (simulate processing)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      amount,
      currency = "USD",
      cardNumber,
      cardExpiry,
      cardCvc,
      billingName,
      billingEmail,
      plan,
      description,
    } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!cardNumber || !cardExpiry || !cardCvc) {
      return NextResponse.json({ error: "Card details are required" }, { status: 400 });
    }

    // Clean card number (remove spaces)
    const cleanCardNumber = cardNumber.replace(/\s+/g, "");

    // Validate card number length
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      return NextResponse.json({ error: "Invalid card number" }, { status: 400 });
    }

    // Detect card brand
    let cardBrand = "unknown";
    if (/^4/.test(cleanCardNumber)) cardBrand = "visa";
    else if (/^5[1-5]/.test(cleanCardNumber) || /^2[2-7]/.test(cleanCardNumber)) cardBrand = "mastercard";
    else if (/^3[47]/.test(cleanCardNumber)) cardBrand = "amex";
    else if (/^6(?:011|5)/.test(cleanCardNumber)) cardBrand = "discover";

    const cardLast4 = cleanCardNumber.slice(-4);

    // Generate a unique transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const paymentsCollection = await getCollection<Payment>("payments");
    const usersCollection = await getCollection<User>("users");
    const now = new Date();

    // Create payment record as "processing"
    const payment: Payment = {
      id: randomUUID(),
      amount: parseFloat(amount),
      currency,
      status: "processing",
      paymentMethod: "card",
      cardLast4,
      cardBrand,
      billingName: billingName || undefined,
      billingEmail: billingEmail || session.user.email || undefined,
      plan: plan || undefined,
      description: description || `Payment of ${currency} ${amount}`,
      transactionId,
      createdAt: now,
      updatedAt: now,
      userId: session.user.id,
    };

    await paymentsCollection.insertOne(payment);

    // Simulate payment processing (2-second delay)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate success (90% chance) or failure (10% chance)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      await paymentsCollection.updateOne(
        { id: payment.id, userId: session.user.id },
        {
          $set: {
            status: "completed",
            processedAt: new Date(),
            receiptUrl: `/api/payments/${payment.id}/receipt`,
            updatedAt: new Date(),
          },
        }
      );
      const updatedPayment = await paymentsCollection.findOne({ id: payment.id, userId: session.user.id });

      if (!updatedPayment) {
        return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
      }

      // If this was a plan upgrade payment, update the user's plan
      if (plan && ["BASIC", "PREMIUM"].includes(plan)) {
        await usersCollection.updateOne(
          { id: session.user.id },
          { $set: { plan: plan as "BASIC" | "PREMIUM", planStartDate: new Date(), updatedAt: new Date() } }
        );
      }

      return NextResponse.json({
        success: true,
        payment: updatedPayment,
        message: "Payment processed successfully!",
      });
    } else {
      await paymentsCollection.updateOne(
        { id: payment.id, userId: session.user.id },
        {
          $set: {
            status: "failed",
            failureReason: "Card declined. Please try a different payment method.",
            updatedAt: new Date(),
          },
        }
      );
      const updatedPayment = await paymentsCollection.findOne({ id: payment.id, userId: session.user.id });

      if (!updatedPayment) {
        return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
      }

      return NextResponse.json(
        {
          success: false,
          payment: updatedPayment,
          message: "Payment failed. Card was declined.",
        },
        { status: 402 }
      );
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
