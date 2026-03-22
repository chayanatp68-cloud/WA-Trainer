module.exports = {
    port: 8081,
    db: {
        database: 'watrainer-db',
        user: 'root',
        password: 'root',
        options: {
            dialect: 'sqlite',
            storage: './watrainer-db.sqlite'

        }
    }
}