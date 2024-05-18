import {NextResponse} from "next/server";

export async function GET(req: any) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("url");

  try {
    const response = await fetch(url);
    const htmlText = await response.text();
    return new Response(htmlText, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
export async function POST(req: any) {
  const {url, data} = await req.json();

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Check if the response is OK and the content type is JSON before parsing
    if (
      response.ok &&
      response.headers.get("Content-Type")?.includes("application/json")
    ) {
      const responseData = await response.json();

      return new Response(JSON.stringify(responseData), {
        headers: {
          "Content-Type": "application/json", // Ensure correct content type is set for JSON response
        },
      });
    } else {
      // Handle non-JSON responses or errors differently
      const textResponse = await response.text();
      console.error("Non-JSON response:", textResponse);
      return new Response(textResponse, {
        status: 200, // Or appropriate status code
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
