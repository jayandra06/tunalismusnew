import { NextResponse } from "next/server";
import Payment from "../../../models/Payment";
import { connectToDB } from "../../../lib/mongodb";
import { authorize } from "../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");

    if (!authorize("admin", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const payments = await Payment.find({})
      .populate("user", "name email")
      .populate("course", "title");

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/payments:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
