// Yori2 PWA service worker — 업데이트 알림 전용.
// 네트워크 요청은 가로채지 않습니다 (항상 최신 데이터/번들 사용).
const VERSION = "v3";

self.addEventListener("activate", event => {
  // 예전 버전이 남긴 캐시가 있으면 모두 정리
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// 설치 가능성(installability) 충족용 빈 fetch 핸들러 — respondWith 호출 안 함 →
// 브라우저가 기본 네트워크 요청을 그대로 처리 (가로채기/캐싱 없음).
self.addEventListener("fetch", () => {});
