import { defineStore } from 'pinia'

export const useAuthenStore = defineStore('authen', {
    state: () => ({
        token: null,
        user: null
    }),
    actions: {
        setToken(token) { this.token = token },
        setUser(user) { this.user = user },
        logout() {
            this.token = null
            this.user = null
        }
    },
    persist: true // สั่งให้จำไว้ใน Local Storage แม้จะปิด Browser ไป
})