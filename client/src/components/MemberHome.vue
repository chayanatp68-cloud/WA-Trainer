<template>
  <div class="member-layout">
    
    <nav class="member-navbar">
      <div class="nav-brand">💪 WA-Trainer | Member Area</div>
      <button class="btn-logout" @click="logout">ออกจากระบบ</button>
    </nav>

    <div class="container auth-container">
      <div class="auth-card member-dashboard">
        <div class="auth-header">
          <h2>สวัสดีคุณ {{ userName }}</h2>
          <p>WA-Trainer ฟิตเนสเรายินดีบริการครับ 🍃</p>
        </div>
        
        <div class="status-section">
          <div class="days-circle">
            <span class="days-num">{{ remainingDays }}</span>
            <span class="days-label">วันคงเหลือ</span>
          </div>
          <button class="btn-submit btn-renew" @click="handleRenew">
            ต่ออายุสมาชิก (แนบสลิป)
          </button>
        </div>

        <div v-if="showSlipModal" class="modal-backdrop">
          <div class="modal-card">
            <h3>แนบสลิปต่ออายุสมาชิก</h3>
            <p>อัพโหลดรูปสลิปธนาคารหรือสลิปโอนเงิน</p>

            <input type="file" accept="image/*" @change="onFileChange" />
            <div v-if="slipPreview" class="preview">
              <img :src="slipPreview" alt="Slip preview" />
            </div>

            <div class="buttons">
              <button class="btn-submit" @click="submitSlip" :disabled="!slipFile">ส่งสลิป</button>
              <button class="btn-cancel" @click="closeRenewModal">ยกเลิก</button>
            </div>
          </div>
        </div>

        <div class="health-grid">
          <div class="stat-box">
            <label>BMI ล่าสุด</label>
            <div class="value">{{ currentBMI }}</div>
          </div>
          <div class="stat-box">
            <label>น้ำหนัก (kg)</label>
            <div class="value">{{ user.weight || '-' }}</div>
          </div>
          <div class="stat-box">
            <label>ส่วนสูง (cm)</label>
            <div class="value">{{ user.height || '-' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="trainer-section auth-card">
      <h3>🧑‍🏫 ผู้ดูแลของคุณ</h3>
      <div v-if="!trainerName" class="empty-trainer">
        <p>⏳ รอการจัดสรรเทรนเนอร์ให้คุณ...</p>
        <small>ระบบกำลังหาเทรนเนอร์ที่เหมาะสมให้ครับ</small>
      </div>
      <div v-else>
        <p class="trainer-name"><strong>โค้ชประจำตัว:</strong> {{ trainerName }}</p>
        
        <div class="trainer-note-box">
          <h4>📝 แผนการฝึกและการกินจากโค้ช:</h4>
          <p v-if="user.trainer_note" class="note-text">{{ user.trainer_note }}</p>
          <p v-else class="text-muted">โค้ชยังไม่ได้สั่งการบ้าน ลุยออกกำลังกายตามปกติได้เลย!</p>
        </div>
      </div>
    </div>

    <div class="update-section auth-card" style="margin-top: 20px;">
      <h3>📝 อัปเดตข้อมูลร่างกายวันนี้</h3>
      <form @submit.prevent="saveHealth">
        <div class="row">
          <div class="input-group">
            <label>น้ำหนักใหม่ (kg)</label>
            <input type="number" step="0.1" v-model="form.weight" placeholder="เช่น 70.5" required />
          </div>
          <div class="input-group">
            <label>ส่วนสูงใหม่ (cm)</label>
            <input type="number" step="0.1" v-model="form.height" placeholder="เช่น 175" required />
          </div>
        </div>
        <button type="submit" class="btn-submit">บันทึกและคำนวณใหม่</button>
      </form>
      <p v-if="lastUpdated" class="timestamp">บันทึกล่าสุดเมื่อ: {{ lastUpdated }}</p>
    </div>
    
    <div class="history-section auth-card" style="margin-top: 20px;">
      <h3>📊 ประวัติการบันทึกร่างกาย</h3>
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
          <tr v-for="log in healthLogs" :key="log.id">
            <td>{{ new Date(log.createdAt).toLocaleDateString('th-TH') }}</td>
            <td>{{ log.weight }}</td>
            <td>{{ log.height }}</td>
            <td :class="getBmiClass(log.bmi)">{{ log.bmi }}</td>
          </tr>
          <tr v-if="healthLogs.length === 0">
            <td colspan="4">ยังไม่มีข้อมูลบันทึกในระบบ</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
import { useAuthenStore } from '../stores/authen'
import Api from '../services/Api'

export default {
  data() {
    return {
      healthLogs: [], 
      user: {},
      userName: '',
      trainerName: null, // ✨ เก็บชื่อเทรนเนอร์
      form: {
        weight: '',
        height: ''
      },
      lastUpdated: '',
      showSlipModal: false,
      slipFile: null,
      slipPreview: null
    }
  },
  computed: {
    remainingDays() {
      if (!this.user.member_end) return 0
      const end = new Date(this.user.member_end)
      const now = new Date()
      const diffTime = end - now
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    },
    currentBMI() {
      if (!this.user.weight || !this.user.height) return '-'
      const heightInMeters = this.user.height / 100
      const bmi = this.user.weight / (heightInMeters * heightInMeters)
      return bmi.toFixed(2)
    }
  },
  methods: {
    logout() {
      const authenStore = useAuthenStore()
      authenStore.setToken('')
      authenStore.setUser({})
      this.$router.push('/login')
    },

    // ✨ 2. ดึงข้อมูล User ล่าสุด เพื่อเช็คว่ามีโค้ชกดรับหรือยัง มีการบ้านใหม่ไหม
    async fetchFreshUserData() {
      try {
        const authenStore = useAuthenStore()
        const res = await Api().get('user/' + authenStore.user.id)
        this.user = res.data
        
        // ถ้ามีรหัสเทรนเนอร์ ให้ไปดึงชื่อเทรนเนอร์มาโชว์
        if (this.user.trainer_id) {
          const trainerRes = await Api().get('user/' + this.user.trainer_id)
          this.trainerName = trainerRes.data.name + ' ' + trainerRes.data.lastname
        }
      } catch (err) {
        console.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้:', err)
      }
    },

    async fetchLogs() {
      try {
        const response = await Api().get(`health-logs/${this.user.id}`)
        this.healthLogs = response.data
      } catch (err) {
        console.error('ไม่สามารถดึงข้อมูลประวัติได้:', err)
      }
    },

    async saveHealth() {
      try {
        const hMeter = this.form.height / 100
        const bmiValue = (this.form.weight / (hMeter * hMeter)).toFixed(2) 

        // 1. สร้างประวัติสุขภาพใหม่
        const payload = {
          userId: this.user.id,
          weight: this.form.weight,
          height: this.form.height,
          bmi: bmiValue
        }
        await Api().post('health-log', payload)

        // ✨ 2. อัปเดตวันที่ชั่งน้ำหนักล่าสุด (last_weight_update) ลงตาราง User
        // เพื่อให้หน้าจอฝั่ง Trainer ไม่แจ้งเตือนสีแดง
        await Api().put('user/' + this.user.id, {
          weight: this.form.weight,
          height: this.form.height,
          last_weight_update: new Date()
        })
        
        this.form.weight = ''
        this.form.height = ''
        
        // รีโหลดข้อมูลทั้งหมดให้หน้าจออัปเดต
        await this.fetchFreshUserData()
        await this.fetchLogs() 
        
        alert('บันทึกข้อมูลเรียบร้อยแล้วครับ!')
      } catch (err) {
        console.error(err)
        alert('เกิดข้อผิดพลาดในการบันทึก')
      }
    },

    handleRenew() {
      this.showSlipModal = true
    },
    closeRenewModal() {
      this.showSlipModal = false
      this.slipFile = null
      this.slipPreview = null
    },
    onFileChange(event) {
      const file = event.target.files[0]
      if (!file) return
      this.slipFile = file
      this.slipPreview = URL.createObjectURL(file)
    },
    async submitSlip() {
      if (!this.slipFile) {
        alert('กรุณาเลือกไฟล์สลิปก่อน')
        return
      }

      try {
        const formData = new FormData()
        formData.append('slip', this.slipFile)
        formData.append('userId', this.user.id)

        await Api().post('membership-renewal', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        alert('ส่งสลิปเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบ')
        this.closeRenewModal()
      } catch (err) {
        console.error('ส่งสลิปไม่สำเร็จ', err)
        alert('เกิดข้อผิดพลาดในการส่งสลิป โปรดลองอีกครั้ง')
      }
    },

    getBmiClass(bmi) {
      if (bmi < 18.5 || bmi > 25) return 'bmi-warning'
      return 'bmi-normal'
    }
  },
  async created() {
    const authenStore = useAuthenStore()
    this.userName = authenStore.user.name
    
    // โหลดข้อมูลล่าสุด
    await this.fetchFreshUserData()
    await this.fetchLogs()
  }
}
</script>

<style scoped>
/* ดีไซน์ Navbar โทนสีเขียว */
.member-layout { min-height: 100vh; background-color: #f4f9f4; font-family: 'Kanit', sans-serif;}
.member-navbar { display: flex; justify-content: space-between; align-items: center; background-color: #42b983; color: white; padding: 15px 30px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.nav-brand { font-size: 1.2rem; font-weight: bold; }
.btn-logout { background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.3s; }
.btn-logout:hover { background: #c0392b; }

/* ✨ 3. ดีไซน์ส่วน Trainer Note */
.trainer-section { margin: 0 auto; max-width: 800px; padding: 25px; background-color: #ffffff; border-radius: 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border-top: 5px solid #d97706;}
.trainer-section h3 { margin-top: 0; color: #92400e; }
.empty-trainer { text-align: center; color: #9ca3af; padding: 20px; font-style: italic; }
.trainer-name { font-size: 1.1rem; color: #451a03; margin-bottom: 15px;}
.trainer-note-box { background-color: #fef3c7; padding: 15px 20px; border-radius: 10px; border-left: 4px solid #f59e0b; }
.trainer-note-box h4 { margin-top: 0; margin-bottom: 10px; color: #b45309; }
.note-text { white-space: pre-line; color: #451a03; line-height: 1.6;}
.text-muted { color: #6b7280; }

/* ดีไซน์เดิม */
.history-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.history-table th, .history-table td { padding: 12px; text-align: center; border-bottom: 1px solid #eee; }
.history-table th { background-color: #f9fdf9; color: #2d5a27; }
.history-table tr:hover { background-color: #f1f8f1; }
.bmi-normal { color: #2ecc71; font-weight: bold; }
.bmi-warning { color: #f1c40f; font-weight: bold; }
.bmi-danger { color: #e74c3c; font-weight: bold; }

.history-section { display: flex; flex-direction: column; align-items: center; margin: 20px auto; width: 95%; max-width: 800px; }
.history-table { width: 100%; border-collapse: collapse; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
.history-table th, .history-table td { padding: 15px; text-align: center; border-bottom: 1px solid #f0f0f0; }
.history-table th { background-color: #e8f5e9; color: #2e7d32; font-weight: 600; }

.modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-card { background: white; border-radius: 14px; padding: 20px; max-width: 420px; width: 90%; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); }
.modal-card .preview { margin-top: 10px; }
.modal-card .preview img { width: 100%; border-radius: 8px; margin-top: 10px; }
.modal-card .buttons { display: flex; justify-content: space-between; margin-top: 14px; }
.modal-card .btn-cancel { background: #ddd; color: #333; border: none; padding: 0.7rem 1rem; border-radius: 10px; cursor: pointer; }

.update-section { margin: 20px auto; max-width: 800px; padding: 25px; background-color: #ffffff; border-radius: 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
.update-section h3 { text-align: center; color: #2d5a27; margin-bottom: 20px; }
.update-section .row { display: flex; gap: 20px; justify-content: center; margin-bottom: 20px; }
.update-section .input-group { flex: 1; max-width: 200px; }
.update-section .btn-submit { display: block; width: 100%; max-width: 300px; margin: 0 auto; }
.timestamp { text-align: center; font-size: 0.9rem; color: #666; margin-top: 10px; }
</style>