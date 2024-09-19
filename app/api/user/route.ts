import {NextRequest, NextResponse} from "next/server";
import {revalidatePath} from "next/cache";
import User from "../../../models/User";
import connectToDatabase from "@/lib/connect-to-db";
import {getAddress} from "viem";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json(
      {success: false, error: "Address is required"},
      {status: 400}
    );
  }
  const result = await getUser(address);
  return NextResponse.json(result, {status: result.success ? 200 : 404});
}

export async function POST(request: NextRequest) {
  const userData = await request.json();
  const result = await createUser(userData);

  console.log("result", result);
  return NextResponse.json(result, {status: result.success ? 201 : 400});
}

export async function PUT(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      {success: false, error: "Address is required"},
      {status: 400}
    );
  }
  const body = await request.json();
  const result = await updateUser(address, body);
  return NextResponse.json(result, {status: result.success ? 200 : 404});
}

export async function DELETE(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  const contactAddress = request.nextUrl.searchParams.get("contactAddress");

  if (!address) {
    return NextResponse.json(
      {success: false, error: "Address is required"},
      {status: 400}
    );
  }

  if (contactAddress) {
    // Delete a specific contact
    const result = await deleteContact(address, contactAddress);
    return NextResponse.json(result, {status: result.success ? 200 : 404});
  } else {
    // Delete the entire user
    const result = await deleteUser(address);
    return NextResponse.json(result, {status: result.success ? 200 : 404});
  }
}

async function getUser(address: string) {
  await connectToDatabase();
  try {
    const user = await User.findOne({address});
    if (!user) {
      return {success: false, error: "User not found"};
    }
    return {
      success: true,
      data: {
        address: user.address,
        contacts: Object.fromEntries(user.contacts),
      },
    };
  } catch (error) {
    return {success: false, error: "Error fetching user"};
  }
}

async function createUser(userData: {
  address: string;
  contacts?: Record<string, string>;
}) {
  await connectToDatabase();
  try {
    const user = await User.create(userData);

    return {
      success: true,
      data: {
        address: user.address,
        contacts: Object.fromEntries(user.contacts),
      },
    };
  } catch (error) {
    return {success: false, error: "Error creating user"};
  }
}

async function updateUser(
  address: string,
  contact?: {
    name: string;
    address: string;
  }
) {
  await connectToDatabase();
  try {
    const existingUser = await User.findOne({address});
    let updatedContacts;
    if (contact?.address && contact.name) {
      if (existingUser) {
        updatedContacts = {
          ...Object.fromEntries(existingUser.contacts),
          ...(contact && {[getAddress(contact.address)]: contact.name}),
        };
      } else {
        updatedContacts = contact && {
          [getAddress(contact.address)]: contact.name,
        };
      }
    }

    const user = await User.findOneAndUpdate(
      {address},
      {
        $set: {
          address,
          ...(contact?.address &&
            contact.name && {
              contacts: Object.fromEntries(
                Object.entries(updatedContacts || {}).map(([key, value]) => [
                  getAddress(key),
                  value,
                ])
              ),
            }),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    revalidatePath("/users");
    return {
      success: true,
      data: {
        address: user.address,
        contacts: Object.fromEntries(user.contacts),
      },
    };
  } catch (error) {
    return {success: false, error: "Error updating user"};
  }
}

async function deleteContact(address: string, contactAddress: string) {
  await connectToDatabase();
  try {
    const user = await User.findOne({address});
    if (!user) {
      return {success: false, error: "User not found"};
    }

    if (!user.contacts.has(contactAddress)) {
      return {success: false, error: "Contact not found"};
    }

    user.contacts.delete(contactAddress);
    await user.save();

    revalidatePath("/users");
    return {
      success: true,
      data: {
        address: user.address,
        contacts: Object.fromEntries(user.contacts),
      },
    };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return {success: false, error: "Error deleting contact"};
  }
}
async function deleteUser(address: string) {
  await connectToDatabase();
  try {
    const deletedUser = await User.findOneAndDelete({address});
    if (!deletedUser) {
      return {success: false, error: "User not found"};
    }
    revalidatePath("/users");
    return {success: true, data: {}};
  } catch (error) {
    console.error("Error deleting user:", error);
    return {success: false, error: "Error deleting user"};
  }
}
