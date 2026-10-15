/* Counts resource downloads, so the site can state a real number instead of a guess.

   Netlify's analytics counts requests for pages but never for files, so a PDF that
   thousands of teachers download leaves no trace at all. When a download link is
   used, this sends the file's path to a small counter (netlify/functions/download-count.mjs),
   which saves only that path and the date.

   No cookie, no identifier, no personal data, nothing stored in the browser. The
   download itself is never delayed or intercepted: the request goes out alongside it.
*/
(function () {
  "use strict";
  var FILES = /\.(pdf|docx|pptx|xlsx|zip)(\?|#|$)/i;
  var COUNTER = "/api/download-count";
  var lastPing = 0;

  function ping(path) {
    // one page can hold two links to the same pack, so ignore a repeat within a moment
    var now = Date.now();
    if (now - lastPing < 400) return;
    lastPing = now;
    var body = JSON.stringify({ path: path });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(COUNTER, new Blob([body], { type: "application/json" }));
        return;
      }
      fetch(COUNTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (!FILES.test(href)) return;
    if (/^https?:\/\//i.test(href) && a.hostname !== location.hostname) return;
    ping(a.pathname);
  }, true);
})();
