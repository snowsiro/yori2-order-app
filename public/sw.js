// Yori2 PWA service worker — 업데이트 알림 전용.
// 네트워크 요청은 가로채지 않습니다 (항상 최신 데이터/번들 사용).
const VERSION = "v5";

self.addEventListener("activate", event => {
  // 이전 버전이 남긴 캐시 전부 삭제
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
});

// 사용자가 업데이트 버튼을 누르면 이 메시지로 새 SW가 활성화됨
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// fetch는 가로채지 않음 — 브라우저 기본 네트워크 그대로 사용
self.addEventListener("fetch", () => {});
