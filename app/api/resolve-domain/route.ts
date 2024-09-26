import axios from "axios";
import {NextRequest, NextResponse} from "next/server";
import Redis from "ioredis";

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL!);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({
      error: "Domain is required",
    });
  }

  try {
    const cachedResult = await redis.get(`domain:${domain}`);
    if (cachedResult) {
      return NextResponse.json({
        address: cachedResult,
        cached: true,
      });
    }

    const searchUDName = async (domain: string) => {
      const resolvedDomain = await axios.get(
        `https://api.unstoppabledomains.com/resolve/domains/${domain}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.UNSTOPPABLE_DOMAINS_API_KEY}`,
          },
        }
      );
      return resolvedDomain.data.meta.owner ?? null;
    };

    const address = await searchUDName(domain);

    if (address) {
      await redis.set(`domain:${domain}`, address);
    }

    return NextResponse.json({
      address,
      cached: false,
    });
  } catch (error) {
    return NextResponse.json({
      error: error,
    });
  }
}

export const dynamic = "force-dynamic";
