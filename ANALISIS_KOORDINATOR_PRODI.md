# Analisis Dashboard Koordinator Program Studi

## 1. Overview

Dashboard untuk Koordinator Program Studi dengan fitur upload dokumen, kelola dokumen, monitoring kelengkapan, dan simulasi penilaian.

## 2. Fitur-Fitur yang Diperlukan

### 2.1. Dashboard Overview

**Tujuan**: Menampilkan ringkasan progress akreditasi program studi

**Input**:

- User yang sedang login (untuk mendapatkan unit_id/program_id)
- Filter tahun (optional)

**Output**:

- Statistik dokumen (total, lengkap, belum lengkap, expired, salah format)
- Progress kelengkapan dokumen (%)
- Statistik penilaian dari asesor (total evaluasi, rata-rata skor)
- Rekap nilai akreditasi per kriteria
- Target akreditasi (target score, target grade)
- Notifikasi terbaru
- Grafik progress (line chart)
- Grafik distribusi status dokumen (pie chart)

**Controller Method**: `CoordinatorProdiController@index`

---

### 2.2. Upload Dokumen + Metadata

**Tujuan**: Upload dokumen dengan metadata lengkap

**Input**:

- File dokumen (PDF/DOC/DOCX, max 10MB)
- Metadata:
    - `program_id` (required)
    - `unit_id` (auto dari user)
    - `category` (required) - kategori dokumen
    - `year` (required) - tahun dokumen
    - `metadata` (optional) - JSON metadata tambahan:
        - `fakultas`
        - `prodi`
        - `dosen` (nama dosen terkait)
        - `tendik` (nama tendik terkait)
        - `description`
- `assignment_id` (optional) - jika terkait dengan assignment tertentu

**Output**:

- Success message
- Document object dengan:
    - `id`
    - `file_name`
    - `file_path`
    - `file_size`
    - `file_type`
    - `category`
    - `year`
    - `metadata`
    - `uploaded_at`
    - `status`

**Controller Method**: `CoordinatorProdiController@storeDocument`

**Validation Rules**:

- `file`: required|file|mimes:pdf,doc,docx|max:10240
- `program_id`: required|exists:programs,id
- `category`: required|string|max:255
- `year`: required|integer|min:2020|max:2030
- `metadata`: nullable|array

**File Storage**:

- Storage disk: `local` (storage/app/private)
- Path structure: `documents/{unit_id}/{program_id}/{year}/{filename}`
- File naming: `{timestamp}_{original_filename}` atau UUID
- Store file using: `Storage::disk('local')->put($path, $file)`
- Set `file_path` in database to relative path

---

### 2.3. Daftar Dokumen Unit

**Tujuan**: Menampilkan daftar dokumen dengan filter

**Input** (Query Parameters):

- `category` (optional) - filter kategori
- `status` (optional) - filter status validasi (pending, validated, rejected, expired)
- `year` (optional) - filter tahun
- `search` (optional) - pencarian nama file
- `page` (optional) - pagination
- `per_page` (optional) - items per page (default: 15)

**Output**:

- Paginated documents dengan:
    - `id`
    - `file_name`
    - `category`
    - `year`
    - `file_size`
    - `status`
    - `validated_at`
    - `validated_by` (user name)
    - `rejected_at`
    - `rejection_notes`
    - `uploaded_at`
    - `metadata`
- Filter options (categories, statuses, years)
- Statistics (total, by status)

**Controller Method**: `CoordinatorProdiController@documents`

---

### 2.4. Laporan Kelengkapan Dokumen

**Tujuan**: Menampilkan laporan otomatis kelengkapan dokumen

**Input** (Query Parameters):

- `program_id` (optional) - filter program
- `year` (optional) - filter tahun
- `format` (optional) - export format (html, pdf)

**Output**:

- Summary:
    - Total dokumen yang dibutuhkan
    - Dokumen yang sudah lengkap
    - Dokumen yang belum lengkap
    - Persentase kelengkapan
- Detail per kriteria:
    - Kriteria name
    - Dokumen yang dibutuhkan
    - Dokumen yang sudah ada
    - Status (lengkap/belum lengkap)
    - Missing documents list
- Per standard:
    - Standard name
    - Total criteria
    - Completed criteria
    - Completion percentage

**Controller Method**: `CoordinatorProdiController@documentCompleteness`

---

### 2.5. Notifikasi Pengingat ke Dosen/Tendik

**Tujuan**: Mengirim notifikasi pengingat ke dosen/tendik

**Input**:

- `document_id` (optional) - jika terkait dokumen tertentu
- `recipient_type` (required) - 'dosen' atau 'tendik'
- `recipient_ids` (required) - array employee IDs
- `message` (optional) - custom message
- `channel` (optional) - 'email', 'whatsapp', atau 'both' (default: 'both')

**Output**:

- Success message
- Notification objects yang dibuat

**Controller Method**: `CoordinatorProdiController@sendReminder`

**Validation Rules**:

- `recipient_type`: required|in:dosen,tendik
- `recipient_ids`: required|array
- `recipient_ids.*`: required|exists:employees,id
- `message`: nullable|string|max:500
- `channel`: nullable|in:email,whatsapp,both

---

### 2.6. Statistik Penilaian dari Asesor

**Tujuan**: Menampilkan statistik penilaian yang diberikan asesor

**Input** (Query Parameters):

- `program_id` (optional) - filter program
- `criteria_id` (optional) - filter kriteria
- `assessor_id` (optional) - filter asesor
- `year` (optional) - filter tahun

**Output**:

- Summary statistics:
    - Total evaluasi
    - Rata-rata skor
    - Skor tertinggi
    - Skor terendah
    - Total criteria yang sudah dinilai
    - Total criteria yang belum dinilai
- Per criteria:
    - Criteria name
    - Total evaluations
    - Average score
    - Max score
    - Evaluations count
- Per assessor:
    - Assessor name
    - Total evaluations
    - Average score given
- Chart data:
    - Score distribution (histogram)
    - Progress per criteria (bar chart)
    - Timeline evaluations (line chart)

**Controller Method**: `CoordinatorProdiController@assessmentStatistics`

---

### 2.7. Simulasi Penilaian

**Tujuan**: Simulasi penilaian berdasarkan standar BAN-PT/LAM

**Input** (Query Parameters):

- `program_id` (required)
- `year` (optional) - tahun simulasi

**Output**:

- Simulated scores per standard:
    - Standard name
    - Weight
    - Simulated score
    - Max score
    - Percentage
- Simulated scores per criteria:
    - Criteria name
    - Weight
    - Simulated score
    - Max score
    - Percentage
    - Based on: (document completeness, existing evaluations, atau default)
- Total simulated score
- Simulated grade (Unggul, Sangat Baik, Baik, Kurang)
- Comparison dengan target akreditasi
- Gap analysis:
    - Gap score
    - Recommendations

**Controller Method**: `CoordinatorProdiController@simulation`

**Logic**:

1. Ambil semua standards dan criteria untuk program
2. Untuk setiap criteria:
    - Jika ada evaluations dari assessor, gunakan rata-rata score
    - Jika tidak ada evaluations, hitung berdasarkan:
        - Document completeness (jika dokumen lengkap = max_score \* 0.8)
        - Default: 0
3. Hitung weighted score per standard
4. Hitung total score
5. Tentukan grade berdasarkan skala BAN-PT/LAM

---

### 2.8. Poin Kriteria (Lihat Bobot/Standar)

**Tujuan**: Menampilkan poin kriteria dan bobotnya

**Input** (Query Parameters):

- `program_id` (required)
- `standard_id` (optional) - filter standard
- `criteria_id` (optional) - filter criteria

**Output**:

- Standards dengan:
    - `id`
    - `name`
    - `description`
    - `weight`
    - `order_index`
- Criteria per standard dengan:
    - `id`
    - `name`
    - `description`
    - `weight`
    - `order_index`
    - `criteria_points`: array of:
        - `id`
        - `title`
        - `description`
        - `max_score`
- Total weight summary

**Controller Method**: `CoordinatorProdiController@criteriaPoints`

---

### 2.9. Standar/Kriteria Akreditasi (Read Only)

**Tujuan**: Menampilkan standar dan kriteria akreditasi (read-only)

**Input** (Query Parameters):

- `program_id` (required)

**Output**:

- Program information
- Standards dengan criteria (nested structure)
- Read-only flag

**Controller Method**: `CoordinatorProdiController@standards`

---

### 2.10. Rekap Nilai / Poin Akreditasi (Per Kriteria)

**Tujuan**: Menampilkan rekap nilai akreditasi per kriteria

**Input** (Query Parameters):

- `program_id` (required)
- `year` (optional) - filter tahun
- `standard_id` (optional) - filter standard

**Output**:

- Summary:
    - Total score
    - Max possible score
    - Percentage
    - Grade
- Per standard:
    - Standard name
    - Weight
    - Total score
    - Max score
    - Percentage
- Per criteria:
    - Criteria name
    - Weight
    - Score (dari evaluations atau simulated)
    - Max score
    - Percentage
    - Evaluations count
    - Last evaluation date
- Chart data:
    - Score per criteria (bar chart)
    - Score per standard (bar chart)
    - Progress timeline

**Controller Method**: `CoordinatorProdiController@scoreRecap`

---

### 2.11. Set / Lihat Target Akreditasi

**Tujuan**: Set atau lihat target akreditasi

**Input** (untuk SET):

- `program_id` (required)
- `year` (required)
- `target_score` (required) - decimal
- `target_grade` (required) - enum: 'unggul', 'sangat_baik', 'baik'

**Output** (untuk GET):

- Current targets:
    - `id`
    - `program_id`
    - `program_name`
    - `year`
    - `target_score`
    - `target_grade`
    - `created_at`
    - `updated_at`
- History targets (jika ada)

**Controller Methods**:

- GET: `CoordinatorProdiController@getTargets`
- POST: `CoordinatorProdiController@setTarget`
- PUT: `CoordinatorProdiController@updateTarget`
- DELETE: `CoordinatorProdiController@deleteTarget`

**Validation Rules** (untuk SET):

- `program_id`: required|exists:programs,id
- `year`: required|integer|min:2020|max:2030
- `target_score`: required|numeric|min:0|max:400
- `target_grade`: required|in:unggul,sangat_baik,baik

---

## 3. Controller Structure

### 3.1. CoordinatorProdiController

```php
namespace App\Http\Controllers\Dashboard;

class CoordinatorProdiController extends Controller
{
    // Dashboard overview
    public function index(Request $request): Response

    // Documents management
    public function documents(Request $request): Response
    public function storeDocument(StoreDocumentRequest $request): RedirectResponse
    public function updateDocument(UpdateDocumentRequest $request, string $id): RedirectResponse
    public function deleteDocument(string $id): RedirectResponse
    public function downloadDocument(string $id): Response

    // Document completeness report
    public function documentCompleteness(Request $request): Response

    // Notifications
    public function sendReminder(SendReminderRequest $request): RedirectResponse

    // Statistics
    public function assessmentStatistics(Request $request): Response

    // Simulation
    public function simulation(Request $request): Response

    // Criteria points
    public function criteriaPoints(Request $request): Response

    // Standards (read-only)
    public function standards(Request $request): Response

    // Score recap
    public function scoreRecap(Request $request): Response

    // Targets
    public function getTargets(Request $request): Response
    public function setTarget(SetTargetRequest $request): RedirectResponse
    public function updateTarget(UpdateTargetRequest $request, string $id): RedirectResponse
    public function deleteTarget(string $id): RedirectResponse
}
```

---

## 4. Routes Structure

```php
Route::middleware(['auth'])->group(function () {
    Route::prefix('coordinator-prodi')->name('coordinator-prodi.')->group(function () {
        // Dashboard
        Route::get('/', [CoordinatorProdiController::class, 'index'])->name('index');

        // Documents
        Route::get('/documents', [CoordinatorProdiController::class, 'documents'])->name('documents.index');
        Route::post('/documents', [CoordinatorProdiController::class, 'storeDocument'])->name('documents.store');
        Route::put('/documents/{id}', [CoordinatorProdiController::class, 'updateDocument'])->name('documents.update');
        Route::delete('/documents/{id}', [CoordinatorProdiController::class, 'deleteDocument'])->name('documents.delete');
        Route::get('/documents/{id}/download', [CoordinatorProdiController::class, 'downloadDocument'])->name('documents.download');

        // Document completeness
        Route::get('/reports/completeness', [CoordinatorProdiController::class, 'documentCompleteness'])->name('reports.completeness');

        // Notifications
        Route::post('/notifications/reminder', [CoordinatorProdiController::class, 'sendReminder'])->name('notifications.reminder');

        // Statistics
        Route::get('/statistics/assessment', [CoordinatorProdiController::class, 'assessmentStatistics'])->name('statistics.assessment');

        // Simulation
        Route::get('/simulation', [CoordinatorProdiController::class, 'simulation'])->name('simulation');

        // Criteria points
        Route::get('/criteria-points', [CoordinatorProdiController::class, 'criteriaPoints'])->name('criteria-points');

        // Standards
        Route::get('/standards', [CoordinatorProdiController::class, 'standards'])->name('standards');

        // Score recap
        Route::get('/score-recap', [CoordinatorProdiController::class, 'scoreRecap'])->name('score-recap');

        // Targets
        Route::get('/targets', [CoordinatorProdiController::class, 'getTargets'])->name('targets.index');
        Route::post('/targets', [CoordinatorProdiController::class, 'setTarget'])->name('targets.store');
        Route::put('/targets/{id}', [CoordinatorProdiController::class, 'updateTarget'])->name('targets.update');
        Route::delete('/targets/{id}', [CoordinatorProdiController::class, 'deleteTarget'])->name('targets.delete');
    });
});
```

---

## 5. Model Relationships yang Digunakan

### User Model

- `user->unit()` - Unit yang dimiliki user
- `user->rolesForUnit($unitId)` - Roles untuk unit tertentu

### Document Model

- `document->unit()` - Unit pemilik dokumen
- `document->program()` - Program terkait
- `document->uploadedBy()` - User yang upload
- `document->validatedBy()` - User yang validasi
- `document->assignment()` - Assignment terkait

### Program Model

- `program->standards()` - Standards untuk program
- `program->akreditasiTargets()` - Target akreditasi

### Standard Model

- `standard->program()` - Program pemilik
- `standard->criteria()` - Criteria dalam standard

### Criterion Model

- `criterion->standard()` - Standard pemilik
- `criterion->criteriaPoints()` - Poin-poin kriteria
- `criterion->assignments()` - Assignments untuk kriteria

### Assignment Model

- `assignment->criterion()` - Kriteria yang di-assign
- `assignment->assessor()` - User asesor
- `assignment->evaluations()` - Evaluasi yang diberikan

### Evaluation Model

- `evaluation->assignment()` - Assignment terkait
- `evaluation->criteriaPoint()` - Poin kriteria yang dinilai

### AkreditasiTarget Model

- `akreditasiTarget->program()` - Program terkait

---

## 6. Frontend Pages Structure

```
resources/js/pages/Dashboard/CoordinatorProdi/
├── Index.tsx                    # Dashboard overview
├── Documents/
│   ├── Index.tsx               # Daftar dokumen
│   ├── Create.tsx              # Upload dokumen
│   └── Edit.tsx                # Edit dokumen metadata
├── Reports/
│   └── Completeness.tsx        # Laporan kelengkapan
├── Statistics/
│   └── Assessment.tsx          # Statistik penilaian
├── Simulation/
│   └── Index.tsx               # Simulasi penilaian
├── CriteriaPoints/
│   └── Index.tsx               # Poin kriteria
├── Standards/
│   └── Index.tsx               # Standar/kriteria (read-only)
├── ScoreRecap/
│   └── Index.tsx               # Rekap nilai
└── Targets/
    ├── Index.tsx               # Lihat target
    └── Create.tsx              # Set target
```

---

## 7. Authorization & Middleware

### Role Check

- User harus memiliki role "Koordinator Prodi" untuk unit tertentu
- Role name di database: `"Koordinator Prodi"` atau `"coordinator-prodi"` (perlu dicek)
- User hanya bisa mengakses dokumen dari unit mereka sendiri
- Middleware: Custom middleware atau check di controller

### Unit Restriction

- Semua query harus di-filter berdasarkan `user->unit_id`
- User tidak bisa mengakses data dari unit lain
- Program yang bisa diakses harus terkait dengan unit user

### Helper Methods yang Perlu Dibuat

**Di User Model atau Trait:**

```php
// Check if user has coordinator role for a unit
public function isCoordinatorProdi(?string $unitId = null): bool
{
    $unitId = $unitId ?? $this->unit_id;

    return $this->rolesForUnit($unitId)
        ->where('name', 'Koordinator Prodi')
        ->exists();
}

// Get programs accessible by coordinator
public function accessiblePrograms(): Builder
{
    // Get programs where user's unit is related
    // This depends on how Program relates to Unit
    // Might need to check Program->fakultas matches Unit->name
    // or Program has unit_id field
}
```

**Di Controller:**

```php
// Check authorization in each method
protected function authorizeCoordinatorProdi(): void
{
    if (!$this->user()->isCoordinatorProdi()) {
        abort(403, 'Unauthorized. Only Koordinator Prodi can access this.');
    }
}

// Get user's unit programs
protected function getUserPrograms(): Collection
{
    $user = auth()->user();
    // Logic to get programs for user's unit
    // This depends on Program-Unit relationship
}
```

---

## 8. Dependencies

### Services yang Digunakan

- `NotificationService` - untuk mengirim notifikasi
- `ReportService` - untuk generate laporan (jika diperlukan)

### Jobs yang Digunakan

- `SendEmailNotification` - untuk email notification
- `SendWhatsAppNotification` - untuk WhatsApp notification

---

## 9. Database Queries & Performance

### Eager Loading

Gunakan eager loading untuk menghindari N+1 queries:

```php
// Documents dengan relations
Document::with(['unit', 'program', 'uploadedBy', 'validatedBy'])
    ->where('unit_id', $user->unit_id)
    ->get();

// Programs dengan standards dan criteria
Program::with(['standards.criteria.criteriaPoints', 'akreditasiTargets'])
    ->where(...)
    ->get();

// Assignments dengan evaluations
Assignment::with(['criterion.standard.program', 'assessor', 'evaluations.criteriaPoint'])
    ->where('unit_id', $user->unit_id)
    ->get();
```

### Indexes yang Disarankan

- `documents.unit_id`
- `documents.program_id`
- `documents.category`
- `documents.year`
- `documents.status`
- `assignments.unit_id`
- `assignments.assessor_id`
- `evaluations.assignment_id`

---

## 10. Additional Considerations

### Document Status Flow

1. `pending` - Baru diupload, belum divalidasi
2. `validated` - Sudah divalidasi oleh admin/assessor
3. `rejected` - Ditolak dengan alasan
4. `expired` - Dokumen sudah expired (berdasarkan expired_at)

### Notification Strategy

- Real-time: Gunakan Inertia untuk update UI
- Background jobs: Untuk email dan WhatsApp
- In-app notifications: Store di notifications table

### Simulation Logic Details

1. **Jika ada evaluations dari assessor:**
    - Gunakan rata-rata score dari evaluations untuk criteria point
    - Hitung weighted score per criteria
2. **Jika tidak ada evaluations:**
    - Check document completeness untuk criteria
    - Jika dokumen lengkap: score = max_score \* 0.8 (80%)
    - Jika dokumen tidak lengkap: score = 0
3. **Grade Calculation:**
    - Unggul: >= 361 (90.25%)
    - Sangat Baik: >= 301 (75.25%)
    - Baik: >= 201 (50.25%)
    - Kurang: < 201

### Target Akreditasi

- Satu program bisa punya multiple targets (per tahun)
- Target bisa diupdate
- History tracking (soft deletes atau history table)

---

## 11. Next Steps

1. ✅ Buat analisis (dokumen ini)
2. ⏳ Cek role name di database (seeder atau migration)
3. ⏳ Buat helper methods untuk authorization
4. ⏳ Buat Form Request classes
5. ⏳ Buat Controller dengan semua methods
6. ⏳ Buat Routes dengan middleware
7. ⏳ Buat Frontend pages
8. ⏳ Buat Components yang reusable
9. ⏳ Testing
10. ⏳ Documentation
