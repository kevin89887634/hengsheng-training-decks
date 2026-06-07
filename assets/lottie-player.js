/* 共享 Lottie 接入。
   用法：<div class="hs-lottie" data-lottie="../../assets/lottie/xxx.json"
                  data-loop="true" data-speed="1"></div>
   - 默认 loop=false（演讲场景一次播完，停在末帧）；data-loop="true" 持续循环
   - 翻页时 deck.js 会调用 HSLottie.refresh(slide)，让新页里的所有 .hs-lottie 从头播 */
(function(){
  // lottie-web 的全局名取决于 bundle:完整版是 window.lottie,
  // lottie_light 老版本是 window.bodymovin。两个都兼容。
  var L = window.lottie || window.bodymovin;
  if (!L) { window.HSLottie = { refresh: function(){}, mount: function(){} }; return; }
  var instances = new WeakMap();

  function mount(el){
    if (instances.has(el)) return instances.get(el);
    var src = el.getAttribute('data-lottie');
    if (!src) return null;
    var loop = el.getAttribute('data-loop') === 'true';
    var speed = parseFloat(el.getAttribute('data-speed') || '1') || 1;
    var anim = L.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: loop,
      autoplay: true,
      path: src
    });
    anim.setSpeed(speed);
    instances.set(el, anim);
    return anim;
  }

  function refresh(scope){
    var root = scope || document;
    var nodes = root.querySelectorAll ? root.querySelectorAll('.hs-lottie') : [];
    nodes.forEach(function(el){
      var a = instances.get(el) || mount(el);
      if (!a) return;
      try { a.goToAndPlay(0, true); } catch(e){}
    });
  }

  function init(){ document.querySelectorAll('.hs-lottie').forEach(mount); }

  window.HSLottie = { refresh: refresh, mount: mount, init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
