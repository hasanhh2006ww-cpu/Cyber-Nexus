import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        preferences: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "انتهت صلاحية جلستك", sessionExpired: true },
        { status: 401 }
      );
    }

    const preferences = user.preferences
      ? JSON.parse(user.preferences)
      : { newCourseNotifications: true, emailNotifications: false };

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      preferences,
    });
  } catch (error) {
    console.error("[USER SETTINGS GET] ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;

    const body = await req.json();
    const { name, email, avatar, currentPassword, newPassword, preferences } = body;

    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: auth.user.id } },
      });
      if (existing) {
        return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 });
      }
    }

    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: auth.user.id },
        select: { password: true },
      });
      if (!user) {
        return NextResponse.json({ error: "انتهت صلاحية الجلسة", sessionExpired: true }, { status: 401 });
      }

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: auth.user.id },
        data: { password: hashed },
      });

      return NextResponse.json({ success: true, message: "تم تحديث كلمة المرور بنجاح" });
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (preferences !== undefined) updateData.preferences = JSON.stringify(preferences);

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: auth.user.id },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true, message: "تم تحديث الإعدادات بنجاح" });
  } catch (error) {
    console.error("[USER SETTINGS PUT] ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ("response" in auth) return auth.response;

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "انتهت صلاحية الجلسة", sessionExpired: true }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: auth.user.id },
      select: { courseId: true },
    });

    for (const enrollment of enrollments) {
      const lessonIds = await prisma.lesson.findMany({
        where: { courseId: enrollment.courseId },
        select: { id: true },
      });
      const ids = lessonIds.map((l) => l.id);

      if (ids.length > 0) {
        await prisma.progress.deleteMany({
          where: { userId: auth.user.id, lessonId: { in: ids } },
        });
        const quizIds = await prisma.quiz.findMany({
          where: { lessonId: { in: ids } },
          select: { id: true },
        });
        if (quizIds.length > 0) {
          await prisma.result.deleteMany({
            where: { userId: auth.user.id, quizId: { in: quizIds.map((q) => q.id) } },
          });
        }
      }
    }

    await prisma.enrollment.deleteMany({ where: { userId: auth.user.id } });
    await prisma.comment.deleteMany({ where: { userId: auth.user.id } });
    await prisma.review.deleteMany({ where: { userId: auth.user.id } });
    await prisma.user.delete({ where: { id: auth.user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[USER SETTINGS DELETE] ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
