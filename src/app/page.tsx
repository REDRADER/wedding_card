import Link from "next/link";
import { formatFullDate } from "@/lib/dates";
import { coupleNames } from "@/lib/invitation";
import { getInvitation, listInvitationSlugs } from "@/lib/load-invitations";

export default function Home() {
  const invitations = listInvitationSlugs()
    .map((slug) => getInvitation(slug))
    .filter((inv) => inv !== null);

  return (
    <main className="min-h-svh bg-gradient-to-b from-[#f9d8df] via-[#fbf4f2] to-[#e4dbf4] px-6 py-16 text-[#3d3648]">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-center font-display text-4xl tracking-wide text-[#463f53]">Invitations</h1>
        <p className="mt-3 text-center text-sm text-[#776d84]">
          Each JSON file in <code className="rounded bg-white/60 px-1">data/invitations/</code> becomes a page.
        </p>
        <ul className="mt-10 space-y-3">
          {invitations.map((inv) => (
            <li key={inv.slug}>
              <Link
                href={`/invite/${inv.slug}`}
                className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/60 px-5 py-4 shadow-sm backdrop-blur transition hover:border-[#8f6a8f]/40 hover:bg-white"
              >
                <span>
                  <span className="block font-display text-lg font-medium">{coupleNames(inv)}</span>
                  <span className="text-sm text-[#776d84]">
                    {formatFullDate(inv.event.date)} · {inv.template}
                  </span>
                </span>
                <span className="font-mono text-xs text-[#776d84]">/invite/{inv.slug}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
