/* "How a lesson runs" carousel (home page). Plain JS, no libraries. */
(function(){
function boot(){
  var r=document.querySelector('.lc');if(!r||r.getAttribute('data-ready'))return;r.setAttribute('data-ready','1');
  var sl=[].slice.call(r.querySelectorAll('.lc-slide')),L=sl.length,view=r.querySelector('.lc-view'),cap=r.querySelector('.lc-cap'),
      segs=[].slice.call(r.querySelectorAll('.lc-segs i')),count=r.querySelector('.lc-count'),
      prev=r.querySelector('.lc-prev'),next=r.querySelector('.lc-next');
  var cur=0,timer=null,auto=false,hover=false,seen=false,capT=null,D=6500;
  var still=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var CLS=['is-far-l','is-prev','is-cur','is-next','is-far-r'];
  function writeCap(k){var s=sl[k];cap.innerHTML='<b><i></i></b><span></span>';cap.firstChild.firstChild.textContent=s.getAttribute('data-n');cap.firstChild.appendChild(document.createTextNode(' · '+s.getAttribute('data-t')));cap.lastChild.textContent=s.getAttribute('data-d')}
  function mark(){segs.forEach(function(e,n){e.className=n===cur?(auto&&!hover&&seen?'on run':'on'):''})}
  function set(k){
    cur=(k+L)%L;
    sl.forEach(function(e,n){
      var o=n-cur;if(o>L/2)o-=L;if(o<-L/2)o+=L;
      CLS.forEach(function(c){e.classList.remove(c)});
      if(o>=-2&&o<=2){e.classList.add(CLS[o+2]);var im=e.querySelector('img');if(im&&im.loading==='lazy')im.loading='eager'}
      if(o===0)e.removeAttribute('aria-hidden');else e.setAttribute('aria-hidden','true');
    });
    if(count)count.textContent=(cur+1)+' / '+L;
    mark();
    clearTimeout(capT);
    if(still){writeCap(cur)}else{cap.classList.add('out');capT=setTimeout(function(){writeCap(cur);cap.classList.remove('out')},220)}
  }
  function tick(){clearTimeout(timer);if(!auto||hover||!seen)return;timer=setTimeout(function(){set(cur+1);tick()},D)}
  function stop(){auto=false;clearTimeout(timer);mark()}
  function go(k){stop();set(k)}
  prev.addEventListener('click',function(){go(cur-1)});
  next.addEventListener('click',function(){go(cur+1)});
  sl.forEach(function(e,n){e.addEventListener('click',function(){if(n!==cur&&!swiped)go(n)})});
  r.addEventListener('keydown',function(ev){var k=ev.key;if(k==='ArrowRight'){ev.preventDefault();go(cur+1)}else if(k==='ArrowLeft'){ev.preventDefault();go(cur-1)}else if(k==='Home'){ev.preventDefault();go(0)}else if(k==='End'){ev.preventDefault();go(L-1)}});
  r.addEventListener('focusin',stop);
  var x0=null,y0=null,swiped=false;
  view.addEventListener('touchstart',function(ev){var t=ev.touches[0];x0=t.clientX;y0=t.clientY;swiped=false},{passive:true});
  view.addEventListener('touchend',function(ev){if(x0===null)return;var t=ev.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3){swiped=true;go(cur+(dx<0?1:-1));setTimeout(function(){swiped=false},400)}},{passive:true});
  r.addEventListener('mouseenter',function(){hover=true;clearTimeout(timer);mark()});
  r.addEventListener('mouseleave',function(){hover=false;mark();tick()});
  r.style.setProperty('--lc-d',D+'ms');
  if(!still&&'IntersectionObserver' in window){
    auto=true;
    new IntersectionObserver(function(en){seen=en[0].isIntersecting;mark();tick()},{threshold:.5}).observe(view);
  }
}
var tries=0;function wait(){if(document.querySelector('.lc')){boot();return}if(tries++<80)setTimeout(wait,150)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
})();
