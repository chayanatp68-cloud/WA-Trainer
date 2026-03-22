// client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthenStore } from '../stores/authen'
import Register from '../components/Users/Register.vue'
import Login from '../components/Login.vue'
import UserIndex from '../components/Users/Index.vue'
import MemberHome from '../components/MemberHome.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import TrainerHome from '../components/TrainerHome.vue'
const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/register',
            name: 'Register',
            component: Register
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/users',
            name: 'Users',
            component: UserIndex,
            meta: { requiresAuth: true }
        },
        {
            path: '/user/edit/:userId',
            name: 'user-edit',
            component: () =>
                import ('../components/Users/EditUser.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/member/home',
            name: 'MemberHome',
            component: MemberHome,
            // เพิ่ม meta เพื่อให้ "ยาม" ตรวจบัตรก่อนเข้าหน้านี้ด้วย
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/dashboard',
            name: 'AdminDashboard',
            component: AdminDashboard,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/trainer',
            name: 'TrainerHome',
            component: TrainerHome
        },
    ]
})

// --- ระบบ "ยามเฝ้าประตู" แบบใหม่ 
router.beforeEach((to, from) => {
    const authenStore = useAuthenStore()

    // กฎข้อ 1: ยังไม่ล็อกอิน ให้ไปหน้า Login
    if (to.meta.requiresAuth && !authenStore.token) {
        return { name: 'Login' }
    }

    // กฎข้อ 2: ตรวจสิทธิ์ Admin (ถ้าจะเข้าหน้า Admin แต่ type ไม่ใช่ admin ให้เตะกลับ)
    if (to.meta.requiresAdmin && authenStore.user && authenStore.user.type !== 'admin') {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ดูแลระบบเท่านั้น');
        return { name: 'MemberHome' };
    }

    // กฎข้อ 3: ล็อกอินแล้ว ห้ามเข้าหน้า Login/Register ซ้ำ
    if (authenStore.token && (to.name === 'Login' || to.name === 'Register')) {
        if (authenStore.user.type === 'admin') {
            return { name: 'AdminDashboard' } // แอดมินล็อกอินเสร็จ เด้งไป Dashboard
        } else if (authenStore.user.type === 'member') {
            return { name: 'MemberHome' }
        }
        return { name: 'Users' }
    }
})
export default router