/**
 * API 全局网络适配层
 * 
 * 作用：在前后端独立部署时，自动将前端原有的相对路径 `/api/...` 请求统一前缀化
 * 指向独立后端域名（通过 REACT_APP_API_URL 环境变量注入）。
 * 本地开发未配置环境变量时，保持相对路径走 setupProxy.js 代理，开发体验零破坏。
 */

export const API_BASE_URL = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

if (typeof window !== "undefined" && API_BASE_URL) {
  const originalFetch = window.fetch;

  window.fetch = (input, init) => {
    if (typeof input === "string") {
      if (input.startsWith("/api")) {
        input = `${API_BASE_URL}${input}`;
      }
    } else if (input instanceof Request) {
      const url = input.url;
      // 匹配相对路径以 /api 开头或当前 host 开头的 /api 请求
      if (url.startsWith("/api")) {
        input = new Request(`${API_BASE_URL}${url}`, input);
      } else if (typeof window.location !== "undefined") {
        const origin = window.location.origin;
        if (url.startsWith(`${origin}/api`)) {
          const path = url.slice(origin.length);
          input = new Request(`${API_BASE_URL}${path}`, input);
        }
      }
    }

    return originalFetch(input, init);
  };

  console.info(`[OwnMenu Dashboard] API Base URL configured: ${API_BASE_URL}`);
}

export default API_BASE_URL;
