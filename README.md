# 项建卓 · 作品集

数字媒体艺术设计 / 传统文化数字化 —— 作品集网页。原生 HTML / CSS / JS，无框架、无构建步骤。

- 首页 `index.html`
- 项目详情页：`hantang.html`（云鬓花颜）、`leyou.html`（乐游）、`shanhaiji.html`（山海纪）、`tujunjun.html`（兔军军）
- `assets/` 站点资源（`css/` `js/` `video/` 与图片）
- `resume/` 简历 PDF（首页「下载简历」按钮指向这里）
- `print/` 打印版页面（实验性，未从导航链接）

## 本地预览

直接双击 `index.html` 即可（纯静态，`file://` 下功能完整）。

## 更新流程

改动后推送到 `main` 分支，GitHub Pages 自动重新发布（约 1 分钟生效）：

```bash
git add -A
git commit -m "更新说明"
git push
```

## 注意

- 新增图片请先压缩（单张建议 ≤ 300KB）；**视频是大头**，`assets/video/` 已占 25MB，再加视频会拖慢国内访问。
- 长图别用默认画廊样式（会被裁），用 `.gallery-single` 或 `.gallery-board`。
