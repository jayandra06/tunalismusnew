import { NextResponse } from "next/server";
import Payment from "../../../../models/Payment";
import { connectToDB } from "../../../../lib/mongodb";

export async function GET(req) {
  try {
    await connectToDB();

    const userId = req.headers.get("X-User-Id");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payments = await Payment.find({ user: userId }).populate(
      "course",
      "title"
    );

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/payments/history:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
