import * as React from "react"

import { cn } from "../../lib/utils.ts"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      style={{fontFamily: 'Assistant'}}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input border-gray-700 bg-transparent py-2 px-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#681bc2] hover:scrollbar-thumb-[#681bc2] scrollbar-thumb-rounded-md",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
