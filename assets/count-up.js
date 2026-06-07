/* 通用数字 count-up
   用法: <span data-countup="80" data-suffix="%" data-duration="1400">0</span>
   - data-countup:目标数字(必填,可带小数)
   - data-suffix:后缀,如 "%" "倍" "x" "+"(可选,默认无)
   - data-prefix:前缀(可选)
   - data-duration:动画时长 ms(默认 1400)
   触发: 进入视口时跑一次。如果元素被 deck.js show() 重新激活(slide 切换),会重跑。
*/
(function(){
  function ease(t){ return 1 - Math.pow(1-t, 3); }  // easeOutCubic
  function run(el){
    var target = parseFloat(el.getAttribute('data-countup'));
    if (isNaN(target)) return;
    var dur = parseInt(el.getAttribute('data-duration') || '1400', 10);
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var decimals = (el.getAttribute('data-countup').split('.')[1] || '').length;
    var start = performance.now();
    function frame(now){
      var p = Math.min(1, (now - start) / dur);
      var v = target * ease(p);
      el.textContent = pre + (decimals ? v.toFixed(decimals) : Math.round(v)) + suf;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function trigger(scope){
    var nodes = (scope || document).querySelectorAll('[data-countup]');
    nodes.forEach(run);
  }
  // 暴露给 deck.js,在 slide 切换时调用 HSCountUp.refresh(slide)
  window.HSCountUp = { refresh: trigger, run: run };
  // 启动时:如果某 slide 是 active 的,跑一次
  function init(){
    document.querySelectorAll('.slide.active [data-countup]').forEach(run);
    // 一些 deck 在 page load 时第一个 slide 不带 .active(deck.js 会立刻添加),
    // 所以延迟 100ms 再扫一次
    setTimeout(function(){ document.querySelectorAll('.slide.active [data-countup]').forEach(run); }, 100);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
