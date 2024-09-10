import axios from "axios";
import {NextRequest, NextResponse} from "next/server";
import {createPublicClient, http, namehash} from "viem";
import {mainnet} from "viem/chains";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const domain = searchParams.get("domain");
  if (!domain) {
    return NextResponse.json({
      error: "Domain is required",
    });
  }

  return NextResponse.json({
    address:domain
  });
  // try {
  //   const searchUDName = async (domain: string) => {
  //     const resolvedDomain = await axios.get(
  //       `https://api.unstoppabledomains.com/resolve/domains/${domain}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${process.env.UNSTOPPABLE_DOMAINS_API_KEY}`,
  //         },
  //       }
  //     );
  //     return resolvedDomain.data.meta.owner ?? null;
  //   };

  //   const address = await searchUDName(domain);
  //   return NextResponse.json({
  //     address,
  //   });
  // } catch (error) {
  //   return NextResponse.json({
  //     error: error,
  //   });
  // }
}

export const dynamic = "force-dynamic";
