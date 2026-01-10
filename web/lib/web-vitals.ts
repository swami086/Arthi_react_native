import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';
import { reportInfo, reportWarning, reportError } from './rollbar-utils';

const VITALS_THRESHOLD = {
    LCP: 2500,
    INP: 200,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 800
};

function sendToRollbar(metric: Metric) {
    const { name, value, rating, delta, id } = metric;

    const payload = {
        metric_name: name,
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        rating,
        delta: Math.round(name === 'CLS' ? delta * 1000 : delta),
        metric_id: id,
        path: window.location.pathname,
    };

    if (rating === 'poor') {
        reportError(new Error(`Web Vitals Error: ${name} is poor`), 'performance.vitals', payload);
    } else if (rating === 'needs-improvement') {
        reportWarning(`Web Vitals Warning: ${name} needs improvement`, 'performance.vitals', payload);
    } else {
        reportInfo(`[Web Vitals] ${name}`, 'performance.vitals', payload);
    }
}

export function reportWebVitals() {
    onCLS(sendToRollbar);
    onFCP(sendToRollbar);
    onINP(sendToRollbar);
    onLCP(sendToRollbar);
    onTTFB(sendToRollbar);
}
