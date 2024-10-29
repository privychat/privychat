import connectToDatabase from "@/lib/connect-to-db";
import User from "@/models/User";
import {NextRequest, NextResponse} from "next/server";
import {getAddress} from "viem";

export async function POST(request: NextRequest) {
  const {chatId, account, lastMessageHash, timestamp} = await request.json();
  if (!chatId || !account || !lastMessageHash || !timestamp) {
    return NextResponse.json(
      {
        success: false,
        error: "ChatId, account, lastMessageHash, and timestamp are required",
      },
      {status: 400}
    );
  }

  try {
    await connectToDatabase();
    const address = getAddress(account);

    const user = await User.findOneAndUpdate(
      {address: address},
      {
        $pull: {lastSeen: {chatId: chatId}},
      }
    );

    if (user) {
      await User.findOneAndUpdate(
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
        {new: true}
      );
    } else {
      await User.create({
        address: address,
        lastSeen: [
          {
            chatId,
            lastMessageHash,
            timestamp,
          },
        ],
      });
    }

    const updatedUser = await User.findOne({address: address});
    return NextResponse.json({success: true, user: updatedUser});
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
    const normalizedAddress = getAddress(address);

    let user = await User.findOne({address: normalizedAddress});
    if (!user) {
      user = await User.create({
        address: normalizedAddress,
        lastSeen: [],
      });
    }

    return NextResponse.json({success: true, lastSeen: user.lastSeen});
  } catch (error) {
    console.error("Error in GET /api/lastSeen:", error);
    return NextResponse.json(
      {success: false, error: String(error)},
      {status: 500}
    );
  }
}
