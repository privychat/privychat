import React, {useState, useEffect, ReactNode} from "react";

interface PWAPromptProps {
  children: ReactNode;
}

const PWAPrompt: React.FC<PWAPromptProps> = ({children}) => {
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if the app is in standalone mode
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    // Check if the device is mobile
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <h1 className="scroll-m-20 border-b mb-4 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Add to Home Screen
      </h1>
      <p className="text-center mb-4">
        Add PrivyChat to your home screen to use it.
      </p>
      <div className="text-center">
        <p>On iOS:</p>
        <ol className="list-decimal list-inside">
          <li>Tap the share button</li>
          <li>Scroll down and tap &apos;Add to Home Screen&apos;</li>
        </ol>
      </div>
      <div className="text-center mt-4">
        <p>On Android:</p>
        <ol className="list-decimal list-inside">
          <li>Tap the menu button</li>
          <li>Tap &apos;Add to Home Screen&apos;</li>
        </ol>
      </div>
    </div>
  );
};

export default PWAPrompt;
