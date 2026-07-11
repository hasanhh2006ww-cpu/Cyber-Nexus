import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, order, courseId } = body

    if (!title || !courseId) {
      return NextResponse.json({ error: "title and courseId are required" }, { status: 400 })
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const section = await prisma.section.create({
      data: { title, description: description || "", order: order || 0, courseId },
    })

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error("Create section error:", error)
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
  }
}
