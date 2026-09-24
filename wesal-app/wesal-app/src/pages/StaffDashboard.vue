<template>
  <div class="wesal-dashboard light-theme">
    
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Update Ticket Status</h3>
          <button @click="showModal = false" class="close-x">×</button>
        </div>
        <form @submit.prevent="updateTicketStatus" class="modal-body">
          <div class="input-group">
            <label>Selected Ticket</label>
            <input :value="'#' + selectedTicket?.ticket_id + ' - ' + selectedTicket?.title" disabled />
          </div>
          <div class="input-group">
            <label>Change Status</label>
            <select v-model="statusUpdate" required>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Updating...' : 'Save Status' }}
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
        <div class="nav-item active">My Workspace</div>
      </nav>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div>
          <h1 class="page-title">Welcome back, {{ userName }}</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Support Agent Portal</p>
        </div>
        <div class="user-badge-container">
          <span class="user-badge">Role: {{ userRole }}</span>
        </div>
      </header>

      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue-deep"></div>
          <div class="stat-content">
            <span class="stat-label">Assigned To Me</span>
            <span class="stat-value">{{ tickets.length }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue-vibrant"></div>
          <div class="stat-content">
            <span class="stat-label">Active Tasks</span>
            <span class="stat-value">{{ stats.activeCount }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue-soft"></div>
          <div class="stat-content">
            <span class="stat-label">My Rating</span>
            <span class="stat-value">{{ feedbackAvg }}/5</span>
          </div>
        </div>
      </section>

      <section class="data-section" style="margin-bottom: 30px;">
        <div class="section-header">
          <h3>Staff Distribution</h3>
          <div style="display: flex; gap: 10px;">
            <div class="input-group" style="margin-bottom: 0;">
              <select v-model="deptScope" style="padding: 8px; font-size: 12px;">
                <option value="my">My Department</option>
                <option value="all">All Departments</option>
                <option value="specific">Specific Department...</option>
              </select>
            </div>
            <div v-if="deptScope === 'specific'" class="input-group" style="margin-bottom: 0;">
              <select v-model="selectedSpecificDept" style="padding: 8px; font-size: 12px;">
                <option v-for="d in deptStats" :key="d.name" :value="d.name">{{ d.name }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="dept-pills-container">
          <div v-for="dept in filteredDeptStats" :key="dept.name" class="dept-pill" :class="{ 'is-mine': dept.name === myDeptName }">
            <span class="pill-label">{{ dept.name }} {{ dept.name === myDeptName ? '(Me)' : '' }}</span>
            <span class="pill-value">{{ dept.count }} Employees</span>
          </div>
        </div>
      </section>

      <section class="data-section" style="margin-bottom: 20px; padding: 20px;">
        <div style="display: flex; gap: 20px; align-items: center;">
          <div class="input-group" style="margin-bottom: 0; flex: 1;">
            <label>Filter by Status</label>
            <select v-model="filterStatus">
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div class="input-group" style="margin-bottom: 0; flex: 1;">
            <label>Filter by Priority</label>
            <select v-model="filterPriority">
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </section>

      <section class="data-section" style="margin-bottom: 30px;">
        <div class="section-header">
          <h3>My Assigned Tickets</h3>
          <button @click="fetchDashboardData" class="new-ticket-btn">↻ Refresh</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Client</th><th>Subject</th><th>Priority</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr v-for="ticket in filteredTickets" :key="ticket.ticket_id">
                <td style="color: #93c5fd; font-weight: 700;">#{{ ticket.ticket_id }}</td>
                <td>{{ ticket.customer_name }}</td>
                <td>{{ ticket.title }}</td>
                <td><span :class="['priority-tag', ticket.priority?.toLowerCase()]">{{ ticket.priority }}</span></td>
                <td><span class="status-dot" :class="ticket.status?.replace(' ', '-')"></span> {{ ticket.status }}</td>
                <td>
                  <button @click="openEditModal(ticket)" class="new-ticket-btn" style="padding: 5px 12px; font-size: 11px;">Update</button>
                </td>
              </tr>
              <tr v-if="filteredTickets.length === 0">
                <td colspan="6" style="text-align: center; color: #94a3b8; padding: 40px;">No tickets found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="data-section">
        <div class="section-header">
          <h3>Feedbacks on My Service</h3>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Feedback ID</th><th>Rating</th><th>Comment</th></tr>
            </thead>
            <tbody>
              <tr v-for="fb in myFeedbacks" :key="fb.f_id">
                <td style="font-weight: 700; color: #94a3b8;">#{{ fb.f_id }}</td>
                <td style="color: #f1c40f; font-size: 18px;">
                  {{ '★'.repeat(fb.rating) }}{{ '☆'.repeat(5 - fb.rating) }}
                </td>
                <td style="font-style: italic; color: #64748b;">"{{ fb.comment || 'No comment' }}"</td>
              </tr>
              <tr v-if="myFeedbacks.length === 0">
                <td colspan="3" style="text-align: center; color: #94a3b8; padding: 40px;">No feedbacks yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('Loading...')
const userRole = ref('Support Agent')
const myDeptName = ref('') 

const tickets = ref([])
const myFeedbacks = ref([])
const feedbackAvg = ref('0.0')
const stats = ref({ activeCount: 0 })
const deptStats = ref([]) 

const deptScope = ref('my') 
const selectedSpecificDept = ref('')

const filterStatus = ref('all')
const filterPriority = ref('all')

const showModal = ref(false)
const isSubmitting = ref(false)
const selectedTicket = ref(null)
const statusUpdate = ref('')

const fetchDashboardData = async () => {
  const sId = localStorage.getItem('logged_user_id')
  if (!sId) { router.push('/'); return; }
  const agentId = sId.trim()

  try {
    const { data: agentData } = await supabase
      .from('support_agent')
      .select(`f_name, l_name, departments(name)`)
      .eq('sagent_id', agentId)
      .maybeSingle()

    if (agentData) {
      userName.value = `${agentData.f_name} ${agentData.l_name}`
      myDeptName.value = agentData.departments?.name || ''
      if (!selectedSpecificDept.value) selectedSpecificDept.value = myDeptName.value
    }

    const { data: ticketData } = await supabase
      .from('ticket')
      .select(`*, users (first_name, last_name)`)
      .eq('sagent_id', agentId)

    if (ticketData) {
      tickets.value = ticketData.map(t => ({
        ...t,
        customer_name: t.users ? `${t.users.first_name} ${t.users.last_name}` : 'Unknown Customer'
      }))
      stats.value.activeCount = ticketData.filter(t => t.status !== 'closed').length
    }

    const { data: deptsData } = await supabase
      .from('departments')
      .select(`name, support_agent(count)`)

    if (deptsData) {
      deptStats.value = deptsData.map(d => ({
        name: d.name,
        count: d.support_agent[0]?.count || 0
      }))
    }

    // تعديل جلب الفيدباك: البحث في الفيدباك التي تخص اليوزر الذي هو في الحقيقة الموظف
    // ملاحظة: بما أن الـ Schema يربط Feedback بـ users عبر u_id، والموظف sagent_id غير مرتبط بـ users، 
    // قمت بتغيير الاستعلام ليبحث عن الـ ID في عمود u_id في جدول feedback
    const { data: fbData } = await supabase
      .from('feedback')
      .select('*')
      .eq('u_id', agentId) 

    if (fbData) {
      myFeedbacks.value = fbData
      if (fbData.length > 0) {
        const sum = fbData.reduce((acc, curr) => acc + curr.rating, 0)
        feedbackAvg.value = (sum / fbData.length).toFixed(1)
      }
    }
  } catch (err) { console.error('Error:', err.message) }
}

const filteredDeptStats = computed(() => {
  if (deptScope.value === 'my') {
    return deptStats.value.filter(d => d.name === myDeptName.value)
  } else if (deptScope.value === 'specific') {
    return deptStats.value.filter(d => d.name === selectedSpecificDept.value)
  }
  return deptStats.value 
})

const filteredTickets = computed(() => {
  return tickets.value.filter(t => {
    const sMatch = filterStatus.value === 'all' || t.status.toLowerCase() === filterStatus.value.toLowerCase()
    const pMatch = filterPriority.value === 'all' || t.priority.toLowerCase() === filterPriority.value.toLowerCase()
    return sMatch && pMatch
  })
})

const openEditModal = (ticket) => {
  selectedTicket.value = ticket
  statusUpdate.value = ticket.status
  showModal.value = true
}

const updateTicketStatus = async () => {
  if (!selectedTicket.value) return
  isSubmitting.value = true
  try {
    const { error } = await supabase.from('ticket').update({ status: statusUpdate.value }).eq('ticket_id', selectedTicket.value.ticket_id)
    if (error) throw error
    showModal.value = false
    await fetchDashboardData()
  } catch (err) { alert(err.message) } finally { isSubmitting.value = false }
}

const handleLogout = () => { localStorage.clear(); router.push('/'); }
onMounted(fetchDashboardData)
</script>

<style scoped>
/* التنسيقات لم تتغير */
.wesal-dashboard { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; }
.sidebar { width: 300px; background: white; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; padding: 40px 20px; }
.nav-logo { width: 240px; height: auto; margin-bottom: 50px; }
.sidebar-nav { flex: 1; }
.nav-item { padding: 15px 20px; border-radius: 12px; color: #64748b; font-weight: 600; cursor: pointer; margin-bottom: 5px; }
.nav-item.active { background: #93c5fd; color: #1e3a8a; }
.main-content { flex: 1; padding: 40px 60px; overflow-y: auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
.page-title { font-size: 28px; font-weight: 800; color: #1e293b; }
.user-badge { background: #1e293b; color: white; padding: 6px 18px; border-radius: 50px; font-size: 13px; font-weight: 700; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 40px; }
.stat-card { background: white; padding: 25px; border-radius: 24px; display: flex; align-items: center; gap: 15px; border: 1px solid #f1f5f9; }
.stat-icon { width: 6px; height: 45px; border-radius: 10px; }
.blue-deep { background: #1e3a8a; }
.blue-vibrant { background: #3b82f6; }
.blue-soft { background: #93c5fd; }
.stat-label { font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
.stat-value { font-size: 28px; font-weight: 800; color: #1e293b; display: block; }
.data-section { background: white; border-radius: 24px; padding: 30px; border: 1px solid #f1f5f9; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.dept-pills-container { display: flex; flex-wrap: wrap; gap: 12px; }
.dept-pill { background: #f8fafc; padding: 12px 20px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; min-width: 150px; }
.dept-pill.is-mine { background: #eff6ff; border-color: #3b82f6; }
.pill-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; }
.pill-value { font-size: 16px; font-weight: 700; color: #1e3a8a; }
.new-ticket-btn { background: #93c5fd; color: #1e3a8a; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 15px; color: #94a3b8; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
td { padding: 15px; border-bottom: 1px solid #f8fafc; font-size: 14px; font-weight: 600; }
.priority-tag { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.priority-tag.urgent { background: #fee2e2; color: #ef4444; }
.priority-tag.high { background: #fff7ed; color: #f97316; }
.priority-tag.medium { background: #f0f9ff; color: #0ea5e9; }
.priority-tag.low { background: #f8fafc; color: #94a3b8; }
.status-dot { height: 8px; width: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
.status-dot.open { background: #10b981; }
.status-dot.in-progress { background: #3b82f6; }
.status-dot.closed { background: #64748b; }
.modal-overlay { position: fixed; inset: 0; background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-card { background: white; width: 500px; border-radius: 24px; padding: 30px; }
.input-group { margin-bottom: 15px; display: flex; flex-direction: column; }
.input-group label { font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 5px; }
.input-group input, select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; }
.btn-primary { background: #93c5fd; color: #1e3a8a; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-secondary { background: #f1f5f9; color: #64748b; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.logout-btn { padding: 12px; background: #fee2e2; color: #ef4444; border: none; border-radius: 10px; font-weight: 700; width: 100%; cursor: pointer; }

@media (max-width: 1024px) {
  .wesal-dashboard { flex-direction: column; }
  .sidebar { width: 100%; padding: 20px; border-right: none; border-bottom: 1px solid #e2e8f0; }
  .nav-logo { margin-bottom: 20px; width: 180px; }
  .main-content { padding: 20px; }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; gap: 15px; }
  .top-bar { flex-direction: column; gap: 15px; align-items: flex-start; }
  .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  table { min-width: 600px; }
  .modal-card { width: 90%; margin: 0 15px; padding: 20px; }
  .dept-pills-container { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .dept-pill { min-width: unset; }
}

@media (max-width: 480px) {
  .page-title { font-size: 20px; }
  .dept-pills-container { grid-template-columns: 1fr; }
}
</style>