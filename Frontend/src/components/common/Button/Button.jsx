import { buttonVariants } from "./ButtonVariants";

const Button = ({
  children,
  variant,
  fullWidth,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`${buttonVariants({
        variant,
        fullWidth,
      })} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;