/* The short trial form (owner 19.11.2026).
     node --test netlify/tests/trial-request.test.mjs
   The game is never called: its answer is mocked with setFetch. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { handler, setFetch, COURSES, ROLES, BUSINESS_TEACHERS, BUSINESS_STUDENTS, HEARD_FROM, check, clientIp } from "../functions/trial-request.mjs";
import { bodyFor } from "../functions/submission-created.mjs";

const HTML = readFileSync(new URL("../../trial/index.html", import.meta.url), "utf8");
const FORM = { name: "Kate Willett", email: "Kate@Cirencester.example", school: "Cirencester College", role: "Head of Business", course: "AQA GCSE Business (8132)",
  message: "Year 10", feedback_opt_in: "yes", business_teachers: "2–3", business_students: "30–100", heard_from: "LinkedIn", "bot-field": "", request_type: "trial", claim: "a".repeat(32) };

function game(answer, status = 200) {
  const calls = [];
  setFetch(async (url, options) => { calls.push({ url, options, body: JSON.parse(options.body) }); return { status, json: async () => answer }; });
  return calls;
}
async function submit(data, headers = { "x-nf-client-connection-ip": "203.0.113.7" }) {
  const res = await handler({ httpMethod: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(data) });
  return { status: res.statusCode, body: JSON.parse(res.body), raw: res.body, headers: res.headers };
}
process.env.TRIAL_HOOK_SECRET = "s3cret";

test("the form on the page: the five fields, one optional message, the feedback box, the honeypot; nothing of the long form", () => {
  const form = HTML.slice(HTML.indexOf('<form id="application"'), HTML.indexOf("</form>"));
  const required = [...form.matchAll(/<(input|select|textarea)\b[^>]*\bname="([^"]+)"[^>]*\brequired\b/g)].map((m) => m[2]);
  /* SPEC CHANGE (owner 22.11.2026): "Your role", required, between School name and Your course. */
  /* SPEC CHANGE (owner 25.11.2026): the two department questions are required too. */
  assert.deepEqual([...new Set(required)], ["request_type", "name", "email", "school", "role", "course", "business_teachers", "business_students", "heard_from"]);
  for (const label of ["Your name *", "School email *", "School name *", "Your role *", "Your course *", "Anything you would like to say? (optional)", "I’d be happy to share brief feedback afterwards (optional)."]) {
    assert.ok(form.includes(label), label);
  }
  assert.match(form, /netlify-honeypot="bot-field"/);
  assert.match(form, /name="bot-field"/);
  assert.ok(form.includes("A free trial") && form.includes("School licence"), "the trial / licence choice stays");
  assert.ok(form.includes("Privacy information"));
  for (const gone of ["country", "school_type", "dept_size", "personal_email", "qualification", "exam_board", "year_group", "timing", "it_whitelist", "referral", "classroom_intent"]) {
    assert.ok(!form.includes(`name="${gone}"`), gone);
  }
  const roleSelect = form.slice(form.indexOf('<select id="role"'), form.indexOf("</select>", form.indexOf('<select id="role"')));
  assert.deepEqual([...roleSelect.matchAll(/<option>([^<]+)<\/option>/g)].map((m) => m[1]), ROLES, "the role select lists exactly the roles the function accepts");
  assert.deepEqual(ROLES, ["Teacher", "Head of Business", "Curriculum lead", "School leader", "Other"]);
  assert.match(roleSelect, /^<select id="role" name="role" required><option value="">Choose your role<\/option>/);
  assert.ok(form.indexOf('id="school"') < form.indexOf('id="role"') && form.indexOf('id="role"') < form.indexOf('id="course"'), "between School name and Your course");
  assert.ok(HTML.includes("setCustomValidity(roleSelect.value ? '' : 'Please choose your role.')") && HTML.includes("role: 'your role'"), "a short error when it is empty");
  /* SPEC CHANGE (owner 25.11.2026): two optional selects follow, so only the course select is read. */
  const courseSelect = form.slice(form.indexOf('<select id="course"'), form.indexOf("</select>", form.indexOf('<select id="course"')));
  const options = [...courseSelect.matchAll(/<option>([^<]+)<\/option>/g)].map((m) => m[1]);
  assert.deepEqual(options, COURSES, "the select lists exactly the courses the function accepts");
  assert.ok(COURSES.includes("AQA GCSE Business (8132)") && COURSES.includes("Pearson Edexcel A level Business (9BS0)") && COURSES.at(-1) === "Other");
  assert.ok(HTML.includes("<video") && HTML.includes("motor-film"), "the film stays");
  assert.doesNotMatch(HTML, /£\s?\d|\$\s?\d|€\s?\d|\bper (pupil|student|year)\b/i, "no prices");
});

test("the result on the page says what the owner asked, and only that", () => {
  const result = HTML.slice(HTML.indexOf('id="trial-result"'), HTML.indexOf('id="trial-note"'));
  for (const line of ["Your licence key", "Trial: ", "Expires ", "Start a lesson", 'href="https://play.thebusiness.school/"', "Want it for your whole school? Ask us for a quote:", "support@thebusiness.school"]) {
    assert.ok(result.includes(line), line);
  }
});

test("a good request: the game is asked with the secret and the sender's address; the new key, 2 lessons and the expiry come back", async () => {
  const calls = game({ ok: true, status: "sent", outcome: "new", emailed: true, key: "TBS-AB12-CD34", expires_at: "2026-12-24", lessons: 2, licence_made: true });
  const out = await submit(FORM);
  assert.equal(out.status, 200);
  assert.deepEqual(out.body, { ok: true, outcome: "new", key: "TBS-AB12-CD34", lessons: 2, expires: "2026-12-24", emailed: true });
  assert.equal(out.headers["Cache-Control"], "no-store");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://play.thebusiness.school/api/trial-licence");
  assert.equal(calls[0].options.headers["x-trial-secret"], "s3cret");
  const sent = calls[0].body;
  assert.match(sent.submission_id, /^web-[0-9a-f-]{36}$/);
  assert.deepEqual({ ...sent, submission_id: "" }, { submission_id: "", request_type: "trial", instant: true, ip: "203.0.113.7", name: "Kate Willett", email: "kate@cirencester.example",
    school: "Cirencester College", role: "Head of Business", course: "AQA GCSE Business (8132)", message: "Year 10", feedback_opt_in: true, business_teachers: "2–3", business_students: "30–100", heard_from: "LinkedIn" }); /* SPEC CHANGE (owner 22.11.2026): the role goes on; (25.11.2026) the two department answers */
  assert.ok(!("claim" in sent) && !("bot-field" in sent), "only the form's own fields go");
  /* two requests, two submissions */
  await submit(FORM);
  assert.notEqual(calls[1].body.submission_id, calls[0].body.submission_id);
});

test("no key unless the game made one for this request", async () => {
  for (const [answer, status, want] of [
    [{ outcome: "existing", emailed: true }, 200, { ok: true, outcome: "existing", emailed: true }],
    [{ outcome: "existing", emailed: false, key: "TBS-AB12-CD34" }, 200, { ok: true, outcome: "existing", emailed: false }],
    [{ outcome: "email_only", emailed: true }, 200, { ok: true, outcome: "email_only", emailed: true }],
    [{ outcome: "limited", reason: "rate_limited_ip" }, 429, { ok: false, outcome: "limited" }],
    [{ outcome: "new", key: "not-a-key", expires_at: "2026-12-24" }, 502, { ok: false, code: "unreachable" }],
    [{ outcome: "invalid", reason: "invalid_email" }, 400, { ok: false, code: "invalid", fields: [] }],
  ]) {
    game(answer);
    const out = await submit(FORM);
    assert.equal(out.status, status, JSON.stringify(answer));
    assert.deepEqual(out.body, want);
    assert.doesNotMatch(out.raw, /TBS-/);
  }
});

test("fields are checked here before anything is made: required, email format, a role and a course from the list", async () => {
  const calls = game({ outcome: "new" });
  for (const [change, fields] of [
    [{ name: "" }, ["name"]], [{ name: " 1 " }, ["name"]], [{ email: "" }, ["email"]], [{ email: "kate@school" }, ["email"]], [{ email: "kate school@x.example" }, ["email"]],
    [{ school: "" }, ["school"]], [{ school: "https://spam.example" }, ["school"]], [{ course: "" }, ["course"]], [{ course: "Made-up course" }, ["course"]],
    /* SPEC CHANGE (owner 22.11.2026): "Your role", one of the five. */
    [{ role: "" }, ["role"]], [{ role: undefined }, ["role"]], [{ role: "Pupil" }, ["role"]], [{ role: "teacher" }, ["role"]],
    [{ name: "", email: "x", school: "", role: "", course: "" }, ["name", "email", "school", "role", "course"]],
  ]) {
    const out = await submit({ ...FORM, ...change });
    assert.equal(out.status, 400, JSON.stringify(change));
    assert.deepEqual(out.body, { ok: false, code: "invalid", fields });
  }
  assert.equal(calls.length, 0, "the game is never asked");
  for (const role of ROLES) assert.deepEqual(check({ ...FORM, role }).fields, [], role);
  assert.equal((await handler({ httpMethod: "POST", headers: {}, body: "{not json" })).statusCode, 400);
  assert.equal((await handler({ httpMethod: "GET", headers: {}, body: "" })).statusCode, 405);
  assert.equal(check({ ...FORM, message: "x".repeat(5000) }).form.message.length, 1000);
});

test("the honeypot: a bot is told nothing useful and nothing is made", async () => {
  const calls = game({ outcome: "new", key: "TBS-AB12-CD34", expires_at: "2026-12-24" });
  const out = await submit({ ...FORM, "bot-field": "http://spam.example" });
  assert.equal(out.status, 200);
  assert.doesNotMatch(out.raw, /TBS-/);
  assert.equal(calls.length, 0);
});

test("game off or out of reach: the page is told to send the form the old way", async () => {
  delete process.env.TRIAL_HOOK_SECRET;
  assert.deepEqual((await submit(FORM)).body, { ok: false, code: "off" });
  process.env.TRIAL_HOOK_SECRET = "s3cret";
  game({}, 500);
  assert.deepEqual((await submit(FORM)).body, { ok: false, code: "unreachable" });
  game({}, 403);
  assert.equal((await submit(FORM)).status, 502);
  setFetch(async () => { throw Object.assign(new Error("t"), { name: "TimeoutError" }); });
  assert.deepEqual((await submit(FORM)).body, { ok: false, code: "unreachable" });
});

test("the sender's address: Netlify's header first, nothing that is not an address", () => {
  assert.equal(clientIp({ "x-nf-client-connection-ip": "2001:db8::1", "x-forwarded-for": "1.1.1.1" }), "2001:db8::1");
  assert.equal(clientIp({ "x-forwarded-for": "198.51.100.4, 10.0.0.1" }), "198.51.100.4");
  assert.equal(clientIp({ "x-nf-client-connection-ip": "evil; DROP TABLE" }), "");
  assert.equal(clientIp({}), "");
});

test("the Netlify Forms copy of a request this page already handled is stored only, never sent to the game again", () => {
  const payload = (data) => ({ form_name: "pilot-application", id: "n1", data: { request_type: "trial", name: "Kate", email: "k@s.example", school: "S", course: "Other", ...data } });
  assert.equal(bodyFor(payload({ handled: "instant" })), null);
  const fallback = bodyFor(payload({ handled: "", message: "Hi", feedback_opt_in: "yes", claim: "b".repeat(32) }));
  assert.deepEqual([fallback.request_type, fallback.course, fallback.message, fallback.feedback_opt_in, fallback.claim, fallback.country, fallback.timing],
    ["trial", "Other", "Hi", true, "b".repeat(32), "", ""]);
  /* SPEC CHANGE (owner 22.11.2026): the fallback carries the role too; anything not one of the five goes as none. */
  assert.equal(bodyFor(payload({ handled: "", role: "School leader" })).role, "School leader");
  assert.equal(bodyFor(payload({ handled: "", role: "<script>" })).role, "");
  assert.equal(bodyFor(payload({ handled: "" })).role, "");
  assert.equal(bodyFor(payload({ request_type: "licence" })).request_type, "licence", "a quote request still reaches the game (which leaves it to the owner)");
});

/* Owner 25.11.2026: two selects at the end of the form, before the button;
   required ("pakollisiksi"). The Forms hook (fallback, older forms) still
   sends "" when there is none. */
test("the two department questions: on the page before the button, required, sent to the game and from the Forms hook", async () => {
  const form = HTML.slice(HTML.indexOf('<form id="application"'), HTML.indexOf("</form>"));
  const options = (id) => { const s = form.slice(form.indexOf(`<select id="${id}"`), form.indexOf("</select>", form.indexOf(`<select id="${id}"`))); return [...s.matchAll(/<option>([^<]+)<\/option>/g)].map((m) => m[1]); };
  assert.deepEqual(options("business-teachers"), BUSINESS_TEACHERS);
  assert.deepEqual(options("business-students"), BUSINESS_STUDENTS);
  assert.deepEqual(BUSINESS_TEACHERS, ["1", "2–3", "4–6", "7–10", "more than 10"]);
  assert.deepEqual(BUSINESS_STUDENTS, ["under 30", "30–100", "100–300", "more than 300"]);
  assert.ok(form.includes("Business / Economics teachers in your department *"));
  assert.ok(form.includes("Students taking Business at your school *"));
  assert.match(form, /<select id="business-teachers" name="business_teachers" required>/);
  assert.match(form, /<select id="business-students" name="business_students" required>/);
  assert.ok(form.indexOf('id="message"') < form.indexOf('id="business-teachers"') && form.indexOf('id="business-students"') < form.indexOf('id="submit-btn"'), "at the end, before the button");
  for (const [t, st, want] of [["", "", ["business_teachers", "business_students"]], ["4–6", "", ["business_students"]], ["lots", "100–300", ["business_teachers"]], ["4–6", "100–300", []]]) {
    assert.deepEqual(check({ ...FORM, business_teachers: t, business_students: st }).fields, want, `${t}/${st}`);
  }
  const before = game({ outcome: "new", key: "TBS-AB12-CD34", expires_at: "2027-02-28", lessons: 2, emailed: true });
  const missing = await submit({ ...FORM, business_teachers: "" });
  assert.deepEqual([missing.status, missing.body.code, missing.body.fields], [400, "invalid", ["business_teachers"]]);
  assert.equal(before.length, 0, "the game is not asked");
  const calls = game({ outcome: "new", key: "TBS-AB12-CD34", expires_at: "2027-02-28", lessons: 2, emailed: true });
  const out = await submit({ ...FORM, business_teachers: "7–10", business_students: "more than 300" });
  assert.equal(out.status, 200);
  assert.deepEqual([calls[0].body.business_teachers, calls[0].body.business_students], ["7–10", "more than 300"]);
  const hooked = bodyFor({ form_name: "pilot-application", id: "x1", data: { ...FORM, business_teachers: "2–3", business_students: "under 30" } });
  assert.deepEqual([hooked.business_teachers, hooked.business_students], ["2–3", "under 30"]);
  const old = bodyFor({ form_name: "pilot-application", id: "x2", data: { name: "A B", email: "a@b.example", school: "S", request_type: "trial" } });
  assert.deepEqual([old.business_teachers, old.business_students], ["", ""], "an older form without them still goes through");
});

/* Owner 25.11.2026: "How did you hear about us?", required, last before the button. */
test('"How did you hear about us?": the options, required, sent on', async () => {
  const form = HTML.slice(HTML.indexOf('<form id="application"'), HTML.indexOf("</form>"));
  const sel = form.slice(form.indexOf('<select id="heard-from"'), form.indexOf("</select>", form.indexOf('<select id="heard-from"')));
  assert.deepEqual([...sel.matchAll(/<option>([^<]+)<\/option>/g)].map((m) => m[1]), HEARD_FROM);
  assert.match(sel, /^<select id="heard-from" name="heard_from" required>/);
  assert.ok(form.indexOf('id="business-students"') < form.indexOf('id="heard-from"') && form.indexOf('id="heard-from"') < form.indexOf('id="submit-btn"'));
  assert.deepEqual(check({ ...FORM, heard_from: "" }).fields, ["heard_from"]);
  assert.deepEqual(check({ ...FORM, heard_from: "TikTok" }).fields, ["heard_from"]);
  const calls = game({ outcome: "new", key: "TBS-AB12-CD34", expires_at: "2027-02-28", lessons: 2, emailed: true });
  await submit({ ...FORM, heard_from: "An AI assistant (ChatGPT, Claude, Gemini)" });
  assert.equal(calls[0].body.heard_from, "An AI assistant (ChatGPT, Claude, Gemini)");
  assert.equal(bodyFor({ form_name: "pilot-application", id: "h1", data: { ...FORM, heard_from: "Facebook" } }).heard_from, "Facebook");
});
