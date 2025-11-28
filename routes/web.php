<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Dashboard\AdminLPMPPController;
use App\Http\Controllers\Dashboard\AssessorAssignmentController;
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

    // Notification routes
    Route::get('/notifications', [\App\Http\Controllers\Dashboard\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Dashboard\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\Dashboard\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::get('/api/notifications/unread-count', [\App\Http\Controllers\Dashboard\NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::get('/api/notifications/recent', [\App\Http\Controllers\Dashboard\NotificationController::class, 'recent'])->name('notifications.recent');

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
