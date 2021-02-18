# Task Manager Service

- buat .tmrc
- buat .env

```bash
npm install
```
```bash
npm run web:dev
```
### untuk menjalankan service yang tidak perlu nodemon
```bash
npm run service:build
```
```bash
npm run service:start worker/task/performance
```
### untuk menjalankan service yang perlu nodemon
- ganti exec pada file service/nodemon.json
```json
  "exec": "npm run service worker/task/performance"
```
```bash
npm run service:dev
```