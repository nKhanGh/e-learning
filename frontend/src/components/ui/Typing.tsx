const Typing = ({ size = "md", avatarFileName }: { size?: "sm" | "md" | "lg" | "xl"; avatarFileName?: string | null }) => {

  const sizeClasses = {
    sm: "w-5 h-5 border-1",
    md: "w-7 h-7 border-2",
    lg: "w-10 h-10 border-4",
    xl: "w-14 h-14 border-4",
  };
  return (
    <div className="flex items-center space-x-1.5">
      {/* {avatarFileName && */}
        <div className={`${sizeClasses[size]} rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse`}>
          <img
            src={avatarFileName ? process.env.NEXT_PUBLIC_AVATAR_BASE_URL + avatarFileName :  "./default-avatar.jpg"}
            alt="Avatar"
            className={`w-full h-full rounded-full object-cover`}
          />
        </div>
      {/* } */}
      <div className="flex gap-1">
        <div className=" dark:bg-gray-800 bg-white rounded-[20px] border border-primary flex items-center gap-1 p-1.5">
          <span
            className="w-1.5 h-1.5 bg-primary rounded-full animate-typing"
            style={{ animationDelay: "0s" }}
          />

          <span
            className="w-1.5 h-1.5 bg-primary rounded-full animate-typing"
            style={{ animationDelay: "0.2s" }}
          />

          <span
            className="w-1.5 h-1.5 bg-primary rounded-full animate-typing"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Typing;
