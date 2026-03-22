<template>
  <div class="admin-layout">
    <nav class="admin-navbar">
      <div class="nav-brand">👑 WA-Trainer Admin</div>
      <div class="nav-menu">
        <button class="nav-item active">แดชบอร์ดจัดการสมาชิก</button>
      </div>
      <button class="btn-logout" @click="logout">ออกจากระบบ</button>
    </nav>

    <div class="admin-content">
      <div class="header-section">
        <h2>รายชื่อสมาชิกทั้งหมด ({{ filteredUsers.length }} คน)</h2>
        
        <div class="filter-group">
          <input type="text" class="search-input" v-model="searchQuery" placeholder="🔍 ค้นหาชื่อ, นามสกุล, อีเมล..." />
          
          <select class="role-select" v-model="selectedRole">
            <option value="">ทั้งหมด (All)</option>
            <option value="member">Member (สมาชิก)</option>
            <option value="trainer">Trainer (เทรนเนอร์)</option>
            <option value="admin">Admin (ผู้ดูแล)</option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="loading-text">กำลังโหลดข้อมูล...</div>

      <div v-else-if="filteredUsers.length === 0" class="empty-state">
        ไม่พบผู้ใช้งานในระบบ
      </div>

      <div v-else class="user-grid">
        <div class="user-card" v-for="user in filteredUsers" :key="user.id">
          
          <div class="card-header">
            <span :class="['role-badge', user.type === 'admin' ? 'admin' : 'member']">
              {{ user.type.toUpperCase() }}
            </span>
            <h3>{{ user.name }} {{ user.lastname }}</h3>
          </div>

          <div class="card-body">
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>วันหมดอายุ:</strong> <span :class="checkExpireColor(user.member_end)">{{ formatDate(user.member_end) }}</span></p>
            <p><strong>สลิป:</strong> 
               <span v-if="user.slip_image" class="text-success">✅ แนบแล้ว</span>
               <span v-else class="text-danger">❌ ยังไม่แนบ</span>
            </p>
          </div>

          <div class="card-actions">
            <button :class="['btn-view', {'has-new-slip': user.slip_image}]" @click="viewSlip(user)">
              {{ user.slip_image ? 'ตรวจสอบสลิป 🔔' : 'ประวัติสลิป' }}
            </button>
            <button class="btn-edit" @click="$router.push('/user/edit/' + user.id)">แก้ไขข้อมูล</button>
            <button class="btn-delete" @click="deleteUser(user)" v-if="user.type !== 'admin'">ลบผู้ใช้</button>
          </div>
          
        </div>
      </div>
    </div>

    <div v-if="showSlip" class="modal-backdrop" @click="showSlip = false">
      <div class="modal-content slip-history-modal" @click.stop>
        <h3>ประวัติสลิป: {{ selectedUser?.name }}</h3>
        
        <div v-if="selectedUser?.slip_image" class="approve-section">
          <h4>✅ ยืนยันสลิปล่าสุด และต่ออายุสมาชิก</h4>
          <div class="approve-buttons">
            <button class="btn-days" @click="approveSlip(7)">+ 7 วัน</button>
            <button class="btn-days" @click="approveSlip(30)">+ 1 เดือน</button>
            <button class="btn-days" @click="approveSlip(365)">+ 1 ปี</button>
          </div>
        </div>

        <div v-if="slipLogs.length === 0" class="empty-state">
          ยังไม่มีประวัติการส่งสลิป
        </div>

        <div v-else class="slip-gallery">
          <transition-group name="fade" tag="div" class="slip-list">
            <div v-for="log in slipLogs" :key="log.id" class="slip-item">
              <p class="slip-date">📅 วันที่ส่ง: {{ formatDate(log.createdAt) }}</p>
              <img :src="'http://localhost:8081/uploads/' + log.slip_image" alt="Slip" class="slip-preview-img" />
              <hr />
            </div>
          </transition-group>
        </div>

        <button class="btn-close" @click="showSlip = false">ปิดหน้าต่าง</button>
      </div>
    </div>

  </div>
</template>

<script>
import UsersService from '../services/UsersService'
import { useAuthenStore } from '../stores/authen'

export default {
  data() {
    return {
      users: [],
      loading: true,
      searchQuery: '',
      selectedRole: '', // ✨ เพิ่มตัวแปรเก็บค่า Dropdown
      showSlip: false,
      slipLogs: [], 
      selectedUser: null 
    }
  },
  computed: {
    // ✨ อัปเดตการกรองข้อมูล ให้เช็คทั้งข้อความ และ ประเภท
    filteredUsers() {
      return this.users.filter(u => {
        // เงื่อนไขที่ 1: ค้นหาจากข้อความ
        const matchSearch = !this.searchQuery || 
          (u.name && u.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (u.lastname && u.lastname.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (u.email && u.email.toLowerCase().includes(this.searchQuery.toLowerCase()));

        // เงื่อนไขที่ 2: ค้นหาจากประเภท
        const matchRole = !this.selectedRole || u.type === this.selectedRole;

        // ต้องผ่านทั้ง 2 เงื่อนไข
        return matchSearch && matchRole;
      });
    }
  },
  async created() {
    await this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      try {
        this.loading = true
        const response = await UsersService.index()
        this.users = response.data
      } catch (error) {
        console.error('ดึงข้อมูลไม่สำเร็จ:', error)
      } finally {
        this.loading = false
      }
    },
    async deleteUser(user) {
      if (confirm(`คุณแน่ใจนะว่าจะลบคุณ ${user.name}?`)) {
        try {
          await UsersService.delete(user)
          await this.fetchUsers() 
        } catch (error) {
          console.error('ลบไม่สำเร็จ', error)
        }
      }
    },
    async viewSlip(user) {
      try {
        this.selectedUser = user;
        const response = await UsersService.getSlipLogs(user.id);
        this.slipLogs = response.data;
        this.showSlip = true;
      } catch (error) {
        console.error('ไม่สามารถดึงประวัติสลิปได้:', error);
      }
    },
    async approveSlip(daysToAdd) {
      if (confirm(`คุณต้องการต่ออายุสมาชิกให้คุณ ${this.selectedUser.name} จำนวน ${daysToAdd} วัน ใช่หรือไม่?`)) {
        try {
          await UsersService.approve(this.selectedUser.id, daysToAdd);
          alert('ต่ออายุสมาชิกเรียบร้อยแล้ว!');
          this.showSlip = false; 
          await this.fetchUsers(); 
        } catch (error) {
          console.error('ยืนยันสลิปไม่สำเร็จ', error);
          alert('เกิดข้อผิดพลาดในการต่ออายุสมาชิก');
        }
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'ไม่มีข้อมูล'
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    },
    checkExpireColor(dateString) {
      if (!dateString) return ''
      return new Date(dateString) < new Date() ? 'text-danger' : 'text-success'
    },
    logout() {
      const authenStore = useAuthenStore()
      authenStore.setToken('')
      authenStore.setUser({})
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.admin-layout { background-color: #f4f7f6; min-height: 100vh; font-family: 'Kanit', sans-serif;}
.admin-navbar { display: flex; justify-content: space-between; align-items: center; background-color: #2c3e50; color: white; padding: 15px 30px; }
.nav-brand { font-size: 1.2rem; font-weight: bold; }
.nav-menu { display: flex; gap: 20px; }
.nav-item { background: none; border: none; color: #cbd5e1; cursor: pointer; font-size: 1rem; }
.nav-item.active { color: white; font-weight: bold; border-bottom: 2px solid #42b983; }
.btn-logout { background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; }

.admin-content { padding: 30px; max-width: 1200px; margin: 0 auto; }

/* ✨ อัปเดต CSS ส่วน Header ให้เรียงตัวสวยงาม */
.header-section { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border-bottom: 2px solid #ddd; 
  padding-bottom: 10px; 
  margin-bottom: 20px;
  flex-wrap: wrap; /* เผื่อจอเล็กมันจะปัดลงมาให้ */
  gap: 15px;
}
.filter-group {
  display: flex;
  gap: 10px;
}
.search-input { padding: 10px 15px; width: 250px; border-radius: 8px; border: 1px solid #ccc; font-size: 0.95rem; outline: none; transition: border-color 0.3s; font-family: 'Kanit', sans-serif;}
.search-input:focus { border-color: #42b983; }

.role-select {
  padding: 10px 15px; 
  border-radius: 8px; 
  border: 1px solid #ccc; 
  font-size: 0.95rem; 
  outline: none;
  background-color: white;
  cursor: pointer;
  font-family: 'Kanit', sans-serif;
  color: #2c3e50;
}
.role-select:focus { border-color: #42b983; }

.user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.user-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: transform 0.2s; }
.user-card:hover { transform: translateY(-5px); }

.card-header { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 10px;}
.card-header h3 { margin: 10px 0 0 0; font-size: 1.2rem; color: #2c3e50;}
.role-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; letter-spacing: 0.5px;}
.role-badge.member { background-color: #e0f2fe; color: #0369a1; }
.role-badge.admin { background-color: #fef08a; color: #854d0e; }

.card-body p { margin: 8px 0; font-size: 0.95rem; color: #4b5563; }
.text-danger { color: #dc2626; font-weight: bold; }
.text-success { color: #16a34a; font-weight: bold; }

.card-actions { display: flex; gap: 8px; margin-top: 15px; }
.btn-view { flex: 1; padding: 8px; border: none; background: #64748b; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;}
.btn-view.has-new-slip { background: #3b82f6; animation: pulse 2s infinite; }
.btn-edit { flex: 1; padding: 8px; border: 1px solid #42b983; background: #e8f5e9; color: #2e7d32; border-radius: 6px; cursor: pointer; font-weight: bold;}
.btn-delete { flex: 1; padding: 8px; border: none; background: #fee2e2; color: #dc2626; border-radius: 6px; cursor: pointer; font-weight: bold;}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.approve-section { background-color: #f0fff4; padding: 15px; border-radius: 10px; border: 2px dashed #42b983; margin-bottom: 20px;}
.approve-section h4 { margin-top: 0; color: #2e7d32; font-size: 1.1rem;}
.approve-buttons { display: flex; gap: 10px; justify-content: center; margin-top: 10px;}
.btn-days { background-color: #42b983; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.95rem; transition: all 0.2s;}
.btn-days:hover { background-color: #369b6d; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1);}

.slip-history-modal { max-width: 600px; max-height: 85vh; overflow-y: auto;}
.slip-item { margin-bottom: 25px; text-align: left; border-bottom: 1px solid #eee; padding-bottom: 15px;}
.slip-date { font-size: 0.9rem; font-weight: bold; color: #555;}
.slip-preview-img { width: 100%; max-height: 450px; object-fit: contain; border-radius: 8px; margin-top: 10px;}

.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 25px; border-radius: 12px; text-align: center; }
.btn-close { background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 15px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>