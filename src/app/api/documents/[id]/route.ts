// src/app/api/documents/[id]/route.ts
// GET    /api/documents/:id  → fetch single document
// PUT    /api/documents/:id  → update title and/or content
// DELETE /api/documents/:id  → delete document

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface Params {
  params: { id: string }
}

async function getOwnedDocument(id: string, userId: string) {
  return db.document.findFirst({
    where: { id, userId },
  })
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const document = await getOwnedDocument(params.id, session.user.id)
  if (!document) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ document })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const existing = await getOwnedDocument(params.id, session.user.id)
  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const { title, content } = body

  const updated = await db.document.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title: String(title).trim().slice(0, 255) || "Untitled" }),
      ...(content !== undefined && { content: String(content) }),
    },
  })

  return NextResponse.json({ document: updated })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const existing = await getOwnedDocument(params.id, session.user.id)
  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  await db.document.delete({ where: { id: params.id } })

  return NextResponse.json({ message: "Deleted" })
}
