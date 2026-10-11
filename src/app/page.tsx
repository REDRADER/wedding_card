import Link from "next/link";
import { formatFullDate } from "@/lib/dates";
import { coupleNames } from "@/lib/invitation";
import { getInvitation, listInvitationSlugs } from "@/lib/load-invitations";

export default function Home() {
  const invitations = listInvitationSlugs()
    .map((slug) => getInvitation(slug))
    .filter((inv) => inv !== null);

  return (
    <main className="min-h-svh bg-[#f3ede0] px-6 py-16 text-[#27331f]">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-center font-script text-5xl text-[#4a5c3d]">Invitations</h1>
        <p className="mt-3 text-center text-sm text-[#5f6d55]">
          Each JSON file in <code className="rounded bg-white/60 px-1">data/invitations/</code> becomes a page.
        </p>
        <ul className="mt-10 space-y-3">
          {invitations.map((inv) => (
            <li key={inv.slug}>
              <Link
                href={`/invite/${inv.slug}`}
                className="flex items-center justify-between rounded-xl border border-[#d9cfbd] bg-white/60 px-5 py-4 transition hover:border-[#4a5c3d]/50 hover:bg-white"
              >
                <span>
                  <span className="block font-display text-lg font-semibold">{coupleNames(inv)}</span>
                  <span className="text-sm text-[#5f6d55]">
                    {formatFullDate(inv.event.date)} · {inv.template}
                  </span>
                </span>
                <span className="font-mono text-xs text-[#5f6d55]">/invite/{inv.slug}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
