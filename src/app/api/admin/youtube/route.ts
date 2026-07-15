import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const YT_API = "https://www.googleapis.com/youtube/v3";

function parsePlaylistId(url: string): string | null {
  try {
    const u = new URL(url);
    const list = u.searchParams.get("list");
    if (list && list.startsWith("PL")) return list;
    return null;
  } catch {
    return null;
  }
}

function iso8601Duration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const h = parseInt(m[1] || "0");
  const min = parseInt(m[2] || "0");
  const s = parseInt(m[3] || "0");
  if (h > 0) return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${min}:${String(s).padStart(2, "0")}`;
}

async function fetchAllVideos(playlistId: string, apiKey: string) {
  const videos: { videoId: string; title: string; duration: string; thumbnail: string; order: number }[] = [];
  let pageToken = "";
  let order = 0;

  do {
    const url = `${YT_API}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || `YouTube API error ${res.status}`;
      if (res.status === 403) throw new Error("ال Playlist خاصة أو تجاوزت حدود YouTube API");
      if (res.status === 404) throw new Error("ال Playlist غير موجودة أو الرابط غير صالح");
      throw new Error(msg);
    }
    const data = await res.json();
    const ids: string[] = [];

    for (const item of data.items || []) {
      const vid = item.contentDetails?.videoId;
      if (!vid) continue;
      ids.push(vid);
      const sn = item.snippet || {};
      videos.push({
        videoId: vid,
        title: sn.title || "فيديو بدون عنوان",
        duration: "",
        thumbnail: sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || "",
        order: order++,
      });
    }

    if (ids.length > 0) {
      const idStr = ids.join(",");
      const durRes = await fetch(`${YT_API}/videos?part=contentDetails&id=${idStr}&key=${apiKey}`);
      if (durRes.ok) {
        const durData = await durRes.json();
        for (const v of durData.items || []) {
          const vid = v.id;
          const dur = iso8601Duration(v.contentDetails?.duration || "");
          const found = videos.find((x) => x.videoId === vid);
          if (found) found.duration = dur;
        }
      }
    }

    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return videos;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "YOUTUBE_API_KEY غير معرّف في المتغيرات البيئية" }, { status: 500 });
    }

    const body = await req.json();
    const { action, playlistUrl, courseId } = body;

    if (!action) {
      return NextResponse.json({ error: "action مطلوب" }, { status: 400 });
    }

    if ((action === "fetch" || action === "import" || action === "sync") && !playlistUrl) {
      return NextResponse.json({ error: "playlistUrl مطلوب" }, { status: 400 });
    }

    if ((action === "import" || action === "sync" || action === "update") && !courseId) {
      return NextResponse.json({ error: "courseId مطلوب" }, { status: 400 });
    }

    if (action === "fetch") {
      const playlistId = parsePlaylistId(playlistUrl);
      if (!playlistId) {
        return NextResponse.json({ error: "رابط Playlist غير صالح. تأكد من أن الرابط يحتوي على ?list=PL..." }, { status: 400 });
      }
      const videos = await fetchAllVideos(playlistId, apiKey);
      return NextResponse.json({ videos, count: videos.length });
    }

    if (action === "import" || action === "sync") {
      const playlistId = parsePlaylistId(playlistUrl);
      if (!playlistId) {
        return NextResponse.json({ error: "رابط Playlist غير صالح" }, { status: 400 });
      }

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        return NextResponse.json({ error: "الدورة غير موجودة" }, { status: 404 });
      }

      const videos = await fetchAllVideos(playlistId, apiKey);
      if (videos.length === 0) {
        return NextResponse.json({ error: "ال Playlist فارغة أو لا تحتوي على فيديوهات" }, { status: 400 });
      }

      const existing = await prisma.lesson.findMany({
        where: { courseId, contentType: "youtube" },
        select: { videoUrl: true },
      });
      const existingUrls = new Set(existing.map((l) => l.videoUrl));

      const maxOrder = await prisma.lesson.aggregate({
        where: { courseId },
        _max: { order: true },
      });
      let nextOrder = (maxOrder._max.order ?? 0) + 1;

      let imported = 0;
      let skipped = 0;
      let failed = 0;

      for (const vid of videos) {
        const videoUrl = `https://www.youtube.com/watch?v=${vid.videoId}`;

        if (action === "sync" && existingUrls.has(videoUrl)) {
          skipped++;
          continue;
        }

        if (existingUrls.has(videoUrl)) {
          skipped++;
          continue;
        }

        try {
          await prisma.lesson.create({
            data: {
              title: vid.title,
              contentType: "youtube",
              videoUrl,
              thumbnail: vid.thumbnail,
              duration: vid.duration,
              order: nextOrder++,
              courseId,
              isPreview: false,
            },
          });
          imported++;
        } catch {
          failed++;
        }
      }

      return NextResponse.json({
        imported,
        skipped,
        failed,
        total: videos.length,
      });
    }

    if (action === "update") {
      const lessons = await prisma.lesson.findMany({
        where: { courseId, contentType: "youtube" },
        orderBy: { order: "asc" },
      });

      if (lessons.length === 0) {
        return NextResponse.json({ error: "لا توجد دروس YouTube في هذه الدورة" }, { status: 400 });
      }

      const videoIds = lessons
        .map((l) => {
          const m = l.videoUrl.match(/v=([^&]+)/);
          return m ? m[1] : null;
        })
        .filter(Boolean) as string[];

      if (videoIds.length === 0) {
        return NextResponse.json({ error: "لم يتم التعرف على أي فيديوهات YouTube" }, { status: 400 });
      }

      const metaMap = new Map<string, { title: string; duration: string; thumbnail: string }>();

      for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);
        const url = `${YT_API}/videos?part=snippet,contentDetails&id=${batch.join(",")}&key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return NextResponse.json({ error: err?.error?.message || "YouTube API error" }, { status: 502 });
        }
        const data = await res.json();
        for (const v of data.items || []) {
          metaMap.set(v.id, {
            title: v.snippet?.title || "",
            duration: iso8601Duration(v.contentDetails?.duration || ""),
            thumbnail: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || "",
          });
        }
      }

      let updated = 0;
      for (const lesson of lessons) {
        const m = lesson.videoUrl.match(/v=([^&]+)/);
        if (!m) continue;
        const meta = metaMap.get(m[1]);
        if (!meta) continue;

        const updates: Record<string, string> = {};
        if (meta.title && meta.title !== lesson.title) updates.title = meta.title;
        if (meta.duration && meta.duration !== lesson.duration) updates.duration = meta.duration;
        if (meta.thumbnail && meta.thumbnail !== lesson.thumbnail) updates.thumbnail = meta.thumbnail;

        if (Object.keys(updates).length > 0) {
          await prisma.lesson.update({ where: { id: lesson.id }, data: updates });
          updated++;
        }
      }

      return NextResponse.json({ updated, total: lessons.length });
    }

    return NextResponse.json({ error: "action غير صالح" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
