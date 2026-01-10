import { createNavigationContainerRef, NavigationState } from '@react-navigation/native';
import rollbar, { reportError, reportInfo, getTraceId } from '../services/rollbar';

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

        // Use the passed state object directly to find the active route.
        // This is safer than navigationRef.getCurrentRoute() because it doesn't 
        // rely on internal React Context that might be in flux.
        const activeRouteName = getRouteName(state);

        if (activeRouteName) {
            reportInfo(`Navigated to: ${activeRouteName}`, 'Navigation', {
                screen: activeRouteName,
                trace_id: getTraceId()
            });
        }
    } catch (error) {
        // Prevent navigation tracking from crashing the app.
        // Only report if it's not the already-known 'navigation context' error to avoid loops.
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
    console.warn('Unhandled navigation action', action);
};
