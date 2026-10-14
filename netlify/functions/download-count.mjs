/* Records one resource download click.

   Stores only the file path and the date (Europe/Helsinki). Nothing else is read
   from the request or saved: no IP address, no user agent, no cookies.

   Each click is saved as its own small entry, keyed  date / file path / random id.
   Separate entries mean two clicks at the same moment can never overwrite each
   other. A day's count for a file = the number of entries under  date/file path/.
*/
import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";

const MAX_BODY_BYTES = 512;
const MAX_PATH_LENGTH = 300;
const FILE_TYPES = /\.(pdf|docx|pptx|xlsx|zip)$/i;

export const config = { path: "/api/download-count" };

function helsinkiDate() {
  // sv-SE formats dates as YYYY-MM-DD
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function reply(status) {
  return new Response(null, { status, headers: { "Cache-Control": "no-store" } });
}

export default async (req) => {
  if (req.method !== "POST") return reply(405);

  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) return reply(413);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return reply(413);

  let path;
  try {
    path = JSON.parse(raw).path;
  } catch (e) {
    return reply(400);
  }

  if (
    typeof path !== "string" ||
    path.length > MAX_PATH_LENGTH ||
    !path.startsWith("/resources/") ||
    path.includes("..") ||
    path.includes("?") ||
    path.includes("#") ||
    !FILE_TYPES.test(path)
  ) {
    return reply(400);
  }

  const store = getStore("download-counts");
  await store.set(`${helsinkiDate()}/${path}/${randomUUID()}`, "1");
  return reply(204);
};
