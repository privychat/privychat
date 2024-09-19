import React, {useState} from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {Trash2, UserPen} from "lucide-react";
import {Label} from "../ui/label";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import {useAppContext} from "@/hooks/use-app-context";
import {getAddress} from "viem";
const ContactCard = ({name, address}: {name: string; address: string}) => {
  const {account, setContactBook, contactBook} = useAppContext();
  const [newName, setNewName] = useState(name);
  const deleteContact = async () => {
    const deleteResponse = await fetch(
      `/api/user?address=${getAddress(account!)}&contactAddress=${address}`,
      {
        method: "DELETE",
      }
    );
    if (deleteResponse.ok) {
      const updatedContacts = await deleteResponse
        .json()
        .then((data) => data.data.contacts);
      setContactBook(updatedContacts);
    } else {
      console.error("Error deleting contact");
    }
  };

  const updateContact = async () => {
    if (newName === name) return;
    const updateResponse = await fetch(
      `/api/user?address=${getAddress(account!)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          address,
          name: newName,
        }),
      }
    );
    if (updateResponse.ok) {
      const updatedContacts = await updateResponse
        .json()
        .then((data) => data.data.contacts);
      setContactBook(updatedContacts);
    } else {
      console.error("Error updating contact");
    }
  };

  return (
    <div className="flex flex-row px-2 items-center gap-2 py-2 rounded-md hover:bg-gray-800/50 border-[1px] border-gray-800/50 hover:border-gray-800 ">
      <div className="flex flex-col gap-2 w-full overflow-x-hidden">
        <span className="text-sm font-medium w-[75%] truncate text-white/80 text-left">
          {name}
        </span>

        <span className="w-[90%] truncate text-xs text-muted-foreground">
          {address}
        </span>
      </div>
      <Dialog>
        <DialogTrigger asChild className="cursor-pointer">
          <UserPen size={"18px"} />
        </DialogTrigger>
        <DialogContent className="border-[1px] border-gray-800 w-[90%] md:w-full  m-auto rounded-md">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Make changes to this contact here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-row-4 items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                defaultValue={name}
                className="col-span-3"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid grid-row-4 items-center gap-4">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                defaultValue={address}
                className="col-span-3"
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateContact}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Trash2
        size={"18px"}
        onClick={deleteContact}
        className="cursor-pointer text-destructive"
      />
    </div>
  );
};

export default ContactCard;
