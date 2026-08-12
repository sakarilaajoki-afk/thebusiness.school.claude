/* Counts resource downloads, so the site can state a real number instead of a guess.

   Netlify's analytics counts requests for pages but never for files, so a PDF that
   thousands of teachers download leaves no trace at all. This asks the counter page
   for one byte whenever a download link is used, which puts the download into the
   same traffic log the pages already appear in.

   No cookie, no identifier, no personal data, nothing stored in the browser. The
   download itself is never delayed or intercepted: the request goes out alongside it.
*/
(function () {
  "use strict";
  var FILES = /\.(pdf|docx|pptx|xlsx|zip)(\?|#|$)/i;
  var COUNTER = "/count/download/";
  var lastPing = 0;

  function ping() {
    // one page can hold two links to the same pack, so ignore a repeat within a moment
    var now = Date.now();
    if (now - lastPing < 400) return;
    lastPing = now;
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(COUNTER);
        return;
      }
      fetch(COUNTER, { method: "GET", cache: "no-store", keepalive: true }).catch(function () {});
    } catch (e) {
      var i = new Image();
      i.src = COUNTER + "?t=" + Date.now();
    }
  }

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (!FILES.test(href)) return;
    if (/^https?:\/\//i.test(href) && a.hostname !== location.hostname) return;
    ping();
  }, true);
})();
