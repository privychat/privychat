import User from "@/models/User";
import {NextRequest, NextResponse} from "next/server";
import {getAddress} from "viem";

export async function POST(request: NextRequest) {
  const {chatId, account} = await request.json();
  if (!chatId || !account) {
    return NextResponse.json(
      {success: false, error: "ChatId and account are required"},
      {status: 400}
    );
  }
  try {
    const user = await User.findOneAndUpdate(
      {address: getAddress(account)},
      {$push: {pinnedChats: chatId}},
      {new: true, upsert: true}
    );
    return NextResponse.json({success: true, user});
  } catch (error) {
    return NextResponse.json({success: false, error: error}, {status: 500});
  }
}

export async function DELETE(request: NextRequest) {
  const {chatId, account} = await request.json();
  if (!chatId || !account) {
    return NextResponse.json(
      {success: false, error: "ChatId and account are required"},
      {status: 400}
    );
  }
  try {
    const user = await User.findOneAndUpdate(
      {address: getAddress(account)},
      {$pull: {pinnedChats: chatId}},
      {new: true}
    );
    return NextResponse.json({success: true, user});
  } catch (error) {
    return NextResponse.json({success: false, error: error}, {status: 500});
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
    const user = await User.findOne({address: getAddress(address)});
    if (!user) {
      return NextResponse.json(
        {success: false, error: "User not found"},
        {status: 404}
      );
    }

    const pinnedChats = user.pinnedChats;
    return NextResponse.json({success: true, pinnedChats});
  } catch (error) {
    return NextResponse.json({success: false, error: error}, {status: 500});
  }
}
