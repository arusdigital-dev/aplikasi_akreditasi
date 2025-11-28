import assessorAssignments from '@/routes/assessor-assignments';
import { home, login, register, logout } from '@/routes';
import dashboard from '@/routes/dashboard';

/**
 * Global route helper function that maps route names to Wayfinder route functions
 */
export function route(name: string, ...params: (string | number)[]): string {
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
    };

    const routeFn = routeMap[name];

    if (!routeFn) {
        console.warn(`Route "${name}" not found in route map`);
        return '#';
    }

    // Handle routes with parameters
    if (params.length > 0) {
        // For routes like 'assessor-assignments.show', the param is the ID
        if (name.includes('assessor-assignments') && (name.includes('.show') || name.includes('.edit') || name.includes('.update') || name.includes('.destroy'))) {
            // The parameter name is 'assessor_assignment' for assessor-assignments routes
            return routeFn.url({ assessor_assignment: params[0] });
        }
        // For employees routes (using direct URL since Wayfinder hasn't generated them yet)
        if (name.includes('employees')) {
            if (name.includes('.show')) {
                return `/employees/${params[0]}`;
            }
            if (name.includes('.edit')) {
                return `/employees/${params[0]}/edit`;
            }
            if (name.includes('.update')) {
                return `/employees/${params[0]}`;
            }
            if (name.includes('.destroy')) {
                return `/employees/${params[0]}`;
            }
        }
        // For other routes, pass the first param directly
        return routeFn.url(params[0]);
    }

    return routeFn.url();
}

// Make route available globally
if (typeof window !== 'undefined') {
    (window as any).route = route;
}

