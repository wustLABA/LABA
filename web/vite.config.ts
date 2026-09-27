import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 站点通过自定义域名 https://baidu.wust.club/ 提供服务，资源位于站点根，
  // 所以 base 固定为 '/'。
  //
  // 历史说明：此前为 GitHub Pages 项目页（wustlaba.github.io/LABA/）设为
  // '/LABA/'。绑定自定义域名后，站点根变成 '/'，若仍保留 '/LABA/' 前缀，
  // index.html 会引用 /LABA/assets/*.js，而文件实际在 /assets/ 下 →
  // 全部 404 → 页面白屏。改用相对路径 './' 也能解决资源加载，但会让
  // import.meta.env.BASE_URL 变成 './'，破坏 vue-router 的 history base，
  // 因此直接用固定的 '/'。
  base: '/',
})
