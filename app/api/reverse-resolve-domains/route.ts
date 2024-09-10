import axios from "axios";
import {NextRequest, NextResponse} from "next/server";
import {createPublicClient, http, namehash} from "viem";
import {mainnet} from "viem/chains";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const address = searchParams.get("address");

  return NextResponse.json([address].flat());

  // const publicClient = createPublicClient({
  //   chain: mainnet,
  //   transport: http(
  //     `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  //   ),
  // });
  // try {
  //   const searchUDName = async (address: string) => {
  //     const resolvedDomain = await axios.get(
  //       `https://api.unstoppabledomains.com/resolve/owners/${address}/domains`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${process.env.UNSTOPPABLE_DOMAINS_API_KEY}`,
  //         },
  //       }
  //     );
  //     return resolvedDomain.data.data
  //       .map((domain: any) => domain.meta.domain)
  //       .filter(Boolean);
  //   };

  //   const searchENSName = async (address: string) => {
  //     const ensName = await publicClient.getEnsName({
  //       address: address as `0x${string}`,
  //     });
  //     return ensName;
  //   };
  //   if (!address) {
  //     return NextResponse.json({
  //       error: "Address is required",
  //     });
  //   }

  //   const [udName, ensName] = await Promise.all([
  //     searchUDName(address),
  //     searchENSName(address),
  //   ]);
  //   const names = [udName, ensName].filter(Boolean);
  //   return NextResponse.json(names.flat());
  // } catch (error) {
  //   return NextResponse.json({
  //     error: error,
  //   });
  // }
}

export const dynamic = "force-dynamic";
