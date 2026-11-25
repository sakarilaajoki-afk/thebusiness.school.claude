/* The short trial form: the licence key on screen at once (owner 19.11.2026).

   POST /.netlify/functions/trial-request   (JSON, from trial/index.html)
   { name, email, school, role, course, message?, feedback_opt_in?,
     business_teachers?, business_students?, "bot-field" }

   This function checks the five fields, then asks the game to make the trial
   licence (play.thebusiness.school/api/trial-licence, the same step the
   Netlify Forms hook uses, with the shared TRIAL_HOOK_SECRET), and hands the
   answer to the browser that sent the form, and to nobody else:

     { ok: true, outcome: 'new', key, lessons, expires, emailed }
     { ok: true, outcome: 'existing' | 'email_only', emailed }   (no key)
     { ok: false, outcome: 'limited' }                            (a limit)
     { ok: false, code: 'invalid', fields: [...] }                (400)
     { ok: false, code: 'off' | 'unreachable' }                   (503 / 502)

   The game makes the licence (2 lessons, 35 days), emails it, keeps the row
   in trial_requests and holds the limits: 3 new trial licences a day from one
   address, 10 for one email domain, one active trial per email. It shows a
   key only for a licence this very request made; a teacher who already has
   one gets it by email. The sender's address goes to the game only to count
   (it keeps a salted hash).

   On 'off' or 'unreachable' the page sends the form the old way (Netlify
   Forms, then the thank-you page), so no request is lost.

   Nothing is logged but the outcome; never the key.
*/
import { randomUUID } from "node:crypto";

const GAME = "https://play.thebusiness.school/api/trial-licence";
const TIMEOUT_MS = 9000;

/* The game's UK courses, as the select on trial/index.html lists them
   (a test keeps the two the same). */
export const COURSES = [
  "AQA GCSE Business (8132)",
  "AQA A level Business (7132)",
  "Pearson Edexcel GCSE Business (1BS0)",
  "Pearson Edexcel A level Business (9BS0)",
  "Pearson Edexcel International GCSE Business (4BS1)",
  "Pearson Edexcel International A level Business (IAL)",
  "OCR GCSE Business (J204)",
  "OCR A level Business",
  "Eduqas GCSE Business",
  "Eduqas A level Business",
  "WJEC GCSE Business",
  "WJEC A level Business",
  "Cambridge IGCSE Business",
  "Cambridge International A level Business (9609)",
  "BTEC Tech Award in Enterprise",
  "BTEC Level 3 Business",
  "IB Business Management",
  "Other",
];

/* "Your role", as the select on trial/index.html lists it, in its order
   (owner 22.11.2026; a test keeps the two the same). */
export const ROLES = ["Teacher", "Head of Business", "Curriculum lead", "School leader", "Other"];

/* Two optional questions at the end of the form (owner 25.11.2026), in the
   form's order; a test keeps the selects the same. Empty or anything else is
   sent as "" and never stops the request. */
export const BUSINESS_TEACHERS = ["1", "2–3", "4–6", "7–10", "more than 10"];
export const BUSINESS_STUDENTS = ["under 30", "30–100", "100–300", "more than 300"];
export function oneOf(list, value) { const v = clean(value, 40); return list.includes(v) ? v : ""; }

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i;
const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function clean(value, max) {
  return String(value == null ? "" : value).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}
function respond(statusCode, body) { return { statusCode, headers: HEADERS, body: JSON.stringify(body) }; }

function parse(event) {
  const raw = event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : String(event.body || "");
  const type = String((event.headers || {})["content-type"] || (event.headers || {})["Content-Type"] || "");
  if (type.includes("application/x-www-form-urlencoded")) return Object.fromEntries(new URLSearchParams(raw));
  try { const body = JSON.parse(raw); return body && typeof body === "object" ? body : null; } catch { return null; }
}

/* The five fields, checked as the game will check them. */
export function check(data) {
  const form = {
    name: clean(data.name, 120),
    email: clean(data.email, 255).toLowerCase(),
    school: clean(data.school, 120),
    role: clean(data.role, 40),
    course: clean(data.course, 120),
    message: String(data.message == null ? "" : data.message).replace(/\u0000/g, "").trim().slice(0, 1000),
    feedback_opt_in: data.feedback_opt_in === true || clean(data.feedback_opt_in, 10).toLowerCase() === "yes",
    business_teachers: oneOf(BUSINESS_TEACHERS, data.business_teachers),
    business_students: oneOf(BUSINESS_STUDENTS, data.business_students),
  };
  const fields = [];
  if (form.name.length < 2 || !/\p{L}/u.test(form.name)) fields.push("name");
  if (!EMAIL_RE.test(form.email)) fields.push("email");
  if (form.school.length < 2 || !/\p{L}/u.test(form.school) || /[<>{}\[\]]|https?:|@/i.test(form.school)) fields.push("school");
  if (!ROLES.includes(form.role)) fields.push("role");
  if (!COURSES.includes(form.course)) fields.push("course");
  return { form, fields };
}

/* Netlify puts the visitor's address in x-nf-client-connection-ip. */
export function clientIp(headers = {}) {
  const first = (value) => String(value || "").split(",")[0].trim();
  const ip = first(headers["x-nf-client-connection-ip"]) || first(headers["client-ip"]) || first(headers["x-forwarded-for"]);
  return /^[0-9a-fA-F:.]{3,64}$/.test(ip) ? ip : "";
}

let fetchFn = fetch;
export function setFetch(fn) { fetchFn = fn || fetch; }

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return respond(405, { ok: false, code: "method" });
  const data = parse(event);
  if (!data) return respond(400, { ok: false, code: "invalid", fields: [] });
  /* The honeypot: a bot is told nothing it can use, and nothing is made. */
  if (clean(data["bot-field"], 200)) return respond(200, { ok: true, outcome: "email_only", emailed: true });
  const { form, fields } = check(data);
  if (fields.length) return respond(400, { ok: false, code: "invalid", fields });

  const secret = process.env.TRIAL_HOOK_SECRET;
  if (!secret) return respond(503, { ok: false, code: "off" });

  const body = {
    submission_id: `web-${randomUUID()}`,
    request_type: "trial",
    instant: true,
    ip: clientIp(event.headers || {}),
    ...form,
  };
  let answer;
  try {
    const response = await fetchFn(GAME, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-trial-secret": secret },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.status >= 500 || response.status === 403) {
      console.log(`trial request: game answered ${response.status}`);
      return respond(502, { ok: false, code: "unreachable" });
    }
    answer = await response.json();
  } catch (error) {
    console.log(`trial request: no answer from the game: ${error && error.name}`);
    return respond(502, { ok: false, code: "unreachable" });
  }
  const outcome = String((answer && answer.outcome) || "");
  console.log(`trial request: ${outcome || "unknown"}`);
  if (outcome === "new" && /^TBS-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(answer.key || "") && /^\d{4}-\d{2}-\d{2}$/.test(answer.expires_at || "")) {
    return respond(200, { ok: true, outcome, key: answer.key, lessons: Number(answer.lessons) || 2, expires: answer.expires_at, emailed: !!answer.emailed });
  }
  if (outcome === "existing" || outcome === "email_only") return respond(200, { ok: true, outcome, emailed: !!answer.emailed });
  if (outcome === "limited") return respond(429, { ok: false, outcome });
  if (outcome === "invalid") return respond(400, { ok: false, code: "invalid", fields: [] });
  return respond(502, { ok: false, code: "unreachable" });
};
