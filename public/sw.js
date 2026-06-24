// Yori2 PWA service worker — 업데이트 알림 전용.
// 네트워크 요청은 가로채지 않습니다 (항상 최신 데이터/번들 사용).
const VERSION = "v4";

self.addEventListener("install", () => {
  // 이전 SW를 즉시 교체 (대기 없이 바로 활성화)
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  // 이전 버전이 남긴 캐시 전부 삭제
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim()) // 열린 탭도 즉시 이 SW가 제어
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// fetch는 가로채지 않음 — 브라우저 기본 네트워크 그대로 사용
self.addEventListener("fetch", () => {});
