<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Dashboard\AdminLPMPPController;
use App\Http\Controllers\Dashboard\AssessorAssignmentController;
use App\Http\Controllers\Dashboard\EmployeeController;
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
});
