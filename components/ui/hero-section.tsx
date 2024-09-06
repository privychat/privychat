import {Button} from "@/components/ui/button";
import {ArrowRight, MessageSquare, Wallet, Menu} from "lucide-react";
import {usePrivy} from "@privy-io/react-auth";
import {Caveat} from "next/font/google";

const caveat = Caveat({subsets: ["latin"]});

const HeroSection = () => {
  const {login, ready} = usePrivy();
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-white">
      {" "}
      <div className="w-full flex items-center justify-center max-w-md mx-auto my-8">
        <h2
          className={`${caveat.className} text-4xl md:text-7xl text-pretty bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent`}
        >
          PrivyChat
        </h2>
      </div>
      <main className="flex-grow flex md:items-center pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center ">
          <div className="lg:w-1/2 lg:pr-8 flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold md:font-extrabold tracking-tight mb-4 text-foreground">
              Chat with any Wallet
            </h1>
            <p className="text-md md:text-xl sm:text-2xl mb-6 text-muted-foreground">
              Send messages directly to any wallet address. Connect,
              communicate, and collaborate in the right way.
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={login}
              disabled={!ready}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          {/* <div className="lg:w-1/2 mt-10 lg:mt-0 border-[1px] border-opacity-25 rounded-md border-gray-300 ">
            <div className=" bg-card p-6 rounded-lg shadow-xl ">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-card-foreground">
                    0x1A4d...5e78
                  </span>
                </div>
                <div className="bg-primary h-3 w-3 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <div className="bg-muted p-3 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="bg-accent p-3 rounded-lg flex-1">
                    <p className="text-sm text-accent-foreground">
                      Hey! I saw your NFT collection. It&apos;s amazing!
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 justify-end">
                  <div className="border-[1px] border-primary p-3 rounded-lg flex-1">
                    <p className="text-sm text-primary">
                      Thanks! Would you like to collaborate on a project?
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default HeroSection;
