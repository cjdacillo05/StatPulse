import type { ReactNode } from "react";
import { Brand } from "@/components/layout/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-6">
        <Brand />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
