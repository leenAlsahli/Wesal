<template>
  <div class="wesal-dashboard light-theme">
    
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Create New Ticket</h3>
          <button @click="showModal = false" class="close-x">×</button>
        </div>
        <form @submit.prevent="createNewTicket" class="modal-body">
          <div class="input-group">
            <label>Subject</label>
            <input v-model="newTicket.title" placeholder="Brief title of your issue" required />
          </div>
          <div class="input-group">
            <label>Description</label>
            <textarea v-model="newTicket.description" rows="3" placeholder="Explain the details here..."></textarea>
          </div>
          <div class="input-row" style="display: flex; gap: 15px;">
            <div class="input-group" style="flex: 1;">
              <label>Priority</label>
              <select v-model="newTicket.priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div class="input-group" style="flex: 1;">
              <label>Department</label>
              <select v-model="newTicket.dept_id" required>
                <option v-for="dept in deptsList" :key="dept.dept_id" :value="dept.dept_id">{{ dept.name }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : 'Submit Ticket' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showFeedbackModal" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Share Your Feedback</h3>
          <button @click="showFeedbackModal = false" class="close-x">×</button>
        </div>
        <form @submit.prevent="submitFeedback" class="modal-body">
          <div class="input-group">
            <label>How would you rate us?</label>
            <div class="star-rating" style="font-size: 24px; cursor: pointer; color: #cbd5e1;">
              <span v-for="star in 5" :key="star" @click="newFeedback.rating = star" :style="{ color: star <= newFeedback.rating ? '#f1c40f' : '#cbd5e1' }">★</span>
            </div>
          </div>
          <div class="input-group">
            <label>Comment</label>
            <textarea v-model="newFeedback.comment" rows="3" placeholder="Write your experience here..." required></textarea>
          </div>

          <div class="input-group">
            <label>Attachments</label>
            <button type="button" @click="alert('This feature will be added later!')" style="background: #f1f5f9; border: 2px dashed #cbd5e1; padding: 12px; border-radius: 12px; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600;">
              <span>📎</span> Attach Screenshot (Coming Soon)
            </button>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" @click="showFeedbackModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Posting...' : 'Post Feedback' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="../assets/logo.png" alt="Wesal Logo" class="nav-logo" />
      </div>
      <nav class="sidebar-nav">
        <div class="nav-item active">Dashboard</div>
        <div class="nav-item">Profile</div>
      </nav>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div>
          <h1 class="page-title">Welcome back, {{ userName }}</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Support status overview</p>
        </div>
        <div class="user-badge-container" style="display: flex; gap: 10px;">
          <span class="type-badge">{{ customerType }}</span>
          <span class="user-badge">Role: {{ userRole }}</span>
        </div>
      </header>

      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue-deep"></div>
          <div class="stat-content">
            <span class="stat-label">Total Departments</span>
            <span class="stat-value">{{ stats.deptCount }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue-vibrant"></div>
          <div class="stat-content">
            <span class="stat-label">Your Active Tickets</span>
            <span class="stat-value">{{ stats.activeTickets }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue-soft"></div>
          <div class="stat-content">
            <span class="stat-label">Customer Feedback Avg</span>
            <span class="stat-value">{{ feedbackAvg }}/5</span>
          </div>
        </div>
      </section>

      <section class="data-section" style="margin-bottom: 30px;">
        <div class="section-header">
          <h3>Your Recent Support Tickets</h3>
          <button @click="showModal = true" class="new-ticket-btn">+ New Ticket</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Title</th><th>Priority</th><th>Status</th><th>Department</th><th>Agent</th></tr>
            </thead>
            <tbody>
              <tr v-for="ticket in tickets" :key="ticket.ticket_id">
                <td style="color: #93c5fd; font-weight: 700;">#{{ ticket.ticket_id }}</td>
                <td>{{ ticket.title }}</td>
                <td><span :class="['priority-tag', ticket.priority?.toLowerCase()]">{{ ticket.priority }}</span></td>
                <td><span class="status-dot" :class="ticket.status?.replace(' ', '-')"></span> {{ ticket.status }}</td>
                <td>{{ ticket.dept_name }}</td>
                <td>
                  <span v-if="ticket.agent_name">{{ ticket.agent_name }}</span>
                  <span v-else style="color: #94a3b8; font-style: italic; font-size: 12px;">Waiting...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="data-section">
        <div class="section-header">
          <h3>Your Feedbacks</h3>
          <button @click="showFeedbackModal = true" class="new-ticket-btn">+ Add Feedback</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Rating</th><th>Comment</th></tr>
            </thead>
            <tbody>
              <tr v-for="fb in userFeedbacks" :key="fb.f_id">
                <td style="color: #f1c40f; font-size: 18px; white-space: nowrap;">
                  {{ '★'.repeat(fb.rating) }}{{ '☆'.repeat(5 - fb.rating) }}
                </td>
                <td style="font-style: italic; color: #64748b;">"{{ fb.comment || 'No comment' }}"</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('User')
const userRole = ref('Customer')
const customerType = ref('Individual') // قيمة افتراضية
const tickets = ref([])
const userFeedbacks = ref([])
const deptsList = ref([])
const feedbackAvg = ref('0.0')
const stats = ref({ deptCount: 0, activeTickets: 0 })

const showModal = ref(false)
const showFeedbackModal = ref(false)
const isSubmitting = ref(false)

const newTicket = ref({ title: '', description: '', priority: 'low', dept_id: null })
const newFeedback = ref({ rating: 5, comment: '' })

const fetchDashboardData = async () => {
  const sId = localStorage.getItem('logged_user_id')
  if (!sId) { router.push('/'); return; }
  
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('first_name')
      .eq('user_id', sId)
      .maybeSingle()
    
    if (userData) userName.value = userData.first_name

    // جلب نوع العميل من جدول customers
    const { data: custData } = await supabase
      .from('customers')
      .select('customer_type')
      .eq('user_id', sId)
      .maybeSingle()
    
    if (custData) customerType.value = custData.customer_type

    userRole.value = localStorage.getItem('logged_user_role') || 'Customer'

    // 2. جلب التذاكر
    const { data: ticketData } = await supabase
      .from('ticket')
      .select(`*, departments (name), support_agent (f_name, l_name)`)
      .eq('user_id', sId)
      .order('creation_date', { ascending: false })

    if (ticketData) {
      tickets.value = ticketData.map(t => ({
        ...t, 
        dept_name: t.departments?.name || 'General',
        agent_name: t.support_agent ? `${t.support_agent.f_name} ${t.support_agent.l_name}` : null
      }))
      stats.value.activeTickets = ticketData.filter(t => t.status !== 'closed').length
    }

    // 3. الأقسام والتقييمات
    const { data: depts } = await supabase.from('departments').select('*')
    if (depts) deptsList.value = depts

    const { data: fbData } = await supabase
      .from('feedback')
      .select('*')
      .eq('u_id', sId)
    
    if (fbData) {
      userFeedbacks.value = fbData
      if (fbData.length > 0) {
        const sum = fbData.reduce((acc, curr) => acc + curr.rating, 0)
        feedbackAvg.value = (sum / fbData.length).toFixed(1)
      }
    }

    const { count } = await supabase.from('departments').select('*', { count: 'exact', head: true })
    stats.value.deptCount = count || 0
    
  } catch (err) { 
    console.error('Fetch Error:', err) 
  }
}

// الدوال (إنشاء تذكرة وتقييم)
const createNewTicket = async () => {
  if (!newTicket.value.dept_id) return alert('Please select a department')
  isSubmitting.value = true
  try {
    const sId = localStorage.getItem('logged_user_id')
    const { error } = await supabase.from('ticket').insert([{ 
      title: newTicket.value.title,
      description: newTicket.value.description,
      priority: newTicket.value.priority,
      dept_id: newTicket.value.dept_id,
      status: 'open', 
      user_id: sId,
      creation_date: new Date().toISOString().split('T')[0]
    }])
    if (error) throw error
    showModal.value = false
    newTicket.value = { title: '', description: '', priority: 'low', dept_id: null }
    await fetchDashboardData()
  } catch (err) { alert(err.message) } finally { isSubmitting.value = false }
}

const submitFeedback = async () => {
  isSubmitting.value = true
  try {
    const sId = localStorage.getItem('logged_user_id')
    const { error } = await supabase.from('feedback').insert([{ 
      rating: newFeedback.value.rating, 
      comment: newFeedback.value.comment, 
      u_id: sId 
    }])
    if (error) throw error
    showFeedbackModal.value = false
    newFeedback.value = { rating: 5, comment: '' }
    await fetchDashboardData()
  } catch (err) { alert(err.message) } finally { isSubmitting.value = false }
}

const handleLogout = () => { localStorage.clear(); router.push('/'); }
onMounted(fetchDashboardData)
</script>

<style scoped>
.wesal-dashboard { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; }
.sidebar { width: 300px; background: white; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; padding: 40px 20px; }
.nav-logo { width: 240px; height: auto; margin-bottom: 50px; margin-right: -25px; align-self: center; }
.sidebar-nav { flex: 1; }
.nav-item { padding: 15px 20px; border-radius: 12px; color: #64748b; font-weight: 600; cursor: pointer; margin-bottom: 5px; transition: 0.3s; }
.nav-item.active { background: #93c5fd; color: #1e3a8a; }

/* ستايل Badge نوع العميل */
.type-badge { background: #f1f5f9; color: #334155; padding: 6px 18px; border-radius: 50px; font-size: 13px; font-weight: 700; border: 1px solid #e2e8f0; }
.user-badge { background: #1e293b; color: white; padding: 6px 18px; border-radius: 50px; font-size: 13px; font-weight: 700; white-space: nowrap; }

.main-content { flex: 1; padding: 40px 60px; overflow-y: auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
.page-title { font-size: 28px; font-weight: 800; color: #1e293b; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 40px; }
.stat-card { background: white; padding: 25px; border-radius: 24px; display: flex; align-items: center; gap: 15px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
.stat-icon { width: 6px; height: 45px; border-radius: 10px; }
.blue-deep { background: #1e3a8a; }
.blue-vibrant { background: #3b82f6; }
.blue-soft { background: #93c5fd; }
.stat-label { font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
.stat-value { font-size: 28px; font-weight: 800; color: #1e293b; display: block; }
.data-section { background: white; border-radius: 24px; padding: 30px; border: 1px solid #f1f5f9; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.new-ticket-btn { background: #93c5fd; color: #1e3a8a; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 15px; color: #94a3b8; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
td { padding: 15px; border-bottom: 1px solid #f8fafc; font-size: 14px; font-weight: 600; }
.priority-tag { padding: 4px 10px; border-radius: 6px; font-size: 10px; text-transform: uppercase; font-weight: 800; }
.priority-tag.urgent { background: #fee2e2; color: #ef4444; }
.priority-tag.high { background: #fff7ed; color: #f97316; }
.priority-tag.medium { background: #fefce8; color: #ca8a04; }
.priority-tag.low { background: #f0fdf4; color: #16a34a; }
.status-dot { height: 8px; width: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
.status-dot.open { background: #10b981; }
.status-dot.closed { background: #94a3b8; }
.modal-overlay { position: fixed; inset: 0; background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-card { background: white; width: 500px; border-radius: 24px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
.input-group { margin-bottom: 15px; display: flex; flex-direction: column; }
.input-group label { font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 5px; }
.input-group input, select, textarea { padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; }
.btn-primary { background: #93c5fd; color: #1e3a8a; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-secondary { background: #f1f5f9; color: #64748b; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; }
/* تنسيق زر تسجيل الخروج المحدث */
.logout-btn { 
 width: 100%; 
 padding: 12px; 
 background: #fee2e2; /* لون أحمر فاتح جداً خلفية */
 color: #ef4444;      /* لون نص أحمر */
 border: none; 
 border-radius: 10px; 
 font-weight: 700; 
 font-size: 14px;
 cursor: pointer; 
 transition: all 0.3s ease;
 display: flex;
 justify-content: center;
 align-items: center;
}

.logout-btn:hover {
 background: #fecaca; /* يغمق قليلاً عند تمرير الماوس */
 transform: translateY(-1px); /* تأثير بسيط عند التفاعل */
}

/* تنسيق تذييل السايدبار لضمان المسافات */
.sidebar-footer {
 margin-top: auto; /* يدفع الزر لأسفل السايدبار */
 padding-top: 20px;
}.close-x { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
/* --- تحديثات التجاوب لصفحة عميل (Customer Dashboard) --- */

@media (max-width: 1024px) {
 /* تحويل السايدبار إلى هيدر علوي */
 .wesal-dashboard { flex-direction: column; }
  
 .sidebar { 
   width: 100%; 
   padding: 15px 20px; 
   border-right: none; 
   border-bottom: 1px solid #e2e8f0; 
   align-items: center;
 }
  
 .nav-logo { margin-bottom: 15px; width: 160px; margin-right: 0; }
  
 .sidebar-nav { display: flex; gap: 10px; margin-bottom: 15px; }
  
 .main-content { padding: 20px; }
}

@media (max-width: 768px) {
 /* ترتيب الإحصائيات بشكل عمودي */
 .stats-grid { 
   grid-template-columns: 1fr; 
   gap: 15px; 
 }
  
 .top-bar { 
   flex-direction: column; 
   gap: 15px; 
 }

 /* جعل الجداول قابلة للتمرير العرضي */
 .table-container {
   overflow-x: auto;
   -webkit-overflow-scrolling: touch; /* تمرير سلس في آيفون */
   border-radius: 12px;
 }
  
 table { min-width: 700px; }

 /* ضبط النوافذ المنبثقة (Modals) */
 .modal-card {
   width: 95%;
   max-height: 90vh;
   overflow-y: auto;
   padding: 20px;
   margin: 10px;
 }

 /* ضبط الصفوف داخل المودال (Priority & Dept) */
 .modal-body .input-row {
   flex-direction: column;
   gap: 0 !important;
 }

 /* تكبير النجوم في الجوال ليسهل الضغط عليها */
 .star-rating {
   font-size: 32px !important;
   display: flex;
   justify-content: center;
   gap: 10px;
 }
}

@media (max-width: 480px) {
 .page-title { font-size: 22px; }
  
 .user-badge-container {
   flex-wrap: wrap;
 }

 .type-badge, .user-badge {
   font-size: 11px;
   padding: 5px 12px;
 }

 .new-ticket-btn {
   width: 100%;
   margin-top: 10px;
 }

 .section-header {
   flex-direction: column;
   align-items: flex-start;
 }
}
</style>