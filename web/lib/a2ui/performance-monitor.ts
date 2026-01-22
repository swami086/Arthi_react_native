
// ============================================================================
// Performance Monitoring
// ============================================================================

class A2UIPerformanceMonitor {
    private renderTimes = new Map<string, number>();
    private messageStartTimes = new Map<string, number>();

    private metrics = {
        renderDurations: [] as { surfaceId: string, duration: number, timestamp: number }[],
        messageProcessingTimes: [] as { type: string, duration: number, timestamp: number }[],
        actionLatencies: [] as { actionId: string, duration: number, timestamp: number }[],
    };

    /**
     * Track the start of a surface render
     */
    trackRenderStart(surfaceId: string) {
        this.renderTimes.set(surfaceId, performance.now());
    }

    /**
     * Track the end of a surface render
     */
    trackRenderEnd(surfaceId: string) {
        const startTime = this.renderTimes.get(surfaceId);
        if (!startTime) return;

        const duration = performance.now() - startTime;
        this.metrics.renderDurations.push({ surfaceId, duration, timestamp: Date.now() });

        // Prune old metrics
        if (this.metrics.renderDurations.length > 100) this.metrics.renderDurations.shift();

        this.renderTimes.delete(surfaceId);

        if (duration > 100) {
            console.warn(`[A2UI] Slow render detected for surface ${surfaceId}: ${duration.toFixed(2)}ms`);
        }
    }

    /**
     * Track message processing duration
     */
    trackMessageProcessing(messageType: string, duration: number) {
        this.metrics.messageProcessingTimes.push({ type: messageType, duration, timestamp: Date.now() });
        if (this.metrics.messageProcessingTimes.length > 100) this.metrics.messageProcessingTimes.shift();
    }

    /**
     * Track action latency
     */
    trackActionLatency(actionId: string, duration: number) {
        this.metrics.actionLatencies.push({ actionId, duration, timestamp: Date.now() });
        if (this.metrics.actionLatencies.length > 100) this.metrics.actionLatencies.shift();
    }

    /**
     * Get aggregated performance metrics
     */
    getMetrics() {
        const avgRender = this.avg(this.metrics.renderDurations.map(m => m.duration));
        const avgMsg = this.avg(this.metrics.messageProcessingTimes.map(m => m.duration));
        return {
            renderCount: this.metrics.renderDurations.length,
            avgRenderDuration: avgRender,
            avgMessageProcessingDuration: avgMsg,
            lastRenderDuration: this.metrics.renderDurations[this.metrics.renderDurations.length - 1]?.duration,
        };
    }

    private avg(arr: number[]) {
        if (arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }
}

export const performanceMonitor = new A2UIPerformanceMonitor();
