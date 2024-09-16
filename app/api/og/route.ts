import {NextRequest, NextResponse} from "next/server";
import {parse} from "node-html-parser";

function extractOGTags(html: string) {
  const root = parse(html);

  const ogTags = {
    ogImage:
      root
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content") || null,
    ogTitle:
      root
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content") || null,
    ogDescription:
      root
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content") || null,
    ogUrl:
      root.querySelector('meta[property="og:url"]')?.getAttribute("content") ||
      null,
    ogType:
      root.querySelector('meta[property="og:type"]')?.getAttribute("content") ||
      null,
  };

  return ogTags;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({error: "URL is required"}, {status: 400});
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; OGDataBot/1.0; +http://example.com/bot)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlText = await response.text();
    const ogTags = extractOGTags(htmlText);

    return NextResponse.json(ogTags);
  } catch (error) {
    console.error("Error fetching or parsing URL:", error);
    return NextResponse.json(
      {error: "Failed to fetch or parse the URL"},
      {status: 500}
    );
  }
}
