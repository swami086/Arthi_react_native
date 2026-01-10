'use client';

import React, { useEffect, useRef } from 'react';
import { reportInfo } from './rollbar-utils';

export function withPerformanceTracking<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName: string
) {
    const ComponentWithTracking = (props: P) => {
        const mountTime = useRef(performance.now());

        useEffect(() => {
            const timeToMount = performance.now() - mountTime.current;

            // Log render time if it exceeds a threshold (e.g., 50ms)
            if (timeToMount > 10) {
                reportInfo(`[Render Time] ${componentName}`, 'performance.render', {
                    component: componentName,
                    duration: timeToMount,
                    path: window.location.pathname
                });
            }
        }, []);

        return <WrappedComponent {...props} />;
    };

    ComponentWithTracking.displayName = `WithPerformanceTracking(${componentName})`;

    return ComponentWithTracking;
}
