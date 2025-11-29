import assessorAssignments from '@/routes/assessor-assignments';
import { home, login, register, logout } from '@/routes';
import dashboard from '@/routes/dashboard';

/**
 * Global route helper function that maps route names to Wayfinder route functions
 */
export function route(name: string, params?: Record<string, any> | string | number, ...additionalParams: (string | number)[]): string {
    // Handle object params (for query parameters) - must be done after getting base URL
    let queryParams: URLSearchParams | null = null;
    let allParams: (string | number)[] = [];
    
    if (params && typeof params === 'object' && !Array.isArray(params) && !(params instanceof Date)) {
        // This is a query parameters object
        queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams!.append(key, String(value));
            }
        });
        allParams = additionalParams;
    } else {
        // Handle legacy params array
        allParams = params !== undefined ? [params, ...additionalParams] : additionalParams;
    }
    const routeMap: Record<string, any> = {
        'assessor-assignments.index': assessorAssignments.index,
        'assessor-assignments.create': assessorAssignments.create,
        'assessor-assignments.store': assessorAssignments.store,
        'assessor-assignments.show': assessorAssignments.show,
        'assessor-assignments.edit': assessorAssignments.edit,
        'assessor-assignments.update': assessorAssignments.update,
        'assessor-assignments.destroy': assessorAssignments.destroy,
        'home': home,
        'login': login,
        'register': register,
        'logout': logout,
        'dashboard.index': dashboard?.index,
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
        'coordinator-prodi.documents.index': { url: () => '/coordinator-prodi/documents' },
        'coordinator-prodi.documents.create': { url: () => '/coordinator-prodi/documents/create' },
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
        'coordinator-prodi.score-recap': { url: () => '/coordinator-prodi/score-recap' },
        'coordinator-prodi.targets.index': { url: () => '/coordinator-prodi/targets' },
        'coordinator-prodi.targets.create': { url: () => '/coordinator-prodi/targets/create' },
        'coordinator-prodi.targets.store': { url: () => '/coordinator-prodi/targets', method: 'post' },
        'coordinator-prodi.targets.update': { url: (id: string | number) => `/coordinator-prodi/targets/${id}`, method: 'put' },
        'coordinator-prodi.targets.delete': { url: (id: string | number) => `/coordinator-prodi/targets/${id}`, method: 'delete' },
    };

    const routeFn = routeMap[name];

    if (!routeFn) {
        console.warn(`Route "${name}" not found in route map`);
        return '#';
    }

    // Handle routes with parameters
    if (allParams.length > 0) {
        // For routes like 'assessor-assignments.show', the param is the ID
        if (name.includes('assessor-assignments') && (name.includes('.show') || name.includes('.edit') || name.includes('.update') || name.includes('.destroy'))) {
            // The parameter name is 'assessor_assignment' for assessor-assignments routes
            return routeFn.url({ assessor_assignment: allParams[0] });
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
        }
        // For other routes, pass the first param directly
        return routeFn.url(allParams[0]);
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

