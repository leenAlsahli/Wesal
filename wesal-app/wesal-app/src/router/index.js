import { createRouter, createWebHistory } from 'vue-router'

// 1. الاستيرادات (تأكدي أن اسم الملف CreateAccount.vue)
import Login from '../pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import StaffDashboard from '../pages/StaffDashboard.vue'
import ForgotPassword from '../pages/ForgotPassword.vue'
import CreateAccount from '../pages/CreateAccount.vue' // <--- تأكدي من هذا الاسم

const routes = [
  { 
    path: '/', 
    component: Login, 
    name: 'login' 
  },
  { 
    path: '/create-account', // <--- يجب أن يكون مطابقاً لـ router-link في اللوجن
    component: CreateAccount, 
    name: 'createAccount' 
  },
  { 
    path: '/forgot-password', 
    component: ForgotPassword, 
    name: 'forgotPassword' 
  },
  { 
    path: '/dashboard', 
    component: Dashboard, 
    name: 'dashboard' 
  },
  { 
    path: '/staff-dashboard', 
    component: StaffDashboard, 
    name: 'staffDashboard' 
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('logged_user_id')
  const userRole = localStorage.getItem('logged_user_role')

  // الأسماء هنا يجب أن تطابق الـ name الموجود في routes بالأعلى
  const publicPages = ['login', 'createAccount', 'forgotPassword']
  const isPublicPage = publicPages.includes(to.name)

  // إذا حاول المستخدم الدخول لصفحة عامة وهو مسجل دخول
  if (isAuthenticated && isPublicPage) {
    return next(userRole === 'Support Agent' ? '/staff-dashboard' : '/dashboard')
  }

  // حماية الصفحات الخاصة
  if (!isAuthenticated && !isPublicPage) {
    return next({ name: 'login' })
  }

  // منع تداخل الصلاحيات
  if (isAuthenticated) {
    if (to.name === 'dashboard' && userRole === 'Support Agent') {
      return next('/staff-dashboard')
    }
    if (to.name === 'staffDashboard' && userRole !== 'Support Agent') {
      return next('/dashboard')
    }
  }

  next()
})

export default router