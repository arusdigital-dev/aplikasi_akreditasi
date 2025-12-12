/**
 * Global route helper function that maps route names to Wayfinder route functions
 */
export function route(name: string, params?: Record<string, any> | string | number, ...additionalParams: (string | number)[]): string {
    // Check if route needs route parameters (not query parameters)
    const needsRouteParam = name.includes('.assignments.evaluate') || 
                           name.includes('.assignments.evaluations.') || 
                           name.includes('.evaluation-documents.') ||
                           name.includes('.edit') ||
                           name.includes('.show') ||
                           name.includes('.update') ||
                           name.includes('.delete') ||
                           name.includes('.download');
    
    // Handle object params
    let queryParams: URLSearchParams | null = null;
    let allParams: (string | number)[] = [];
    let routeParam: string | number | null = null;
    
    if (params && typeof params === 'object' && !Array.isArray(params) && !(params instanceof Date)) {
        if (needsRouteParam) {
            // Extract route parameter from object
            routeParam = (params as any).assignmentId || 
                        (params as any).documentId || 
                        (params as any).id || 
                        (params as any)[Object.keys(params)[0]] || 
                        null;
            
            // Remaining params become query parameters
            const remainingParams: Record<string, any> = {};
            Object.entries(params).forEach(([key, value]) => {
                if (key !== 'assignmentId' && key !== 'documentId' && key !== 'id' && value !== routeParam) {
                    remainingParams[key] = value;
                }
            });
            
            if (Object.keys(remainingParams).length > 0) {
                queryParams = new URLSearchParams();
                Object.entries(remainingParams).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        queryParams!.append(key, String(value));
                    }
                });
            }
            
            if (routeParam !== null) {
                allParams = [routeParam, ...additionalParams];
            } else {
                allParams = additionalParams;
            }
        } else {
            // This is a query parameters object
            queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    queryParams!.append(key, String(value));
                }
            });
            allParams = additionalParams;
        }
    } else {
        // Handle legacy params array - ensure params is string or number
        if (params !== undefined && (typeof params === 'string' || typeof params === 'number')) {
            allParams = [params, ...additionalParams];
        } else {
            allParams = additionalParams;
        }
    }
    const routeMap: Record<string, any> = {
        'home': { url: () => '/' },
        'login': { url: () => '/login' },
        'register': { url: () => '/register' },
        'logout': { url: () => '/logout', method: 'post' },
        'dashboard.index': { url: () => '/dashboard' },
        'statistics.index': { url: () => '/statistics' },
        'employees.index': { url: () => '/employees' },
        'employees.create': { url: () => '/employees/create' },
        'employees.store': { url: () => '/employees', method: 'post' },
        'employees.show': { url: (id: string | number) => `/employees/${id}` },
        'employees.edit': { url: (id: string | number) => `/employees/${id}/edit` },
        'employees.update': { url: (id: string | number) => `/employees/${id}`, method: 'put' },
        'employees.destroy': { url: (id: string | number) => `/employees/${id}`, method: 'delete' },
        'employees.import': { url: () => '/employees/import', method: 'post' },
        'reports.index': { url: () => '/reports' },
        'reports.document-completeness': { url: () => '/reports/document-completeness', method: 'post' },
        'reports.document-completeness.preview': { url: () => '/reports/document-completeness/preview', method: 'post' },
        'reports.assessor-evaluation': { url: () => '/reports/assessor-evaluation', method: 'post' },
        'reports.executive': { url: () => '/reports/executive', method: 'post' },
        'notifications.index': { url: () => '/notifications' },
        'notifications.read': { url: (id: string | number) => `/notifications/${id}/read`, method: 'post' },
        'notifications.read-all': { url: () => '/notifications/read-all', method: 'post' },
        'documents.issues.index': { url: () => '/documents/issues' },
        'documents.issues.show': { url: (id: string | number) => `/documents/issues/${id}` },
        'documents.issues.notify': { url: (id: string | number) => `/documents/issues/${id}/notify`, method: 'post' },
        'documents.issues.update-metadata': { url: (id: string | number) => `/documents/issues/${id}/metadata`, method: 'put' },
        'documents.issues.download': { url: (id: string | number) => `/documents/issues/${id}/download` },
        'documents.issues.resolve': { url: (id: string | number) => `/documents/issues/${id}/resolve`, method: 'post' },
        'documents.issues.reject': { url: (id: string | number) => `/documents/issues/${id}/reject`, method: 'post' },
        // Coordinator Prodi routes
        'coordinator-prodi.index': { url: () => '/coordinator-prodi' },
        'coordinator-prodi.documents.store': { url: () => '/coordinator-prodi/documents', method: 'post' },
        'coordinator-prodi.documents.update': { url: (id: string | number) => `/coordinator-prodi/documents/${id}`, method: 'put' },
        'coordinator-prodi.documents.delete': { url: (id: string | number) => `/coordinator-prodi/documents/${id}`, method: 'delete' },
        'coordinator-prodi.documents.download': { url: (id: string | number) => `/coordinator-prodi/documents/${id}/download` },
        'coordinator-prodi.reports.completeness': { url: () => '/coordinator-prodi/reports/completeness' },
        'coordinator-prodi.notifications.reminder': { url: () => '/coordinator-prodi/notifications/reminder', method: 'post' },
        'coordinator-prodi.statistics.assessment': { url: () => '/coordinator-prodi/statistics/assessment' },
        'coordinator-prodi.simulation': { url: () => '/coordinator-prodi/simulation' },
        'coordinator-prodi.criteria-points': { url: () => '/coordinator-prodi/criteria-points' },
        'coordinator-prodi.standards': { url: () => '/coordinator-prodi/standards' },
        'coordinator-prodi.criteria.index': { url: () => '/coordinator-prodi/criteria' },
        'coordinator-prodi.criteria.create': { url: () => '/coordinator-prodi/criteria/create' },
        'coordinator-prodi.criteria.store': { url: () => '/coordinator-prodi/criteria', method: 'post' },
        'coordinator-prodi.criteria.edit': { url: (id: string | number) => `/coordinator-prodi/criteria/${id}/edit` },
        'coordinator-prodi.criteria.update': { url: (id: string | number) => `/coordinator-prodi/criteria/${id}`, method: 'put' },
        'coordinator-prodi.criteria.destroy': { url: (id: string | number) => `/coordinator-prodi/criteria/${id}`, method: 'delete' },
        'coordinator-prodi.assessor-requests.create': { url: () => '/coordinator-prodi/assessor-requests/create' },
        'coordinator-prodi.assessor-requests.store': { url: () => '/coordinator-prodi/assessor-requests', method: 'post' },
        'coordinator-prodi.score-recap': { url: () => '/coordinator-prodi/score-recap' },
        'coordinator-prodi.targets.index': { url: () => '/coordinator-prodi/targets' },
        'coordinator-prodi.targets.create': { url: () => '/coordinator-prodi/targets/create' },
        'coordinator-prodi.targets.store': { url: () => '/coordinator-prodi/targets', method: 'post' },
        'coordinator-prodi.targets.update': { url: (id: string | number) => `/coordinator-prodi/targets/${id}`, method: 'put' },
        'coordinator-prodi.targets.delete': { url: (id: string | number) => `/coordinator-prodi/targets/${id}`, method: 'delete' },
        // Accreditation routes
        'coordinator-prodi.accreditation.cycles': { url: () => '/coordinator-prodi/accreditation/cycles' },
        'coordinator-prodi.accreditation.criteria': { url: (cycleId?: string | number) => cycleId ? `/coordinator-prodi/accreditation/criteria/${cycleId}` : '/coordinator-prodi/accreditation/criteria' },
        'coordinator-prodi.accreditation.simulation': { url: (cycleId?: string | number) => cycleId ? `/coordinator-prodi/accreditation/simulation/${cycleId}` : '/coordinator-prodi/accreditation/simulation' },
        'coordinator-prodi.accreditation.lkps': { url: (cycleId?: string | number) => cycleId ? `/coordinator-prodi/accreditation/lkps/${cycleId}` : '/coordinator-prodi/accreditation/lkps' },
        // Assessor Internal routes
        'assessor-internal.index': { url: () => '/assessor-internal' },
        'assessor-internal.dashboard': { url: () => '/assessor-internal' },
        'assessor-internal.assignments.index': { url: () => '/assessor-internal/assignments' },
        'assessor-internal.assignments.evaluate': { url: (assignmentId: string | number) => `/assessor-internal/assignments/${assignmentId}/evaluate` },
        'assessor-internal.assignments.evaluations.store': { url: (assignmentId: string | number) => `/assessor-internal/assignments/${assignmentId}/evaluations`, method: 'post' },
        'assessor-internal.assignments.evaluations.update': { url: (assignmentId: string | number) => `/assessor-internal/assignments/${assignmentId}/evaluations`, method: 'put' },
        'assessor-internal.evaluation-documents.index': { url: () => '/assessor-internal/evaluation-documents' },
        'assessor-internal.evaluation-documents.evaluate': { url: (documentId: string | number) => `/assessor-internal/evaluation-documents/${documentId}/evaluate` },
        'assessor-internal.evaluation-documents.history': { url: (documentId: string | number) => `/assessor-internal/evaluation-documents/${documentId}/history` },
        'assessor-internal.statistics.per-program': { url: () => '/assessor-internal/statistics/per-program' },
        'assessor-internal.statistics.per-criterion': { url: () => '/assessor-internal/statistics/per-criterion' },
        'assessor-internal.statistics.progress': { url: () => '/assessor-internal/statistics/progress' },
        'assessor-internal.simulation': { url: () => '/assessor-internal/simulation' },
        'assessor-internal.simulation.export.pdf': { url: () => '/assessor-internal/simulation/export/pdf' },
        'assessor-internal.simulation.export.excel': { url: () => '/assessor-internal/simulation/export/excel' },
        // Pimpinan routes
        'pimpinan.dashboard': { url: () => '/pimpinan' },
        'pimpinan.rekap-nilai': { url: () => '/pimpinan/rekap-nilai' },
        'pimpinan.statistik-penilaian': { url: () => '/pimpinan/statistik-penilaian' },
        'pimpinan.laporan-eksekutif': { url: () => '/pimpinan/laporan-eksekutif' },
        'pimpinan.laporan-eksekutif.download': { url: (params?: { reportType?: string; format?: string }) => {
            if (!params?.reportType || !params?.format) {
                return '/pimpinan/laporan-eksekutif/download';
            }
            return `/pimpinan/laporan-eksekutif/download/${params.reportType}/${params.format}`;
        }},
        'pimpinan.insight-kesiapan': { url: () => '/pimpinan/insight-kesiapan' },
        // Admin LPMPP routes
        'admin-lpmpp.index': { url: () => '/admin-lpmpp' },
        'admin-lpmpp.progress-summary': { url: () => '/admin-lpmpp/progress-summary' },
        'admin-lpmpp.assignments.index': { url: () => '/admin-lpmpp/assignments' },
        'admin-lpmpp.assignments.create': { url: () => '/admin-lpmpp/assignments/create' },
        'admin-lpmpp.assignments.store': { url: () => '/admin-lpmpp/assignments', method: 'post' },
        'admin-lpmpp.assignments.edit': { url: (id: string | number) => `/admin-lpmpp/assignments/${id}/edit` },
        'admin-lpmpp.assignments.update': { url: (id: string | number) => `/admin-lpmpp/assignments/${id}`, method: 'put' },
        'admin-lpmpp.assignments.assign': { url: (id: string | number) => `/admin-lpmpp/assignments/${id}/assign`, method: 'post' },
        'admin-lpmpp.assignments.unassign': { url: (id: string | number) => `/admin-lpmpp/assignments/${id}/unassign`, method: 'post' },
        'admin-lpmpp.statistics.index': { url: () => '/admin-lpmpp/statistics' },
        'admin-lpmpp.employees.index': { url: () => '/admin-lpmpp/employees' },
        'admin-lpmpp.employees.show': { url: (id: string | number) => `/admin-lpmpp/employees/${id}` },
        'admin-lpmpp.employees.create': { url: () => '/admin-lpmpp/employees/create' },
        'admin-lpmpp.employees.store': { url: () => '/admin-lpmpp/employees', method: 'post' },
        'admin-lpmpp.employees.edit': { url: (id: string | number) => `/admin-lpmpp/employees/${id}/edit` },
        'admin-lpmpp.employees.update': { url: (id: string | number) => `/admin-lpmpp/employees/${id}`, method: 'put' },
        'admin-lpmpp.employees.sync': { url: () => '/admin-lpmpp/employees/sync', method: 'post' },
        'admin-lpmpp.reports.index': { url: () => '/admin-lpmpp/reports' },
        'admin-lpmpp.reports.generate': { url: () => '/admin-lpmpp/reports/generate', method: 'post' },
        'admin-lpmpp.reports.preview': { url: () => '/admin-lpmpp/reports/preview' },
        'admin-lpmpp.reports.download': { url: (id: string | number) => `/admin-lpmpp/reports/${id}/download` },
        'admin-lpmpp.notifications.index': { url: () => '/admin-lpmpp/notifications' },
        'admin-lpmpp.notifications.send-reminder': { url: () => '/admin-lpmpp/notifications/send-reminder', method: 'post' },
        'admin-lpmpp.notifications.send-broadcast': { url: () => '/admin-lpmpp/notifications/send-broadcast', method: 'post' },
        'admin-lpmpp.problem-documents.index': { url: () => '/admin-lpmpp/problem-documents' },
        'admin-lpmpp.assessor-requests.index': { url: () => '/admin-lpmpp/assessor-requests' },
        'admin-lpmpp.assessor-requests.approve': { url: (id: string | number) => `/admin-lpmpp/assessor-requests/${id}/approve`, method: 'post' },
        'admin-lpmpp.assessor-requests.reject': { url: (id: string | number) => `/admin-lpmpp/assessor-requests/${id}/reject`, method: 'post' },
        // Alias untuk assessor-assignments (menggunakan route admin-lpmpp.assignments)
        'assessor-assignments.index': { url: () => '/admin-lpmpp/assignments' },
        'assessor-assignments.create': { url: () => '/admin-lpmpp/assignments/create' },
        'assessor-assignments.store': { url: () => '/admin-lpmpp/assignments', method: 'post' },
        'assessor-assignments.show': { url: (id: string | number) => `/admin-lpmpp/assignments/${id}` },
        'assessor-assignments.edit': { url: (id: string | number) => `/admin-lpmpp/assignments/${id}/edit` },
        'assessor-assignments.update': { url: (id: string | number) => `/admin-lpmpp/assignments/${id}`, method: 'put' },
        'assessor-assignments.destroy': { url: (id: string | number) => `/admin-lpmpp/assignments/${id}`, method: 'delete' },
    };

    const routeFn = routeMap[name];

    if (!routeFn) {
        console.warn(`Route "${name}" not found in route map`);
        return '#';
    }

    // Handle routes with parameters
    if (allParams.length > 0) {
        // For admin-lpmpp routes with parameters
        if (name.includes('admin-lpmpp')) {
            if (name.includes('.assignments.') && (name.includes('.edit') || name.includes('.update') || name.includes('.assign') || name.includes('.unassign'))) {
                return routeFn.url(allParams[0]);
            }
            if (name.includes('.employees.') && (name.includes('.show') || name.includes('.edit') || name.includes('.update'))) {
                return routeFn.url(allParams[0]);
            }
        }
        // For assessor-assignments routes with parameters (alias untuk admin-lpmpp.assignments)
        if (name.includes('assessor-assignments')) {
            if (name.includes('.show') || name.includes('.edit') || name.includes('.update') || name.includes('.destroy')) {
                return routeFn.url(allParams[0]);
            }
        }
        // For employees routes (using direct URL since Wayfinder hasn't generated them yet)
        if (name.includes('employees')) {
            if (name.includes('.show')) {
                return `/employees/${allParams[0]}`;
            }
            if (name.includes('.edit')) {
                return `/employees/${allParams[0]}/edit`;
            }
            if (name.includes('.update')) {
                return `/employees/${allParams[0]}`;
            }
            if (name.includes('.destroy')) {
                return `/employees/${allParams[0]}`;
            }
        }
        // For coordinator-prodi routes with parameters
        if (name.includes('coordinator-prodi')) {
            if (name.includes('.documents.') && (name.includes('.update') || name.includes('.delete') || name.includes('.download'))) {
                return routeFn.url(allParams[0]);
            }
            if (name.includes('.targets.') && (name.includes('.update') || name.includes('.delete'))) {
                return routeFn.url(allParams[0]);
            }
            // Handle accreditation routes with optional cycleId
            if (name.includes('.accreditation.')) {
                if (name.includes('.criteria') || name.includes('.simulation') || name.includes('.lkps')) {
                    if (allParams.length > 0) {
                        return routeFn.url(allParams[0]);
                    }
                    return routeFn.url();
                }
            }
        }
        // For assessor-internal routes with parameters
        if (name.includes('assessor-internal')) {
            if (name.includes('.assignments.evaluate') || name.includes('.assignments.evaluations.') || name.includes('.evaluation-documents.')) {
                // If params is an object, extract assignmentId or documentId
                if (params && typeof params === 'object' && !Array.isArray(params) && !(params instanceof Date)) {
                    const assignmentId = (params as any).assignmentId || (params as any).documentId || (params as any).id;
                    if (assignmentId !== undefined && assignmentId !== null) {
                        return routeFn.url(assignmentId);
                    }
                }
                if (allParams.length > 0) {
                    return routeFn.url(allParams[0]);
                }
                return routeFn.url();
            }
        }
        // For other routes, pass the first param directly
        if (allParams.length > 0) {
            return routeFn.url(allParams[0]);
        }
        // If params is an object, try to extract id or first value
        if (params && typeof params === 'object' && !Array.isArray(params) && !(params instanceof Date)) {
            const id = (params as any).id || (params as any).assignmentId || (params as any).documentId || Object.values(params)[0];
            if (id !== undefined && id !== null) {
                return routeFn.url(id);
            }
        }
        return routeFn.url();
    }

    const baseUrl = routeFn.url();
    
    // Append query parameters if provided
    if (queryParams && queryParams.toString()) {
        return `${baseUrl}?${queryParams.toString()}`;
    }
    
    return baseUrl;
}

// Make route available globally
if (typeof window !== 'undefined') {
    (window as any).route = route;
}
