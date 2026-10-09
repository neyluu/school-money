import * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

function useIsMobile(breakpoint = 768): boolean {
  const query = `(max-width: ${breakpoint - 1}px)`

  const subscribe = React.useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", callback)
      return () => mql.removeEventListener("change", callback)
    },
    [query]
  )
  const getSnapshot = React.useCallback(
    () => window.matchMedia(query).matches,
    [query]
  )

  return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}

type ResponsiveRootProps = {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function ResponsiveDialog({ children, ...props }: ResponsiveRootProps) {
  const isMobile = useIsMobile()
  return isMobile ? (
    <Drawer showSwipeHandle swipeDirection="down" {...props}>
      {children}
    </Drawer>
  ) : (
    <Dialog {...props}>{children}</Dialog>
  )
}

function ResponsiveDialogTrigger({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  return isMobile ? (
    <DrawerTrigger>{children}</DrawerTrigger>
  ) : (
    <DialogTrigger>{children}</DialogTrigger>
  )
}

function ResponsiveDialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerContent className={cn("gap-4 p-4", className)} {...props}>
        {children}
        {showCloseButton && (
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Zamknij</span>
          </DrawerClose>
        )}
      </DrawerContent>
    )
  }

  return (
    <DialogContent
      showCloseButton={showCloseButton}
      className={className}
      {...props}
    >
      {children}
    </DialogContent>
  )
}

function ResponsiveDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()
  return isMobile ? (
    <DrawerHeader className={className} {...props} />
  ) : (
    <DialogHeader className={className} {...props} />
  )
}

function ResponsiveDialogTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"h2">) {
  const isMobile = useIsMobile()
  return isMobile ? (
    <DrawerTitle className={className} {...props}>
      {children}
    </DrawerTitle>
  ) : (
    <DialogTitle className={className} {...props}>
      {children}
    </DialogTitle>
  )
}

function ResponsiveDialogDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  const isMobile = useIsMobile()
  return isMobile ? (
    <DrawerDescription className={className} {...props}>
      {children}
    </DrawerDescription>
  ) : (
    <DialogDescription className={className} {...props}>
      {children}
    </DialogDescription>
  )
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  DialogClose,
}
