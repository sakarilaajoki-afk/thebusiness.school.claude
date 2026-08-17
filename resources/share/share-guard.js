// The file input used to be required, which silently blocked every teacher
// whose deck was over the 8 MB cap or who only had a Drive link. Now either
// one will do, but not neither.
//
// This lives in its own file rather than inline: the inline version did not run
// on this page, and a submission guard that silently does not run is worse than
// no guard, because it looks like it is working.
(function () {
  function wire() {
    var form = document.querySelector('form[name="free-resource"]');
    if (!form) return;
    var file = form.querySelector('#file'), link = form.querySelector('#link');
    if (!file || !link) return;
    var msg = document.createElement('p');
    msg.id = 'need-one';
    msg.style.cssText = 'display:none;font-size:13px;color:#b3261e;margin:8px 0 0';
    msg.textContent = 'Add the file, or paste a link to it. Either is fine, we just need one.';
    link.parentNode.insertBefore(msg, link.nextSibling);
    form.addEventListener('submit', function (e) {
      var has = (file.files && file.files.length) || link.value.trim();
      if (!has) {
        e.preventDefault();
        msg.style.display = 'block';
        file.scrollIntoView({ block: 'center' });
      } else {
        msg.style.display = 'none';
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
