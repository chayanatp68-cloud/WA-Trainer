import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' // ตัวช่วยจำข้อมูล
import App from './App.vue'
import router from './router/'
import './style.css'
const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate) // สั่งให้ Pinia ใช้ระบบจำข้อมูลลงเครื่อง

app.use(pinia)
app.use(router)
app.mount('#app')