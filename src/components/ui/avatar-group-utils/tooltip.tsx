"use client";

// Thin adapter over this project's own Base UI-backed tooltip
// (src/components/ui/tooltip.tsx) exposing the flatter API the
// avatar-group component expects: side/sideOffset settable on
// <Tooltip> itself (rather than only on <TooltipContent>), and
// openDelay/closeDelay on <TooltipProvider> (Base UI's Provider only
// has delay/closeDelay).

import * as React from "react";
import {
  Tooltip as TooltipRoot,
  TooltipTrigger as TooltipTriggerRoot,
  TooltipContent as TooltipContentRoot,
  TooltipProvider as TooltipProviderRoot,
} from "@/components/ui/tooltip";

type Side = "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";

interface TooltipProviderProps
  extends Omit<
    React.ComponentProps<typeof TooltipProviderRoot>,
    "delay"
  > {
  openDelay?: number;
  closeDelay?: number;
}

function TooltipProvider({
  openDelay = 0,
  closeDelay = 0,
  ...props
}: TooltipProviderProps) {
  return (
    <TooltipProviderRoot delay={openDelay} closeDelay={closeDelay} {...props} />
  );
}

interface PositionContextValue {
  side?: Side;
  sideOffset?: number;
}

const PositionContext = React.createContext<PositionContextValue>({});

interface TooltipProps
  extends Omit<React.ComponentProps<typeof TooltipRoot>, "children">,
    PositionContextValue {
  children: React.ReactNode;
}

function Tooltip({ side, sideOffset, children, ...props }: TooltipProps) {
  const position = React.useMemo(
    () => ({ side, sideOffset }),
    [side, sideOffset],
  );
  return (
    <PositionContext.Provider value={position}>
      <TooltipRoot {...props}>{children}</TooltipRoot>
    </PositionContext.Provider>
  );
}

function TooltipTrigger(
  props: React.ComponentProps<typeof TooltipTriggerRoot>,
) {
  return <TooltipTriggerRoot {...props} />;
}

type TooltipContentProps = React.ComponentProps<typeof TooltipContentRoot>;

function TooltipContent(props: TooltipContentProps) {
  const position = React.useContext(PositionContext);
  return (
    <TooltipContentRoot
      side={position.side}
      sideOffset={position.sideOffset}
      {...props}
    />
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  type TooltipProps,
  type TooltipContentProps,
};
