# 恒晟集团 · 培训演示集 (Training Decks)

一个静态网页集：**首页一张张卡片，点进去每个 PPT 是一个独立全屏页面**。
一套配色（学院 academy，浅 / 深），共用样式，新课程随时加。

在线效果（部署后）：`https://<你的用户名>.github.io/hengsheng-training-decks/`

## 目录结构

```
hengsheng-training-decks/
├─ index.html                      首页（课程卡片入口）
├─ assets/
│  ├─ tokens.css                   配色令牌（academy 浅/深 + 投资 scheme-blue/gold）
│  ├─ deck.css                     演示页样式（所有 deck 复用）
│  ├─ deck.js                      翻页 / 键盘 / 进度 / 白天夜间（所有 deck 复用）
│  └─ hub.css                      首页样式
├─ decks/
│  └─ ai-love-protection/index.html   《爱与守护》（第一个课程）
├─ .github/workflows/pages.yml     推送 main 自动部署到 GitHub Pages
├─ README.md / LICENSE / .gitignore
```

## 怎么加一个新课程（3 步）

1. 复制 `decks/ai-love-protection/` 到 `decks/你的课程名/`，改里面的 `<section class="slide">` 内容。
   （结构、配色、翻页都现成，只改文字。每个 `.slide` = 一页。）
2. 打开 `index.html`，在 `DECKS` 数组里加一项：
   ```js
   { title:"课程名", desc:"一句话简介", tag:"标签", mark:"封面字",
     accent:"#2C8A60", href:"decks/你的课程名/index.html" }
   ```
3. `git add . && git commit -m "feat: 新增课程 XXX" && git push` —— Pages 自动更新。

## 本地预览（不用部署）

直接双击 `index.html` 用浏览器打开即可。点卡片进入课程，**方向键 ← → / 空格**翻页，
右下角按钮切**白天 / 夜间**，按 **F11** 全屏放映。

## 部署到 GitHub Pages（免费托管）

1. 在 GitHub 新建空仓库 `hengsheng-training-decks`，把本项目推上去（见下）。
2. 仓库 **Settings → Pages → Build and deployment → Source 选「GitHub Actions」**。
3. 之后每次 `push` 到 `main`，`.github/workflows/pages.yml` 会自动部署。

```bash
git init
git add .
git commit -m "feat: training deck hub (一PPT一页面) + 《爱与守护》"
git branch -M main
git remote add origin https://github.com/kevin89887634/hengsheng-training-decks.git
git push -u origin main
```

## 想挂到自己的子域名（可选）

如果想用 `train.hsprosper.com` 之类：
- **GitHub Pages 方案**：仓库根加一个 `CNAME` 文件写上域名，再到 DNS 加一条 CNAME 指向 `<用户名>.github.io`。
- **你现有的 DO + nginx 方案**：这是纯静态站，把整个文件夹放到服务器，nginx 加一个 server block 指过去、certbot 申证书即可（仍走 commit→push→Actions，别手动 SSH 改）。

## 配色说明

- 默认 = 学院配色（`tokens.css` 的 `:root` 浅色 + `html[data-theme="dark"]` 夜间）。
- 想做**投资 deck** 页：给那一页 `<body class="scheme-blue">`（电光蓝）或 `class="scheme-gold"`（鎏金）即可，其余通用。
- 改色只改 `tokens.css` 一处，全站生效。

## 语义色纪律（培训页务必固定）

金 = 要点 / 话术｜绿 = 该练 / 答对｜红 = 避开 / 答错｜蓝 = 解析 / 提示。
学员扫一眼颜色就知道该「记」还是该「练」。

## Lottie 接入（已预埋管道）

每门课都能直接用 Lottie 动画。播放器自托管在 `assets/vendor/lottie_light.min.js`，不依赖 CDN。

**3 步接一个动画：**

1. 把 LottieFiles 下载的 JSON 扔进 `assets/lottie/your-file.json`
2. 在目标 slide 里加一个容器：
   ```html
   <div class="hs-lottie"
        data-lottie="../../assets/lottie/your-file.json"
        data-loop="true"></div>
   ```
3. deck 末尾按这个顺序引入脚本（《爱与守护》模板已含 deck.js，再补两行）：
   ```html
   <script src="../../assets/vendor/lottie_light.min.js"></script>
   <script src="../../assets/lottie-player.js"></script>
   <script src="../../assets/deck.js"></script>
   ```

**参数：**
- `data-loop` —— `"true"` 持续循环 / 不写或 `"false"` 一次播完停末帧（演讲场景默认）
- `data-speed` —— 倍速，默认 `"1"`

**翻页自动重播：** 翻到新页时，`deck.js` 会调用 `HSLottie.refresh(currentSlide)`，让那一页里所有 `.hs-lottie` 从第 0 帧重新播一次（对齐 `.rv` 的规矩）。

**自测页：** `decks/_lottie-demo/` —— 直接访问 `https://你的域名/hengsheng-training-decks/decks/_lottie-demo/` 验证管道。这页不在首页 hub 列出，是给你 / 我自测的。
