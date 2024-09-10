const FetchingMoreMessagesLoader = ({
  showLoader,
  text,
}: {
  showLoader?: boolean;
  text?: string;
}) => {
  return (
    <div
      className={`flex flex-row justify-center items-center gap-2 py-4 ${
        showLoader ? "" : "opacity-0"
      }`}
    >
      <div className="bg-primary w-1 h-1 animate-ping rounded-full"></div>
      <div className="bg-primary w-1.5 h-1.5 animate-ping rounded-full"></div>
      <div className="bg-primary w-2 h-2 animate-ping rounded-full"></div>
      <p className="text-muted-foreground text-sm">
        {text ?? "Fetching more chats"}
      </p>
      <div className="bg-primary w-2 h-2 animate-ping rounded-full"></div>
      <div className="bg-primary w-1.5 h-1.5 animate-ping rounded-full"></div>
      <div className="bg-primary w-1 h-1 animate-ping rounded-full"></div>
    </div>
  );
};

export default FetchingMoreMessagesLoader;
