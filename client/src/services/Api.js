import axios from 'axios'

export default () => {
    return axios.create({
        baseURL: 'http://localhost:8081/' // ชี้ไปที่เซิร์ฟเวอร์ Node.js ของเรา 
    })
}