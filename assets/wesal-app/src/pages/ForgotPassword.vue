<template>
  <div class="wesal-cinematic-wrapper light-theme" @mousemove="handleMouseMove">
    <div class="particles-container">
      <div v-for="n in 15" :key="n" class="particle"></div>
    </div>

    <transition name="toast">
      <div v-if="statusMessage" :class="['error-toast', { 'success-toast': !isError }]">
        <div class="toast-text">{{ statusMessage }}</div>
      </div>
    </transition>

    <div class="nebula-aurora"></div>

    <header class="nexus-header" :class="{ 'header-active': isScrolled }">
      <div class="header-inner">
        <div class="h-left">
          <img src="../assets/logo.png" alt="Wesal Mini Logo" class="header-mini-logo" />
          <div class="system-pulse"></div>
          <span class="status-label">WESAL - Help Desk management system </span>
        </div>
      </div>
    </header>

    <main class="master-stage">
      <div class="central-brand">
        <img src="../assets/logo.png" alt="Wesal Logo" class="master-logo" />
        <h2 class="brand-sub-title">Help Desk management system</h2>
      </div>

      <div class="perspective-box" :style="cardTransform">
        <div class="panoramic-card">
          <div class="card-inner-glow"></div>
          
          <div class="card-content">
            <h3 class="form-title-simple">FORGOT PASSWORD?</h3>
            <p class="form-instruction">Please follow the steps to recover your account.</p>

            <form v-if="step === 1" @submit.prevent="verifyId" class="panoramic-form" novalidate>
              <div class="form-row">
                <div class="input-nexus">
                  <label>ID NUMBER</label>
                  <div class="input-wrapper">
                    <input v-model="recoveryId" type="text" maxlength="10" placeholder="Enter your ID" @input="isError = false" />
                    <div class="glowing-bar"></div>
                  </div>
                </div>
              </div>

              <div class="action-nexus">
                <button type="submit" class="prime-action-btn" :disabled="loading">
                  <span v-if="!loading">CONTINUE</span>
                  <div v-else class="simple-loader"></div>
                </button>
              </div>
            </form>

            <form v-else @submit.prevent="handleReset" class="panoramic-form" novalidate>
              <div class="security-hint-box">
                <span class="hint-label">Associated Email:</span>
                <span class="masked-text">{{ maskedEmail }}</span>
              </div>
              
              <div class="form-row">
                <div class="input-nexus">
                  <label>FULL EMAIL ADDRESS</label>
                  <div class="input-wrapper">
                    <input v-model="inputEmail" type="email" placeholder="example@domain.com" />
                    <div class="glowing-bar"></div>
                  </div>
                </div>
              </div>

              <div class="action-nexus">
                <button type="submit" class="prime-action-btn" :disabled="loading">
                  <span v-if="!loading">SEND RESET LINK</span>
                  <div v-else class="simple-loader"></div>
                </button>
              </div>
              <p class="back-step-link" @click="step = 1">Back to ID entry</p>
            </form>

            <div class="card-extra-links">
              <router-link to="/" class="nexus-link accent">Return to Login</router-link>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="wesal-footer">
      <div class="footer-inner">
        <div class="f-section">
           <span class="f-label">CONTACT US</span>
           <div class="f-row">
             <span>help@wesal.com</span>
             <span class="f-sep">|</span>
             <span>WESAL</span>
           </div>
        </div>
        <p class="copyright-text">© 2025 WESAL SMART SUPPORT.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabase'

const step = ref(1)
const recoveryId = ref('')
const inputEmail = ref('')
const fullEmailFromServer = ref('')
const loading = ref(false)
const statusMessage = ref('')
const isError = ref(false)
const isScrolled = ref(false)

const maskedEmail = computed(() => {
  if (!fullEmailFromServer.value) return ''
  const [name, domain] = fullEmailFromServer.value.split('@')
  const visiblePart = name.length > 2 ? name.substring(0, 2) : name[0]
  return `${visiblePart}****@${domain}`
})

const verifyId = async () => {
  if (!recoveryId.value) return triggerMsg("Please enter ID", true)
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('users') 
      .select('email')
      .eq('user_id', recoveryId.value.trim())
      .single()

    if (error || !data) throw new Error("ID not found in our records.")
    
    fullEmailFromServer.value = data.email
    step.value = 2
    isError.value = false
  } catch (err) {
    triggerMsg(err.message, true)
  } finally {
    loading.value = false
  }
}

const handleReset = async () => {
  if (!inputEmail.value) return triggerMsg("Please enter email", true)
  if (inputEmail.value.trim().toLowerCase() !== fullEmailFromServer.value.toLowerCase()) {
    return triggerMsg("Email does not match our records.", true)
  }
  loading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(inputEmail.value.trim(), {
      redirectTo: window.location.origin + '/update-password',
    })
    if (error) throw error
    triggerMsg("Reset link sent successfully!", false)
  } catch (err) {
    triggerMsg(err.message, true)
  } finally {
    loading.value = false
  }
}

const triggerMsg = (msg, errorStatus) => {
  statusMessage.value = msg
  isError.value = errorStatus
  setTimeout(() => { statusMessage.value = '' }, 4000)
}

const mousePos = reactive({ x: 0, y: 0, lerpX: 0, lerpY: 0 })
const handleMouseMove = (e) => {
  mousePos.x = (e.clientX / window.innerWidth - 0.5) * 8
  mousePos.y = (e.clientY / window.innerHeight - 0.5) * -8
}
const updateLerp = () => {
  mousePos.lerpX += (mousePos.x - mousePos.lerpX) * 0.1
  mousePos.lerpY += (mousePos.y - mousePos.lerpY) * 0.1
  requestAnimationFrame(updateLerp)
}
const cardTransform = computed(() => {
  return { transform: `perspective(1200px) rotateX(${mousePos.lerpY}deg) rotateY(${mousePos.lerpX}deg)` }
})
const handleScroll = () => { isScrolled.value = window.scrollY > 40 }

onMounted(() => {
  updateLerp()
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Space+Grotesk:wght@500;700&display=swap');

/* الأساسيات */
.wesal-cinematic-wrapper { min-height: 100vh; background: #fcfdfe; color: #1e293b; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; flex-direction: column; }
.nebula-aurora { position: fixed; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(52, 152, 219, 0.03) 0%, transparent 50%); z-index: 0; }

/* الهيدر - مطابقة للوج إن 100% */
.nexus-header { position: fixed; top: 0; width: 100%; height: 80px; z-index: 1000; padding: 0 50px; display: flex; align-items: center; transition: 0.3s; }
.header-active { background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid #f1f5f9; }
.header-inner { width: 100%; max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.h-left { display: flex; align-items: center; }
.header-mini-logo { height: 30px; margin-right: 12px; }
.system-pulse { width: 6px; height: 6px; background: #3498db; border-radius: 50%; }
.status-label { font-size: 10px; font-weight: 800; color: #cbd5e1; margin-left: 8px; }

/* المسرح الرئيسي */
.master-stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; position: relative; z-index: 10; }
.central-brand { margin-bottom: 40px; text-align: center; }
.master-logo { width: 320px; filter: drop-shadow(0 10px 30px rgba(0,0,0,0.05)); }
.brand-sub-title { margin-top: 15px; font-size: 14px; font-weight: 600; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; }

/* الكارد والخطوط داخل الإدخال - مطابقة تامة */
.perspective-box { width: 100%; max-width: 950px; }
.panoramic-card { background: white; border-radius: 40px; padding: 60px 80px; box-shadow: 0 40px 120px rgba(30, 41, 59, 0.06); border: 1px solid #f8fafc; }

.form-title-simple { font-size: 26px; font-weight: 800; color: #1e293b; text-align: center; margin-bottom: 8px; letter-spacing: -0.5px; }
.form-instruction { font-size: 13px; color: #94a3b8; text-align: center; margin-bottom: 40px; font-weight: 500; }

.form-row { margin-bottom: 35px; }
.input-nexus { text-align: left; }
.input-nexus label { display: block; font-size: 10px; font-weight: 900; color: #94a3b8; margin-bottom: 8px; letter-spacing: 1px; }

.input-wrapper { position: relative; }
.input-wrapper input { 
  width: 100%; 
  background: transparent; 
  border: none; 
  border-bottom: 2px solid #f1f5f9; 
  padding: 12px 0; 
  color: #1e293b; 
  font-size: 18px; 
  font-weight: 600; 
  outline: none; 
  transition: 0.3s; 
  font-family: 'Plus Jakarta Sans', sans-serif; /* الخط المطلوب */
}
.input-wrapper input::placeholder { 
  color: #cbd5e1; 
  font-weight: 400; 
  font-size: 15px; 
}
.glowing-bar { position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: #3498db; transition: 0.5s ease; }
.input-wrapper input:focus ~ .glowing-bar { width: 100%; }

/* الأزرار والروابط */
.prime-action-btn { width: 100%; max-width: 300px; margin: 0 auto; display: block; padding: 20px; background: #1e293b; color: white; border: none; border-radius: 16px; font-weight: 800; font-size: 13px; cursor: pointer; transition: 0.3s; }
.prime-action-btn:hover { background: #3498db; transform: translateY(-2px); }

.nexus-link { text-decoration: none; font-size: 13px; font-weight: 700; color: #3498db; }
.back-step-link { text-align: center; font-size: 11px; color: #94a3b8; cursor: pointer; margin-top: 20px; font-weight: 700; text-decoration: underline; }

/* الفوتر */
.wesal-footer { padding: 40px 60px; background: #fff; border-top: 1px solid #f8fafc; }
.footer-inner { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.f-label { font-size: 10px; font-weight: 900; color: #3498db; display: block; margin-bottom: 5px; }
.f-row { display: flex; gap: 15px; font-size: 12px; font-weight: 700; color: #64748b; }
.copyright-text { font-size: 11px; color: #cbd5e1; font-weight: 600; }

/* التنبيهات واللودر */
.error-toast { position: fixed; top: 100px; right: 40px; z-index: 2000; background: white; padding: 15px 25px; border-radius: 15px; box-shadow: 0 15px 40px rgba(231, 76, 60, 0.15); border-left: 5px solid #e74c3c; display: flex; align-items: center; gap: 12px; }
.success-toast { border-left-color: #10b981; box-shadow: 0 15px 40px rgba(16, 185, 129, 0.15); }
.toast-text { font-size: 13px; font-weight: 700; color: #1e293b; }
.simple-loader { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }

@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 800px) { .panoramic-card { padding: 40px; } }
/* امسح الكود القديم اللي يبدأ بـ media@ وضع هذا مكانه لضمان أفضل نتيجة */

@media (max-width: 800px) {
  /* 1. الهيدر: نصغر الارتفاع ونخفي النص الطويل عشان ما يزحم اللوجو */
  .nexus-header { padding: 0 20px; height: 65px; }
  .status-label { display: none; } 
  
  /* 2. المسرح: نصغر المسافات عشان البوكس ما يختفي تحت */
  .master-stage { padding: 30px 15px; }
  .master-logo { width: 220px; } 
  .brand-sub-title { font-size: 11px; }

  /* 3. الكارد (البوكس الأبيض): نخليه مريح للعين على شاشة الجوال */
  .form-row { flex-direction: column; gap: 20px; margin-bottom: 25px; }
  .panoramic-card { 
    padding: 35px 20px; 
    border-radius: 30px; 
  }
  
  /* 4. أزرار الاختيار (Customer/Employee): نخليهم يتمددون بعرض الشاشة */
  .auth-mode-selector { width: 100%; display: flex; }
  .auth-mode-selector button { padding: 12px 10px; font-size: 10px; flex: 1; }

  /* 5. الفوتر: نرتب العناصر فوق بعض بالوسط */
  .wesal-footer { padding: 30px 20px; }
  .footer-inner { flex-direction: column; gap: 15px; text-align: center; }
  .f-row { justify-content: center; }

  /* 6. التنبيهات: نخليها في نص الشاشة من فوق */
  .toast { right: 20px; left: 20px; text-align: center; top: 80px; }
}

/* للجوالات الصغيرة جداً (مثل آيفون ميني) */
@media (max-width: 480px) {
  .master-logo { width: 180px; }
  .input-wrapper input { font-size: 16px; }
  .prime-action-btn { padding: 16px; font-size: 12px; }
}
</style>