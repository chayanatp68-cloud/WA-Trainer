<template>
  <div class="trainer-layout">
    <nav class="trainer-navbar">
      <div class="nav-brand">🏋️‍♂️ WA-Trainer | Trainer Area</div>
      <button class="btn-logout" @click="logout">ออกจากระบบ</button>
    </nav>

    <div class="trainer-content">
      <div class="header-section">
        <h2>สวัสดีโค้ช {{ currentUser.name }} 👋</h2>
      </div>

      <div class="tabs">
        <button :class="['tab-btn', { active: currentTab === 'my_students' }]" @click="currentTab = 'my_students'">
          👥 นักเรียนของฉัน ({{ myStudents.length }})
        </button>
        <button :class="['tab-btn', { active: currentTab === 'find_students' }]" @click="currentTab = 'find_students'">
          🔍 หาผู้ฝึกใหม่ ({{ availableMembers.length }})
        </button>
      </div>

      <div v-if="currentTab === 'my_students'" class="tab-content">
        <div v-if="myStudents.length === 0" class="empty-state">
          คุณยังไม่มีนักเรียนในความดูแล ไปที่แท็บ "หาผู้ฝึกใหม่" เลย!
        </div>
        <div v-else class="user-grid">
          <div class="user-card" v-for="user in myStudents" :key="user.id">
            <div class="card-header">
              <h3>{{ user.name }} {{ user.lastname }}</h3>
            </div>
            <div class="card-body">
              <p><strong>น้ำหนักล่าสุด:</strong> {{ user.weight || '-' }} kg</p>
              <p><strong>ส่วนสูง:</strong> {{ user.height || '-' }} cm</p>
              <p><strong>อัปเดตน้ำหนักล่าสุด:</strong> 
                <span :class="checkInactive(user.last_weight_update)">
                  {{ formatDate(user.last_weight_update) }}
                </span>
              </p>
            </div>
            <div class="card-actions-row">
              <button class="btn-info" @click="openProgressModal(user)">📊 ดูพัฒนาการ</button>
              <button class="btn-primary" @click="openNoteModal(user)">📝 สั่งการบ้าน</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'find_students'" class="tab-content">
        <div v-if="availableMembers.length === 0" class="empty-state">
          ตอนนี้ยังไม่มีสมาชิกที่ต้องการเทรนเนอร์
        </div>
        <div v-else class="user-grid">
          <div class="user-card" v-for="user in availableMembers" :key="user.id">
            <div class="card-header">
              <h3>{{ user.name }} {{ user.lastname }}</h3>
            </div>
            <div class="card-body">
              <p>เป้าหมาย: รอการประเมิน</p>
            </div>
            <div class="card-actions">
              <button class="btn-success" @click="adoptMember(user)">🙋‍♂️ กดรับดูแลสมาชิก</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <h3>📝 แผนการฝึกของคุณ {{ selectedUser?.name }}</h3>
        <p class="subtitle">เขียนตารางออกกำลังกายหรือเป้าหมายให้สมาชิกเห็น</p>
        
        <textarea v-model="noteInput" rows="6" placeholder="เช่น วันนี้วิ่ง 30 นาที, งดของทอด..."></textarea>
        
        <div class="modal-actions">
          <button class="btn-success" @click="saveNote">บันทึกส่งให้สมาชิก</button>
          <button class="btn-cancel" @click="showModal = false">ยกเลิก</button>
        </div>
      </div>
    </div>

    <div v-if="showProgressModal" class="modal-backdrop" @click="showProgressModal = false">
      <div class="modal-content large-modal" @click.stop>
        <h3>📊 ประวัติและพัฒนาการของคุณ {{ selectedUser?.name }}</h3>
        
        <div v-if="studentLogs.length === 0" class="empty-state">
          สมาชิกคนนี้ยังไม่เคยบันทึกข้อมูลร่างกายเ
        </div>
        
        <div v-else class="progress-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>น้ำหนัก (kg)</th>
                <th>ส่วนสูง (cm)</th>
                <th>BMI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in studentLogs" :key="log.id">
                <td>{{ new Date(log.createdAt).toLocaleDateString('th-TH') }}</td>
                <td>{{ log.weight }}</td>
                <td>{{ log.height }}</td>
                <td :class="getBmiClass(log.bmi)">{{ log.bmi }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="showProgressModal = false">ปิดหน้าต่าง</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import UsersService from '../services/UsersService'
import Api from '../services/Api' // ✨ ต้อง import Api มาใช้ดึง HealthLogs
import { useAuthenStore } from '../stores/authen'

export default {
  data() {
    return {
      currentUser: {},
      users: [],
      currentTab: 'my_students',
      
      // ตัวแปรสำหรับ Modal สั่งการบ้าน
      showModal: false,
      selectedUser: null,
      noteInput: '',

      // ตัวแปรสำหรับ Modal ดูพัฒนาการ
      showProgressModal: false,
      studentLogs: []
    }
  },
  computed: {
    availableMembers() {
      return this.users.filter(u => u.type === 'member' && !u.trainer_id)
    },
    myStudents() {
      return this.users.filter(u => u.type === 'member' && u.trainer_id === this.currentUser.id)
    }
  },
  async created() {
    const authenStore = useAuthenStore()
    this.currentUser = authenStore.user
    await this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await UsersService.index()
        this.users = response.data
      } catch (error) {
        console.error('ดึงข้อมูลไม่สำเร็จ:', error)
      }
    },
    async adoptMember(user) {
      if (confirm(`คุณต้องการรับดูแลคุณ ${user.name} ใช่หรือไม่?`)) {
        try {
          user.trainer_id = this.currentUser.id 
          await UsersService.put(user) 
          alert('เพิ่มเข้าสู่นักเรียนของคุณแล้ว!')
          await this.fetchUsers()
          this.currentTab = 'my_students'
        } catch (error) {
          console.error('รับดูแลไม่สำเร็จ', error)
        }
      }
    },

    // ------------------------------------
    // ฟังก์ชันสำหรับ Modal 📝 สั่งการบ้าน
    // ------------------------------------
    openNoteModal(user) {
      this.selectedUser = user
      this.noteInput = user.trainer_note || '' 
      this.showModal = true
    },
    async saveNote() {
      try {
        this.selectedUser.trainer_note = this.noteInput
        await UsersService.put(this.selectedUser)
        alert('ส่งแผนการฝึกเรียบร้อย!')
        this.showModal = false
        await this.fetchUsers()
      } catch (error) {
        console.error('บันทึกไม่สำเร็จ', error)
      }
    },

    // ------------------------------------
    // ✨ ฟังก์ชันสำหรับ Modal 📊 ดูพัฒนาการ
    // ------------------------------------
    async openProgressModal(user) {
      this.selectedUser = user;
      try {
        // ยิงไปหลังบ้านเพื่อดึง HealthLogs ของ User คนนี้มา
        const response = await Api().get(`health-logs/${user.id}`);
        this.studentLogs = response.data;
        this.showProgressModal = true;
      } catch (error) {
        console.error('ไม่สามารถดึงข้อมูลประวัติได้:', error);
        alert('เกิดข้อผิดพลาดในการดึงประวัติพัฒนาการ');
      }
    },
    getBmiClass(bmi) {
      if (bmi < 18.5 || bmi > 25) return 'text-danger'
      return 'text-success'
    },

    formatDate(dateString) {
      if (!dateString) return 'ยังไม่เคยบันทึก'
      return new Date(dateString).toLocaleDateString('th-TH')
    },
    checkInactive(dateString) {
      if (!dateString) return 'text-danger'
      const lastUpdate = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - lastUpdate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 7 ? 'text-danger' : 'text-success'
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
/* ดีไซน์เดิมของน้อง */
.trainer-layout { background-color: #fdfaf6; min-height: 100vh; font-family: 'Kanit', sans-serif;}
.trainer-navbar { display: flex; justify-content: space-between; align-items: center; background-color: #d97706; color: white; padding: 15px 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);}
.nav-brand { font-size: 1.2rem; font-weight: bold; }
.btn-logout { background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;}

.trainer-content { padding: 30px; max-width: 1000px; margin: 0 auto; }
.header-section { margin-bottom: 20px; color: #92400e; }

.tabs { display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 2px solid #fde68a; padding-bottom: 10px;}
.tab-btn { background: none; border: none; font-size: 1.1rem; color: #9ca3af; cursor: pointer; padding: 10px 20px; border-radius: 8px; font-family: 'Kanit', sans-serif;}
.tab-btn.active { background-color: #fef3c7; color: #d97706; font-weight: bold; }

.user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.user-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-left: 5px solid #d97706;}
.card-header h3 { margin: 0 0 15px 0; color: #451a03;}
.card-body p { margin: 8px 0; font-size: 0.95rem; color: #4b5563; }

.text-danger { color: #dc2626; font-weight: bold; }
.text-success { color: #16a34a; font-weight: bold; }

/* ✨ เพิ่มจัด Layout 2 ปุ่มให้สวยงาม */
.card-actions-row {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}
.btn-primary { flex: 1; padding: 10px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.2s;}
.btn-primary:hover { background: #2563eb; }
.btn-info { flex: 1; padding: 10px; border: none; background: #8b5cf6; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.2s;}
.btn-info:hover { background: #7c3aed; }
.btn-success { width: 100%; padding: 10px; border: none; background: #10b981; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;}

.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 25px; border-radius: 12px; width: 90%; max-width: 500px; text-align: left; max-height: 80vh; overflow-y: auto;}
.large-modal { max-width: 650px; } /* ขยายกว้างขึ้นสำหรับตารางประวัติ */
.modal-content h3 { margin-top: 0; color: #d97706; }
.subtitle { font-size: 0.9rem; color: #666; margin-bottom: 15px; }
textarea { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-family: 'Kanit', sans-serif; resize: vertical; box-sizing: border-box;}
.modal-actions { display: flex; gap: 10px; margin-top: 20px; }
.btn-cancel { flex: 1; padding: 10px; background: #e5e7eb; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;}
.empty-state { text-align: center; color: #9ca3af; padding: 40px; font-size: 1.1rem; background: #f9fafb; border-radius: 12px; margin-top: 15px;}

/* ✨ ตารางดูประวัติ (ดึงสไตล์มาจากหน้า Member) */
.progress-container { margin-top: 15px; }
.history-table { width: 100%; border-collapse: collapse; background-color: white; border-radius: 8px; overflow: hidden; }
.history-table th, .history-table td { padding: 12px; text-align: center; border-bottom: 1px solid #f0f0f0; }
.history-table th { background-color: #fef3c7; color: #92400e; font-weight: 600; }
.history-table tr:hover { background-color: #fffbeb; }
</style>