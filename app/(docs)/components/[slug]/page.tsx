// app/(docs)/components/[slug]/page.tsx
import type { Metadata } from "next";
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

export function generateStaticParams() {
  return REGISTRY.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = findItem(slug);
  return item ? { title: item.name, description: item.description } : {};
}

export default async function ComponentSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const item = findItem(slug);
  if (!item) return notFound();

  const sourceCode = getComponentSourceCode(item.slug);

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#171717]">
      <DocsNavbar />

      <div className="flex">
        <DocsLeftSidebar />

        {/* floating panel (no border — separation comes from the soft page background) */}
        <main className="mb-3 min-w-0 flex-1 rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_50px_-30px_rgba(0,0,0,0.2)]">
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
      </div>
    </div>
  );
}