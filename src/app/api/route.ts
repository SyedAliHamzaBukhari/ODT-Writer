// src/app/api/documents/route.ts
// GET  /api/documents  → list all documents for the authenticated user
// POST /api/documents  → create a new document

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const documents = await db.document.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ documents })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { title = "Untitled", content = "" } = body

  const document = await db.document.create({
    data: {
      userId: session.user.id,
      title: String(title).trim().slice(0, 255) || "Untitled",
      content: String(content),
    },
  })

  return NextResponse.json({ document }, { status: 201 })
}