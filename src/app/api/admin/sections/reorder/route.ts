import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { items } = body as { items: { id: string; order: number }[] }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "items array required" }, { status: 400 })
    }

    await Promise.all(
      items.map((item) =>
        prisma.section.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reorder sections error:", error)
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 })
  }
}
