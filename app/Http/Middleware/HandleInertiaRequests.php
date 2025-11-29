<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $userRole = null;
        $isAdmin = false;
        $isCoordinator = false;

        if ($user) {
            // Load roles if not already loaded
            if (! $user->relationLoaded('roles')) {
                $user->load('roles');
            }

            // Determine user role
            $isAdmin = $user->isAdminLPMPP();
            $isCoordinator = $user->isCoordinatorProdi();

            // Get primary role name
            if ($isAdmin) {
                $userRole = 'Admin LPMPP';
            } elseif ($isCoordinator) {
                $userRole = 'Koordinator Prodi';
            } elseif ($user->roles->isNotEmpty()) {
                $userRole = $user->roles->first()->name;
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
                'role' => $userRole,
                'isAdmin' => $isAdmin,
                'isCoordinator' => $isCoordinator,
            ],
        ];
    }
}
