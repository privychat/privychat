const FullPageLoader = () => {
  return (
    <div className="h-screen w-screen fixed inset-0 bg flex items-center justify-center backdrop-filter backdrop-blur-lg ">
      <span className="animate-ping absolute inline-flex h-[100px] w-[100px] rounded-full bg-primary opacity-75"></span>{" "}
    </div>
  );
};

export default FullPageLoader;
