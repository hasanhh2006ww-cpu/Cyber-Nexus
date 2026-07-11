import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { lessons: true, sections: true, reviews: true },
        },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, descriptionLong, thumbnail, banner, category,
      difficulty, language, duration, instructorName, instructorBio,
      instructorAvatar, tags, isFree, isPublished, isFeatured, sortOrder,
      commentsEnabled, reviewsEnabled, xpPoints, certificateEnabled,
    } = body;

    if (!title || !description || !category || !duration) {
      return NextResponse.json(
        { error: "title, description, category, and duration are required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        descriptionLong: descriptionLong || "",
        thumbnail: thumbnail || null,
        banner: banner || null,
        category,
        difficulty: difficulty || "beginner",
        language: language || "ar",
        duration,
        instructorName: instructorName || "",
        instructorBio: instructorBio || "",
        instructorAvatar: instructorAvatar || null,
        tags: JSON.stringify(tags || []),
        isFree: isFree !== false,
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
        sortOrder: sortOrder || 0,
        commentsEnabled: commentsEnabled !== false,
        reviewsEnabled: reviewsEnabled !== false,
        xpPoints: xpPoints || 0,
        certificateEnabled: certificateEnabled || false,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
