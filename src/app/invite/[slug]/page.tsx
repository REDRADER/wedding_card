import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InvitationView } from "@/components/invitation/InvitationView";
import { formatFullDate } from "@/lib/dates";
import { coupleNames } from "@/lib/invitation";
import { getInvitation, listInvitationSlugs } from "@/lib/load-invitations";

export function generateStaticParams() {
  return listInvitationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/invite/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const inv = getInvitation(slug);
  if (!inv) return {};
  const title = inv.seo?.title ?? `${coupleNames(inv)} - Wedding Invitation`;
  const description =
    inv.seo?.description ??
    `You're invited to celebrate with ${coupleNames(inv)} on ${formatFullDate(inv.event.date)}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default function InvitePage({ params }: PageProps<"/invite/[slug]">) {
  // URL data stays behind Suspense so the route's shell can be served instantly.
  return (
    <Suspense fallback={<div className="h-svh bg-[#0f0f0f]" />}>
      <Invitation params={params} />
    </Suspense>
  );
}

async function Invitation({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = getInvitation(slug);
  if (!invitation) notFound();
  return <InvitationView invitation={invitation} />;
}
