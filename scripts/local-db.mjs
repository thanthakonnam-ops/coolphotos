// Runs a PostgreSQL server for local development — no installation needed.
// Data is kept in ./.pgdata between runs. Usage: npm run db:local (Ctrl+C to stop)
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'fs'

const dataDir = './.pgdata'
const firstRun = !existsSync(dataDir)

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'postgres',
  port: 5432,
  persistent: true
})

if (firstRun) await pg.initialise()
await pg.start()
if (firstRun) {
  await pg.createDatabase('coolphotos')
  console.log('🆕 สร้างฐานข้อมูลใหม่แล้ว — เปิดอีกหน้าต่างแล้วรัน: npm run db:migrate && npm run db:seed')
}
console.log('🐘 PostgreSQL พร้อมใช้งานที่ localhost:5432 (กด Ctrl+C เพื่อหยุด)')

const stop = async () => {
  await pg.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
