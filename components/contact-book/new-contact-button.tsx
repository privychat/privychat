import React, {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {Button} from "../ui/button";
import {Label} from "../ui/label";
import {Input} from "../ui/input";
import usePush from "@/hooks/use-push";
import {useAppContext} from "@/hooks/use-app-context";
import {UserRoundPen} from "lucide-react";

const NewContactButton = ({
  buttonText,
  inputAddress,
  chat,
}: {
  buttonText?: string;
  inputAddress?: string;
  chat?: boolean;
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState(inputAddress || "");
  const {addContact} = usePush();
  const {setContactBook} = useAppContext();

  const newContactSaveHandler = async () => {
    if (!name || !address) return;
    const contacts = await addContact(address, name);
    if ("error" in contacts) {
      return;
    }
    setContactBook(contacts);
    setName("");
    setAddress("");
  };
  return (
    <Dialog>
      <DialogTrigger asChild className="cursor-pointer">
        {chat ? (
          <div className="w-fit">
            <UserRoundPen className="text-primary" size={"16px"} />
          </div>
        ) : (
          <Button
            className="text-xs rounded-lg px-1.5 py-0.5 h-fit text-primary border-primary"
            variant={"outline"}
          >
            Add Contact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-[1px] border-gray-800">
        <DialogHeader>
          <DialogTitle>Add a new Contact</DialogTitle>
          <DialogDescription>
            Make changes to this contact here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-row-4 items-center gap-4">
            <Label htmlFor="name" className="">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Mike Wazowski"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-row-4 items-center gap-4">
            <Label htmlFor="Address" className="">
              Address
            </Label>
            <Input
              id="address"
              placeholder="0x839274A2C15B62803EFea1359E7E28E64a15e9a1"
              className="col-span-3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={newContactSaveHandler}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewContactButton;
