<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Show the login form.
     */
    public function showLoginForm(): Response
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Handle a login request to the application.
     */
    public function login(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->validated();

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // Redirect to dashboard based on user role
            $user = Auth::user();
            $redirectTo = $this->getDashboardRoute($user);

            return redirect()->intended($redirectTo);
        }

        return back()->withErrors([
            'email' => 'Email atau password tidak valid.',
        ])->onlyInput('email');
    }

    /**
     * Get dashboard route based on user role.
     */
    private function getDashboardRoute(User $user): string
    {
        // Check if user is Admin LPMPP
        if ($user->isAdminLPMPP()) {
            return route('admin-lpmpp.index');
        }

        // Check if user is Koordinator Prodi
        if ($user->isCoordinatorProdi()) {
            return route('coordinator-prodi.index');
        }

        // Check if user is Assessor Internal
        if ($user->isAssessorInternal()) {
            return route('assessor-internal.index');
        }

        // Check if user is Pimpinan
        if ($user->isPimpinan()) {
            return route('pimpinan.dashboard');
        }

        // Default to home if no specific role
        return route('home');
    }

    /**
     * Show the registration form.
     */
    public function showRegisterForm(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle a registration request for the application.
     */
    public function register(RegisterRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        Auth::login($user);

        return redirect()->route('home');
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback from Google.
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if user exists by email
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Update google_id if not set
                if (! $user->google_id) {
                    $user->update(['google_id' => $googleUser->getId()]);
                }
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => Hash::make(uniqid()), // Random password since using OAuth
                    'email_verified_at' => now(),
                ]);
            }

            Auth::login($user);

            // Redirect to dashboard based on user role
            $redirectTo = $this->getDashboardRoute($user);

            return redirect($redirectTo);
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Gagal melakukan autentikasi dengan Google. Silakan coba lagi.',
            ]);
        }
    }
}
