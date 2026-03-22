<template>
  <div>
    <button class="btn-logout" @click="logout" style="background: red; color: white; padding: 10px; cursor: pointer;">
      🚪 ออกจากระบบ (ฉุกเฉิน)
    </button>
    
    <h2>รายชื่อสมาชิกฟิตเนสทั้งหมด</h2>
    <div v-if="users.length">
      <p>จำนวนสมาชิก: {{ users.length }} คน</p>
      <table border="1" style="width: 80%; margin: 0 auto;">
        <thead>
          <tr>
            <th>ชื่อ-นามสกุล</th>
            <th>อีเมล</th>
            <th>ประเภท</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }} {{ user.lastname }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.type }}</td>
            <td>
              <button @click="navigateTo('/User/edit/' + user.id)">แก้ไข</button>
              <button @click="deleteUser(user)">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>ยังไม่มีสมาชิกในระบบ...</p>
    </div>
  </div>
</template>

<script>
import UsersService from '../../services/UsersService'
import { useAuthenStore } from '../../stores/authen' // ✨ 1. ดึง Store มาใช้ล้างค่า

export default {
  data() {
    return {
      users: []
    }
  },
  async created() {
    try {
      this.users = (await UsersService.index()).data
    } catch (error) {
      console.log('ดึงข้อมูลไม่สำเร็จ:', error)
    }
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path)
    },
    async deleteUser(user) {
      let result = confirm("คุณแน่ใจนะว่าจะลบสมาชิกคนนี้?")
      if (result) {
        try {
          await UsersService.delete(user)
          this.users = (await UsersService.index()).data
        } catch (error) {
          console.log(error)
        }
      }
    },
    // ✨ 2. เพิ่มฟังก์ชันล็อกเอาท์ เพื่อให้ปุ่มใช้งานได้จริง
    logout() {
      const authenStore = useAuthenStore()
      authenStore.setToken('')
      authenStore.setUser({})
      this.$router.push('/login')
    }
  }
}
</script>