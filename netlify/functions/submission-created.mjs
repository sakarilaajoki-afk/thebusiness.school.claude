/* A verified form submission, handed to the game (owner 10.11.2026).

   Netlify runs a function with this exact name after every form submission
   that passed its spam check. A Request a trial submission ("pilot-application")
   is posted to the game, which makes the trial licence and writes the email
   (the game's netlify/functions/trial-licence.js). Every other form is left
   alone.

   The switch: nothing is posted unless TRIAL_HOOK_SECRET is set on this site
   (the same value as on the game's site). Without it this function does
   nothing at all.

   Only the fields the licence and its email need leave this site: the name,
   the school email, the school, the country, the answer to "When could you
   run a lesson?" and which of the two requests it is. Nothing is logged but
   the outcome. The form's own storage and email notification are untouched,
   so a submission is never lost here: if the game cannot be reached the owner
   still has it in Netlify Forms, and the game's own record shows it missing.
*/
const HOOK = "https://play.thebusiness.school/api/trial-licence";
const FORM = "pilot-application";
const TIMEOUT_MS = 8000;

function clean(value, max) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, max);
}

export function bodyFor(payload) {
  if (!payload || payload.form_name !== FORM || !payload.id) return null;
  const data = payload.data || {};
  return {
    submission_id: clean(payload.id, 120),
    request_type: clean(data.request_type, 20).toLowerCase(),
    name: clean(data.name, 120),
    email: clean(data.email, 255),
    school: clean(data.school, 120),
    country: clean(data.country, 80),
    timing: clean(data.timing, 80),
  };
}

async function post(body, secret, fetchFn) {
  const response = await fetchFn(HOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-trial-secret": secret },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return response.status;
}

/* The fetch in use. Not a handler parameter: Netlify calls the handler with
   (event, context, callback), so a third parameter is the Lambda callback,
   never a fetch. With `fetchFn = fetch` there the callback was called as if it
   were fetch, and every real submission answered 502 (found 11.11.2026 with
   the first real form test; nothing reached the game). */
let fetchFn = fetch;
export function setFetch(fn) { fetchFn = fn || fetch; }

export const handler = async (event) => {
  const secret = process.env.TRIAL_HOOK_SECRET;
  if (!secret) return { statusCode: 200, body: "trial hook is off" };
  let payload = null;
  try { payload = JSON.parse(event.body || "{}").payload; } catch { payload = null; }
  const body = bodyFor(payload);
  if (!body) return { statusCode: 200, body: "not a trial form" };
  /* One more try if the game did not answer: the game does nothing twice for
     one submission id. */
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const status = await post(body, secret, fetchFn);
      console.log(`trial hook: game answered ${status} (attempt ${attempt})`);
      if (status < 500) return { statusCode: 200, body: `game ${status}` };
    } catch (error) {
      console.log(`trial hook: no answer (attempt ${attempt}): ${error && error.name}`);
    }
  }
  return { statusCode: 200, body: "game not reached" };
};
