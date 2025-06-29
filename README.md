# KomikCast-Parser---ExpressJS

REST API untuk melakukan parsing data dari KomikCast menggunakan Express.js, Cheerio, dan Axios.

## Fitur

- Mengambil daftar manga populer
- Mengambil daftar update manga terbaru
- Mencari manga berdasarkan query
- Mengambil detail lengkap sebuah manga (judul, deskripsi, genre, status, daftar chapter)
- Mengambil daftar gambar untuk chapter tertentu
- Filter manga berdasarkan status, tipe, urutan, dan genre

## Teknologi yang Digunakan

- **Node.js**: Lingkungan runtime JavaScript.
- **Express.js**: Framework web untuk Node.js, digunakan untuk membangun REST API.
- **Axios**: Klien HTTP berbasis Promise untuk membuat permintaan ke situs KomikCast.
- **Cheerio**: Implementasi inti dari jQuery yang dirancang untuk server, digunakan untuk parsing HTML.
- **CORS**: Middleware Express.js untuk mengaktifkan Cross-Origin Resource Sharing.

## Instalasi

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

1.  **Clone repositori ini:**
    ```bash
    git clone https://github.com/MuhamadSyabitHidayattulloh/KomikCast-Parser---ExpressJS.git
    ```

2.  **Masuk ke direktori proyek:**
    ```bash
    cd KomikCast-Parser---ExpressJS
    ```

3.  **Instal dependensi:**
    ```bash
    npm install
    ```

## Cara Menjalankan

Untuk memulai server API, jalankan perintah berikut:

```bash
node app.js
# Atau jika Anda ingin menjalankannya di background dan melihat log:
nohup node app.js > server.log 2>&1 &
```

Server akan berjalan di `http://localhost:3000` secara default.

## Endpoint API

Berikut adalah daftar endpoint yang tersedia:

### 1. Root Endpoint

Menampilkan informasi dasar API dan daftar endpoint yang tersedia.

-   **URL:** `/`
-   **Metode:** `GET`
-   **Contoh Respons:**
    ```json
    {
        "message": "KomikCast API",
        "version": "1.0.0",
        "endpoints": {
            "popular": "/popular?page=1",
            "latest": "/latest?page=1",
            "search": "/search?q=naruto&page=1",
            "manga_detail": "/manga/:slug",
            "chapter_images": "/chapter/:slug/:chapterNumber",
            "filter": "/filter?status=ongoing&type=manga&orderby=popular&page=1"
        }
    }
    ```

### 2. Manga Populer

Mengambil daftar manga populer.

-   **URL:** `/popular`
-   **Metode:** `GET`
-   **Query Parameters:**
    -   `page` (opsional): Nomor halaman (default: 1)
-   **Contoh:** `http://localhost:3000/popular?page=1`

### 3. Update Manga Terbaru

Mengambil daftar update manga terbaru.

-   **URL:** `/latest`
-   **Metode:** `GET`
-   **Query Parameters:**
    -   `page` (opsional): Nomor halaman (default: 1)
-   **Contoh:** `http://localhost:3000/latest?page=1`

### 4. Cari Manga

Mencari manga berdasarkan query.

-   **URL:** `/search`
-   **Metode:** `GET`
-   **Query Parameters:**
    -   `q` (wajib): Kata kunci pencarian
    -   `page` (opsional): Nomor halaman (default: 1)
-   **Contoh:** `http://localhost:3000/search?q=one%20piece&page=1`

### 5. Detail Manga

Mengambil detail lengkap sebuah manga.

-   **URL:** `/manga/:slug`
-   **Metode:** `GET`
-   **URL Parameters:**
    -   `slug` (wajib): Slug manga (bagian dari URL manga setelah `/manga/`, contoh: `one-piece`)
-   **Contoh:** `http://localhost:3000/manga/one-piece`

### 6. Gambar Chapter

Mengambil daftar URL gambar untuk chapter tertentu.

-   **URL:** `/chapter/:slug/:chapterNumber`
-   **Metode:** `GET`
-   **URL Parameters:**
    -   `slug` (wajib): Slug manga
    -   `chapterNumber` (wajib): Nomor chapter (contoh: `100`, `100.5`)
-   **Contoh:** `http://localhost:3000/chapter/one-piece/1000`

### 7. Filter Manga

Memfilter manga berdasarkan berbagai kriteria.

-   **URL:** `/filter`
-   **Metode:** `GET`
-   **Query Parameters:**
    -   `page` (opsional): Nomor halaman (default: 1)
    -   `status` (opsional): `ongoing` atau `completed`
    -   `type` (opsional): `manga`, `manhwa`, atau `manhua`
    -   `orderby` (opsional): `titleasc` (A-Z), `titledesc` (Z-A), `update`, atau `popular`
    -   `genres` (opsional): Daftar slug genre yang dipisahkan koma (contoh: `action,fantasy`). Untuk mengecualikan genre, tambahkan `-` di depannya (contoh: `action,-comedy`).
    -   `project` (opsional): `true` jika ingin memfilter dari halaman proyek (default: `false`)
-   **Contoh:** `http://localhost:3000/filter?status=ongoing&type=manga&orderby=popular&genres=action,fantasy&page=1`

## Pengujian

Untuk menjalankan suite pengujian otomatis, pastikan server API sedang berjalan, lalu jalankan perintah:

```bash
node test.js
```

Ini akan menguji endpoint utama dan memberikan laporan hasil.

## Kontribusi

Kontribusi sangat dihargai! Jika Anda menemukan bug atau memiliki saran fitur, silakan buka issue atau kirim pull request.

## Lisensi

Proyek ini dilisensikan di bawah lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut. (Catatan: File LICENSE belum dibuat, ini adalah placeholder.)

---

**Catatan Penting:**

-   **Perubahan Struktur Situs:** Situs web KomikCast dapat mengubah struktur HTML mereka kapan saja. Jika ini terjadi, parser mungkin perlu diperbarui.
-   **Penggunaan Bertanggung Jawab:** Gunakan API ini secara bertanggung jawab dan hindari membuat terlalu banyak permintaan dalam waktu singkat untuk mencegah pemblokiran IP Anda oleh situs target.


