/* 恒晟培训 AI 教练浮动按钮
   ─────────────────────────────────────────
   - 注入到任何 deck 页(在 </body> 前加 <script src="../../assets/coach.js">)
   - 自动建浮动按钮(右下角)+ 对话窗口
   - 自动读取当前 slide 标题/正文作 context
   - 调 http://127.0.0.1:8643/training-api/chat
   - 失败时给出本地 fallback 提示
   - 主题跟 deck(.logo 金色)统一
   */
(function () {
  var API = (window.HS_COACH_API || "http://127.0.0.1:8643/training-api/chat");
  var DECK_TITLE = (document.title || "恒晟培训").replace(/\s*[-|·—]\s*恒晟(集团|培训).*$/, "").trim();

  // 找当前 active slide
  function readActiveSlide() {
    var el = document.querySelector(".slide.active") || document.querySelector(".slide");
    if (!el) return { title: "", body: "" };
    var h = el.querySelector("h1, h2");
    var ps = el.querySelectorAll("p, .body, .lead, .callout, .tipbox");
    var body = "";
    for (var i = 0; i < ps.length && i < 3; i++) body += ps[i].innerText + " ";
    return { title: h ? h.innerText : "", body: body.slice(0, 200) };
  }

  // 浮动按钮
  var btn = document.createElement("button");
  btn.id = "hs-coach-btn";
  btn.title = "问 AI 教练";
  btn.innerHTML = "?" +
    "<style>" +
    "#hs-coach-btn{position:fixed;right:20px;bottom:84px;width:48px;height:48px;border-radius:50%;" +
    "background:var(--key,#A87E2E);color:#fff;border:none;font-size:24px;font-weight:700;cursor:pointer;" +
    "box-shadow:0 6px 20px rgba(168,126,46,.45);z-index:9999;transition:transform .2s;line-height:1;}" +
    "#hs-coach-btn:hover{transform:translateY(-2px) scale(1.06)}" +
    "#hs-coach-panel{position:fixed;right:20px;bottom:140px;width:340px;max-height:62vh;" +
    "background:var(--surface,#FFFFFF);border:1px solid var(--border,#E5E0D5);border-radius:18px;" +
    "box-shadow:0 16px 48px rgba(0,0,0,.18);z-index:9999;display:none;flex-direction:column;overflow:hidden;" +
    "font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','SF Pro Text',sans-serif}" +
    "#hs-coach-head{padding:14px 18px;background:var(--key-bg,#FBF4E6);" +
    "border-bottom:1px solid var(--key-bd,#EAD9B0);color:var(--ink,#1A2742);" +
    "font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:space-between}" +
    "#hs-coach-head .lbl{display:flex;align-items:center;gap:8px}" +
    "#hs-coach-head .lbl::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--ok,#2C8A60)}" +
    "#hs-coach-head .x{cursor:pointer;color:var(--ink-2,#5E6A82);font-size:20px;line-height:1}" +
    "#hs-coach-msgs{flex:1;overflow-y:auto;padding:14px 18px;display:flex;flex-direction:column;gap:10px;" +
    "scrollbar-width:thin;min-height:120px}" +
    ".hs-msg{max-width:88%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.55;" +
    "white-space:pre-wrap;word-break:break-word}" +
    ".hs-msg.u{align-self:flex-end;background:var(--accent,#2A4A8C);color:#fff;border-bottom-right-radius:4px}" +
    ".hs-msg.a{align-self:flex-start;background:#F6F4EE;color:var(--ink,#1A2742);border-bottom-left-radius:4px}" +
    ".hs-msg.err{background:#F8EAE5;color:#B14E39}" +
    "#hs-coach-input{padding:10px;border-top:1px solid var(--border,#E5E0D5);display:flex;gap:8px}" +
    "#hs-coach-input textarea{flex:1;resize:none;border:1px solid var(--border,#E5E0D5);border-radius:10px;" +
    "padding:8px 10px;font-size:13px;font-family:inherit;min-height:36px;max-height:100px;outline:none}" +
    "#hs-coach-input textarea:focus{border-color:var(--key,#A87E2E)}" +
    "#hs-coach-input button{padding:0 14px;background:var(--key,#A87E2E);color:#fff;border:none;" +
    "border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}" +
    "#hs-coach-input button:disabled{opacity:.5;cursor:not-allowed}" +
    "#hs-coach-context{padding:6px 18px;font-size:11px;color:var(--ink-2,#5E6A82);" +
    "background:rgba(168,126,46,.04);border-top:1px solid var(--border,#E5E0D5);" +
    "white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    "</style>";
  btn.onclick = togglePanel;

  // 面板
  var panel = document.createElement("div");
  panel.id = "hs-coach-panel";
  panel.innerHTML =
    '<div id="hs-coach-head"><span class="lbl">恒晟 AI 教练</span><span class="x" id="hs-coach-x">×</span></div>' +
    '<div id="hs-coach-msgs"></div>' +
    '<div id="hs-coach-context"></div>' +
    '<div id="hs-coach-input"><textarea id="hs-coach-q" placeholder="问点啥…(Enter 发送,Shift+Enter 换行)" rows="1"></textarea>' +
    '<button id="hs-coach-send">发送</button></div>';

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  var msgs = panel.querySelector("#hs-coach-msgs");
  var ctx = panel.querySelector("#hs-coach-context");
  var qEl = panel.querySelector("#hs-coach-q");
  var sendBtn = panel.querySelector("#hs-coach-send");
  panel.querySelector("#hs-coach-x").onclick = togglePanel;

  // 欢迎
  function welcome() {
    addMsg("a", "👋 我是恒晟 AI 教练。\n有问题直接问,比如:\n• 这页的关键点是什么?\n• 客户问「保费太贵」怎么答?\n• 怎么把这套方法用到我今天的客户身上?");
  }
  welcome();

  function togglePanel() {
    var show = panel.style.display !== "flex";
    panel.style.display = show ? "flex" : "none";
    if (show) {
      var sc = readActiveSlide();
      ctx.textContent = "📍 当前 slide: " + (sc.title || "(无标题)");
      qEl.focus();
    }
  }

  function addMsg(role, text) {
    var div = document.createElement("div");
    div.className = "hs-msg " + role;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function ask() {
    var q = qEl.value.trim();
    if (!q) return;
    var sc = readActiveSlide();
    ctx.textContent = "📍 当前 slide: " + (sc.title || "(无标题)");

    addMsg("u", q);
    qEl.value = "";
    sendBtn.disabled = true;

    var loading = addMsg("a", "思考中…");

    var body = JSON.stringify({
      question: q,
      deck_title: DECK_TITLE,
      slide_context: sc,
    });

    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    })
      .then(function (r) { return r.json(); })
      .then(function (resp) {
        msgs.removeChild(loading);
        if (resp.error) {
          addMsg("err", "❌ " + (resp.error + (resp.detail ? " — " + resp.detail.slice(0, 200) : "")));
        } else {
          addMsg("a", resp.answer || "(无回答)");
        }
      })
      .catch(function (e) {
        msgs.removeChild(loading);
        addMsg("err", "❌ 网络错误:" + e.message + "\n\n请确认:\n• /training-api/ 服务在跑?\n•  curl http://127.0.0.1:8643/health");
      })
      .finally(function () { sendBtn.disabled = false; });
  }

  sendBtn.onclick = ask;
  qEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); }
  });

  // 每次翻页时更新 slide context 显示
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(function () {
      if (panel.style.display === "flex") {
        var sc = readActiveSlide();
        ctx.textContent = "📍 当前 slide: " + (sc.title || "(无标题)");
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
  }
})();
