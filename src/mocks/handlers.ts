import { http, HttpResponse } from 'msw';
const now = () => new Date().toISOString();

const fakeUser = {
  id: 1,
  email: 'dev@example.com',
  first_name: 'Dev',
  last_name: 'User',
  is_active: true,
  role_id: 1,
  role: 'ADMIN',
  created_at: now(),
  updated_at: now(),
};

export const handlers = [
  // Auth
  http.post('/api/auth/login/', async ({ request }) => {
    const body = await request.json() as any;
    const email = body?.email ?? 'dev@example.com';

    return HttpResponse.json(
      {
        token: { access: 'dev-access-token', refresh: 'dev-refresh-token' },
        user: { ...fakeUser, email },
      },
      { status: 200 }
    );
  }),

  http.post('/api/auth/signup/', async ({ request }) => {
    const body = await request.json() as any;
    const user = { ...fakeUser, id: 2, email: body?.email ?? 'new@example.com' };
    return HttpResponse.json(user, { status: 201 });
  }),

  http.post('/api/auth/logout/', () => new HttpResponse(null, { status: 204 })),

  http.post('/api/auth/refresh/', () => {
    return HttpResponse.json({ access: 'dev-access-token', refresh: 'dev-refresh-token' }, { status: 200 });
  }),

  // Current user
  http.get('/api/users/me/', () => HttpResponse.json(fakeUser, { status: 200 })),

  // Dashboard
  http.get('/api/dashboard/stats/', () =>
    HttpResponse.json({ total_projects: 3, total_experiments: 12, total_deployments: 4, active_models: 2 }, { status: 200 })
  ),

  http.get('/api/dashboard/recent-experiments/', () =>
    HttpResponse.json(
      [
        { id: 101, experiment_name: 'Experiment A', project_name: 'Project One', status: 'running', created_at: now() },
        { id: 102, experiment_name: 'Experiment B', project_name: 'Project Two', status: 'completed', created_at: now() },
      ],
      { status: 200 }
    )
  ),

  http.get('/api/dashboard/recent-deployments/', () =>
    HttpResponse.json(
      [
        { id: 201, experiment_id: 101, status: 'running', created_at: now(), created_by: 1 },
        { id: 202, experiment_id: 102, status: 'completed', created_at: now(), created_by: 1 },
      ],
      { status: 200 }
    )
  ),

  http.get('/api/dashboard/activity-timeline/', () =>
    HttpResponse.json(
      [
        { id: 'a1', message: 'Experiment A started', timestamp: now() },
        { id: 'a2', message: 'Deployment B failed', timestamp: now() },
      ],
      { status: 200 }
    )
  ),

  http.get('/api/dashboard/system-health/', () =>
    HttpResponse.json({ status: 'healthy', details: {} }, { status: 200 })
  ),

  // Infrastructure
  http.get('/api/infrastructure-availability/', () =>
    HttpResponse.json({ total_instances: 3, running_instances: 2, available_instances: 1, cpu_utilization: 12, memory_utilization: 42 }, { status: 200 })
  ),

  // Projects (paginated)
  http.get('/api/projects/', () =>
    HttpResponse.json(
      { count: 1, next: null, previous: null, results: [{ id: 1, name: 'Project One', description: 'A demo project', project_type_id: 1, created_by: 1, created_at: now(), updated_at: now() }] },
      { status: 200 }
    )
  ),

  // Experiments list
  http.get('/api/experiments/', () =>
    HttpResponse.json(
      { count: 2, next: null, previous: null, results: [ { id: 101, experiment_name: 'Experiment A', description: 'desc', instance_id: 1, data_version_id: 1, project_type_id: 1, sub_model_id: 1, target_column: 'y', feature_columns: ['x'], train_test_split: 0.8, hyperparameters: {}, status: 'running', created_by: 1, created_at: now(), updated_at: now() } ] },
      { status: 200 }
    )
  ),

  // Deployments
  http.get('/api/deployments/', () =>
    HttpResponse.json({ count: 0, next: null, previous: null, results: [] }, { status: 200 })
  ),
];
