import * as React from "react"

import { cn } from "@/lib/utils"

type Orientation = "horizontal" | "vertical"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation
  decorative?: boolean
}

/**
 * Lightweight Separator component that does not rely on Radix.
 * Replaces `@radix-ui/react-separator` to avoid the unresolved import issue.
 */
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
    // decorative is accepted for API compatibility but not used
    const isHorizontal = orientation === "horizontal"
    return (
      <div
        ref={ref}
        role={decorative ? "separator" : undefined}
        aria-orientation={orientation}
        className={cn(
          "shrink-0 bg-border",
          isHorizontal ? "h-px w-full" : "h-full w-px",
          className
        )}
        {...props}
      />
    )
  }
)
Separator.displayName = "Separator"

export { Separator }
