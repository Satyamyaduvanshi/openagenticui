import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-zinc-900">
      <img src="/logo.svg" alt="OpenAgenticUI" className="h-12 w-12 mb-4" />
      <h1 className="font-editorial text-4xl text-zinc-950">OpenAgenticUI</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        Home page under construction. Jump straight into the component catalog.
      </p>
      <Link
        href="/components"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
      >
        <img src="/logo.svg" alt="" className="h-4 w-4" />
        <span>Explore /components</span>
        <ArrowRight className="h-3.5 w-3.5 text-[#FF4500]" />
      </Link>
    </main>
  );
}