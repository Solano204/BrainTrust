import { RouteGuard } from "./auth/RouteGuard";

export default function Template({ children }: { children: React.ReactNode }) {
  return <div>
    <RouteGuard>

    {children}

    </RouteGuard>
    </div>
}