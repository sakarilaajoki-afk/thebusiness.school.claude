/* Homepage: the lesson topics of the course picked in the lesson map, as a sheet of paper.
   The page template re-renders after load, so this waits for the list and fills it again if it is emptied. */
(function(){
"use strict";
var ALIAS = { 'btec-l3-national': 'btec-l3-extended-certificate', 'cambridge-igcse-0450': 'cambridge-igcse-0264' };
var SHOW = 8, guides = null, failed = false;
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function render(force){
  var list = document.getElementById('tp-list'), sel = document.getElementById('lm-course');
  if(!list || !sel) return;
  var picked = sel.value, id = ALIAS[picked] || picked;
  if(!force && list.getAttribute('data-course') === id && list.children.length) return;
  var head = document.getElementById('tp-course'), all = document.getElementById('tp-all');
  if(head && sel.selectedIndex >= 0) head.textContent = sel.options[sel.selectedIndex].text;
  if(all) all.href = '/teacher-guides/?course=' + encodeURIComponent(picked);
  if(failed){ list.innerHTML = '<li><span class="t">The topics could not load. Open the full list instead.</span></li>'; list.setAttribute('data-course', id); return; }
  if(!guides) return;
  var rows = guides.filter(function(g){ return g.courseId === id && g.topicId !== 'no-topic'; });
  var allDraft = rows.length > 0 && rows.every(function(g){ return g.draft; });
  var html = (allDraft ? '<li class="dh"><span class="d">Draft</span></li>' : '') + rows.slice(0, SHOW).map(function(g, k){
    return '<li><span class="n">' + ('0' + (k + 1)).slice(-2) + '</span><span class="t">' + esc(g.topic) + (g.draft && !allDraft ? '<span class="d">Draft</span>' : '') + '</span>'
      + '<a class="dl" href="/teacher-guides/pdf/' + encodeURIComponent(g.file) + '" target="_blank" rel="noopener" aria-label="Open the PDF: ' + esc(g.topic) + '">Open PDF</a></li>';
  }).join('');
  if(rows.length > SHOW) html += '<li class="more"><a href="/teacher-guides/?course=' + encodeURIComponent(picked) + '">and ' + (rows.length - SHOW) + ' more topics &rarr;</a></li>';
  list.innerHTML = html; list.setAttribute('data-course', id);
}
fetch('/teacher-guides/guides.json').then(function(r){ return r.json(); }).then(function(d){ guides = (d && d.guides) || []; render(true); }).catch(function(){ failed = true; render(true); });
document.addEventListener('change', function(e){ if(e.target && e.target.id === 'lm-course') render(true); });
var tries = 0;
(function tick(){ render(false); setTimeout(tick, tries++ < 40 ? 500 : 3000); })();
})();
