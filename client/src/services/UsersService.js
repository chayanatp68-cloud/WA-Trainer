import Api from './Api'

export default {
    index(search) { // รับค่า search เข้ามา [cite: 174]
        return Api().get('users', {
            params: {
                search: search // แนบไปกับ URL parameters [cite: 177]
            }
        })
    },
    show(userId) {
        return Api().get('user/' + userId)
    },
    post(user) {
        return Api().post('user', user)
    },
    put(user) {
        return Api().put('user/' + user.id, user)
    },
    delete(user) {
        return Api().delete('user/' + user.id)
    },
    getSlipLogs(userId) {
        return Api().get('slip-logs/' + userId)
    },
    approve(userId, days) {
        return Api().put('user/approve/' + userId, { days: days })
    },
}