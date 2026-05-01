<template>
  <div>
    <div class="page-title">Notifications</div>

    <div class="tabs">
      <button :class="['tab', activeTab === 'log' && 'tab--active']" @click="activeTab = 'log'">📋 Log</button>
      <button :class="['tab', activeTab === 'templates' && 'tab--active']" @click="activeTab = 'templates'">📝 Templates</button>
      <button :class="['tab', activeTab === 'settings' && 'tab--active']" @click="activeTab = 'settings'">⚙️ Test & Setup</button>
    </div>

    <!-- ── LOG ── -->
    <div v-if="activeTab === 'log'">
      <DataTable
        v-model:search="logSearch"
        v-model:currentPage="logPage"
        v-model:pageSize="logPageSize"
        :columns="logColumns"
        :rows="logs"
        :loading="logLoading"
        :totalPages="logTotalPages"
        :totalElements="logTotalElements"
        search-placeholder="Search by recipient…"
        @update:search="onLogSearch"
        @update:currentPage="loadLogs"
        @update:pageSize="() => { logPage = 0; loadLogs() }"
      >
        <template #filters>
          <select v-model="channelFilter" class="filter-select" @change="() => { logPage = 0; loadLogs() }">
            <option value="">All Channels</option>
            <option value="EMAIL">EMAIL</option>
            <option value="SMS">SMS</option>
            <option value="PUSH">PUSH</option>
          </select>
          <select v-model="statusFilter" class="filter-select" @change="() => { logPage = 0; loadLogs() }">
            <option value="">All Statuses</option>
            <option value="SENT">SENT</option>
            <option value="FAILED">FAILED</option>
            <option value="SKIPPED">SKIPPED</option>
          </select>
        </template>

        <template #cell-channel="{ value }">
          <span :class="['ch-badge', `ch-${value.toLowerCase()}`]">{{ value }}</span>
        </template>
        <template #cell-status="{ value }">
          <span :class="['status-badge', statusClass(value)]">{{ value }}</span>
        </template>
        <template #cell-sentAt="{ value }">{{ formatDate(value) }}</template>
      </DataTable>
    </div>

    <!-- ── TEMPLATES ── -->
    <div v-if="activeTab === 'templates'">
      <div class="section-header">
        <span class="sub-title">Notification Templates</span>
        <button class="btn-primary" @click="openTemplateForm()">+ Add Template</button>
      </div>

      <div v-if="showTemplateForm" class="form-card">
        <div class="form-row">
          <select v-model="tForm.event" class="form-input">
            <option value="" disabled>Event *</option>
            <option v-for="e in events" :key="e" :value="e">{{ e }}</option>
          </select>
          <select v-model="tForm.channel" class="form-input">
            <option value="" disabled>Channel *</option>
            <option value="EMAIL">EMAIL</option>
            <option value="SMS">SMS</option>
            <option value="PUSH">PUSH</option>
          </select>
        </div>
        <input v-if="tForm.channel === 'EMAIL'" v-model="tForm.subject" class="form-input" placeholder="Subject (supports {{vars}})" />
        <textarea v-model="tForm.body" class="form-input form-textarea" :placeholder="bodyPlaceholder" />
        <div class="hint">Variables: <code>{{orderNumber}}</code> <code>{{status}}</code> <code>{{total}}</code> <code>{{orderType}}</code></div>
        <div class="form-actions">
          <button class="btn-primary" @click="saveTemplate">Save</button>
          <button class="btn-ghost" @click="showTemplateForm = false">Cancel</button>
        </div>
      </div>

      <div v-if="tLoading" class="empty-state">Loading…</div>
      <div v-else-if="!templates.length" class="empty-state">No templates yet. Add one to enable notifications.</div>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Event</th><th>Channel</th><th>Subject</th><th>Enabled</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="t in templates" :key="t.id">
              <td><span class="badge">{{ t.event }}</span></td>
              <td><span :class="['ch-badge', `ch-${t.channel.toLowerCase()}`]">{{ t.channel }}</span></td>
              <td class="desc-cell">{{ t.subject || '—' }}</td>
              <td>
                <button :class="['toggle-btn', t.enabled ? 'toggle-on' : 'toggle-off']" @click="toggleTemplate(t.id)">
                  {{ t.enabled ? 'ON' : 'OFF' }}
                </button>
              </td>
              <td>
                <button class="btn-icon" @click="openTemplateForm(t)">✏️</button>
                <button class="btn-icon danger" @click="deleteTemplate(t.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── SETTINGS / TEST ── -->
    <div v-if="activeTab === 'settings'">
      <div class="settings-grid">
        <!-- Email config -->
        <div class="settings-card">
          <div class="settings-title">📧 Email (SMTP)</div>
          <div class="settings-body">
            <p>Configure in <code>application.properties</code>:</p>
            <pre class="config-block">notification.email.enabled=true
notification.email.from=noreply@yourapp.com
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=you@gmail.com
spring.mail.password=app-password</pre>
          </div>
        </div>
        <!-- SMS config -->
        <div class="settings-card">
          <div class="settings-title">📱 SMS (Twilio)</div>
          <div class="settings-body">
            <p>Configure in <code>application.properties</code>:</p>
            <pre class="config-block">notification.sms.enabled=true
notification.sms.account-sid=ACxxx
notification.sms.auth-token=your-token
notification.sms.from-number=+1XXXXXXXXXX</pre>
          </div>
        </div>
        <!-- Push config -->
        <div class="settings-card">
          <div class="settings-title">🔔 Push (Firebase FCM)</div>
          <div class="settings-body">
            <p>Download service account JSON from Firebase Console, then:</p>
            <pre class="config-block">notification.push.enabled=true
notification.push.service-account-path=
  /path/to/serviceAccount.json</pre>
          </div>
        </div>
      </div>

      <!-- Test panel -->
      <div class="form-card" style="margin-top:24px">
        <div class="sub-title" style="margin-bottom:12px">🧪 Send Test Notification</div>
        <div class="form-row">
          <select v-model="testForm.channel" class="form-input">
            <option value="EMAIL">EMAIL</option>
            <option value="SMS">SMS</option>
            <option value="PUSH">PUSH</option>
          </select>
          <input v-model="testForm.recipient" class="form-input"
            :placeholder="testForm.channel === 'EMAIL' ? 'email@example.com' : testForm.channel === 'SMS' ? '+91XXXXXXXXXX' : 'FCM device token'" />
        </div>
        <textarea v-model="testForm.message" class="form-input form-textarea" placeholder="Test message body…" />
        <p v-if="testResult" :class="['test-result', testResult.ok ? 'test-ok' : 'test-fail']">{{ testResult.msg }}</p>
        <div class="form-actions">
          <button class="btn-primary" :disabled="testLoading" @click="sendTest">
            {{ testLoading ? 'Sending…' : 'Send Test' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { api } from '@/utils/request'
import DataTable from '@/components/DataTable.vue'

const activeTab = ref<'log' | 'templates' | 'settings'>('log')

// ── Log ──
const logColumns = [
  { key: 'id', label: '#' },
  { key: 'channel', label: 'Channel' },
  { key: 'event', label: 'Event' },
  { key: 'recipient', label: 'Recipient' },
  { key: 'status', label: 'Status' },
  { key: 'entityType', label: 'Entity' },
  { key: 'entityId', label: 'Entity ID' },
  { key: 'sentAt', label: 'Sent At' },
]
const logs = ref<any[]>([])
const logLoading = ref(false)
const logSearch = ref('')
const channelFilter = ref('')
const statusFilter = ref('')
const logPage = ref(0)
const logPageSize = ref(20)
const logTotalPages = ref(0)
const logTotalElements = ref(0)
let logTimer: ReturnType<typeof setTimeout>

async function loadLogs() {
  logLoading.value = true
  try {
    const p = new URLSearchParams({ page: String(logPage.value), size: String(logPageSize.value) })
    if (channelFilter.value) p.set('channel', channelFilter.value)
    if (statusFilter.value) p.set('status', statusFilter.value)
    if (logSearch.value) p.set('recipient', logSearch.value)
    const res = await api.get<any>(`/notifications/logs?${p}`)
    logs.value = res.content; logTotalPages.value = res.totalPages; logTotalElements.value = res.totalElements
  } finally { logLoading.value = false }
}
function onLogSearch() { clearTimeout(logTimer); logTimer = setTimeout(() => { logPage.value = 0; loadLogs() }, 350) }

// ── Templates ──
const events = ['ORDER_PLACED','ORDER_CONFIRMED','ORDER_PREPARING','ORDER_READY','ORDER_COMPLETED','ORDER_CANCELLED','PAYMENT_SUCCESS','PAYMENT_FAILED','RESERVATION_CONFIRMED','RESERVATION_CANCELLED','RESERVATION_REMINDER']
const templates = ref<any[]>([])
const tLoading = ref(false)
const showTemplateForm = ref(false)
const tForm = reactive({ id: undefined as number | undefined, event: '', channel: 'EMAIL', subject: '', body: '' })

const bodyPlaceholder = computed(() =>
  tForm.channel === 'EMAIL' ? 'HTML body — use {{orderNumber}}, {{status}}, {{total}}…'
  : tForm.channel === 'SMS' ? 'SMS text — keep under 160 chars. Use {{orderNumber}}, {{status}}…'
  : 'Push notification body')

function openTemplateForm(t?: any) {
  if (t) Object.assign(tForm, { id: t.id, event: t.event, channel: t.channel, subject: t.subject || '', body: t.body })
  else Object.assign(tForm, { id: undefined, event: '', channel: 'EMAIL', subject: '', body: '' })
  showTemplateForm.value = true
}
async function loadTemplates() {
  tLoading.value = true
  try { templates.value = await api.get<any[]>('/notifications/templates') } finally { tLoading.value = false }
}
async function saveTemplate() {
  if (!tForm.event || !tForm.channel || !tForm.body) return
  await api.post('/notifications/templates', { id: tForm.id, event: tForm.event, channel: tForm.channel, subject: tForm.subject || null, body: tForm.body, enabled: true })
  showTemplateForm.value = false; await loadTemplates()
}
async function toggleTemplate(id: number) {
  await api.patch(`/notifications/templates/${id}/toggle`)
  await loadTemplates()
}
async function deleteTemplate(id: number) {
  if (!confirm('Delete template?')) return
  await api.delete(`/notifications/templates/${id}`); await loadTemplates()
}

// ── Test ──
const testForm = reactive({ channel: 'EMAIL', recipient: '', message: 'Hello from Savure Express! This is a test notification.' })
const testLoading = ref(false)
const testResult = ref<{ ok: boolean; msg: string } | null>(null)
async function sendTest() {
  testLoading.value = true; testResult.value = null
  try {
    await api.post('/notifications/test', { channel: testForm.channel, recipient: testForm.recipient, message: testForm.message })
    testResult.value = { ok: true, msg: '✅ Test sent successfully' }
  } catch (e: any) {
    testResult.value = { ok: false, msg: '❌ ' + (e.message || 'Failed') }
  } finally { testLoading.value = false }
}

// ── Helpers ──
function statusClass(s: string) {
  if (s === 'SENT') return 'status-green'
  if (s === 'FAILED') return 'status-red'
  return 'status-gray'
}
function formatDate(iso: string) { return iso ? new Date(iso).toLocaleString() : '—' }

watch(activeTab, (t) => {
  if (t === 'log') loadLogs()
  if (t === 'templates') loadTemplates()
})
onMounted(loadLogs)
</script>

<style scoped>
.page-title { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.tabs { display: flex; gap: 4px; background: #212c4d; border-radius: 10px; padding: 4px; margin-bottom: 24px; width: fit-content; }
.tab { padding: 8px 20px; border: none; border-radius: 8px; background: transparent; color: #aeb9e1; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.tab:hover { color: #fff; }
.tab--active { background: #6c72ff; color: #fff; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.sub-title { color: #d1dbf9; font-size: 14px; font-weight: 600; }
.btn-primary { background: #6c72ff; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-primary:hover:not(:disabled) { background: #4a4fcc; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { background: transparent; color: #aeb9e1; border: 1px solid #37446b; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-icon { background: transparent; border: none; font-size: 15px; cursor: pointer; padding: 4px; }
.btn-icon.danger { opacity: 0.6; }
.btn-icon.danger:hover { opacity: 1; }
.filter-select { background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 8px 14px; color: #fff; font-size: 13px; outline: none; }
.form-card { background: #212c4d; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; gap: 12px; }
.form-input { flex: 1; background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; }
.form-input:focus { border-color: #6c72ff; }
.form-textarea { min-height: 100px; resize: vertical; font-family: inherit; }
.form-actions { display: flex; gap: 12px; }
.hint { font-size: 12px; color: #7e89ac; }
.hint code { background: #37446b; border-radius: 4px; padding: 1px 5px; color: #57c3ff; }
.table-wrap { background: #212c4d; border-radius: 12px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #37446b; color: #aeb9e1; font-size: 12px; text-transform: uppercase; padding: 12px 16px; text-align: left; }
.data-table td { padding: 12px 16px; color: #d1dbf9; font-size: 14px; border-bottom: 1px solid #37446b; }
.data-table tr:last-child td { border-bottom: none; }
.badge { background: #1e3a5f; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.ch-badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; font-weight: 600; }
.ch-email { background: #1e3a5f; color: #57c3ff; }
.ch-sms { background: #451a03; color: #f59e0b; }
.ch-push { background: #14532d; color: #22c55e; }
.status-badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; font-weight: 600; }
.status-green { background: #14532d; color: #22c55e; }
.status-red { background: #450a0a; color: #ef4444; }
.status-gray { background: #37446b; color: #aeb9e1; }
.toggle-btn { font-size: 11px; padding: 3px 10px; border-radius: 20px; border: none; cursor: pointer; font-weight: 600; }
.toggle-on { background: #14532d; color: #22c55e; }
.toggle-off { background: #450a0a; color: #ef4444; }
.desc-cell { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #7e89ac; }
.settings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.settings-card { background: #212c4d; border-radius: 12px; padding: 20px; }
.settings-title { color: #fff; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.settings-body { font-size: 13px; color: #aeb9e1; line-height: 1.6; }
.settings-body code { background: #37446b; border-radius: 4px; padding: 1px 5px; color: #57c3ff; }
.config-block { background: #080f25; border-radius: 8px; padding: 12px; font-size: 11px; color: #a3e635; line-height: 1.8; margin-top: 8px; overflow-x: auto; white-space: pre; }
.test-result { font-size: 13px; padding: 8px 12px; border-radius: 8px; }
.test-ok { background: #14532d33; color: #22c55e; }
.test-fail { background: #450a0a33; color: #ef4444; }
.empty-state { color: #aeb9e1; text-align: center; padding: 40px; }
@media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } }
</style>
