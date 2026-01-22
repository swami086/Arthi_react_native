import { http, HttpResponse } from 'msw';

export const handlers = [
    // Mock fetching a surface
    http.get('*/rest/v1/a2ui_surfaces*', () => {
        return HttpResponse.json([
            {
                surface_id: 'test-surface',
                user_id: 'test-user',
                agent_id: 'test-agent',
                version: 1,
                components: [],
                data_model: {},
                updated_at: new Date().toISOString()
            }
        ]);
    }),

    // Mock logging
    http.post('*/rest/v1/a2ui_logs', () => {
        return new HttpResponse(null, { status: 201 });
    })
];
