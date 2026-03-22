<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Join WA-Trainer</h2>
        <p>เริ่มก้าวแรกสู่สุขภาพที่ดีกับเรา</p>
      </div>

      <transition name="fade">
        <div class="alert error" v-if="error">{{ error }}</div>
        <div class="alert success" v-else-if="success">{{ success }}</div>
      </transition>

      <form @submit.prevent="onRegister" class="auth-form">
        <div class="input-group">
          <label>อีเมล (Email)</label>
          <input 
            v-model="formData.email" 
            type="email" 
            placeholder="example@fitness.com" 
            required 
          />
        </div>

        <div class="input-group">
          <label>รหัสผ่าน (Password)</label>
          <input 
            v-model="formData.password" 
            type="password" 
            placeholder="รหัสผ่าน 6 ตัวขึ้นไป" 
            required 
          />
        </div>

        <div class="row">
          <div class="input-group">
            <label>ชื่อ (First Name)</label>
            <input 
              v-model="formData.name" 
              type="text" 
              placeholder="สมชาย" 
              required 
            />
          </div>
          <div class="input-group">
            <label>นามสกุล (Last Name)</label>
            <input 
              v-model="formData.lastname" 
              type="text" 
              placeholder="สายสตรอง" 
              required 
            />
          </div>
        </div>

        <div class="input-group">
          <label>ประเภทผู้ใช้งาน</label>
          <select v-model="formData.type">
            <option value="member">สมาชิกทั่วไป (Member)</option>
            <option value="trainer">เทรนเนอร์ (Trainer)</option>
          </select>
        </div>

        <button type="submit" class="btn-submit">สมัครสมาชิก</button>
      </form>

      <div class="auth-footer">
        มีบัญชีอยู่แล้ว? <router-link to="/Login">เข้าสู่ระบบที่นี่</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthenService from '../../services/AuthenService'

const router = useRouter()
const error = ref('')
const success = ref('')

const formData = ref({
  email: '',
  password: '',
  name: '',
  lastname: '',
  type: 'member'
})

const onRegister = async () => {
  error.value = ''
  success.value = ''
  
  try {
    await AuthenService.register(formData.value)
    success.value = 'ยินดีด้วย! สมัครสมาชิกสำเร็จแล้ว 🍃'
    
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.error || 'ข้อมูลไม่ถูกต้อง กรุณาลองใหม่'
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #f0f9f4; /* พื้นหลังเขียวอ่อนมากก */
  font-family: 'Kanit', sans-serif;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(119, 221, 119, 0.15);
  width: 100%;
  max-width: 450px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  color: #55a655; /* เขียวพาสเทลเข้ม */
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.auth-header p {
  color: #88bc88;
  font-size: 0.9rem;
}

.input-group {
  margin-bottom: 1.2rem;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.input-group input, .input-group select {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e8f5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #77dd77;
  box-shadow: 0 0 8px rgba(119, 221, 119, 0.3);
}

.row {
  display: flex;
  gap: 1rem;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background-color: #77dd77;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 1rem;
}

.btn-submit:hover {
  background-color: #66bb66;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #777;
}

.auth-footer a {
  color: #77dd77;
  text-decoration: none;
  font-weight: bold;
}

/* Alert Styles */
.alert {
  padding: 0.8rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.error {
  background-color: #fff0f0;
  color: #ff6b6b;
  border: 1px solid #ffdbdb;
}

.success {
  background-color: #f0fff4;
  color: #55a655;
  border: 1px solid #dcfce7;
}

/* Animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>