const Badge = ({
  children,
  color = "orange",
}) => {
  const colors = {
    orange: "bg-orange-500/20 text-orange-400",
    green: "bg-green-500/20 text-green-400",
    red: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
};

export default Badge;