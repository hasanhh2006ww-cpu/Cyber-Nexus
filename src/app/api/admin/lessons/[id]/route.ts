import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      title, content, contentType, videoUrl, fileUrl, fileType,
      externalUrl, codeContent, codeLanguage, order, duration,
      isPreview, sectionId,
    } = body

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(contentType !== undefined && { contentType }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(fileType !== undefined && { fileType }),
        ...(externalUrl !== undefined && { externalUrl }),
        ...(codeContent !== undefined && { codeContent }),
        ...(codeLanguage !== undefined && { codeLanguage }),
        ...(order !== undefined && { order }),
        ...(duration !== undefined && { duration }),
        ...(isPreview !== undefined && { isPreview }),
        ...(sectionId !== undefined && { sectionId: sectionId || null }),
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Update lesson error:", error)
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.lesson.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete lesson error:", error)
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
  }
}
