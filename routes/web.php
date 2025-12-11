<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Dashboard\AdminLPMPPController;
use App\Http\Controllers\Dashboard\CoordinatorProdiController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('LandingPage');
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

    // Google OAuth
    Route::get('/auth/google', [AuthController::class, 'redirectToGoogle'])->name('google.login');
    Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('google.callback');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Admin LPMPP routes - Only accessible by Admin LPMPP
    Route::middleware('admin.lpmpp')->prefix('admin-lpmpp')->name('admin-lpmpp.')->group(function () {
        // Dashboard
        Route::get('/', [AdminLPMPPController::class, 'index'])->name('index');

        // Progress Summary
        Route::get('/progress-summary', [AdminLPMPPController::class, 'progressSummary'])->name('progress-summary');

        // Assignments
        Route::get('/assignments', [AdminLPMPPController::class, 'assignments'])->name('assignments.index');
        Route::get('/assignments/create', [AdminLPMPPController::class, 'createAssignment'])->name('assignments.create');
        Route::post('/assignments', [AdminLPMPPController::class, 'storeAssignment'])->name('assignments.store');
        Route::get('/assignments/{id}/edit', [AdminLPMPPController::class, 'editAssignment'])->name('assignments.edit');
        Route::put('/assignments/{id}', [AdminLPMPPController::class, 'updateAssignment'])->name('assignments.update');
        Route::post('/assignments/{id}/assign', [AdminLPMPPController::class, 'assignAssessor'])->name('assignments.assign');
        Route::post('/assignments/{id}/unassign', [AdminLPMPPController::class, 'unassignAssessor'])->name('assignments.unassign');

        // Statistics
        Route::get('/statistics', [AdminLPMPPController::class, 'statistics'])->name('statistics.index');

        // Employees
        Route::get('/employees', [AdminLPMPPController::class, 'employees'])->name('employees.index');
        Route::get('/employees/create', [AdminLPMPPController::class, 'createEmployee'])->name('employees.create');
        Route::post('/employees', [AdminLPMPPController::class, 'storeEmployee'])->name('employees.store');
        Route::post('/employees/sync', [AdminLPMPPController::class, 'syncEmployees'])->name('employees.sync');
        Route::get('/employees/{id}', [AdminLPMPPController::class, 'showEmployee'])->name('employees.show');
        Route::get('/employees/{id}/edit', [AdminLPMPPController::class, 'editEmployee'])->name('employees.edit');
        Route::put('/employees/{id}', [AdminLPMPPController::class, 'updateEmployee'])->name('employees.update');

        // Reports
        Route::get('/reports', [AdminLPMPPController::class, 'reports'])->name('reports.index');
        Route::post('/reports/generate', [AdminLPMPPController::class, 'generateReport'])->name('reports.generate');
        Route::get('/reports/preview', [AdminLPMPPController::class, 'previewReport'])->name('reports.preview');

        // Notifications
        Route::get('/notifications', [AdminLPMPPController::class, 'notifications'])->name('notifications.index');
        Route::post('/notifications/send-reminder', [AdminLPMPPController::class, 'sendReminder'])->name('notifications.send-reminder');
        Route::post('/notifications/send-broadcast', [AdminLPMPPController::class, 'sendBroadcast'])->name('notifications.send-broadcast');

        // Problem Documents
        Route::get('/problem-documents', [AdminLPMPPController::class, 'problemDocuments'])->name('problem-documents.index');

        // Download Report
        Route::get('/reports/{report}/download', [AdminLPMPPController::class, 'downloadReport'])->name('reports.download');

        // Assessor Assignment Requests
        Route::get('/assessor-requests', [AdminLPMPPController::class, 'assessorRequests'])->name('assessor-requests.index');
        // Assessor Assignment Requests Processing
        Route::post('/assessor-requests/{id}/approve', [AdminLPMPPController::class, 'approveAssessorRequest'])->name('assessor-requests.approve');
        Route::post('/assessor-requests/{id}/reject', [AdminLPMPPController::class, 'rejectAssessorRequest'])->name('assessor-requests.reject');
    });

    // Notification routes - Accessible by all authenticated users
    Route::get('/notifications', [\App\Http\Controllers\Dashboard\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Dashboard\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\Dashboard\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::get('/api/notifications/unread-count', [\App\Http\Controllers\Dashboard\NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::get('/api/notifications/recent', [\App\Http\Controllers\Dashboard\NotificationController::class, 'recent'])->name('notifications.recent');

    // Assessor Internal routes
    Route::prefix('assessor-internal')->name('assessor-internal.')->middleware('assessor.internal')->group(function () {
        // Dashboard
        Route::get('/', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'dashboard'])->name('index');
        // Dashboard - Evaluation Documents
        Route::get('/evaluation-documents', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'index'])->name('evaluation-documents.index');
        Route::get('/evaluation-documents/{documentId}/evaluate', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'showEvaluation'])->name('evaluation-documents.evaluate');
        Route::get('/evaluation-documents/{documentId}/history', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'showHistory'])->name('evaluation-documents.history');
        Route::post('/evaluation-notes', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'storeEvaluation'])->name('evaluation-notes.store');
        Route::match(['put', 'patch'], '/evaluation-notes/{id}', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'updateEvaluation'])->name('evaluation-notes.update');
        Route::get('/evaluation-notes/{id}/download/{type}', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'downloadEvaluationFile'])->name('evaluation-notes.download');

        // Assessment Assignments (Poin Penilaian)
        Route::get('/assignments', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'assignments'])->name('assignments.index');
        Route::get('/assignments/{assignmentId}/evaluate', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'showAssignmentEvaluation'])->name('assignments.evaluate');
        Route::post('/assignments/{assignmentId}/evaluations', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'storeAssignmentEvaluation'])->name('assignments.evaluations.store');
        Route::match(['put', 'patch'], '/assignments/{assignmentId}/evaluations', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'updateAssignmentEvaluation'])->name('assignments.evaluations.update');

        // Document download
        Route::get('/documents/{id}/download', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'downloadDocument'])->name('documents.download');

        // Statistics
        Route::get('/statistics/per-program', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'statisticsPerProgram'])->name('statistics.per-program');
        Route::get('/statistics/per-criterion', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'statisticsPerCriterion'])->name('statistics.per-criterion');
        Route::get('/statistics/progress', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'statisticsProgress'])->name('statistics.progress');

        // Simulation
        Route::get('/simulation', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'simulation'])->name('simulation');
        Route::get('/simulation/export/pdf', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'exportSimulationPDF'])->name('simulation.export.pdf');
        Route::get('/simulation/export/excel', [\App\Http\Controllers\Dashboard\AssessorInternalController::class, 'exportSimulationExcel'])->name('simulation.export.excel');
    });

    // Pimpinan routes
    Route::prefix('pimpinan')->name('pimpinan.')->middleware('pimpinan')->group(function () {
        Route::get('/', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'dashboard'])->name('dashboard');
        Route::get('/rekap-nilai', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'rekapNilai'])->name('rekap-nilai');
        Route::get('/statistik-penilaian', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'statistikPenilaian'])->name('statistik-penilaian');
        Route::get('/laporan-eksekutif', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'laporanEksekutif'])->name('laporan-eksekutif');
        Route::get('/laporan-eksekutif/download/{reportType}/{format}', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'downloadLaporan'])->name('laporan-eksekutif.download');
        Route::get('/insight-kesiapan', [\App\Http\Controllers\Dashboard\PimpinanController::class, 'insightKesiapan'])->name('insight-kesiapan');
    });

    // Coordinator Prodi routes
    Route::prefix('coordinator-prodi')->name('coordinator-prodi.')->middleware('coordinator.prodi')->group(function () {
        // Dashboard
        Route::get('/', [CoordinatorProdiController::class, 'index'])->name('index');

        // Documents
        Route::get('/documents', [CoordinatorProdiController::class, 'documents'])->name('documents.index');
        Route::get('/documents/create', [CoordinatorProdiController::class, 'createDocument'])->name('documents.create');
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

        // Criteria Points
        Route::get('/criteria-points', [CoordinatorProdiController::class, 'criteriaPoints'])->name('criteria-points.index');
        Route::get('/criteria-points/create', [CoordinatorProdiController::class, 'createCriteriaPoint'])->name('criteria-points.create');
        Route::post('/criteria-points', [CoordinatorProdiController::class, 'storeCriteriaPoint'])->name('criteria-points.store');
        Route::get('/criteria-points/{id}/edit', [CoordinatorProdiController::class, 'editCriteriaPoint'])->name('criteria-points.edit');
        Route::put('/criteria-points/{id}', [CoordinatorProdiController::class, 'updateCriteriaPoint'])->name('criteria-points.update');
        Route::delete('/criteria-points/{id}', [CoordinatorProdiController::class, 'destroyCriteriaPoint'])->name('criteria-points.destroy');

        // Standards
        Route::get('/standards', [CoordinatorProdiController::class, 'standards'])->name('standards');

        // Criteria
        Route::get('/criteria', [CoordinatorProdiController::class, 'criteria'])->name('criteria.index');
        Route::get('/criteria/create', [CoordinatorProdiController::class, 'createCriterion'])->name('criteria.create');
        Route::post('/criteria', [CoordinatorProdiController::class, 'storeCriterion'])->name('criteria.store');
        Route::get('/criteria/{id}/edit', [CoordinatorProdiController::class, 'editCriterion'])->name('criteria.edit');
        Route::put('/criteria/{id}', [CoordinatorProdiController::class, 'updateCriterion'])->name('criteria.update');
        Route::delete('/criteria/{id}', [CoordinatorProdiController::class, 'destroyCriterion'])->name('criteria.destroy');

        // Assessor Requests
        Route::get('/assessor-requests/create', [CoordinatorProdiController::class, 'createAssessorRequest'])->name('assessor-requests.create');
        Route::post('/assessor-requests', [CoordinatorProdiController::class, 'storeAssessorRequest'])->name('assessor-requests.store');

        // Score recap
        Route::get('/score-recap', [CoordinatorProdiController::class, 'scoreRecap'])->name('score-recap');

        // Targets
        Route::get('/targets', [CoordinatorProdiController::class, 'getTargets'])->name('targets.index');
        Route::get('/targets/create', [CoordinatorProdiController::class, 'createTarget'])->name('targets.create');
        Route::post('/targets', [CoordinatorProdiController::class, 'setTarget'])->name('targets.store');
        Route::put('/targets/{id}', [CoordinatorProdiController::class, 'updateTarget'])->name('targets.update');
        Route::delete('/targets/{id}', [CoordinatorProdiController::class, 'deleteTarget'])->name('targets.delete');
    });
});
