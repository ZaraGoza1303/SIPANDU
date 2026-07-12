# API Documentation

Dokumentasi lengkap endpoint backend untuk keperluan integrasi Frontend.

**Base URL:** `http://localhost:8000/api` (development)
**Base format response (umum):**
```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

---

## Daftar Isi

1. [Auth](#1-auth)
2. [Pasien](#2-pasien)
3. [Pemeriksaan](#3-pemeriksaan)
4. [Dashboard](#4-dashboard)
5. [Rangkuman Endpoint](#5-rangkuman-endpoint)

---

## 1. Auth

### `POST /api/auth/login`

| | |
|---|---|
| **Auth** | ❌ Tidak perlu |
| **Format** | JSON |

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response sukses:**
```json
{
  "success": true,
  "data": {
    "jwt_token": "eyJhbGci..."
  },
  "message": "Login Berhasil"
}
```

---

## 2. Pasien

### `GET /api/pasien/all`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Query params** | `?page=1&limit=10&search=` |

> 📝 `search` mencari berdasarkan **nama** & **NIK** pasien

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "nik": "1234567890123456",
        "name": "Budi",
        "birth_date": "2020-01-15T00:00:00.000Z",
        "gender": "Laki-Laki",
        "mother_name": "Siti",
        "father_name": "Ahmad",
        "address": "Jl. Merdeka No. 1",
        "phone_parent": "08123456789",
        "picture": null,
        "posyandu_id": "...",
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "next_cursor": null,
    "meta": {
      "total_items": 50,
      "current_page": 1,
      "limit": 10,
      "total_pages": 5
    }
  },
  "message": "Berhasil menampilkan data pasien"
}
```

---

### `GET /api/pasien/all-today-patients`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Query params** | `?page=1&limit=10&search=` |

Mengambil pasien yang jadwal periksanya **hari ini saja**.

> 📝 Kalau hari ini tidak ada jadwal, response `items` akan berupa array kosong (`[]`)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "nik": "...",
        "name": "Budi",
        "birth_date": "...",
        "gender": "Laki-Laki",
        "mother_name": "Siti",
        "phone_parent": "08123456789",
        "examination": [{ "id": "..." }]
      }
    ],
    "next_cursor": null,
    "meta": {
      "total_items": "...",
      "current_page": "...",
      "limit": "...",
      "total_pages": "..."
    }
  },
  "message": "..."
}
```

---

### `GET /api/pasien/detail/:patient_id`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Path params** | `patient_id` (required) |

Contoh: `/api/pasien/detail/44444444-4444-4444-4444-444444444407`

Response sama seperti `/api/pasien/all`, tapi berupa **single object** (bukan array `items`).

---

### `POST /api/pasien/add`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Format** | `multipart/form-data` |

> 📝 Wajib pakai `multipart/form-data` karena ada upload gambar
> 📝 File gambar dicek berdasarkan **magic byte** (bukan cuma extension), jadi aman dari fake extension

**Fields:**

| Field | Type | Required | Keterangan |
|---|---|---|---|
| `nik` | string | ✅ | Min 16 karakter |
| `nik_parent` | string | ✅ | Min 16 karakter |
| `name` | string | ✅ | Nama pasien |
| `birth_date` | string (date) | ✅ | Format `YYYY-MM-DD` |
| `gender` | string | ✅ | `"Laki-Laki"` atau `"Perempuan"` |
| `mother_name` | string | ✅ | Nama ibu |
| `father_name` | string | ❌ | Boleh `null` |
| `address` | string | ✅ | Alamat |
| `phone_parent` | string | ✅ | Min 10 digit |
| `picture` | file | ❌ | jpg/jpeg/png, max 1MB |

---

### `PATCH /api/pasien/update/:patient_id`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Format** | `multipart/form-data` |
| **Path params** | `patient_id` (required) |

Contoh: `/api/pasien/update/44444444-4444-4444-4444-444444444407`

Field sama seperti `add`, tapi **semua opsional** (partial update):
- Field yang tidak dikirim → nilainya tetap (tidak berubah)
- Untuk ganti foto → kirim file `picture` baru
- Tidak kirim `picture` → foto lama tetap dipakai

---

### `DELETE /api/pasien/delete/:patient_id`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Path params** | `patient_id` (required) |

Contoh: `/api/pasien/delete/44444444-4444-4444-4444-444444444407`

Otomatis menghapus juga foto pasien dari Supabase storage.

**Response:**
```json
{
  "success": true,
  "message": "Patient berhasil dihapus"
}
```

---

## 3. Pemeriksaan

### `POST /api/pemeriksaan/add`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Format** | JSON |

> 📝 Backend otomatis menghitung umur (bulan) dari `birth_date`, Z-Score WHO, serta status stunting/wasting/underweight
> ⚠️ Error jika `patient_id` tidak ditemukan di posyandu yang sama
> ⚠️ `exam_date` cukup format `YYYY-MM-DD` (backend otomatis konversi)

**Request body:**
```json
{
  "exam_date": "2026-06-29",
  "patient_id": "uuid-pasien",
  "user_id": "uuid-user",
  "weight": 8.5,
  "height": 72.0,
  "head_circumference": 44.0,
  "arm_circumference": 14.5,
  "notes": "Sehat"
}
```

**Fields:**

| Field | Type | Required |
|---|---|---|
| `exam_date` | string (date) | ✅ Format `YYYY-MM-DD` |
| `patient_id` | string | ✅ |
| `user_id` | string | ✅ |
| `weight` | number | ✅ |
| `height` | number | ✅ |
| `head_circumference` | number | ✅ |
| `arm_circumference` | number | ✅ |
| `notes` | string \| null | ❌ |

> ℹ️ `age_months` tidak perlu dikirim — backend otomatis menghitung dari `birth_date` pasien

**Response — Status Field Values:**

| Field | Possible Values |
|---|---|
| `stunting_status` | `Normal` / `Stunted` / `SeverelyStunted` / `High` |
| `wasting_status` | `GiziBaikNormal` / `GiziKurangWasted` / `GiziBurukSeverelyWasted` / `BerisikoGiziLebih` |
| `underweight_status` | `BeratBadanNormal` / `BeratBadanKurang` / `BeratBadanSangatKurang` |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "examination_id": "...",
    "age_months": 18,
    "weight_for_age_zscore": -1.23,
    "height_for_age_zscore": -2.50,
    "weight_for_height_zscore": -0.45,
    "stunting_status": "Stunted",
    "wasting_status": "GiziBaikNormal",
    "underweight_status": "BeratBadanNormal"
  },
  "message": "Pemeriksaan berhasil ditambahkan"
}
```

---

### `PATCH /api/pemeriksaan/update/:exam_id`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Format** | JSON |
| **Path params** | `exam_id` (required) |

Contoh: `/api/pemeriksaan/update/44444444-4444-4444-4444-444444444408`

Field sama seperti `add`, tapi **semua opsional** (partial update). Backend akan **re-calculate Z-Score** berdasarkan data baru.

---

### `POST /api/pemeriksaan/schedule`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Format** | JSON |

**Request body:**
```json
{
  "scheduled_date": "2026-06-27",
  "time_start": "2026-06-27T08:00:00.000Z",
  "time_end": "2026-06-27T12:00:00.000Z",
  "status": "aktif"
}
```

---

## 4. Dashboard

### `GET /api/dashboard/stats`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPatients": 100,
    "totalExaminationsThisMonth": 45,
    "stuntingCount": 12,
    "normalCount": 30,
    "ageGroupDistribution": [
      { "range": "0-11 Bulan", "count": 20 },
      { "range": "12-23 Bulan", "count": 35 },
      { "range": "24-35 Bulan", "count": 25 },
      { "range": "36-47 Bulan", "count": 15 },
      { "range": "48-59 Bulan", "count": 5 }
    ]
  },
  "message": "Berhasil mengambil data dashboard"
}
```

---

### `GET /api/dashboard/trend-stunting`

| | |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Query params** | — |

Menampilkan trend stunting **6 bulan terakhir** per posyandu. Filter posyandu otomatis dari JWT.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "month": "Jun 2026",
      "total": 45,
      "stunting": 12,
      "percentage": 26.7
    }
  ],
  "message": "Berhasil mengambil data trend stunting"
}
```

**Field details:**

| Field | Type | Keterangan |
|---|---|---|
| `month` | string | Format `"Mon YYYY"` (Jan 2026, Feb 2026, ...) |
| `total` | number | Total pemeriksaan di bulan itu |
| `stunting` | number | Jumlah status `Stunted` + `SeverelyStunted` |
| `percentage` | number | Persentase `(stunting / total) * 100` — 1 desimal |

> 📝 Kalo 6 bulan terakhir kosong, balikin `data: []`

---

## 5. Rangkuman Endpoint

| Endpoint | Method | Format | Auth | ID via |
|---|---|---|---|---|
| `/api/auth/login` | POST | JSON | ❌ | — |
| `/api/pasien/all` | GET | Query | ✅ | — |
| `/api/pasien/all-today-patients` | GET | Query | ✅ | — |
| `/api/pasien/detail/:patient_id` | GET | Path | ✅ | `:patient_id` |
| `/api/pasien/add` | POST | Multipart | ✅ | — |
| `/api/pasien/update/:patient_id` | PATCH | Multipart | ✅ | `:patient_id` |
| `/api/pasien/delete/:patient_id` | DELETE | Path | ✅ | `:patient_id` |
| `/api/pemeriksaan/add` | POST | JSON | ✅ | — |
| `/api/pemeriksaan/update/:exam_id` | PATCH | JSON | ✅ | `:exam_id` |
| `/api/pemeriksaan/schedule` | POST | JSON | ✅ | — |
| `/api/dashboard/stats` | GET | — | ✅ | — |
| `/api/dashboard/trend-stunting` | GET | — | ✅ | — |
