import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Table({ className, children, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <table
        className={cn("w-full border-separate border-spacing-0 text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "h-10 border-b border-line bg-canvas/70 px-3 text-start align-middle text-2xs font-bold whitespace-nowrap text-ink-muted first:ps-5 last:pe-5",
        className,
      )}
      {...props}
    />
  );
}

export function Tr({
  className,
  selected,
  ...props
}: ComponentProps<"tr"> & { selected?: boolean }) {
  return (
    <tr
      aria-selected={selected}
      className={cn(
        "group/row relative transition-colors duration-100",
        selected ? "bg-firuze/6" : "hover:bg-canvas/70",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border-b border-line px-3 py-3 align-middle text-ink group-last/row:border-b-0 first:ps-5 last:pe-5",
        className,
      )}
      {...props}
    />
  );
}

export const rowLinkClass =
  "font-medium text-ink outline-none after:absolute after:inset-0 after:content-[''] hover:text-teal focus-visible:after:rounded-sm focus-visible:after:ring-2 focus-visible:after:ring-gold focus-visible:after:ring-inset";
