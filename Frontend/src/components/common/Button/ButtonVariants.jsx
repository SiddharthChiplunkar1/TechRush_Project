import clsx from "clsx";

export const buttonVariants = ({ variant = "primary", fullWidth = false }) =>
  clsx(
    "inline-flex items-center justify-center rounded-full px-6 py-3 font-medium transition-all duration-300",

    fullWidth && "w-full",

    {
      "bg-orange-500 text-white hover:bg-orange-400":
        variant === "primary",

      "border border-white/10 bg-transparent text-white hover:bg-white/5":
        variant === "secondary",

      "bg-red-500 text-white":
        variant === "danger",

      "bg-green-500 text-white":
        variant === "success",
    }
  );