# Tugas

### Pertemuan Sebelumnya

1. deploy webapp aplikasi task-manager ke `vercel`
1. deploy service task manager menggunakan orkestrasi `docker-compose`
1. push docker image dari service ke registry masing-masing kelompok

### Pertemuan 22

1. ganti bentuk logger dari console.log (dan sejenisnya) dengan winston, yang bentuknya info outputnya console saja, yang bentuknya error output nya console dan file, attachfile .log pada saat PR
1. implementasi sentry di frontend, trigger satu error, sertakan screenshot (1 saja) di PR
1. implementasi jaeger untuk semua endpoint di service worker, service task, performance service dengan ketentuan span sebagai berikut

- proses get data dari body (parsing)
- error (log, tag)
- process ke database
- process encoding dari hasil output database ke response
- hasil span process nya di screenshoot, cantumkan pada saat PR (on confirmed)

url deployment dari vercel tolong dicantumkan di PR
