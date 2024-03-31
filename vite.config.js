import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
    const env = loadEnv(mode, process.cwd(), '')
    
    return {
        plugins: [react()],
        define: {
            SERVER_WS_ENDPOINT: JSON.stringify(env.SERVER_WS_ENDPOINT),
            API_ENDPOINT: JSON.stringify(env.API_ENDPOINT),
        },
    }
})
