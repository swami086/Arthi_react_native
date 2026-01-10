import { createNavigationContainerRef, NavigationState } from '@react-navigation/native';
import rollbar, { getTraceId } from '../services/rollbar';

// Global navigation reference
export const navigationRef = createNavigationContainerRef();

/**
 * Extracts the current route name from the navigation state object safely.
 * This avoids calling navigationRef.getCurrentRoute() which can throw if context is locked.
 */
function getRouteName(state: any): string | undefined {
    if (!state || !state.routes || state.index === undefined) return undefined;
    const route = state.routes[state.index];
    if (route.state) {
        return getRouteName(route.state);
    }
    return route.name;
}

/**
 * Handle navigation state changes to track the current route
 */
export const onNavigationStateChange = (state: NavigationState | undefined) => {
    try {
        if (!state) return;

        const activeRouteName = getRouteName(state);

        if (activeRouteName) {
            rollbar.info(`Navigated to: ${activeRouteName}`, {
                screen: activeRouteName,
                trace_id: getTraceId()
            });
            rollbar.addBreadcrumb({
                category: 'navigation',
                message: `Navigated to ${activeRouteName}`,
                level: 'info',
            });
            rollbar.addBreadcrumb({
                category: 'navigation',
                message: `Navigated to ${activeRouteName}`,
                level: 'info',
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('navigation context')) {
            reportError(error, 'navigationErrorHandler:onNavigationStateChange');
        }
    }
};

/**
 * Handle unhandled navigation actions
 * This is useful for debugging deep links or extensive navigation failures
 */
export const onUnhandledAction = (action: any) => {
    reportError(new Error(`Unhandled Navigation Action: ${action.type}`), 'navigationErrorHandler:onUnhandledAction');
    rollbar.addBreadcrumb({
        category: 'navigation',
        message: `Unhandled action: ${action.type}`,
        level: 'warning',
    });
    console.warn('Unhandled navigation action', action);
};
