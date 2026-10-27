import { cva } from "class-variance-authority";

export const adminButton = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,box-shadow,opacity] duration-150 ease-miqat",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: "bg-green-900 text-parchment shadow-card hover:bg-teal",
        gold: "bg-gold text-green-950 hover:bg-gold-light",
        outline:
          "border border-line-strong bg-white text-ink hover:border-green-900/35 hover:bg-canvas",
        ghost: "text-ink-muted hover:bg-green-900/6 hover:text-ink",
        danger: "bg-danger text-white hover:bg-danger-ink",
        "danger-ghost": "text-danger hover:bg-danger/8",
        subtle: "bg-green-900/6 text-green-900 hover:bg-green-900/10",
      },
      size: {
        xs: "h-7 rounded-sm px-2.5 text-2xs [&_svg]:size-3.5",
        sm: "h-8.5 rounded-md px-3 text-caption [&_svg]:size-4",
        md: "h-10 rounded-btn-sm px-4 text-sm [&_svg]:size-4",
        lg: "h-11 rounded-btn-sm px-5 text-body [&_svg]:size-4.5",
        icon: "size-9 rounded-btn-sm [&_svg]:size-4.5",
        "icon-sm": "size-8 rounded-md [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);
