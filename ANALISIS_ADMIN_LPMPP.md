# Analisis Dashboard Admin LPMPP

## Overview

**Role**: Admin LPMPP  
**Tujuan**: Mengelola keseluruhan proses akreditasi dan monitoring kelengkapan dokumen di seluruh unit.

## Fitur-Fitur yang Tersedia

### 1. Ringkasan Progress Akreditasi per Fakultas / Prodi / Unit

#### Input/Output

- **Input**:
    - Filter: `unit_id`, `program_id`, `fakultas`, `date_range` (optional)
- **Output**:
    - Progress per Fakultas: `name`, `completion_percentage`, `status_color`, `criteria_fulfilled`, `total_criteria`, `pending_documents`, `rejected_documents`
    - Progress per Prodi: `id`, `name`, `fakultas`, `jenjang`, `progress_percentage`, `simulated_score`, `nearest_deadline`, `pic_name`, `has_issues`, `completed_criteria`, `total_criteria`
    - Progress per Unit: `name`, `type`, `progress`, `total_assignments`, `completed_assignments`

#### Controller Method

```php
public function progressSummary(Request $request): Response
```

- Query: `Unit`, `Program`, `Assignment`, `Document`
- Filter berdasarkan `unit_id`, `program_id`, `fakultas`
- Hitung completion rate berdasarkan assignments yang completed vs total
- Group by Fakultas/Prodi/Unit

#### Routes

- `GET /admin-lpmpp/progress-summary` → `admin-lpmpp.progress-summary`

#### Model Relationships

- `Unit` → `children` (Prodi), `assignments`
- `Program` → `standards.criteria.assignments`
- `Assignment` → `criterion.standard.program`, `unit`, `status`

---

### 2. Penugasan Asesor (Create, Edit, Assign, Unassign)

#### Input/Output

- **Create Assignment**:
    - Input: `criteria_id`, `unit_id`, `assessor_id`, `assigned_date`, `deadline`, `access_level`, `notes`
    - Output: Assignment object dengan relationships
- **Edit Assignment**:
    - Input: `assignment_id`, `criteria_id`, `unit_id`, `assessor_id`, `assigned_date`, `deadline`, `access_level`, `notes`, `status`
    - Output: Updated assignment
- **Assign Assessor**:
    - Input: `assignment_id`, `assessor_id`, `assigned_date`, `deadline`, `access_level`
    - Output: Updated assignment dengan assessor
- **Unassign Assessor**:
    - Input: `assignment_id`, `unassigned_reason`
    - Output: Updated assignment dengan `unassigned_at`, `unassigned_by`

#### Controller Methods

```php
public function assignments(Request $request): Response // List assignments
public function createAssignment(): Response // Form create
public function storeAssignment(StoreAssignmentRequest $request): RedirectResponse
public function editAssignment(string $id): Response // Form edit
public function updateAssignment(UpdateAssignmentRequest $request, string $id): RedirectResponse
public function assignAssessor(AssignAssessorRequest $request, string $id): RedirectResponse
public function unassignAssessor(UnassignAssessorRequest $request, string $id): RedirectResponse
```

#### Routes

- `GET /admin-lpmpp/assignments` → `admin-lpmpp.assignments.index`
- `GET /admin-lpmpp/assignments/create` → `admin-lpmpp.assignments.create`
- `POST /admin-lpmpp/assignments` → `admin-lpmpp.assignments.store`
- `GET /admin-lpmpp/assignments/{id}/edit` → `admin-lpmpp.assignments.edit`
- `PUT /admin-lpmpp/assignments/{id}` → `admin-lpmpp.assignments.update`
- `POST /admin-lpmpp/assignments/{id}/assign` → `admin-lpmpp.assignments.assign`
- `POST /admin-lpmpp/assignments/{id}/unassign` → `admin-lpmpp.assignments.unassign`

#### Form Requests

- `StoreAssignmentRequest`: `criteria_id`, `unit_id`, `assessor_id`, `assigned_date`, `deadline`, `access_level`, `notes`
- `UpdateAssignmentRequest`: `criteria_id`, `unit_id`, `assessor_id`, `assigned_date`, `deadline`, `access_level`, `notes`, `status`
- `AssignAssessorRequest`: `assessor_id`, `assigned_date`, `deadline`, `access_level`
- `UnassignAssessorRequest`: `unassigned_reason`

#### Model Relationships

- `Assignment` → `criterion`, `assessor` (User), `unit`, `evaluations`
- `User` → `assignments` (as assessor)
- `Criterion` → `assignments`
- `Unit` → `assignments`

---

### 3. Rekap & Statistik Akreditasi (Grafik Status, Kelengkapan, Poin)

#### Input/Output

- **Input**:
    - Filter: `program_id`, `unit_id`, `date_range` (optional)
- **Output**:
    - Status Distribution: `unggul`, `sangat_baik`, `baik`, `kurang` (count)
    - Progress Chart Data: `date`, `count` (last 7 days)
    - Document Completeness: `lengkap`, `belum_lengkap`, `salah_format`, `expired` (count)
    - Points Summary: `total_points`, `average_points`, `points_by_criteria`, `points_by_standard`

#### Controller Method

```php
public function statistics(Request $request): Response
```

- Query: `Program`, `Assignment`, `Evaluation`, `Document`, `CriteriaPoint`
- Hitung status distribution berdasarkan completion rate
- Hitung progress chart (assignments created per day)
- Hitung document completeness
- Hitung points dari evaluations

#### Routes

- `GET /admin-lpmpp/statistics` → `admin-lpmpp.statistics.index`

#### Model Relationships

- `Program` → `standards.criteria.assignments.evaluations`
- `Evaluation` → `assignment`, `criteriaPoint`
- `Document` → `assignment`, `program`, `unit`

---

### 4. Master Data Pegawai (Lihat, Edit, Sinkron, Tambah)

#### Input/Output

- **List Employees**:
    - Input: Filter `unit_id`, `employment_status`, `employment_type`, `search` (name/nip)
    - Output: Paginated list of employees dengan `unit`, `homebase_unit`
- **Show Employee**:
    - Input: `employee_id`
    - Output: Employee detail dengan relationships
- **Create Employee**:
    - Input: All employee fields
    - Output: Created employee
- **Edit Employee**:
    - Input: `employee_id`, updated fields
    - Output: Updated employee
- **Sync Employees** (from external source):
    - Input: `source` (siasn/api), `unit_id` (optional)
    - Output: Sync result dengan `created`, `updated`, `errors`

#### Controller Methods

```php
public function employees(Request $request): Response // List
public function showEmployee(string $id): Response // Detail
public function createEmployee(): Response // Form create
public function storeEmployee(StoreEmployeeRequest $request): RedirectResponse
public function editEmployee(string $id): Response // Form edit
public function updateEmployee(UpdateEmployeeRequest $request, string $id): RedirectResponse
public function syncEmployees(SyncEmployeesRequest $request): RedirectResponse
```

#### Routes

- `GET /admin-lpmpp/employees` → `admin-lpmpp.employees.index`
- `GET /admin-lpmpp/employees/{id}` → `admin-lpmpp.employees.show`
- `GET /admin-lpmpp/employees/create` → `admin-lpmpp.employees.create`
- `POST /admin-lpmpp/employees` → `admin-lpmpp.employees.store`
- `GET /admin-lpmpp/employees/{id}/edit` → `admin-lpmpp.employees.edit`
- `PUT /admin-lpmpp/employees/{id}` → `admin-lpmpp.employees.update`
- `POST /admin-lpmpp/employees/sync` → `admin-lpmpp.employees.sync`

#### Form Requests

- `StoreEmployeeRequest`: All employee fillable fields
- `UpdateEmployeeRequest`: All employee fillable fields (optional)
- `SyncEmployeesRequest`: `source`, `unit_id` (optional)

#### Model Relationships

- `Employee` → `unit`, `homebaseUnit`, `user`, `roleAssignments`

---

### 5. Cetak & Simpan Laporan Akreditasi Versi Standar LPMPP

#### Input/Output

- **Input**:
    - `program_id` (optional), `unit_id` (optional), `format` (pdf/excel/word), `type` (completeness/evaluation/executive)
- **Output**:
    - File path untuk download
    - Report data untuk preview

#### Controller Methods

```php
public function reports(Request $request): Response // List reports
public function generateReport(GenerateReportRequest $request): Response // Generate & download
public function previewReport(Request $request): Response // Preview before generate
```

#### Routes

- `GET /admin-lpmpp/reports` → `admin-lpmpp.reports.index`
- `POST /admin-lpmpp/reports/generate` → `admin-lpmpp.reports.generate`
- `GET /admin-lpmpp/reports/preview` → `admin-lpmpp.reports.preview`

#### Form Requests

- `GenerateReportRequest`: `type`, `program_id` (optional), `unit_id` (optional), `format`, `date_range` (optional)

#### Service

- `ReportService`: `generateDocumentCompletenessReport()`, `generateAssessorEvaluationReport()`, `generateExecutiveReport()`

#### Model Relationships

- `Report` → `program`, `generated_by` (User)
- Menggunakan `ReportService` untuk generate PDF/Excel/Word

---

### 6. Notifikasi Otomatis (Deadline Pengumpulan Dokumen, Reminder ke Prodi/Dosen)

#### Input/Output

- **Send Deadline Reminder**:
    - Input: `assignment_id` atau `unit_id`, `days_before` (0/3/7), `message` (optional)
    - Output: Notification objects created
- **Send Broadcast Notification**:
    - Input: `unit_ids` (array), `type`, `title`, `message`, `channels` (in-app/email/whatsapp)
    - Output: Notification objects created
- **List Notifications**:
    - Input: Filter `type`, `unit_id`, `status`, `date_range`
    - Output: Paginated notifications

#### Controller Methods

```php
public function notifications(Request $request): Response // List
public function sendReminder(SendReminderRequest $request): RedirectResponse
public function sendBroadcast(SendBroadcastRequest $request): RedirectResponse
public function notificationSettings(): Response // Settings page
public function updateNotificationSettings(UpdateNotificationSettingsRequest $request): RedirectResponse
```

#### Routes

- `GET /admin-lpmpp/notifications` → `admin-lpmpp.notifications.index`
- `POST /admin-lpmpp/notifications/send-reminder` → `admin-lpmpp.notifications.send-reminder`
- `POST /admin-lpmpp/notifications/send-broadcast` → `admin-lpmpp.notifications.send-broadcast`
- `GET /admin-lpmpp/notifications/settings` → `admin-lpmpp.notifications.settings`
- `PUT /admin-lpmpp/notifications/settings` → `admin-lpmpp.notifications.update-settings`

#### Form Requests

- `SendReminderRequest`: `assignment_id` atau `unit_id`, `days_before`, `message` (optional)
- `SendBroadcastRequest`: `unit_ids`, `type`, `title`, `message`, `channels`
- `UpdateNotificationSettingsRequest`: Auto-reminder settings

#### Service

- `NotificationService`: `sendDeadlineReminder()`, `sendBroadcast()`, `sendToUnit()`

#### Model Relationships

- `Notification` → `user`, `unit`
- `Assignment` → `deadline`, `unit`, `assessor`

---

### 7. List Dokumen Bermasalah (Expired, Salah Format, Belum Valid)

#### Input/Output

- **Input**:
    - Filter: `issue_type` (expired/wrong_format/not_validated), `unit_id`, `program_id`, `date_range`
- **Output**:
    - List documents dengan:
        - `id`, `file_name`, `file_type`, `file_size`, `uploaded_at`, `uploaded_by`
        - `program`, `unit`, `assignment`
        - `issue_type`, `issue_status`, `expired_at`, `rejection_notes`
        - `validated_at`, `validated_by`

#### Controller Method

```php
public function problemDocuments(Request $request): Response
```

- Query: `Document` dengan filter:
    - `expired_at < now()` untuk expired
    - `hasWrongFormat()` untuk wrong format
    - `validated_at IS NULL` untuk not validated
- Group by `issue_type`
- Include relationships: `program`, `unit`, `assignment`, `uploadedBy`, `validatedBy`

#### Routes

- `GET /admin-lpmpp/problem-documents` → `admin-lpmpp.problem-documents.index`

#### Model Relationships

- `Document` → `program`, `unit`, `assignment`, `uploadedBy`, `validatedBy`, `rejectedBy`
- `Document::isExpired()`: Check `expired_at < now()`
- `Document::hasWrongFormat()`: Check file type & size

---

## Authorization

### Middleware

- `EnsureAdminLPMPP`: Check `User::isAdminLPMPP()`
- Applied to all routes under `/admin-lpmpp`

### Policy (if needed)

- `AdminLPMPPPolicy`: Check admin access untuk semua resources

---

## File Storage

### Documents

- Storage: `storage/app/public/documents/`
- Path: `documents/{program_id}/{unit_id}/{year}/{filename}`

### Reports

- Storage: `storage/app/public/reports/`
- Path: `reports/{type}-{date}.{format}`

---

## Frontend Structure (Reference)

### Pages

- `Dashboard/AdminLPMPP/Index.tsx` - Main dashboard
- `Dashboard/AdminLPMPP/ProgressSummary/Index.tsx` - Progress summary
- `Dashboard/AdminLPMPP/Assignments/Index.tsx` - List assignments
- `Dashboard/AdminLPMPP/Assignments/Create.tsx` - Create assignment
- `Dashboard/AdminLPMPP/Assignments/Edit.tsx` - Edit assignment
- `Dashboard/AdminLPMPP/Statistics/Index.tsx` - Statistics
- `Dashboard/AdminLPMPP/Employees/Index.tsx` - List employees
- `Dashboard/AdminLPMPP/Employees/Create.tsx` - Create employee
- `Dashboard/AdminLPMPP/Employees/Edit.tsx` - Edit employee
- `Dashboard/AdminLPMPP/Reports/Index.tsx` - Reports
- `Dashboard/AdminLPMPP/Notifications/Index.tsx` - Notifications
- `Dashboard/AdminLPMPP/ProblemDocuments/Index.tsx` - Problem documents

---

## Important Notes

1. **Admin LPMPP** memiliki akses penuh ke semua unit, program, dan data
2. Semua operasi harus di-log ke `ActivityLog`
3. Notifikasi otomatis menggunakan `NotificationService` dan queue jobs
4. Laporan menggunakan `ReportService` dengan support PDF/Excel/Word
5. Sync employees bisa dari SIASN atau API eksternal (implementasi sesuai kebutuhan)
6. Problem documents diidentifikasi berdasarkan:
    - `expired_at < now()` → Expired
    - `hasWrongFormat()` → Wrong format
    - `validated_at IS NULL` → Not validated
