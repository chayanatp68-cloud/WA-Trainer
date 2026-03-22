<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useAuthenStore } from './stores/authen'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const authenStore = useAuthenStore()
    const router = useRouter()

    const logout = () => {
      authenStore.logout() 
      router.push({ name: 'Login' }) 
    }

    return { authenStore, logout }
  }
}
</script>

<style>
/* Reset พื้นฐานไม่ให้มีขอบขาวกวนใจ */
body, html {
  margin: 0;
  padding: 0;
}
</style>