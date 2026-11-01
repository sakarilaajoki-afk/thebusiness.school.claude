(function(){function boot(){var r=document.querySelector('.hs');if(!r||r.getAttribute('data-ready'))return;r.setAttribute('data-ready','1');var it=[].slice.call(r.querySelectorAll('.hs-item')),im=[].slice.call(r.querySelectorAll('.hs-img')),cap=r.querySelector('.hs-cap'),bar=r.querySelector('.hs-bar i');var cur=0,timer=null,paused=false,D=6500;
function set(k,user){cur=k;it.forEach(function(e,n){e.setAttribute('aria-selected',n===k?'true':'false')});im.forEach(function(e,n){e.classList.toggle('on',n===k)});var t=it[k].querySelector('.hs-t').textContent,d=it[k].querySelector('.hs-d').textContent;cap.innerHTML='<b></b><span></span>';cap.firstChild.textContent=t;cap.lastChild.textContent=d;if(window.innerWidth<=820){it[k].parentNode.scrollTo({left:it[k].offsetLeft-24,behavior:'smooth'})}
if(bar){bar.style.transition='none';bar.style.width='0';void bar.offsetWidth;if(!user&&!paused&&timer){bar.style.transition='width '+D+'ms linear';bar.style.width='100%'}}}
function next(){set((cur+1)%it.length,false)}
function stop(){if(timer){clearInterval(timer);timer=null}}
function start(){stop();if(window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;timer=setInterval(function(){if(!paused)next()},D)}
it.forEach(function(e,n){e.addEventListener('click',function(){stop();set(n,true)})});
r.addEventListener('mouseenter',function(){paused=true});r.addEventListener('mouseleave',function(){paused=false});
start();set(0,false);
}
var tries=0;function wait(){if(document.querySelector('.hs')){boot();return}if(tries++<80)setTimeout(wait,150)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();})();
