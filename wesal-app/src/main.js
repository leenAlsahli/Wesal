import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // استيراد الراوتر

const app = createApp(App)
app.use(router) // تفعيل الراوتر
app.mount('#app')