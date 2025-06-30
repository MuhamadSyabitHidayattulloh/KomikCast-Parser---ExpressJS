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
            "filter": "/filter?status=ongoing&type=manga&orderby=popular&page=1",
            "filters": "/filters"
        }
    }
    ```

### 2. Daftar Filter Tersedia

Mengambil daftar semua filter yang tersedia untuk digunakan dalam endpoint filter.

-   **URL:** `/filters`
-   **Metode:** `GET`
-   **Contoh:** `http://localhost:3000/filters`
-   **Contoh Respons:**
    ```json
    {
        "success": true,
        "message": "Available filter options for KomikCast API",
        "data": {
            "status": [
                { "label": "All", "value": "" },
                { "label": "Ongoing", "value": "ongoing" },
                { "label": "Completed", "value": "completed" }
            ],
            "type": [
                { "label": "All", "value": "" },
                { "label": "Manga", "value": "manga" },
                { "label": "Manhwa", "value": "manhwa" },
                { "label": "Manhua", "value": "manhua" }
            ],
            "orderby": [
                { "label": "Default", "value": "" },
                { "label": "A-Z", "value": "titleasc" },
                { "label": "Z-A", "value": "titledesc" },
                { "label": "Latest Update", "value": "update" },
                { "label": "Most Popular", "value": "popular" }
            ],
            "genres": [
                { "label": "Action", "value": "action" },
                { "label": "Adventure", "value": "adventure" },
                { "label": "Comedy", "value": "comedy" },
                { "label": "Drama", "value": "drama" },
                { "label": "Fantasy", "value": "fantasy" },
                { "label": "Horror", "value": "horror" },
                { "label": "Romance", "value": "romance" },
                { "label": "Sci-Fi", "value": "sci-fi" },
                { "label": "Slice of Life", "value": "slice-of-life" },
                "... dan banyak lagi"
            ],
            "project": [
                { "label": "All Manga", "value": false },
                { "label": "Project Only", "value": true }
            ]
        },
        "usage": {
            "status": "Use status filter to filter by completion status",
            "type": "Use type filter to filter by manga origin (Japan/Korea/China)",
            "orderby": "Use orderby filter to sort results",
            "genres": "Use genres filter with comma-separated values. Prefix with \"-\" to exclude (e.g., \"action,-comedy\")",
            "project": "Use project filter to show only project manga"
        }
    }
    ```

### 3. Manga Populer

Mengambil daftar manga populer.

-   **URL:** `/popular`
-   **Metode:** `GET`
-   **Query Parameters:**
    -   `page` (opsional): Nomor halaman (default: 1)
-   **Contoh:** `http://localhost:3000/popular?page=1`

### 4. Update Manga Terbaru

Mengambil daftar update manga terbaru.

-   **URL:** `/latest`
-   **Metode:** `GET`
-   **Query Parameters:**
    -   `page` (opsional): Nomor halaman (default: 1)
-   **Contoh:** `http://localhost:3000/latest?page=1`

### 5. Cari Manga

Mencari manga berdasarkan query.

-   **URL:** `/search`
-   **Metode:** `GET`
-   **Query Parameters:**
    -   `q` (wajib): Kata kunci pencarian
    -   `page` (opsional): Nomor halaman (default: 1)
-   **Contoh:** `http://localhost:3000/search?q=one%20piece&page=1`

### 6. Detail Manga

Mengambil detail lengkap sebuah manga.

-   **URL:** `/manga/:slug`
-   **Metode:** `GET`
-   **URL Parameters:**
    -   `slug` (wajib): Slug manga (bagian dari URL manga setelah `/manga/`, contoh: `one-piece`)
-   **Contoh:** `http://localhost:3000/manga/one-piece`

### 7. Gambar Chapter

Mengambil daftar URL gambar untuk chapter tertentu.

-   **URL:** `/chapter/:slug/:chapterNumber`
-   **Metode:** `GET`
-   **URL Parameters:**
    -   `slug` (wajib): Slug manga
    -   `chapterNumber` (wajib): Nomor chapter (contoh: `100`, `100.5`)
-   **Contoh:** `http://localhost:3000/chapter/one-piece/1000`

### 8. Filter Manga

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




## Daftar Genre Lengkap

API ini mendukung lebih dari 70 genre manga yang berbeda. Berikut adalah daftar lengkap genre yang tersedia:

**Genre Utama:**
- Action, Adventure, Comedy, Drama, Fantasy, Horror, Romance, Sci-Fi, Slice of Life, Sports, Supernatural, Thriller

**Genre Demografis:**
- Shounen (untuk remaja laki-laki), Shoujo (untuk remaja perempuan), Seinen (untuk dewasa muda laki-laki), Josei (untuk dewasa muda perempuan)

**Genre Khusus:**
- Isekai (dunia lain), Martial Arts (seni bela diri), Mecha (robot), Magic (sihir), School Life (kehidupan sekolah), Harem, Reverse Harem

**Genre Mature:**
- Ecchi, Mature, Adult, Smut, Yaoi (Boys' Love), Yuri (Girls' Love)

**Genre Lainnya:**
- 4-Koma, Adaptation, Animals, Anthology, Award Winning, Bodyswap, Bully, Cartoon, Crime, Crossdressing, Delinquents, Demons, Full Color, Game, Gender Bender, Ghosts, Gore, Gyaru, Historical, Incest, Loli, Long Strip, Magical Girls, Medical, Military, Monster Girls, Monsters, Music, Mystery, Ninja, Office Workers, Oneshot, Philosophical, Police, Post-Apocalyptic, Psychological, Reincarnation, Samurai, Sexual Violence, Shota, Shoujo Ai, Shounen Ai, Superhero, Survival, Time Travel, Traditional Games, Tragedy, User Created, Vampires, Video Games, Villainess, Virtual Reality, Web Comic, Wuxia, Zombies

Untuk menggunakan genre dalam filter, gunakan nilai `value` yang sesuai (biasanya dalam format lowercase dengan tanda hubung). Contoh: `action`, `slice-of-life`, `boys-love`.


