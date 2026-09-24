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
            <h3 class="form-title-simple">CREATE ACCOUNT</h3>
            <p class="form-instruction">Set up your account to start raising support tickets.</p>

            <form @submit.prevent="handleRegister" class="panoramic-form" novalidate>
              <div class="form-row two-col">
                <div class="input-nexus">
                  <label>FIRST NAME</label>
                  <div class="input-wrapper">
                    <input v-model="firstName" type="text" placeholder="First name" required />
                    <div class="glowing-bar"></div>
                  </div>
                </div>
                <div class="input-nexus">
                  <label>LAST NAME</label>
                  <div class="input-wrapper">
                    <input v-model="lastName" type="text" placeholder="Last name" required />
                    <div class="glowing-bar"></div>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="input-nexus">
                  <label>USER ID</label>
                  <div class="input-wrapper">
                    <input v-model="userId" type="text" placeholder="Enter your ID number" required />
                    <div class="glowing-bar"></div>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="input-nexus">
                  <label>ACCOUNT TYPE</label>
                  <div class="auth-mode-selector">
                    <button type="button" :class="{ active: customerType === 'Individual' }" @click="customerType = 'Individual'">Individual</button>
                    <button type="button" :class="{ active: customerType === 'Organization' }" @click="customerType = 'Organization'">Organization</button>
                  </div>
                </div>
              </div>

              <div class="form-row" v-if="customerType === 'Organization'">
                <div class="input-nexus">
                  <label>ORGANIZATION NAME</label>
                  <div class="input-wrapper">
                    <input v-model="organizationName" type="text" placeholder="Company or entity name" required />
                    <div class="glowing-bar"></div>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="input-nexus">
                  <label>EMAIL</label>
                  <div class="input-wrapper">
                    <input v-model="email" type="email" placeholder="you@example.com" required />
                    <div class="glowing-bar"></div>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="input-nexus">
                  <label>PASSWORD</label>
                  <div class="input-wrapper">
                    <input v-model="password" type="password" placeholder="At least 8 characters" required />
                    <div class="glowing-bar"></div>
                  </div>
                </div>
              </div>

              <div class="action-nexus">
                <button type="submit" class="prime-action-btn" :disabled="loading">
                  <span v-if="!loading">CREATE ACCOUNT</span>
                  <div v-else class="simple-loader"></div>
                </button>
              </div>
            </form>

            <div class="card-extra-links">
              <router-link to="/" class="nexus-link accent">Back to login</router-link>
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
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const userId = ref('')
const customerType = ref('Individual')
const organizationName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const statusMessage = ref('')
const isError = ref(false)
const isScrolled = ref(false)

const triggerMsg = (msg, errorStatus) => {
  statusMessage.value = msg
  isError.value = errorStatus
  setTimeout(() => { statusMessage.value = '' }, 4000)
}

const handleRegister = async () => {
  if (password.value.length < 8) {
    triggerMsg('Password must be at least 8 characters.', true)
    return
  }
  if (!userId.value.trim()) {
    triggerMsg('Please enter your User ID.', true)
    return
  }
  if (customerType.value === 'Organization' && !organizationName.value.trim()) {
    triggerMsg('Please enter the organization name.', true)
    return
  }
  loading.value = true
  try {
    const { data: existingEmail } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email.value.trim())
      .maybeSingle()

    if (existingEmail) {
      triggerMsg('An account with this email already exists.', true)
      return
    }

    const { data: existingId } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userId.value.trim())
      .maybeSingle()

    if (existingId) {
      triggerMsg('This User ID is already registered.', true)
      return
    }

    const newUserId = userId.value.trim()

    const { error: userError } = await supabase
      .from('users')
      .insert([{
        user_id: newUserId,
        first_name: firstName.value.trim(),
        last_name: lastName.value.trim(),
        email: email.value.trim()
      }])

    if (userError) throw userError

    const { error: customerError } = await supabase
      .from('customers')
      .insert([{
        user_id: newUserId,
        customer_type: customerType.value,
        organization_name: customerType.value === 'Organization' ? organizationName.value.trim() : null
      }])

    if (customerError) throw customerError

    const { error: authError } = await supabase
      .from('wesal_auth')
      .insert([{
        user_id: newUserId,
        password: password.value,
        role: 'Customer'
      }])

    if (authError) throw authError

    localStorage.setItem('logged_user_id', newUserId)
    localStorage.setItem('logged_user_role', 'Customer')
    router.push('/dashboard')
  } catch (err) {
    triggerMsg(err.message, true)
  } finally {
    loading.value = false
  }
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

.wesal-cinematic-wrapper { min-height: 100vh; background: #fcfdfe; color: #1e293b; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; flex-direction: column; }
.nebula-aurora { position: fixed; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(52, 152, 219, 0.03) 0%, transparent 50%); z-index: 0; }

.nexus-header { position: fixed; top: 0; width: 100%; height: 80px; z-index: 1000; padding: 0 50px; display: flex; align-items: center; transition: 0.3s; }
.header-active { background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid #f1f5f9; }
.header-inner { width: 100%; max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.h-left { display: flex; align-items: center; }
.header-mini-logo { height: 30px; margin-right: 12px; }
.system-pulse { width: 6px; height: 6px; background: #3498db; border-radius: 50%; }
.status-label { font-size: 10px; font-weight: 800; color: #cbd5e1; margin-left: 8px; }

.master-stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; position: relative; z-index: 10; }
.central-brand { margin-bottom: 40px; text-align: center; }
.master-logo { width: 320px; filter: drop-shadow(0 10px 30px rgba(0,0,0,0.05)); }
.brand-sub-title { margin-top: 15px; font-size: 14px; font-weight: 600; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; }

.perspective-box { width: 100%; max-width: 560px; }
.panoramic-card { background: white; border-radius: 40px; padding: 60px; box-shadow: 0 40px 120px rgba(30, 41, 59, 0.06); border: 1px solid #f8fafc; }

.form-title-simple { font-size: 26px; font-weight: 800; color: #1e293b; text-align: center; margin-bottom: 8px; letter-spacing: -0.5px; }
.form-instruction { font-size: 13px; color: #94a3b8; text-align: center; margin-bottom: 40px; font-weight: 500; }

.form-row { margin-bottom: 30px; }
.form-row.two-col { display: flex; gap: 25px; }
.form-row.two-col .input-nexus { flex: 1; }
.input-nexus { text-align: left; }
.input-nexus label { display: block; font-size: 10px; font-weight: 900; color: #94a3b8; margin-bottom: 8px; letter-spacing: 1px; }

.auth-mode-selector { display: flex; gap: 10px; background: #f8fafc; border-radius: 14px; padding: 6px; margin-top: 4px; }
.auth-mode-selector button { flex: 1; padding: 12px; border: none; background: transparent; border-radius: 10px; font-weight: 800; font-size: 12px; letter-spacing: 0.5px; color: #94a3b8; cursor: pointer; transition: 0.25s; }
.auth-mode-selector button.active { background: #1e293b; color: white; }

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
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.input-wrapper input::placeholder {
  color: #cbd5e1;
  font-weight: 400;
  font-size: 15px;
}
.glowing-bar { position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: #3498db; transition: 0.5s ease; }
.input-wrapper input:focus ~ .glowing-bar { width: 100%; }

.action-nexus { margin-top: 10px; }
.prime-action-btn { width: 100%; max-width: 300px; margin: 0 auto; display: block; padding: 20px; background: #1e293b; color: white; border: none; border-radius: 16px; font-weight: 800; font-size: 13px; cursor: pointer; transition: 0.3s; }
.prime-action-btn:hover { background: #3498db; transform: translateY(-2px); }
.prime-action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.card-extra-links { text-align: center; margin-top: 28px; font-size: 13px; }
.nexus-link { text-decoration: none; font-size: 13px; font-weight: 700; color: #94a3b8; }
.nexus-link.accent { color: #3498db; }

.wesal-footer { padding: 40px 60px; background: #fff; border-top: 1px solid #f8fafc; }
.footer-inner { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.f-label { font-size: 10px; font-weight: 900; color: #3498db; display: block; margin-bottom: 5px; }
.f-row { display: flex; gap: 15px; font-size: 12px; font-weight: 700; color: #64748b; }
.copyright-text { font-size: 11px; color: #cbd5e1; font-weight: 600; }

.error-toast { position: fixed; top: 100px; right: 40px; z-index: 2000; background: white; padding: 15px 25px; border-radius: 15px; box-shadow: 0 15px 40px rgba(231, 76, 60, 0.15); border-left: 5px solid #e74c3c; display: flex; align-items: center; gap: 12px; }
.success-toast { border-left-color: #10b981; box-shadow: 0 15px 40px rgba(16, 185, 129, 0.15); }
.toast-text { font-size: 13px; font-weight: 700; color: #1e293b; }
.simple-loader { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 800px) {
  .nexus-header { padding: 0 20px; height: 65px; }
  .status-label { display: none; }
  .master-stage { padding: 30px 15px; }
  .master-logo { width: 220px; }
  .brand-sub-title { font-size: 11px; }
  .panoramic-card { padding: 35px 20px; border-radius: 30px; }
  .form-row.two-col { flex-direction: column; gap: 0; }
  .wesal-footer { padding: 30px 20px; }
  .footer-inner { flex-direction: column; gap: 15px; text-align: center; }
  .f-row { justify-content: center; }
  .toast { right: 20px; left: 20px; text-align: center; top: 80px; }
}

@media (max-width: 480px) {
  .master-logo { width: 180px; }
  .input-wrapper input { font-size: 16px; }
  .prime-action-btn { padding: 16px; font-size: 12px; }
}
</style>