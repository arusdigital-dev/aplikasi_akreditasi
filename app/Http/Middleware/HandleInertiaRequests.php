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
        $isAssessorInternal = false;
        $isPimpinan = false;
        $isAssessorExternal = false;
        $pimpinanLevel = null;

        if ($user) {
            // Load roles if not already loaded
            if (! $user->relationLoaded('roles')) {
                $user->load('roles');
            }

            // Load unit roles if needed
            if ($user->unit_id && ! $user->relationLoaded('unitRoles')) {
                $user->load('unitRoles');
            }

            // Determine user role
            $isAdmin = $user->isAdminLPMPP();
            $isCoordinator = $user->isCoordinatorProdi();
            $isAssessorInternal = $user->isAssessorInternal();
            $isPimpinan = $user->isPimpinan();
            $isAssessorExternal = $user->isAssessorExternal();
            $pimpinanLevel = $user->getPimpinanLevel();

            // Get primary role name
            if ($isAdmin) {
                $userRole = 'Admin LPMPP';
            } elseif ($isCoordinator) {
                $userRole = 'Koordinator Prodi';
            } elseif ($isAssessorInternal) {
                $userRole = 'Asesor Internal';
            } elseif ($isAssessorExternal) {
                $userRole = 'Asesor Eksternal';
            } elseif ($isPimpinan) {
                if ($user->isRektor()) {
                    $userRole = 'Rektor';
                } elseif ($user->isWakilRektor()) {
                    $userRole = 'Wakil Rektor';
                } elseif ($user->isDekan()) {
                    $userRole = 'Dekan';
                } elseif ($user->isWakilDekan()) {
                    $userRole = 'Wakil Dekan';
                } elseif ($user->isKajur()) {
                    $userRole = 'Kajur';
                }
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
                'isAssessorInternal' => $isAssessorInternal,
                'isAssessorExternal' => $isAssessorExternal,
                'isPimpinan' => $isPimpinan,
                'pimpinanLevel' => $pimpinanLevel,
            ],
        ];
    }
}
