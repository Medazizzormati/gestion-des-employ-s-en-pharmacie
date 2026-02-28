from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework import routers
from hr_agent.api import views

def home_view(request):
    html = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>PharmAssist HR Agent — API Status</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      background: #0a0e1a;
      background-image:
        radial-gradient(ellipse 80% 60% at 20% -10%, rgba(56,189,248,0.18) 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 80% 110%, rgba(99,102,241,0.2) 0%, transparent 60%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #e2e8f0;
    }

    .container { max-width: 860px; width: 100%; }

    /* ── Hero ── */
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3);
      color: #38bdf8; border-radius: 999px; padding: 6px 16px;
      font-size: 13px; font-weight: 600; letter-spacing: .5px;
      margin-bottom: 24px;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
           box-shadow: 0 0 8px #22c55e; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

    h1 {
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 800; line-height: 1.15;
      background: linear-gradient(135deg, #e2e8f0 30%, #38bdf8 70%, #818cf8);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
    }
    .subtitle {
      font-size: 1.05rem; color: #94a3b8; max-width: 520px;
      margin: 0 auto 40px; line-height: 1.7;
    }

    /* ── Action Buttons ── */
    .actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 48px; }
    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 26px; border-radius: 10px;
      font-weight: 600; font-size: 15px; text-decoration: none;
      transition: transform .18s, box-shadow .18s;
    }
    .btn:hover { transform: translateY(-2px); }
    .btn-primary {
      background: linear-gradient(135deg, #38bdf8, #6366f1);
      color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.4);
    }
    .btn-primary:hover { box-shadow: 0 6px 28px rgba(99,102,241,0.6); }
    .btn-secondary {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      color: #cbd5e1; backdrop-filter: blur(8px);
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }

    /* ── Cards Grid ── */
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px,1fr)); gap: 16px; margin-bottom: 40px; }
    .card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; padding: 22px 24px;
      backdrop-filter: blur(12px); transition: border-color .2s, background .2s;
    }
    .card:hover { background: rgba(255,255,255,0.07); border-color: rgba(56,189,248,0.3); }
    .card-icon { font-size: 1.7rem; margin-bottom: 10px; }
    .card-title { font-size: 14px; font-weight: 700; color: #e2e8f0; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .6px; }
    .card-desc { font-size: 13px; color: #64748b; line-height: 1.6; }
    .card-link { display: inline-block; margin-top: 12px; font-size: 12px; font-weight: 600;
                 color: #38bdf8; text-decoration: none; }
    .card-link:hover { text-decoration: underline; }

    /* ── Footer Status Bar ── */
    .status-bar {
      display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px; padding: 14px 24px; font-size: 13px; color: #64748b;
    }
    .status-item { display: flex; align-items: center; gap: 6px; }
    .status-ok { color: #22c55e; font-weight: 600; }
    .divider { width: 1px; height: 16px; background: rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align:center;">
      <div class="badge"><span class="dot"></span> API Online &amp; Operational</div>
      <h1>PharmAssist HR Agent</h1>
      <p class="subtitle">
        Plateforme intelligente de gestion RH pour les pharmacies françaises.<br/>
        Conformité droit du travail · IA Claude · REST API
      </p>
      <div class="actions">
        <a href="/api/" class="btn btn-primary">🔌 Explorer l'API</a>
        <a href="/admin/" class="btn btn-secondary">🛡️ Panneau Admin</a>
        <a href="/api/auth/login/" class="btn btn-secondary">🔑 Connexion</a>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-icon">👥</div>
        <div class="card-title">Employés</div>
        <div class="card-desc">Gestion complète des profils, contrats et qualifications.</div>
        <a href="/api/employees/" class="card-link">GET /api/employees/ →</a>
      </div>
      <div class="card">
        <div class="card-icon">📅</div>
        <div class="card-title">Planning</div>
        <div class="card-desc">Planification des shifts, semaine en cours et création en masse.</div>
        <a href="/api/shifts/" class="card-link">GET /api/shifts/ →</a>
      </div>
      <div class="card">
        <div class="card-icon">🏖️</div>
        <div class="card-title">Absences</div>
        <div class="card-desc">Workflow de demandes de congé avec validation automatique.</div>
        <a href="/api/absences/" class="card-link">GET /api/absences/ →</a>
      </div>
      <div class="card">
        <div class="card-icon">⚖️</div>
        <div class="card-title">Conformité</div>
        <div class="card-desc">9 règles du Code du Travail français vérifiées en temps réel.</div>
        <a href="/api/compliance-rules/" class="card-link">GET /api/compliance-rules/ →</a>
      </div>
      <div class="card">
        <div class="card-icon">🤖</div>
        <div class="card-title">IA Claude</div>
        <div class="card-desc">Assistant RH intelligent pour recommandations et planning.</div>
        <a href="/api/chat/" class="card-link">POST /api/chat/ →</a>
      </div>
      <div class="card">
        <div class="card-icon">📊</div>
        <div class="card-title">Prévisions</div>
        <div class="card-desc">Analyse charge de travail sur 7 jours et alertes staffing.</div>
        <a href="/api/forecast/" class="card-link">GET /api/forecast/ →</a>
      </div>
    </div>

    <div class="status-bar">
      <div class="status-item">🟢 Django <span class="status-ok">4.2.11</span></div>
      <div class="divider"></div>
      <div class="status-item">🟢 DRF <span class="status-ok">3.14</span></div>
      <div class="divider"></div>
      <div class="status-item">🟢 Base de données <span class="status-ok">OK</span></div>
      <div class="divider"></div>
      <div class="status-item">🤖 AI <span class="status-ok">Claude Opus</span></div>
    </div>
  </div>
</body>
</html>"""
    return HttpResponse(html)

router = routers.DefaultRouter()
router.register(r'employees', views.EmployeeViewSet)
router.register(r'shifts', views.WorkShiftViewSet)
router.register(r'absences', views.AbsenceRequestViewSet)
router.register(r'compliance-rules', views.ComplianceRuleViewSet, basename='compliance-rule')
router.register(r'compliance-violations', views.ComplianceViolationViewSet, basename='compliance-violation')

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
    path('api/chat/', views.ChatAPIView.as_view(), name='chat-api'),
    path('api/compliance/check/', views.ComplianceCheckAPIView.as_view(), name='compliance-check'),
    path('api/forecast/', views.ForecastAPIView.as_view(), name='forecast'),
    path('api/demo/seed/', views.SeedDemoDataView.as_view(), name='seed-demo'),
]
