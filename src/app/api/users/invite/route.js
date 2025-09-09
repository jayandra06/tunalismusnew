import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "../../../../models/User";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function POST(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");

    if (!authorize("admin", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, email, role } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { message: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: "invited",
    });

    return NextResponse.json({ message: "User invited successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/users/invite:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
