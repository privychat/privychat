import axios from "axios";
import {NextRequest, NextResponse} from "next/server";
import {createPublicClient, http} from "viem";
import {mainnet} from "viem/chains";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({
      error: "Address is required",
    });
  }

  try {
    // Check if the result is already in Redis
    const cachedResult = await redis.get(address);
    if (cachedResult) {
      return NextResponse.json(JSON.parse(cachedResult));
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      ),
    });

    const searchUDName = async (address: string) => {
      const resolvedDomain = await axios.get(
        `https://api.unstoppabledomains.com/resolve/owners/${address}/domains`,
        {
          headers: {
            Authorization: `Bearer ${process.env.UNSTOPPABLE_DOMAINS_API_KEY}`,
          },
        }
      );
      return resolvedDomain.data.data
        .map((domain: any) => domain.meta.domain)
        .filter(Boolean);
    };

    const searchENSName = async (address: string) => {
      const ensName = await publicClient.getEnsName({
        address: address as `0x${string}`,
      });
      return ensName;
    };

    const [udName, ensName] = await Promise.all([
      searchUDName(address),
      searchENSName(address),
    ]);
    const names = [udName, ensName].filter(Boolean).flat();

    if (names.length > 0) await redis.set(address, JSON.stringify(names));

    return NextResponse.json(names);
  } catch (error) {
    return NextResponse.json({
      error: error,
    });
  }
}

export const dynamic = "force-dynamic";
