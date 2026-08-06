const GlassCard = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`glass card-hover p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;