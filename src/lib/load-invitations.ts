// Server-only: reads invitation JSON files from disk. Client code imports from ./invitation instead.
import fs from "node:fs";
import path from "node:path";
import { TEMPLATE_IDS, type Invitation, type InvitationData } from "./invitation";

const DATA_DIR = path.join(process.cwd(), "data", "invitations");

export function listInvitationSlugs(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

export function getInvitation(slug: string): Invitation | null {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const file = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (err) {
    throw new Error(`data/invitations/${slug}.json is not valid JSON: ${(err as Error).message}`);
  }
  const data = raw as InvitationData;
  const problems = validate(data);
  if (problems.length) {
    throw new Error(`data/invitations/${slug}.json has problems:\n- ${problems.join("\n- ")}`);
  }
  return { ...data, slug };
}

function validate(d: InvitationData): string[] {
  const p: string[] = [];
  if (!TEMPLATE_IDS.includes(d.template)) p.push(`"template" must be one of: ${TEMPLATE_IDS.join(", ")}`);
  if (!d.couple?.groom?.name) p.push(`"couple.groom.name" is required`);
  if (!d.couple?.bride?.name) p.push(`"couple.bride.name" is required`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.event?.date ?? "")) p.push(`"event.date" must look like 2027-01-31`);
  if (!/^\d{2}:\d{2}$/.test(d.event?.time ?? "")) p.push(`"event.time" must look like 18:30`);
  if (!d.event?.timezone) p.push(`"event.timezone" is required, e.g. "Asia/Kolkata"`);
  for (const key of ["program", "preEvents"] as const) {
    d[key]?.items?.forEach((item, i) => {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(item.dateTime ?? "")) {
        p.push(`"${key}.items[${i}].dateTime" must look like 2027-01-31T18:30`);
      }
    });
  }
  return p;
}
