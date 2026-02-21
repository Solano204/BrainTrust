

import type { AppRoutes, LayoutRoutes, ParamMap } from "./routes.js"
import type { ResolvingMetadata, ResolvingViewport } from "next/types.js"

type AppPageConfig<Route extends AppRoutes = AppRoutes> = {
  default: React.ComponentType<{ params: Promise<ParamMap[Route]> } & any> | ((props: { params: Promise<ParamMap[Route]> } & any) => React.ReactNode | Promise<React.ReactNode> | never | void | Promise<void>)
  generateStaticParams?: (props: { params: ParamMap[Route] }) => Promise<any[]> | any[]
  generateMetadata?: (
    props: { params: Promise<ParamMap[Route]> } & any,
    parent: ResolvingMetadata
  ) => Promise<any> | any
  generateViewport?: (
    props: { params: Promise<ParamMap[Route]> } & any,
    parent: ResolvingViewport
  ) => Promise<any> | any
  metadata?: any
  viewport?: any
}

type LayoutConfig<Route extends LayoutRoutes = LayoutRoutes> = {
  default: React.ComponentType<LayoutProps<Route>> | ((props: LayoutProps<Route>) => React.ReactNode | Promise<React.ReactNode> | never | void | Promise<void>)
  generateStaticParams?: (props: { params: ParamMap[Route] }) => Promise<any[]> | any[]
  generateMetadata?: (
    props: { params: Promise<ParamMap[Route]> } & any,
    parent: ResolvingMetadata
  ) => Promise<any> | any
  generateViewport?: (
    props: { params: Promise<ParamMap[Route]> } & any,
    parent: ResolvingViewport
  ) => Promise<any> | any
  metadata?: any
  viewport?: any
}


{
  type __IsExpected<Specific extends AppPageConfig<"/calendar">> = Specific
  const handler = {} as typeof import("../calendar/page.js")
  type __Check = __IsExpected<typeof handler>
  // @ts-ignore
  type __Unused = __Check
}

// Validate ../../app/courses/[id]/page.tsx
{
  type __IsExpected<Specific extends AppPageConfig<"/courses/[id]">> = Specific
  const handler = {} as typeof import("../courses/[id]/page.js")
  type __Check = __IsExpected<typeof handler>
  // @ts-ignore
  type __Unused = __Check
}

{
  type __IsExpected<Specific extends AppPageConfig<"/courses">> = Specific
  const handler = {} as typeof import("../courses/page.js")
  type __Check = __IsExpected<typeof handler>
  // @ts-ignore
  type __Unused = __Check
}

{
  type __IsExpected<Specific extends AppPageConfig<"/">> = Specific
  const handler = {} as typeof import("../page.js")
  type __Check = __IsExpected<typeof handler>
  // @ts-ignore
  type __Unused = __Check
}

{
  type __IsExpected<Specific extends LayoutConfig<"/">> = Specific
  const handler = {} as typeof import("../layout.js")
  type __Check = __IsExpected<typeof handler>
  // @ts-ignore
  type __Unused = __Check
}
