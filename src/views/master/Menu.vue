<template>
  <div>
    <!-- Category Section -->
    <div class="section-header">
      <div class="section-title">Menu Categories</div>
      <button class="btn-primary" @click="showCatForm = !showCatForm">+ Add Category</button>
    </div>

    <div v-if="showCatForm" class="form-card">
      <input v-model="catForm.name" class="form-input" placeholder="Category name *" />
      <input v-model="catForm.description" class="form-input" placeholder="Description (optional)" />
      <div class="form-actions">
        <button class="btn-primary" @click="submitCategory">Save</button>
        <button class="btn-ghost" @click="showCatForm = false">Cancel</button>
      </div>
    </div>

    <div class="chips-row">
      <span v-for="cat in menuStore.categories" :key="cat.id" class="category-chip">
        {{ cat.name }}
        <button class="chip-del" @click="menuStore.deleteCategory(cat.id)">✕</button>
      </span>
      <span v-if="!menuStore.categories.length" class="empty-inline">No categories yet.</span>
    </div>

    <!-- Menu Items Section -->
    <div class="section-header" style="margin-top: 32px;">
      <div class="section-title">Menu Items</div>
      <button class="btn-primary" @click="openItemForm()">+ Add Item</button>
    </div>

    <div v-if="showItemForm" class="form-card">
      <div class="form-row">
        <input v-model="itemForm.name" class="form-input" placeholder="Item name *" />
        <input v-model.number="itemForm.price" class="form-input" type="number" placeholder="Price *" />
      </div>
      <input v-model="itemForm.description" class="form-input" placeholder="Description" />
      <div class="form-row">
        <select v-model.number="itemForm.menuCategoryId" class="form-input">
          <option value="" disabled>Select Category *</option>
          <option v-for="c in menuStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <label class="form-toggle">
          <input v-model="itemForm.availability" type="checkbox" />
          <span>Available</span>
        </label>
      </div>
      <div class="form-actions">
        <button class="btn-primary" @click="submitItem">{{ itemForm.id ? 'Update' : 'Save' }} Item</button>
        <button class="btn-ghost" @click="showItemForm = false">Cancel</button>
      </div>
    </div>

    <div v-if="menuStore.loading" class="empty-state">Loading…</div>
    <div v-else-if="!menuStore.items.length" class="empty-state">No menu items yet.</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>Name</th><th>Category</th><th>Description</th><th>Price</th><th>Available</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in menuStore.items" :key="item.id">
            <td>{{ item.name }}</td>
            <td><span class="badge">{{ item.menuCategoryName }}</span></td>
            <td class="desc-cell">{{ item.description ?? '—' }}</td>
            <td>₹{{ item.price }}</td>
            <td><span :class="item.availability ? 'avail-yes' : 'avail-no'">{{ item.availability ? '✅' : '❌' }}</span></td>
            <td>
              <button class="btn-icon" @click="openItemForm(item)">✏️</button>
              <button class="btn-icon danger" @click="menuStore.deleteItem(item.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import type { MenuItem } from '@/services/menu-service'

const menuStore = useMenuStore()
const RESTAURANT_ID = 1

const showCatForm = ref(false)
const catForm = reactive({ name: '', description: '' })

const showItemForm = ref(false)
const itemForm = reactive({ id: undefined as number | undefined, name: '', description: '', price: 0, menuCategoryId: '' as any, availability: true })

function openItemForm(item?: MenuItem) {
  if (item) {
    Object.assign(itemForm, { id: item.id, name: item.name, description: item.description ?? '', price: item.price, menuCategoryId: item.menuCategoryId, availability: item.availability })
  } else {
    Object.assign(itemForm, { id: undefined, name: '', description: '', price: 0, menuCategoryId: '', availability: true })
  }
  showItemForm.value = true
}

async function submitCategory() {
  if (!catForm.name.trim()) return
  await menuStore.saveCategory({ name: catForm.name, description: catForm.description || undefined })
  Object.assign(catForm, { name: '', description: '' })
  showCatForm.value = false
}

async function submitItem() {
  if (!itemForm.name || !itemForm.price || !itemForm.menuCategoryId) return
  await menuStore.saveItem({ id: itemForm.id, restaurantId: RESTAURANT_ID, menuCategoryId: itemForm.menuCategoryId, name: itemForm.name, description: itemForm.description || undefined, price: itemForm.price, availability: itemForm.availability })
  showItemForm.value = false
}

onMounted(() => menuStore.fetchAll())
</script>

<style scoped>
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { color: #fff; font-size: 16px; font-weight: 600; }
.btn-primary { background: #6c72ff; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; transition: 0.2s; }
.btn-primary:hover { background: #4a4fcc; }
.btn-ghost { background: transparent; color: #aeb9e1; border: 1px solid #37446b; border-radius: 8px; padding: 8px 18px; font-size: 14px; cursor: pointer; }
.btn-icon { background: transparent; border: none; font-size: 16px; cursor: pointer; padding: 4px; }
.btn-icon.danger { opacity: 0.7; }
.btn-icon.danger:hover { opacity: 1; }
.form-card { background: #212c4d; border-radius: 12px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; gap: 12px; }
.form-input { flex: 1; background: #37446b; border: 1px solid #4a5580; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; }
.form-input:focus { border-color: #6c72ff; }
.form-toggle { display: flex; align-items: center; gap: 8px; color: #aeb9e1; font-size: 14px; }
.form-actions { display: flex; gap: 12px; }
.chips-row { display: flex; flex-wrap: wrap; gap: 10px; }
.category-chip { display: flex; align-items: center; gap: 6px; background: #37446b; color: #57c3ff; border-radius: 20px; padding: 6px 14px; font-size: 13px; }
.chip-del { background: none; border: none; color: #aeb9e1; cursor: pointer; font-size: 12px; }
.chip-del:hover { color: #ef4444; }
.empty-inline { color: #aeb9e1; font-size: 13px; }
.table-wrap { background: #212c4d; border-radius: 12px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #37446b; color: #aeb9e1; font-size: 12px; text-transform: uppercase; padding: 12px 16px; text-align: left; }
.data-table td { padding: 12px 16px; color: #d1dbf9; font-size: 14px; border-bottom: 1px solid #37446b; }
.data-table tr:last-child td { border-bottom: none; }
.badge { background: #1e3a5f; color: #57c3ff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.desc-cell { color: #7e89ac; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.avail-yes { color: #22c55e; }
.avail-no { color: #ef4444; }
.empty-state { color: #aeb9e1; text-align: center; padding: 40px; }
</style>
