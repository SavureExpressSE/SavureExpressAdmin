<template>
  <div>
    <div class="page-title">Reports & Analytics</div>

    <!-- ── TAB SWITCH ── -->
    <div class="tabs">
      <button :class="['tab', activeTab === 'orders' && 'tab--active']" @click="activeTab = 'orders'">📋 Order Analytics</button>
      <button :class="['tab', activeTab === 'payments' && 'tab--active']" @click="activeTab = 'payments'">💳 Payment Analytics</button>
    </div>

    <!-- ══════════ ORDER ANALYTICS ══════════ -->
    <div v-if="activeTab === 'orders'">
      <!-- KPI row -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">📦</div>
          <div class="kpi-val">{{ totalOrders }}</div>
          <div class="kpi-label">Total Orders</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-val">{{ completedOrders }}</div>
          <div class="kpi-label">Completed</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">❌</div>
          <div class="kpi-val">{{ cancelledOrders }}</div>
          <div class="kpi-label">Cancelled</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-val">{{ activeOrders }}</div>
          <div class="kpi-label">Active</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-val">₹{{ orderRevenue }}</div>
          <div class="kpi-label">Order Revenue</div>
        </div>
      </div>

      <div class="charts-row">
        <!-- By Status -->
        <div class="chart-card">
          <div class="chart-title">By Status</div>
          <div class="bar-list">
            <div v-for="s in statusBreakdown" :key="s.label" class="bar-row">
              <span class="bar-label">{{ s.label }}</span>
              <div class="bar-wrap">
                <div class="bar" :style="{ width: s.pct + '%', background: s.color }"></div>
              </div>
              <span class="bar-count">{{ s.count }}</span>
            </div>
          </div>
        </div>

        <!-- By Type -->
        <div class="chart-card">
          <div class="chart-title">By Order Type</div>
          <div class="donut-wrap">
            <svg viewBox="0 0 100 100" class="donut-svg">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#37446b" stroke-width="18"/>
              <circle cx="50" cy="50" r="35" fill="none" stroke="#6c72ff" stroke-width="18"
                :stroke-dasharray="`${dineInPct * 2.199} ${(100 - dineInPct) * 2.199}`"
                stroke-dashoffset="54.97" stroke-linecap="round"/>
            </svg>
            <div class="donut-center">
              <div class="donut-val">{{ dineInPct }}%</div>
              <div class="donut-sub">DINE_IN</div>
            </div>
          </div>
          <div class="legend-list">
            <div class="leg-row"><span class="leg-dot" style="background:#6c72ff"></span> DINE_IN <strong>{{ dineIn }}</strong></div>
            <div class="leg-row"><span class="leg-dot" style="background:#f59e0b"></span> WALK_IN <strong>{{ walkIn }}</strong></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════ PAYMENT ANALYTICS ══════════ -->
    <div v-if="activeTab === 'payments'">
      <!-- KPI row -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">🧾</div>
          <div class="kpi-val">{{ totalPayments }}</div>
          <div class="kpi-label">Total Payments</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-val">{{ successPayments }}</div>
          <div class="kpi-label">Successful</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-val">{{ pendingPayments }}</div>
          <div class="kpi-label">Pending</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">❌</div>
          <div class="kpi-val">{{ failedPayments }}</div>
          <div class="kpi-label">Failed</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-val">₹{{ collectedRevenue }}</div>
          <div class="kpi-label">Collected</div>
        </div>
      </div>

      <div class="charts-row">
        <!-- By Method -->
        <div class="chart-card">
          <div class="chart-title">By Payment Method</div>
          <div class="bar-list">
            <div v-for="m in methodBreakdown" :key="m.label" class="bar-row">
              <span class="bar-label">{{ m.label }}</span>
              <div class="bar-wrap">
                <div class="bar" :style="{ width: m.pct + '%', background: m.color }"></div>
              </div>
              <span class="bar-count">{{ m.count }}</span>
            </div>
          </div>
        </div>

        <!-- By Initiator -->
        <div class="chart-card">
          <div class="chart-title">By Initiator</div>
          <div class="donut-wrap">
            <svg viewBox="0 0 100 100" class="donut-svg">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#37446b" stroke-width="18"/>
              <circle cx="50" cy="50" r="35" fill="none" stroke="#22c55e" stroke-width="18"
                :stroke-dasharray="`${customerPct * 2.199} ${(100 - customerPct) * 2.199}`"
                stroke-dashoffset="54.97" stroke-linecap="round"/>
            </svg>
            <div class="donut-center">
              <div class="donut-val">{{ customerPct }}%</div>
              <div class="donut-sub">CUSTOMER</div>
            </div>
          </div>
          <div class="legend-list">
            <div class="leg-row"><span class="leg-dot" style="background:#22c55e"></span> Customer (Self-pay) <strong>{{ customerInitiated }}</strong></div>
            <div class="leg-row"><span class="leg-dot" style="background:#6c72ff"></span> Staff collected <strong>{{ staffInitiated }}</strong></div>
          </div>
        </div>
      </div>

      <!-- Revenue by method table -->
      <div class="chart-card" style="margin-top:16px">
        <div class="chart-title">Revenue by Method</div>
        <table class="data-table">
          <thead><tr><th>Method</th><th>Transactions</th><th>Revenue</th><th>Avg</th></tr></thead>
          <tbody>
            <tr v-for="m in methodRevenue" :key="m.method">
              <td><span class="badge">{{ m.method }}</span></td>
              <td>{{ m.count }}</td>
              <td>₹{{ m.revenue }}</td>
              <td>₹{{ m.avg }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { api } from '@/utils/request'

interface Payment {
  id: number; orderId: number; amount: number
  method: string; status: string; initiatedBy: string; createdAt: string
}

const orderStore = useOrderStore()
const payments = ref<Payment[]>([])
const activeTab = ref<'orders' | 'payments'>('orders')
const RESTAURANT_ID = 1

// ── ORDER COMPUTED ──
const totalOrders = computed(() => orderStore.orders.length)
const completedOrders = computed(() => orderStore.orders.filter(o => o.orderStatus === 'COMPLETED').length)
const cancelledOrders = computed(() => orderStore.orders.filter(o => o.orderStatus === 'CANCELLED').length)
const activeOrders = computed(() => orderStore.orders.filter(o => !['COMPLETED','CANCELLED'].includes(o.orderStatus)).length)
const orderRevenue = computed(() => orderStore.orders.filter(o => o.orderStatus === 'COMPLETED').reduce((s, o) => s + o.totalAmount, 0).toFixed(0))

const dineIn = computed(() => orderStore.orders.filter(o => o.orderType === 'DINE_IN').length)
const walkIn = computed(() => orderStore.orders.filter(o => o.orderType === 'WALK_IN').length)
const dineInPct = computed(() => totalOrders.value ? Math.round((dineIn.value / totalOrders.value) * 100) : 0)

const orderStatuses = [
  { label: 'PENDING',    color: '#57c3ff' },
  { label: 'CONFIRMED',  color: '#818cf8' },
  { label: 'PREPARING',  color: '#f59e0b' },
  { label: 'READY',      color: '#a3e635' },
  { label: 'SERVED',     color: '#34d399' },
  { label: 'COMPLETED',  color: '#22c55e' },
  { label: 'CANCELLED',  color: '#ef4444' },
]
const statusBreakdown = computed(() =>
  orderStatuses.map(s => {
    const count = orderStore.orders.filter(o => o.orderStatus === s.label).length
    return { ...s, count, pct: totalOrders.value ? Math.round((count / totalOrders.value) * 100) : 0 }
  })
)

// ── PAYMENT COMPUTED ──
const totalPayments = computed(() => payments.value.length)
const successPayments = computed(() => payments.value.filter(p => p.status === 'SUCCESS').length)
const pendingPayments = computed(() => payments.value.filter(p => p.status === 'PENDING').length)
const failedPayments = computed(() => payments.value.filter(p => p.status === 'FAILED').length)
const collectedRevenue = computed(() => payments.value.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + Number(p.amount), 0).toFixed(0))

const customerInitiated = computed(() => payments.value.filter(p => p.initiatedBy === 'CUSTOMER').length)
const staffInitiated = computed(() => payments.value.filter(p => p.initiatedBy === 'STAFF').length)
const customerPct = computed(() => totalPayments.value ? Math.round((customerInitiated.value / totalPayments.value) * 100) : 0)

const paymentMethods = [
  { label: 'CASH',   color: '#22c55e' },
  { label: 'CARD',   color: '#6c72ff' },
  { label: 'UPI',    color: '#f59e0b' },
  { label: 'WALLET', color: '#ec4899' },
]
const methodBreakdown = computed(() =>
  paymentMethods.map(m => {
    const count = payments.value.filter(p => p.method === m.label).length
    return { ...m, count, pct: totalPayments.value ? Math.round((count / totalPayments.value) * 100) : 0 }
  })
)
const methodRevenue = computed(() =>
  paymentMethods.map(m => {
    const rows = payments.value.filter(p => p.method === m.label && p.status === 'SUCCESS')
    const revenue = rows.reduce((s, p) => s + Number(p.amount), 0).toFixed(0)
    const avg = rows.length ? (Number(revenue) / rows.length).toFixed(0) : '0'
    return { method: m.label, count: rows.length, revenue, avg }
  }).filter(m => m.count > 0)
)

onMounted(async () => {
  await orderStore.fetchByRestaurant()
  payments.value = await api.get<Payment[]>(`/payments/restaurant/${RESTAURANT_ID}`).catch(() => [])
})
</script>

<style scoped>
.page-title { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.tabs { display: flex; gap: 4px; background: #212c4d; border-radius: 10px; padding: 4px; margin-bottom: 24px; width: fit-content; }
.tab { padding: 9px 22px; border: none; border-radius: 8px; background: transparent; color: #aeb9e1; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.tab:hover { color: #fff; }
.tab--active { background: #6c72ff; color: #fff; }

.kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 20px; }
.kpi-card { background: #212c4d; border-radius: 12px; padding: 18px 16px; display: flex; flex-direction: column; gap: 6px; }
.kpi-icon { font-size: 24px; }
.kpi-val { font-size: 24px; font-weight: 700; color: #fff; }
.kpi-label { font-size: 11px; color: #aeb9e1; }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-card { background: #212c4d; border-radius: 12px; padding: 20px; }
.chart-title { color: #d1dbf9; font-size: 13px; font-weight: 600; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }

.bar-list { display: flex; flex-direction: column; gap: 10px; }
.bar-row { display: flex; align-items: center; gap: 12px; }
.bar-label { width: 90px; font-size: 12px; color: #aeb9e1; flex-shrink: 0; }
.bar-wrap { flex: 1; height: 8px; background: #37446b; border-radius: 4px; overflow: hidden; }
.bar { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.bar-count { width: 28px; text-align: right; font-size: 12px; color: #d1dbf9; }

.donut-wrap { position: relative; width: 130px; height: 130px; margin: 0 auto 16px; }
.donut-svg { transform: rotate(-90deg); width: 100%; height: 100%; }
.donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
.donut-val { font-size: 20px; font-weight: 700; color: #fff; }
.donut-sub { font-size: 10px; color: #aeb9e1; }
.legend-list { display: flex; flex-direction: column; gap: 8px; }
.leg-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #aeb9e1; }
.leg-row strong { color: #fff; margin-left: auto; }
.leg-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #37446b; color: #aeb9e1; font-size: 11px; text-transform: uppercase; padding: 10px 14px; text-align: left; }
.data-table td { padding: 10px 14px; color: #d1dbf9; font-size: 13px; border-bottom: 1px solid #37446b; }
.data-table tr:last-child td { border-bottom: none; }
.badge { background: #1e3a5f; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }

@media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } .charts-row { grid-template-columns: 1fr; } }
@media (max-width: 700px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
