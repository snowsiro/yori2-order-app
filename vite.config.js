import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 또는 @vitejs/plugin-react-swc

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/yori2-order-app/', // ⚠️ 깃허브 저장소 이름을 정확히 적어줍니다.
})