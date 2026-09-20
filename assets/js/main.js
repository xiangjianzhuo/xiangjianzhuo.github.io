/* ============================================================
   项建卓 · 作品集 — 共享 JS
   无框架，原生实现。兼容 file:// 本地打开。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 移动端导航 ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.textContent = open ? "关闭 ✕" : "菜单 ☰";
    });
    nav.addEventListener("click", function (e) {
      if (window.innerWidth <= 768 && e.target.tagName === "A") {
        nav.classList.remove("open");
        menuBtn.textContent = "菜单 ☰";
      }
    });
    /* 点击其他区域关闭菜单 */
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && e.target !== menuBtn) {
        nav.classList.remove("open");
        menuBtn.textContent = "菜单 ☰";
      }
    });
  }

  /* ---------- 回顶部（兼容低版本浏览器） ---------- */
  var backTop = document.querySelector(".back-top");
  if (backTop) {
    var getY = function () {
      // window.pageYOffset 老规范；scrollTop 双保险
      var root = document.documentElement || document.body;
      return window.pageYOffset !== undefined ? window.pageYOffset :
             (root.scrollTop !== undefined ? root.scrollTop : 0);
    };
    var onScroll = function () {
      if (getY() > 640) { backTop.classList.add("show"); }
      else { backTop.classList.remove("show"); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    backTop.addEventListener("click", function () {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        (document.documentElement || document.body).scrollTop = 0;
      }
    });
  }

  /* ---------- 首页纸色导航：滚过封面后淡入站点 logo ---------- */
  var paperHeader = document.querySelector(".site-header.on-paper");
  if (paperHeader) {
    var headScroll = function () {
      var root = document.documentElement || document.body;
      var y = window.pageYOffset !== undefined ? window.pageYOffset : (root.scrollTop || 0);
      if (y > 120) { paperHeader.classList.add("scrolled"); }
      else { paperHeader.classList.remove("scrolled"); }
    };
    window.addEventListener("scroll", headScroll, { passive: true });
    headScroll();
  }

  /* ---------- 滚动渐显 ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("revealed"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("revealed"); });
  }

  /* ---------- 视频演示：MP4 存在则自动播放，否则显示 B 站备用卡 ----------
     依赖 <video> 的 error 事件，file:// 与 http:// 下都可靠。 */
  var vmap = document.querySelector("[data-vmap]");
  if (vmap) {
    var vids = vmap.querySelectorAll("video");
    var fb = vmap.querySelector("[data-vfallback]");
    var anyOk = false;
    (fb ? [].slice.call(vids) : []).forEach(function (v) {
      v.addEventListener("error", function () {
        if (anyOk) { return; }
        var i = vids.indexOf(v);
        if (i + 1 < (vids.length - 0)) { return; } /* 还有后续源可试 */
        anyOk = true;
        v.style.display = "none";
        v.poster = ""; /* eslint-disable-line */
        fb.style.display = "";
      });
      v.addEventListener("loadeddata", function () {
        anyOk = true;
        if (fb) { fb.style.display = "none"; }
      });
    });
    /* 启动播放 */
    vids.forEach(function (v) {
      try {
        if (v.getAttribute("autoplay") !== null) { v.play(); }
      } catch (err) { /* 静音自动播放受限时忽略 */ }
    });
  }

  /* ---------- 山海纪：点卡面 / 章节按钮 → 卡面动效跳到该卡片段 ----------
     时间点来自对「加字粒子.mp4」字幕区做帧差得到的切点（与站上压缩版时间轴一致）；
     顺序说明：视频以主角巫咸开场，其后依次为卡面 01→15。 */
  var cardsVideo = document.getElementById("cardsVideo");
  if (cardsVideo) {
    var cwBtns = [].slice.call(document.querySelectorAll(".cardwall .cw-btn"));
    var chBtns = [].slice.call(document.querySelectorAll(".chapter-bar .ch"));
    var segs = chBtns.map(function (b) {
      return { t: parseFloat(b.getAttribute("data-t")) || 0, name: b.getAttribute("data-name") };
    }).sort(function (a, b) { return a.t - b.t; });
    var curName = null;
    var pendingT = null;

    var markActive = function (name) {
      if (name === curName) { return; }
      curName = name;
      chBtns.forEach(function (b) {
        b.classList.toggle("on", b.getAttribute("data-name") === name);
      });
      cwBtns.forEach(function (b) {
        var fig = b.parentNode;
        if (fig && fig.tagName === "FIGURE") {
          fig.classList.toggle("playing", b.getAttribute("data-name") === name);
        }
      });
    };

    var applySeek = function (t) {
      if (isNaN(t)) { return; }
      if (cardsVideo.readyState >= 1) {
        try { cardsVideo.currentTime = t; } catch (err) { /* 极少数内核下早于 metadata 时会抛错，忽略 */ }
      } else {
        pendingT = t;   /* metadata 还没到，先记下来 */
      }
    };
    cardsVideo.addEventListener("loadedmetadata", function () {
      if (pendingT !== null) { applySeek(pendingT); pendingT = null; }
    });

    var jumpTo = function (t, name) {
      var root = document.documentElement || document.body;
      var y = window.pageYOffset !== undefined ? window.pageYOffset : (root.scrollTop || 0);
      var top = cardsVideo.getBoundingClientRect().top + y - 80;
      try { window.scrollTo({ top: top, behavior: "smooth" }); }
      catch (err) { root.scrollTop = top; }
      applySeek(t);
      try {
        var p = cardsVideo.play();
        if (p && p.catch) { p.catch(function () { /* 浏览器拦截自动播放时忽略 */ }); }
      } catch (err2) { /* 同上 */ }
      markActive(name);
    };

    var bind = function (list) {
      list.forEach(function (b) {
        b.addEventListener("click", function () {
          jumpTo(parseFloat(b.getAttribute("data-t")), b.getAttribute("data-name"));
        });
      });
    };
    bind(cwBtns);
    bind(chBtns);

    /* 播放过程中同步高亮当前章节（拖进度条也能跟上） */
    cardsVideo.addEventListener("timeupdate", function () {
      var t = cardsVideo.currentTime, hit = segs[0];
      for (var i = 0; i < segs.length; i++) {
        if (t >= segs[i].t - 0.05) { hit = segs[i]; } else { break; }
      }
      if (hit) { markActive(hit.name); }
    });
  }

  /* ---------- 山海纪：卡面属性（五行 / 出现地）----------
     数据逐段读自卡面动效内信息面板（F:\...\加字粒子.mp4，4K 源）；
     出现地为空字符串 = 该卡面板上此栏留白。 */
  var cardMeta = {
    "巫咸":       { wx: "木", place: "" },
    "人面鸮":     { wx: "火", place: "" },
    "昌意":       { wx: "木", place: "朝云国" },
    "鸾鸟":       { wx: "木", place: "朝云国 · 不死山 · 黑水山 · 先民国 · 摇山" },
    "女祭·女戚":  { wx: "水", place: "寒荒国" },
    "青鴍":       { wx: "水", place: "寒荒国 · 玄丹山" },
    "狌狌":       { wx: "木", place: "大巫山 · 少和渊" },
    "鳋鱼":       { wx: "金", place: "寒荒国 · 鸟鼠同穴山" },
    "比翼鸟":     { wx: "水", place: "少和渊 · 大巫山 · 朱卷国" },
    "双双":       { wx: "金", place: "流黄酆氏国 · 都广野" },
    "巴蛇":       { wx: "水", place: "巴国" },
    "延维":       { wx: "木", place: "黑水山" },
    "鱄鱼":       { wx: "火", place: "巴国 · 鸡山" },
    "颙鸟":       { wx: "火", place: "巴国 · 令丘山" },
    "二八":       { wx: "土", place: "羽民国" },
    "毕方鸟":     { wx: "火", place: "" }
  };
  var WX_CLASS = { "木": "wx-mu", "火": "wx-huo", "土": "wx-tu", "金": "wx-jin", "水": "wx-shui" };
  if (document.querySelector(".cardwall")) {
    var metaTip = function (m) {
      return "五行 " + m.wx + (m.place ? " ／ 出现地 " + m.place : "");
    };
    var metaHTML = function (m) {
      return '<span class="cw-meta"><i class="wx ' + (WX_CLASS[m.wx] || "") + '" aria-hidden="true"></i>'
           + m.wx + (m.place ? " · " + m.place : "") + "</span>";
    };
    document.querySelectorAll(".cardwall .cw-btn").forEach(function (b) {
      var m = cardMeta[b.getAttribute("data-name")];
      if (!m) { return; }
      var fig = b.parentNode;
      var cap = fig && fig.querySelector("figcaption");
      if (cap && !cap.querySelector(".cw-meta")) { cap.insertAdjacentHTML("beforeend", metaHTML(m)); }
      b.title = metaTip(m);
    });
    document.querySelectorAll(".chapter-bar .ch").forEach(function (b) {
      var m = cardMeta[b.getAttribute("data-name")];
      if (!m) { return; }
      if (!b.querySelector(".wx")) {
        var dot = document.createElement("i");
        dot.className = "wx " + (WX_CLASS[m.wx] || "");
        dot.setAttribute("aria-hidden", "true");
        b.insertBefore(dot, b.firstChild);
      }
      b.title = metaTip(m);
    });
  }

  /* ---------- 详情页：当前导航高亮 ---------- */
  var slug = document.body.getAttribute("data-page");
  if (slug && nav) {
    nav.querySelectorAll("a").forEach(function (a) {
      if (a.getAttribute("data-slug") === slug) { a.classList.add("current"); }
    });
  }
})();