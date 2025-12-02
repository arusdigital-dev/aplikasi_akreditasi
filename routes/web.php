<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Dashboard\AdminLPMPPController;
use App\Http\Controllers\Dashboard\AssessorAssignmentController;
use App\Http\Controllers\Dashboard\CoordinatorProdiController;
use App\Http\Controllers\Dashboard\DocumentIssueController;
use App\Http\Controllers\Dashboard\EmployeeController;
use App\Http\Controllers\Dashboard\ReportController;
use App\Http\Controllers\Dashboard\StatisticsController;
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
    Route::middleware('admin.lpmpp')->group(function () {
        // Dashboard routes
        Route::prefix('dashboard')->name('dashboard.')->group(function () {
            Route::get('/', [AdminLPMPPController::class, 'index'])->name('index');
        });

        // Assessor Assignment routes
        Route::resource('assessor-assignments', AssessorAssignmentController::class);

        // Statistics routes
        Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics.index');

        // Employee routes
        Route::resource('employees', EmployeeController::class);
        Route::post('/employees/import', [EmployeeController::class, 'import'])->name('employees.import');

        // Report routes
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::post('/reports/document-completeness/preview', [ReportController::class, 'previewDocumentCompleteness'])->name('reports.document-completeness.preview');
        Route::post('/reports/document-completeness', [ReportController::class, 'generateDocumentCompleteness'])->name('reports.document-completeness');
        Route::post('/reports/assessor-evaluation', [ReportController::class, 'generateAssessorEvaluation'])->name('reports.assessor-evaluation');
        Route::post('/reports/executive', [ReportController::class, 'generateExecutive'])->name('reports.executive');

        // Document Issues routes
        Route::get('/documents/issues', [DocumentIssueController::class, 'index'])->name('documents.issues.index');
        Route::get('/documents/issues/{id}', [DocumentIssueController::class, 'show'])->name('documents.issues.show');
        Route::post('/documents/issues/{id}/notify', [DocumentIssueController::class, 'sendNotification'])->name('documents.issues.notify');
        Route::put('/documents/issues/{id}/metadata', [DocumentIssueController::class, 'updateMetadata'])->name('documents.issues.update-metadata');
        Route::get('/documents/issues/{id}/download', [DocumentIssueController::class, 'download'])->name('documents.issues.download');
        Route::post('/documents/issues/{id}/resolve', [DocumentIssueController::class, 'resolve'])->name('documents.issues.resolve');
        Route::post('/documents/issues/{id}/reject', [DocumentIssueController::class, 'reject'])->name('documents.issues.reject');
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

        // Criteria points
        Route::get('/criteria-points', [CoordinatorProdiController::class, 'criteriaPoints'])->name('criteria-points');

        // Standards
        Route::get('/standards', [CoordinatorProdiController::class, 'standards'])->name('standards');

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
