import { NextResponse } from "next/server";

export const revalidate = 3600; // 1시간 캐시

export async function GET() {
  try {
    // JFT (Just For Today) 웹사이트에서 오늘의 명상 가져오기
    const response = await fetch("https://www.jftna.org/jft/", {
      next: { revalidate: 3600 },
    });
    const html = await response.text();

    // HTML 파싱
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace("JFT - ", "").trim() : "Just For Today";

    // 본문 추출 (테이블 기반 레이아웃에서)
    const tdMatches = html.match(/<td[^>]*class="pointed"[^>]*>([\s\S]*?)<\/td>/gi);
    let content = "";

    if (tdMatches) {
      content = tdMatches
        .map((td) =>
          td
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
            .replace(/&#39;/g, "'")
            .trim()
        )
        .filter((text) => text.length > 0)
        .join("\n\n");
    }

    if (!content) {
      // fallback: body에서 텍스트 추출
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        content = bodyMatch[1]
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, "\n")
          .replace(/&nbsp;/g, " ")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, "&")
          .replace(/&#39;/g, "'")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      }
    }

    return NextResponse.json({
      title,
      content: content || "오늘의 명상을 불러올 수 없습니다.",
      date: new Date().toISOString().split("T")[0],
    });
  } catch {
    return NextResponse.json(
      {
        title: "Just For Today",
        content: "명상 내용을 불러오는 데 실패했습니다. 인터넷 연결을 확인해주세요.",
        date: new Date().toISOString().split("T")[0],
      },
      { status: 500 }
    );
  }
}
