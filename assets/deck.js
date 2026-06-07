/* 共享演示页脚本 —— 所有 deck 复用。
   页面需包含 .slide 若干、一个 .bar、控制条里 #prev #next #count #theme #ti。 */
(function(){
  var slides=[].slice.call(document.querySelectorAll('.slide'));
  if(!slides.length) return;
  var n=slides.length, i=0;
  var bar=document.getElementById('bar'), count=document.getElementById('count');
  function show(idx){
    i=Math.max(0,Math.min(n-1,idx));
    slides.forEach(function(s,k){s.classList.toggle('active',k===i);});
    if(count) count.textContent=(i+1)+' / '+n;
    if(bar) bar.style.width=(n>1?(i/(n-1)*100):100)+'%';
    if(window.HSLottie && window.HSLottie.refresh) window.HSLottie.refresh(slides[i]);
    if(window.HSCountUp && window.HSCountUp.refresh) window.HSCountUp.refresh(slides[i]);
  }
  var next=function(){show(i+1);}, prev=function(){show(i-1);};
  var nb=document.getElementById('next'), pb=document.getElementById('prev');
  if(nb) nb.onclick=next; if(pb) pb.onclick=prev;
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();next();}
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();prev();}
  });
  // 白天 / 夜间
  var root=document.documentElement, ti=document.getElementById('ti');
  var sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  var moon='<path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/>';
  function setTheme(t){root.setAttribute('data-theme',t); if(ti) ti.innerHTML=(t==='dark'?sun:moon); try{localStorage.setItem('hs-theme',t);}catch(e){}}
  var tb=document.getElementById('theme');
  if(tb) tb.onclick=function(){setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');};
  try{var saved=localStorage.getItem('hs-theme'); if(saved) setTheme(saved); else if(ti) ti.innerHTML=moon;}catch(e){ if(ti) ti.innerHTML=moon; }
  show(0);
})();
