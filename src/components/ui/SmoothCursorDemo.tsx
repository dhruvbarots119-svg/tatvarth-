import { SmoothCursor } from "./smooth-cursor"

export function SmoothCursorDemo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full relative overflow-hidden bg-background border rounded-lg">
      <span className="hidden md:block font-medium text-lg">Move your mouse around</span>
      <span className="block md:hidden text-muted-foreground">
        SmoothCursor is disabled on touch devices
      </span>
      <SmoothCursor />
    </div>
  )
}
