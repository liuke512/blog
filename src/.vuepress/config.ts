import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/blog/",

  lang: "zh-CN",
  title: "koko博客",
  description: "参考 vuepress-theme-hope 改的的博客",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
