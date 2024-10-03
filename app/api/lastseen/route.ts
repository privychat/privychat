import connectToDatabase from "@/lib/connect-to-db";
import User from "@/models/User";
import {NextRequest, NextResponse} from "next/server";
import {getAddress} from "viem";

export async function POST(request: NextRequest) {
  const {chatId, account, lastMessageHash, timestamp} = await request.json();
  if (!chatId || !account || !lastMessageHash || !timestamp) {
    return NextResponse.json({
      success: false,
      error: "ChatId, account, lastMessageHash, and timestamp are required",
    });
  }
  try {
    await connectToDatabase();
    const address = getAddress(account);

    let user = await User.findOneAndUpdate(
      {
        address: address,
        "lastSeen.chatId": chatId,
      },
      {
        $set: {
          "lastSeen.$.lastMessageHash": lastMessageHash,
          "lastSeen.$.timestamp": timestamp,
        },
      },
      {new: true}
    );

    if (!user) {
      user = await User.findOneAndUpdate(
        {address: address},
        {
          $push: {
            lastSeen: {
              chatId,
              lastMessageHash,
              timestamp,
            },
          },
        },
        {new: true, upsert: true}
      );
    }

    return NextResponse.json({success: true, user});
  } catch (error) {
    console.error("Error in POST /api/lastSeen:", error);
    return NextResponse.json(
      {success: false, error: String(error)},
      {status: 500}
    );
  }
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json(
      {success: false, error: "Address is required"},
      {status: 400}
    );
  }
  try {
    await connectToDatabase();
    const user = await User.findOne({address: getAddress(address)});
    if (!user) {
      return NextResponse.json(
        {success: false, error: "User not found"},
        {status: 404}
      );
    }
    return NextResponse.json({success: true, lastSeen: user.lastSeen});
  } catch (error) {
    return NextResponse.json({success: false, error: error}, {status: 500});
  }
}
