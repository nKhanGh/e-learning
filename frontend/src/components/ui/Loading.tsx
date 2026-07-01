const Loading = ({
  size = "md",
  className = "",
  color = "green",
}: {
  size?: "sm" | "md" | "lg" | "xl" | "smd";
  className?: string;
  color?: "green" | "blue" | "red" | "gray";
}) => {
  const sizeClasses = {
    sm: "w-3.5 h-3.5 border-2",
    smd: "w-5 h-5 border-3",
    md: "w-7 h-7 border-4",
    lg: "w-10 h-10 border-4",
    xl: "w-14 h-14 border-4",
  };

  const colorClasses = {
    green: "border-green-200 border-t-green-600",
    blue: "border-blue-200 border-t-blue-600",
    red: "border-red-200 border-t-red-600",
    gray: "border-gray-400 border-t-gray-100",
  };

  return (
    <div className={`flex items-center justify-center${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default Loading;
