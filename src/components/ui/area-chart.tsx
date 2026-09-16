"use client";

import React from "react";
import * as SubframeCore from "@subframe/core";
import { useTheme } from "next-themes";

const SubframeUtils = {
  twClassNames: SubframeCore.createTwClassNames([
    "text-caption",
    "text-caption-bold",
    "text-body",
    "text-body-bold",
    "text-heading-3",
    "text-heading-2",
    "text-heading-1",
    "text-monospace-body",
  ]),
};

type DataPoint = Record<string, string | number>;

interface AreaChartRootProps
  extends Omit<
    React.ComponentProps<typeof SubframeCore.AreaChart>,
    "data" | "categories" | "index"
  > {
  data?: DataPoint[];
  categories?: string[];
  index?: string;
  stacked?: boolean;
  className?: string;
}

const defaultIndex = "Year";
const defaultCategories = ["Psychology", "Business", "Biology"];
const defaultData: DataPoint[] = [
  { Year: "2018", Psychology: 125, Business: 120, Biology: 90 },
  { Year: "2019", Psychology: 110, Business: 130, Biology: 85 },
  { Year: "2020", Psychology: 135, Business: 100, Biology: 95 },
  { Year: "2021", Psychology: 105, Business: 115, Biology: 120 },
  { Year: "2022", Psychology: 140, Business: 125, Biology: 130 },
];

// This app's own palette (see design.md's lime accent + the
// per-platform series colors used elsewhere), not Subframe's default
// teal — the platform order here matches rating-chart.tsx.
const APP_THEME_COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#a3e635"];

const AreaChartRoot = React.forwardRef<
  React.ElementRef<typeof SubframeCore.AreaChart>,
  AreaChartRootProps
>(function AreaChartRoot(
  {
    data = defaultData,
    categories = defaultCategories,
    index = defaultIndex,
    stacked = false,
    className,
    colors = APP_THEME_COLORS,
    dark,
    ...otherProps
  }: AreaChartRootProps,
  ref,
) {
  const { resolvedTheme } = useTheme();
  // Follows this app's own theme toggle instead of Subframe's default
  // (which forces dark styling regardless of the page theme).
  const isDark = dark ?? resolvedTheme === "dark";

  return (
    <SubframeCore.AreaChart
      className={SubframeUtils.twClassNames("h-80 w-full", className)}
      ref={ref}
      data={data}
      categories={categories}
      index={index}
      stacked={stacked}
      colors={colors}
      dark={isDark}
      {...otherProps}
    />
  );
});

export const AreaChart = AreaChartRoot;
export default AreaChart;
