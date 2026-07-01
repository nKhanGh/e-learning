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
    sm: "w-4 h-4 border-2",
    smd: "w-6 h-6 border-3",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
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
