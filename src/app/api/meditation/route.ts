import { NextResponse } from "next/server";
import translate from "google-translate-api-x";
import fs from "fs";
import path from "path";
import os from "os";

// 인메모리 캐시 (프로세스 내)
const memCache: Record<string, MeditationResponse> = {};

// 파일 캐시 경로 (서버 재시작해도 유지)
const CACHE_DIR = path.join(os.tmpdir(), "gratitude-journal-cache");
function getCacheFilePath(date: string) {
  return path.join(CACHE_DIR, `meditation-${date}.json`);
}
function readFileCache(date: string): MeditationResponse | null {
  try {
    const file = getCacheFilePath(date);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch {}
  return null;
}
function writeFileCache(date: string, data: MeditationResponse) {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(getCacheFilePath(date), JSON.stringify(data), "utf-8");
  } catch {}
}

interface MeditationResponse {
  date: string;
  title_en: string;
  title_ko: string;
  quote_en: string;
  quote_ko: string;
  source_en: string;
  source_ko: string;
  body_en: string;
  body_ko: string;
}

function cleanHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, "\u201c")
    .replace(/&rdquo;/g, "\u201d")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/\s+/g, " ")
    .trim();
}

function parseJftHtml(html: string): Omit<
  MeditationResponse,
  "date" | "title_ko" | "quote_ko" | "source_ko" | "body_ko"
> {
  // 제목: <h1> 태그
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title_en = h1Match ? cleanHtml(h1Match[1]) : "Just For Today";

  // 인용구: align="left" 셀 중 " + <i> 로 시작하는 셀
  const quoteMatch = html.match(
    /<td[^>]*align=["']?left["']?[^>]*>\s*["\u201c]\s*<i[^>]*>([\s\S]*?)<\/i>/i
  );
  const quote_en = quoteMatch ? cleanHtml(quoteMatch[1]) : "";

  // 출처: align="center" 셀 중 "p. 숫자" 포함 + "Page"로 시작하지 않고 + Copyright 아닌 것
  const centerCells = Array.from(
    html.matchAll(/<td[^>]*align=["']?center["']?[^>]*>([\s\S]*?)<\/td>/gi)
  );
  let source_en = "";
  for (const m of centerCells) {
    const text = cleanHtml(m[1]);
    if (
      /p\.\s*\d+/i.test(text) &&
      !/^Page\s+\d+/i.test(text) &&
      !/copyright/i.test(text)
    ) {
      source_en = text;
      break;
    }
  }

  // 본문: align="left" 셀 중 인용구 셀이 아닌 것 (h2 포함 셀 제외)
  const leftCells = Array.from(
    html.matchAll(/<td[^>]*align=["']?left["']?[^>]*>([\s\S]*?)<\/td>/gi)
  );
  const bodyParts: string[] = [];
  for (const m of leftCells) {
    const raw = m[1].trim();
    const text = cleanHtml(raw);
    // 날짜 셀 (h2 포함) 제외
    if (/<h2[\s>]/i.test(raw)) continue;
    // 인용구 셀 제외: 따옴표 + italic 으로 시작
    if (/^["\u201c]/.test(text) && /<i[\s>]/i.test(raw)) continue;
    // 너무 짧은 셀 제외
    if (text.length < 30) continue;
    bodyParts.push(text);
  }
  const body_en = bodyParts.join("\n\n");

  return { title_en, quote_en, source_en, body_en };
}

async function translateText(text: string): Promise<string> {
  if (!text.trim()) return "";
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (translate as any)(text, { from: "en", to: "ko" });
    return (result as { text: string }).text ?? text;
  } catch {
    return text; // 번역 실패 시 원문 반환
  }
}

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  // 1) 인메모리 캐시
  if (memCache[today]) return NextResponse.json(memCache[today]);

  // 2) 파일 캐시 (서버 재시작 후에도 유지)
  const fileHit = readFileCache(today);
  if (fileHit) {
    memCache[today] = fileHit;
    return NextResponse.json(fileHit);
  }

  try {
    const response = await fetch("https://www.jftna.org/jft/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const { title_en, quote_en, source_en, body_en } = parseJftHtml(html);

    // 4개 섹션 병렬 번역
    const [title_ko, quote_ko, source_ko, body_ko] = await Promise.all([
      translateText(title_en),
      translateText(quote_en),
      translateText(source_en),
      translateText(body_en),
    ]);

    const data: MeditationResponse = {
      date: today,
      title_en,
      title_ko,
      quote_en,
      quote_ko,
      source_en,
      source_ko,
      body_en,
      body_ko,
    };

    memCache[today] = data;
    writeFileCache(today, data);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "명상 내용을 불러올 수 없습니다.", date: today },
      { status: 500 }
    );
  }
}
