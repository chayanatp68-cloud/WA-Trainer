<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Welcome Back</h2>
        <p>ยินดีต้อนรับกลับเข้าสู่ระบบ</p>
      </div>

      <transition name="fade">
        <div class="alert error" v-if="error">{{ error }}</div>
      </transition>

      <form @submit.prevent="onLogin" class="auth-form">
        <div class="input-group">
          <label>อีเมล</label>
          <input type="email" v-model="email" placeholder="กรอกอีเมลของคุณ" required />
        </div>

        <div class="input-group">
          <label>รหัสผ่าน</label>
          <input type="password" v-model="password" placeholder="กรอกรหัสผ่าน" required />
        </div>

        <button type="submit" class="btn-submit">เข้าสู่ระบบ</button>
      </form>

      <div class="auth-footer">
        ยังไม่ได้เป็นสมาชิก? <router-link to="/register">สมัครสมาชิกฟรี</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import AuthenService from '../services/AuthenService'
import { useAuthenStore } from '../stores/authen'

export default {
  data() {
    return { 
      email: '', 
      password: '', 
      error: null 
    }
  },
  methods: {
    async onLogin() {
      this.error = null
      try {
        const authenStore = useAuthenStore()
        const response = await AuthenService.login({
          email: this.email,
          password: this.password
        })

        // 1. เก็บข้อมูลลง Store ตามปกติ
        const user = response.data.user
        authenStore.setToken(response.data.token)
        authenStore.setUser(user)

        // 2. ตรวจสอบประเภทผู้ใช้ (Role-based Redirect)
        if (user.type === 'member') {
          // ถ้าเป็นสมาชิก เด้งไปหน้า MemberHome
          this.$router.push({ name: 'MemberHome' }) 
        } else if (user.type === 'admin') {
          // ถ้าเป็นแอดมิน ให้เด้งไปหน้า Admin Dashboard
          this.$router.push({ name: 'AdminDashboard' }) 
        } else if (user.type === 'trainer') {
          // ✨ เพิ่มทางแยกใหม่: ถ้าเป็น Trainer ให้เด้งไปหน้า TrainerHome สีส้มทองของเรา!
          this.$router.push({ name: 'TrainerHome' }) 
        } else {
          // เผื่อมี Type อื่นหลุดมา
          this.$router.push({ name: 'Users' }) 
        }

      } catch (err) {
        // ป้องกันแอปพังเวลา err.response ไม่มีค่า
        this.error = err.response?.data?.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือเชื่อมต่อเซิร์ฟเวอร์ไม่ได้'
        console.error('Login Error:', err)
      }
    }
  }
}
</script>