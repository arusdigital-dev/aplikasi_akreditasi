<?php

/**
 * File Routes Web Application
 *
 * File ini berisi definisi semua route untuk aplikasi akreditasi.
 * Route dikelompokkan berdasarkan middleware dan role pengguna.
 */

use App\Http\Controllers\API\AccreditationController;
use App\Http\Controllers\API\LAMController;
use App\Http\Controllers\API\SimulationController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Dashboard\AdminLPMPPController;
use App\Http\Controllers\Dashboard\CoordinatorProdiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ============================================================================
// ROUTE PUBLIK
// ============================================================================

/**
 * Halaman Landing Page
 */
Route::get('/', function () {
    return Inertia::render('LandingPage');
})->name('home');

// ============================================================================
// ROUTE AUTHENTIKASI (Guest Only)
// ============================================================================

Route::middleware('guest')->group(function () {
    // Login & Register
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

    // Google OAuth
    Route::get('/auth/google', [AuthController::class, 'redirectToGoogle'])->name('google.login');
    Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('google.callback');
});

// ============================================================================
// ROUTE TERPROTEKSI (Memerlukan Authentikasi)
// ============================================================================

Route::middleware('auth')->group(function () {
    // Logout - dapat diakses semua user yang sudah login
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ========================================================================
    // ROUTE ADMIN LPMPP
    // ========================================================================
    Route::middleware('admin.lpmpp')->prefix('admin-lpmpp')->name('admin-lpmpp.')->group(function () {
        // Dashboard
        Route::get('/', [AdminLPMPPController::class, 'index'])->name('index');
        Route::get('/progress-summary', [AdminLPMPPController::class, 'progressSummary'])->name('progress-summary');

        // Penugasan Asesor
        Route::get('/assignments', [AdminLPMPPController::class, 'assignments'])->name('assignments.index');
        Route::get('/assignments/create', [AdminLPMPPController::class, 'createAssignment'])->name('assignments.create');
        Route::post('/assignments', [AdminLPMPPController::class, 'storeAssignment'])->name('assignments.store');
        Route::get('/assignments/{id}/edit', [AdminLPMPPController::class, 'editAssignment'])->name('assignments.edit');
        Route::put('/assignments/{id}', [AdminLPMPPController::class, 'updateAssignment'])->name('assignments.update');
        Route::post('/assignments/{id}/assign', [AdminLPMPPController::class, 'assignAssessor'])->name('assignments.assign');
        Route::post('/assignments/{id}/unassign', [AdminLPMPPController::class, 'unassignAssessor'])->name('assignments.unassign');
        Route::delete('/assignments/{id}', [AdminLPMPPController::class, 'destroyAssignment'])->name('assignments.destroy');

        // Statistik
        Route::get('/statistics', [AdminLPMPPController::class, 'statistics'])->name('statistics.index');

        // Manajemen Karyawan
        Route::get('/employees', [AdminLPMPPController::class, 'employees'])->name('employees.index');
        Route::get('/employees/create', [AdminLPMPPController::class, 'createEmployee'])->name('employees.create');
        Route::post('/employees', [AdminLPMPPController::class, 'storeEmployee'])->name('employees.store');
        Route::post('/employees/sync', [AdminLPMPPController::class, 'syncEmployees'])->name('employees.sync');
        Route::get('/employees/{id}', [AdminLPMPPController::class, 'showEmployee'])->name('employees.show');
        Route::get('/employees/{id}/edit', [AdminLPMPPController::class, 'editEmployee'])->name('employees.edit');
        Route::put('/employees/{id}', [AdminLPMPPController::class, 'updateEmployee'])->name('employees.update');

        // Laporan
        Route::get('/reports', [AdminLPMPPController::class, 'reports'])->name('reports.index');
        Route::post('/reports/generate', [AdminLPMPPController::class, 'generateReport'])->name('reports.generate');
        Route::get('/reports/preview', [AdminLPMPPController::class, 'previewReport'])->name('reports.preview');
        Route::get('/reports/{report}/download', [AdminLPMPPController::class, 'downloadReport'])->name('reports.download');

        // Notifikasi
        Route::get('/notifications', [AdminLPMPPController::class, 'notifications'])->name('notifications.index');
        Route::post('/notifications/send-reminder', [AdminLPMPPController::class, 'sendReminder'])->name('notifications.send-reminder');
        Route::post('/notifications/send-broadcast', [AdminLPMPPController::class, 'sendBroadcast'])->name('notifications.send-broadcast');

        // Dokumen Bermasalah
        Route::get('/problem-documents', [AdminLPMPPController::class, 'problemDocuments'])->name('problem-documents.index');

        // Permintaan Penugasan Asesor
        Route::get('/assessor-requests', [AdminLPMPPController::class, 'assessorRequests'])->name('assessor-requests.index');
        Route::post('/assessor-requests/{id}/approve', [AdminLPMPPController::class, 'approveAssessorRequest'])->name('assessor-requests.approve');
        Route::post('/assessor-requests/{id}/reject', [AdminLPMPPController::class, 'rejectAssessorRequest'])->name('assessor-requests.reject');

        // Penugasan Asesor Akreditasi (LAM-based)
        Route::get('/accreditation-assessor-assignments', [AdminLPMPPController::class, 'accreditationAssessorAssignments'])->name('accreditation-assessor-assignments.index');
        Route::post('/accreditation-assessor-assignments', [AdminLPMPPController::class, 'assignAccreditationAssessor'])->name('accreditation-assessor-assignments.assign');

        // Monitoring Hasil Simulasi
        Route::get('/simulations', [AdminLPMPPController::class, 'simulations'])->name('simulations.index');

        // Kelola LAM
        Route::get('/lam', [AdminLPMPPController::class, 'lamIndex'])->name('lam.index');
        Route::get('/lam/create', [AdminLPMPPController::class, 'lamCreate'])->name('lam.create');
        Route::post('/lam', [AdminLPMPPController::class, 'lamStore'])->name('lam.store');
        Route::get('/lam/{id}/edit', [AdminLPMPPController::class, 'lamEdit'])->name('lam.edit');
        Route::post('/lam/{id}/structure', [AdminLPMPPController::class, 'updateLAMStructure'])->name('lam.structure.update');

        // Kelola Asesor Eksternal
        Route::get('/external-assessors', [AdminLPMPPController::class, 'externalAssessors'])->name('external-assessors.index');
        Route::get('/external-assessors/create', [AdminLPMPPController::class, 'createExternalAssessor'])->name('external-assessors.create');
        Route::post('/external-assessors', [AdminLPMPPController::class, 'storeExternalAssessor'])->name('external-assessors.store');
        Route::get('/external-assessors/{id}/edit', [AdminLPMPPController::class, 'editExternalAssessor'])->name('external-assessors.edit');
        Route::put('/external-assessors/{id}', [AdminLPMPPController::class, 'updateExternalAssessor'])->name('external-assessors.update');
        Route::delete('/external-assessors/{id}', [AdminLPMPPController::class, 'destroyExternalAssessor'])->name('external-assessors.destroy');
    });

    // ========================================================================
    // ROUTE NOTIFIKASI (Dapat diakses semua user yang sudah login)
    // ========================================================================
    Route::get('/notifications', [\App\Http\Controllers\Dashboard\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Dashboard\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\Dashboard\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::get('/api/notifications/unread-count', [\App\Http\Controllers\Dashboard\NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::get('/api/notifications/recent', [\App\Http\Controllers\Dashboard\NotificationController::class, 'recent'])->name('notifications.recent');

    // ========================================================================
    // ROUTE ASSESSOR INTERNAL
    // ========================================================================
    Route::prefix('assessor-internal')->name('assessor-internal.')->middleware('assessor')->group(function () {
        // Dashboard
        Route::get('/', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'dashboard'])->name('index');

        // Penugasan Akreditasi (LAM-based)
        Route::get('/accreditation-assignments', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'accreditationAssignments'])->name('accreditation-assignments.index');
        Route::get('/accreditation-assignments/{assignmentId}/evaluate', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'evaluateAccreditationAssignment'])->name('accreditation-assignments.evaluate');
        Route::post('/accreditation-assignments/{assignmentId}/scores', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'storeAccreditationScores'])->name('accreditation-assignments.scores.store');
        Route::match(['put', 'patch'], '/accreditation-assignments/{assignmentId}/scores', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'updateAccreditationScores'])->name('accreditation-assignments.scores.update');

        // Evaluasi Dokumen
        Route::get('/evaluation-documents', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'index'])->name('evaluation-documents.index');
        Route::get('/evaluation-documents/{documentId}/evaluate', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'showEvaluation'])->name('evaluation-documents.evaluate');
        Route::get('/evaluation-documents/{documentId}/history', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'showHistory'])->name('evaluation-documents.history');
        Route::post('/evaluation-notes', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'storeEvaluation'])->name('evaluation-notes.store');
        Route::match(['put', 'patch'], '/evaluation-notes/{id}', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'updateEvaluation'])->name('evaluation-notes.update');
        Route::get('/evaluation-notes/{id}/download/{type}', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'downloadEvaluationFile'])->name('evaluation-notes.download');

        // Penugasan Penilaian (Poin Penilaian)
        Route::get('/assignments', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'assignments'])->name('assignments.index');
        Route::get('/assignments/{assignmentId}/evaluate', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'showAssignmentEvaluation'])->name('assignments.evaluate');
        Route::post('/assignments/{assignmentId}/evaluations', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'storeAssignmentEvaluation'])->name('assignments.evaluations.store');
        Route::match(['put', 'patch'], '/assignments/{assignmentId}/evaluations', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'updateAssignmentEvaluation'])->name('assignments.evaluations.update');

        // Download Dokumen
        Route::get('/documents/{id}/download', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'downloadDocument'])->name('documents.download');

        // Statistik
        Route::get('/statistics/per-program', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'statisticsPerProgram'])->name('statistics.per-program');
        Route::get('/statistics/per-criterion', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'statisticsPerCriterion'])->name('statistics.per-criterion');
        Route::get('/statistics/progress', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'statisticsProgress'])->name('statistics.progress');

        // Simulasi
        Route::get('/simulation', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'simulation'])->name('simulation');
        Route::get('/simulation/export/pdf', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'exportSimulationPDF'])->name('simulation.export.pdf');
        Route::get('/simulation/export/excel', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'exportSimulationExcel'])->name('simulation.export.excel');
    });

    // Assessor Eksternal menggunakan dashboard assessor yang sama

    // ========================================================================
    // ROUTE PIMPINAN
    // ========================================================================
    Route::prefix('pimpinan')->name('pimpinan.')->middleware('pimpinan')->group(function () {
        Route::get('/', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'dashboard'])->name('dashboard');
        Route::get('/rekap-nilai', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'rekapNilai'])->name('rekap-nilai');
        Route::get('/statistik-penilaian', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'statistikPenilaian'])->name('statistik-penilaian');
        Route::get('/laporan-eksekutif', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'laporanEksekutif'])->name('laporan-eksekutif');
        Route::get('/laporan-eksekutif/download/{reportType}/{format}', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'downloadLaporan'])->name('laporan-eksekutif.download');
        Route::get('/insight-kesiapan', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'insightKesiapan'])->name('insight-kesiapan');
    });

    // ========================================================================
    // ROUTE KOORDINATOR PRODI
    // ========================================================================
    Route::prefix('coordinator-prodi')->name('coordinator-prodi.')->middleware('coordinator.prodi')->group(function () {
        // Dashboard
        Route::get('/', [CoordinatorProdiController::class, 'index'])->name('index');

        // Manajemen Dokumen (upload dilakukan di LKPS)
        Route::post('/documents', [CoordinatorProdiController::class, 'storeDocument'])->name('documents.store');
        Route::put('/documents/{id}', [CoordinatorProdiController::class, 'updateDocument'])->name('documents.update');
        Route::delete('/documents/{id}', [CoordinatorProdiController::class, 'deleteDocument'])->name('documents.delete');
        Route::get('/documents/{id}/download', [CoordinatorProdiController::class, 'downloadDocument'])->name('documents.download');

        // Notifikasi
        Route::post('/notifications/reminder', [CoordinatorProdiController::class, 'sendReminder'])->name('notifications.reminder');

        // Poin Kriteria
        Route::get('/criteria-points', [CoordinatorProdiController::class, 'criteriaPoints'])->name('criteria-points.index');
        Route::get('/criteria-points/create', [CoordinatorProdiController::class, 'createCriteriaPoint'])->name('criteria-points.create');
        Route::post('/criteria-points', [CoordinatorProdiController::class, 'storeCriteriaPoint'])->name('criteria-points.store');
        Route::get('/criteria-points/{id}/edit', [CoordinatorProdiController::class, 'editCriteriaPoint'])->name('criteria-points.edit');
        Route::put('/criteria-points/{id}', [CoordinatorProdiController::class, 'updateCriteriaPoint'])->name('criteria-points.update');
        Route::delete('/criteria-points/{id}', [CoordinatorProdiController::class, 'destroyCriteriaPoint'])->name('criteria-points.destroy');

        // Standar Akreditasi
        Route::get('/standards', [CoordinatorProdiController::class, 'standards'])->name('standards');
        Route::post('/standards', [CoordinatorProdiController::class, 'storeStandard'])->name('standards.store');
        Route::post('/programs', [CoordinatorProdiController::class, 'storeProgram'])->name('programs.store');
        Route::put('/programs/{id}/criteria-points/base-scale', [CoordinatorProdiController::class, 'updateCriteriaPointsBaseScale'])->name('programs.criteria-points.base-scale.update');
        Route::put('/programs/{id}/lam-name', [CoordinatorProdiController::class, 'updateLamName'])->name('programs.lam-name.update');

        // Kriteria
        Route::get('/criteria', [CoordinatorProdiController::class, 'criteria'])->name('criteria.index');
        Route::get('/criteria/create', [CoordinatorProdiController::class, 'createCriterion'])->name('criteria.create');
        Route::post('/criteria', [CoordinatorProdiController::class, 'storeCriterion'])->name('criteria.store');
        Route::get('/criteria/{id}/edit', [CoordinatorProdiController::class, 'editCriterion'])->name('criteria.edit');
        Route::put('/criteria/{id}', [CoordinatorProdiController::class, 'updateCriterion'])->name('criteria.update');
        Route::delete('/criteria/{id}', [CoordinatorProdiController::class, 'destroyCriterion'])->name('criteria.destroy');

        // Permintaan Asesor
        Route::get('/assessor-requests/create', [CoordinatorProdiController::class, 'createAssessorRequest'])->name('assessor-requests.create');
        Route::post('/assessor-requests', [CoordinatorProdiController::class, 'storeAssessorRequest'])->name('assessor-requests.store');

        // Target Akreditasi
        Route::get('/targets', [CoordinatorProdiController::class, 'getTargets'])->name('targets.index');
        Route::get('/targets/create', [CoordinatorProdiController::class, 'createTarget'])->name('targets.create');
        Route::post('/targets', [CoordinatorProdiController::class, 'setTarget'])->name('targets.store');
        Route::put('/targets/{id}', [CoordinatorProdiController::class, 'updateTarget'])->name('targets.update');
        Route::delete('/targets/{id}', [CoordinatorProdiController::class, 'deleteTarget'])->name('targets.delete');

        // ====================================================================
        // SISTEM AKREDITASI BERBASIS LAM
        // ====================================================================
        Route::prefix('accreditation')->name('accreditation.')->group(function () {
            // Route Halaman (Render Inertia Pages)
            Route::get('/cycles', [CoordinatorProdiController::class, 'accreditationCycles'])->name('cycles');
            Route::get('/criteria/{cycleId?}', [CoordinatorProdiController::class, 'accreditationCriteria'])->name('criteria');
            Route::get('/simulation/{cycleId?}', [CoordinatorProdiController::class, 'accreditationSimulation'])->name('simulation');
            Route::get('/lkps/{cycleId?}', [CoordinatorProdiController::class, 'accreditationLKPS'])->name('lkps');

            // API Framework LAM
            Route::get('/lam', function (Request $request) {
                $prodi = $request->user()->prodi;
                if (!$prodi) {
                    abort(404, 'Prodi not found');
                }

                return app(LAMController::class)->getProdiLAM($prodi->id);
            })->name('lam.show');
            Route::get('/lam/{id}', [LAMController::class, 'show'])->name('lam.detail');

            // API Siklus Akreditasi
            Route::get('/cycles/active', function (Request $request) {
                $prodi = $request->user()->prodi;
                if (!$prodi) {
                    abort(404, 'Prodi not found');
                }

                return app(AccreditationController::class)->getActiveCycle($prodi->id);
            })->name('cycles.active');
            Route::post('/cycles', [CoordinatorProdiController::class, 'storeAccreditationCycle'])->name('cycles.create');
            Route::put('/cycles/{id}', [AccreditationController::class, 'updateCycle'])->name('cycles.update');

            // API Skor Indikator
            Route::get('/cycles/{id}/scores', [AccreditationController::class, 'getIndicatorScores'])->name('cycles.scores');
            Route::post('/cycles/{id}/scores', [AccreditationController::class, 'saveIndicatorScore'])->name('cycles.scores.save');

            // API Simulasi
            Route::post('/cycles/{id}/simulation', [SimulationController::class, 'runSimulation'])->name('simulation.run');
            Route::post('/cycles/{id}/simulation/current', [SimulationController::class, 'runSimulationWithCurrentScores'])->name('simulation.run-current');
            Route::get('/cycles/{id}/simulation/history', [SimulationController::class, 'getSimulationHistory'])->name('simulation.history');
            Route::get('/simulations/{id}', [SimulationController::class, 'getSimulation'])->name('simulations.show');
            Route::get('/cycles/{id}/criteria-points/scores', [AccreditationController::class, 'getCriteriaPointScores'])->name('criteria-points.scores');
        });
    });

    // ========================================================================
    // API ROUTES UNTUK LAM (Dapat diakses user yang sudah login)
    // ========================================================================
    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/lams', [LAMController::class, 'index'])->name('lams.index');
        Route::get('/lams/{id}', [LAMController::class, 'show'])->name('lams.show');
    });
});
