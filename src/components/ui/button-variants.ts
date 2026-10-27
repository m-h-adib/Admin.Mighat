import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 font-bold whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-miqat",
    "active:scale-[0.98] motion-reduce:transform-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        gold: "bg-gold text-green-950 hover:bg-gold-light hover:shadow-lift-dark",
        ghost:
          "border border-gold-light/60 font-medium text-gold-light hover:border-gold-light hover:bg-gold-light/12 hover:text-white",
        outline: "border border-green-900 text-green-900 hover:bg-green-900 hover:text-gold-light",
        dark: "bg-green-900 text-gold-light hover:bg-green-950",
      },
      size: {
        sm: "min-h-11 rounded-btn-sm px-4.5 text-body",
        md: "min-h-12 rounded-btn px-6.5 text-base",
        lg: "min-h-13 gap-2.5 rounded-btn px-7 text-lead",
        xl: "min-h-13.5 gap-2.5 rounded-btn px-8.5 text-lg font-extrabold",
        icon: "size-11 rounded-btn-sm",
      },
    },
    defaultVariants: { variant: "gold", size: "md" },
  },
);
