// src/app/api/auth/register/route.ts
// POST /api/auth/register — create a new user account

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { db } from "@/lib/db"

const SALT_ROUNDS = 12

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { username, email, password } = body

  if (!username || !email || !password) {
    return NextResponse.json(
      { message: "Username, email and password are required." },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters." },
      { status: 400 }
    )
  }

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })

  if (existing) {
    return NextResponse.json(
      { message: "Email or username is already taken." },
      { status: 409 }
    )
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await db.user.create({
    data: {
      username: String(username).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash,
    },
    select: { id: true, username: true, email: true },
  })

  return NextResponse.json({ user }, { status: 201 })
}