// app/(docs)/components/[slug]/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { REGISTRY } from "@/lib/registry";
import { getComponentSourceCode } from "@/lib/registry/source.server";
import { DocsNavbar } from "@/app/_shared/docs-navbar";
import { DocsLeftSidebar } from "@/app/_shared/docs-left-sidebar";
import { DocsRightSidebar } from "@/app/_shared/docs-right-sidebar";
import { ComponentViewer } from "@/app/_shared/component-viewer";
import { InkTitle } from "@/app/_shared/ink-title";
import { OpenMenu } from "@/app/_shared/open-menu";

type PageProps = { params: Promise<{ slug: string }> };

const findItem = (slug: string) => REGISTRY.find((entry) => entry.slug === slug);

const PANEL =
  "mb-3 min-w-0 flex-1 rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_50px_-30px_rgba(0,0,0,0.2)]";

export function generateStaticParams() {
  return REGISTRY.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = findItem(slug);
  return item ? { title: item.name, description: item.description } : {};
}

/* ------------------------------------------------------------------ */
/*  Instant shell: everything that does NOT need the URL renders        */
/*  immediately; everything that does is streamed inside <Suspense>.    */
/* ------------------------------------------------------------------ */

export default function ComponentSlugPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#171717]">
      <DocsNavbar />

      <div className="flex">
        {/* usePathname() reads the URL, so the sidebar gets its own boundary */}
        <Suspense fallback={<aside aria-hidden="true" className="hidden w-72 shrink-0 md:block lg:w-80" />}>
          <DocsLeftSidebar />
        </Suspense>

        <Suspense fallback={<ContentSkeleton />}>
          <ComponentContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dynamic part (awaits params)                                        */
/* ------------------------------------------------------------------ */

async function ComponentContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findItem(slug);
  if (!item) return notFound();

  const sourceCode = getComponentSourceCode(item.slug);

  return (
    <>
      {/* floating panel (no border — separation comes from the soft page background) */}
      <main className={PANEL}>
        <div className="mx-auto w-full max-w-5xl space-y-10 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          {/* INTRO — title only; Preview / Setup / copy actions all live inside ComponentViewer */}
          <div id="intro" className="relative isolate scroll-mt-24 space-y-5">
            <div
              aria-hidden="true"
              className="absolute -inset-x-6 -top-8 -z-10 h-56 [background-image:radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
            />

            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-code text-[10.5px] uppercase tracking-widest text-zinc-400"
            >
              <Link href="/components" className="inline-flex items-center gap-1.5 transition-colors hover:text-zinc-900">
                <ArrowLeft className="size-3" />
                All components
              </Link>
              <span aria-hidden="true">/</span>
              <span>{item.category}</span>
            </nav>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <InkTitle
                text={item.name}
                className="font-editorial text-[38px] leading-[1.1] text-zinc-900 sm:text-[48px]"
              />
              <OpenMenu name={item.name} />
            </div>

            <p className="max-w-xl text-[15px] leading-relaxed text-zinc-500">{item.description}</p>
          </div>

          <ComponentViewer item={item} sourceCode={sourceCode} />
        </div>
      </main>

      <DocsRightSidebar
        items={[
          { id: "intro", title: "Short intro", subtitle: "What it does & how to use it" },
          { id: "preview", title: "Preview", subtitle: "Live component demo" },
          { id: "setup", title: "Setup", subtitle: `Install & source code\n${item.filePath}` },
        ]}
      />
    </>
  );
}


function ContentSkeleton() {
  return (
    <>
      <main className={PANEL} aria-busy="true">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="space-y-5">
            <div className="h-3 w-44 animate-pulse rounded-full bg-zinc-100" />
            <div className="h-12 w-2/3 animate-pulse rounded-xl bg-zinc-100" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-zinc-100" />
          </div>
          <div className="h-[380px] animate-pulse rounded-2xl bg-zinc-50" />
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-50" />
        </div>
      </main>
      <aside aria-hidden="true" className="hidden w-80 shrink-0 xl:block" />
    </>
  );
}