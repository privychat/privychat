import React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetContent,
} from "../ui/sheet";
import {BookUser, Contact} from "lucide-react";
import NewContactButton from "./new-contact-button";
import ContactCard from "./contact-card";
import {useAppContext} from "@/hooks/use-app-context";

const ContactBook = () => {
  const {contactBook} = useAppContext();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Contact className="cursor-pointer" />
      </SheetTrigger>
      <SheetContent side={"left"} className="w-full sm:max-w-md border-none">
        <SheetHeader className="h-full flex flex-col">
          <SheetTitle asChild>
            <div className="flex flex-row gap-2 items-center">
              <BookUser className="text-primary" /> <span>Contacts</span>{" "}
              <NewContactButton />
            </div>
          </SheetTitle>

          <div className="flex-1 overflow-y-auto mt-4">
            {Object.entries(contactBook).map(([address, name]) => (
              <ContactCard key={address} address={address} name={name} />
            ))}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default ContactBook;
