import {useTheme} from "next-themes";
import React from "react";

const FullPageLoader = () => {
  const {theme} = useTheme();

  return (
    <section
      className={`fixed inset-0 flex items-center justify-center bg-background text-primary-foreground z-100`}
    >
      <span className="animate-ping absolute inline-flex h-[100px] w-[100px] rounded-full bg-primary opacity-75"></span>
    </section>
  );
};

export default FullPageLoader;
