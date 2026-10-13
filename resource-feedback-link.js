(function(){
  if(!/^\/resources\//.test(location.pathname))return;
  function mount(){
    if(document.querySelector('[data-resource-feedback-link]'))return true;
    if(document.querySelector('x-dc')&&!document.getElementById('dc-root'))return false;
    var title=document.querySelector('main h1,.wrap h1,h1');
    if(!title)return false;
    var main=document.querySelector('main')||document.querySelector('.wrap')||document.body;
    var footer=main.querySelector('footer');
    var box=document.createElement('aside');
    box.setAttribute('aria-label','Resource feedback');
    box.setAttribute('data-resource-feedback-link','');
    box.style.cssText='box-sizing:border-box;width:min(900px,calc(100% - 40px));border:1px solid #c8d9d3;border-radius:12px;background:#f4f8f5;padding:20px 22px;margin:30px auto;color:#173145;font:15px/1.55 Arial,Helvetica,sans-serif';
    var heading=document.createElement('strong');
    heading.textContent='Used this resource?';
    heading.style.cssText='display:block;font-size:18px;margin-bottom:5px';
    var copy=document.createElement('p');
    copy.textContent='A rating and one sentence help us improve it and decide what to make next.';
    copy.style.cssText='margin:0 0 12px';
    var link=document.createElement('a');
    var url=new URL('/resources/feedback/',location.origin);
    url.searchParams.set('resource',title.textContent.trim().slice(0,160));
    url.searchParams.set('source',location.pathname);
    link.href=url.pathname+url.search;
    link.textContent='★ Rate this resource';
    link.style.cssText='display:inline-block;border-radius:8px;background:#0a6b73;color:#fff;padding:10px 15px;text-decoration:none;font-weight:700';
    box.append(heading,copy,link);
    var dynamicRoot=document.getElementById('dc-root');
    if(dynamicRoot)dynamicRoot.after(box);
    else if(footer)footer.before(box);
    else main.append(box);
    return true;
  }
  if(mount())return;
  var observer=new MutationObserver(function(){if(mount())observer.disconnect()});
  observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(function(){observer.disconnect()},10000);
})();
