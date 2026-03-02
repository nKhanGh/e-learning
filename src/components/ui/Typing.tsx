const Typing = ({ size = "md", avatarUrl }: { size?: "sm" | "md" | "lg" | "xl"; avatarUrl?: string | null }) => {

  const sizeClasses = {
    sm: "w-6 h-6 border-1",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };
  return (
    <div className="flex items-center space-x-2">
      {/* {avatarUrl && */}
        <div className={`${sizeClasses[size]} rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse`}>
          <img
            src={avatarUrl ?? "./default-avatar.jpg"}
            alt="Avatar"
            className={`w-full h-full rounded-full object-cover`}
          />
        </div>
      {/* } */}
      <div className="flex gap-1">
        <div className=" dark:bg-gray-800 bg-white rounded-[20px] border border-primary flex items-center gap-1 p-2">
          <span
            className="w-2 h-2 bg-primary rounded-full animate-typing"
            style={{ animationDelay: "0s" }}
          />

          <span
            className="w-2 h-2 bg-primary rounded-full animate-typing"
            style={{ animationDelay: "0.2s" }}
          />

          <span
            className="w-2 h-2 bg-primary rounded-full animate-typing"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Typing;
