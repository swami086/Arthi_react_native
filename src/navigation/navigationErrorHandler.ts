import { createNavigationContainerRef, NavigationState } from '@react-navigation/native';
import rollbar, { reportError } from '../services/rollbar';

// Global navigation reference
export const navigationRef = createNavigationContainerRef();

/**
 * Handle navigation state changes to track the current route
 */
export const onNavigationStateChange = (state: NavigationState | undefined) => {
    try {
        if (!state) return;

        // This is where you could track breadcrumbs or current screen context
        const currentRoute = navigationRef.getCurrentRoute();

        if (currentRoute) {
            // Optional: Log navigation event or set context if needed
            // console.log('Navigated to:', currentRoute.name, currentRoute.params);

            // Set the global context for Rollbar to the current screen name
            // This ensures all errors reported while on this screen have the correct context
            rollbar.configure({ payload: { context: currentRoute.name } });
        }
    } catch (error) {
        // Prevent navigation tracking from crashing the app
        reportError(error, 'navigationErrorHandler:onNavigationStateChange');
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
