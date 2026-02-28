# PharmAssist HR Agent - Intelligent HR Management for French Pharmacies

A full-stack HR management system for pharmacies that combines Django REST backend with Next.js frontend and Claude AI integration. Designed to manage French pharmacy staffing with built-in compliance against French labor law (Code du Travail).

## Features

### Core Functionality
- **Employee Management**: Complete CRUD operations with role-based access, contract types, and vacation tracking
- **Intelligent Scheduling**: AI-powered shift planning respecting all French labor law constraints
- **Compliance Checking**: Real-time validation against 9 French labor law rules
- **Absence Management**: Workflow for leave requests with automatic compliance validation
- **AI Chat Interface**: Claude-powered assistant for HR decisions and recommendations
- **Activity Forecasting**: 7-day staffing predictions and workload analysis
- **Audit Logging**: Comprehensive change tracking for all HR actions

### French Labor Law Compliance
The system enforces:
- **Art. L3121-27**: 35h/week legal duration
- **Art. L3121-20**: 48h/week absolute maximum
- **Art. L3131-1**: 11h minimum daily rest
- **Art. L3132-2**: 35h minimum weekly rest
- **Art. L3121-18**: 10h maximum daily duration
- **Art. L3121-16**: Mandatory break after 6h work
- **Art. L3122-7**: 8h maximum night shift
- **Art. L5125-4**: Mandatory qualified pharmacist presence
- **Art. L3141-3**: 25 days minimum vacation

### Technical Architecture

```
Frontend (Next.js 16 + React 18)
├── Pages: Dashboard, Planning, Absences, Chat, Compliance
├── Components: Reusable HR UI components
├── Hooks: TanStack Query for data fetching
└── API Client: Type-safe REST client

Backend (Django 4.2 + DRF 3.14)
├── Models: Employee, WorkShift, Absence, Compliance, Chat
├── Services: ComplianceChecker, PharmacyHRAgent
├── APIs: RESTful endpoints for all resources
└── Integration: Claude AI for intelligent recommendations
```

## Quick Start

### Prerequisites
- Python 3.8+ (backend)
- Node.js 18+ (frontend)
- Anthropic API key (for AI features)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file
cat > .env << EOF
SECRET_KEY=your-django-secret-key
DEBUG=True
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
EOF

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# (Optional) Seed demo data
python manage.py shell
>>> from hr_agent.services import ComplianceChecker
>>> checker = ComplianceChecker()
>>> checker.initialize_rules()

# Start server
python manage.py runserver
# Runs on http://localhost:8000
```

### Frontend Setup

```bash
# In root directory
npm install

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EOF

# Start development server
npm run dev
# Visit http://localhost:3000/hr-agent
```

### Django Admin Access
- URL: http://localhost:8000/admin
- Use superuser credentials created above

## Project Structure

```
pharmacy-hr-agent/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                    # Django settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── __init__.py
│   └── hr_agent/                  # Main Django app
│       ├── models.py              # 7 models: Employee, WorkShift, etc.
│       ├── admin.py               # Django admin config
│       ├── signals.py             # Audit logging
│       ├── services/
│       │   ├── compliance.py      # French labor law checker
│       │   └── ai_agent.py        # Claude AI integration
│       └── api/
│           ├── serializers.py     # DRF serializers
│           ├── views.py           # REST endpoints
│           └── urls.py            # API routing
│
├── app/
│   ├── layout.tsx                 # Root layout
│   └── hr-agent/
│       ├── layout.tsx             # HR agent sidebar navigation
│       ├── page.tsx               # Dashboard
│       ├── planning/page.tsx       # Shift planning board
│       ├── absences/page.tsx       # Absence kanban
│       ├── chat/page.tsx           # AI chat interface
│       └── compliance/page.tsx     # Compliance checker
│
├── components/
│   ├── ui/                        # shadcn/ui components
│   └── hr-agent/                  # HR-specific components
│
├── lib/
│   ├── api.ts                     # API client with types
│   └── mock-data.ts               # Demo data for development
│
├── hooks/
│   └── useHRAgent.ts              # TanStack Query hooks
│
└── package.json
```

## API Endpoints

### Employees
- `GET /api/employees/` - List all employees
- `GET /api/employees/{id}/` - Get employee details
- `GET /api/employees/{id}/schedule/` - Get employee schedule
- `GET /api/employees/{id}/compliance_status/` - Check compliance
- `POST /api/employees/` - Create employee
- `PATCH /api/employees/{id}/` - Update employee

### Shifts
- `GET /api/shifts/` - List shifts
- `GET /api/shifts/this_week/` - Get this week's shifts
- `POST /api/shifts/` - Create shift
- `POST /api/shifts/bulk_create/` - Create multiple shifts
- `PATCH /api/shifts/{id}/` - Update shift
- `DELETE /api/shifts/{id}/` - Delete shift

### Absences
- `GET /api/absences/` - List absences
- `GET /api/absences/pending/` - Get pending requests
- `POST /api/absences/` - Request absence
- `POST /api/absences/{id}/approve/` - Approve request
- `POST /api/absences/{id}/refuse/` - Refuse request

### Compliance & AI
- `POST /api/compliance/check/` - Run compliance check
- `POST /api/chat/` - Send message to AI agent
- `GET /api/forecast/` - Get 7-day forecast

### Demo
- `POST /api/demo/seed/` - Create demo data

## Environment Variables

### Backend (.env)
```
SECRET_KEY=django-secret-key
DEBUG=True
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
USE_POSTGRES=False  # Optional: use PostgreSQL instead of SQLite
DB_NAME=pharmacy_hr
DB_USER=postgres
DB_PASSWORD=...
DB_HOST=localhost
DB_PORT=5432
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Using the AI Agent

The PharmAssist AI agent uses Claude Opus model to:

1. **Generate optimal schedules** respecting all constraints
2. **Analyze absence requests** for compliance impact
3. **Recommend staffing decisions** based on workload
4. **Detect regulatory risks** proactively
5. **Suggest alternatives** when conflicts arise

### Example Queries
- "Generate next week's schedule respecting all constraints"
- "Can Marie take vacation June 15-17?"
- "Who should cover the night shift on Friday?"
- "Are we compliant with Art. L3121-27 this week?"

## Compliance Checking

The `ComplianceChecker` service:
- Validates schedules against 9 French labor law articles
- Detects violations and issues warnings
- Calculates compliance score (0-100)
- Tracks violations with severity levels
- Supports pharmacy-wide coverage validation

Example:
```python
from hr_agent.services import ComplianceChecker

checker = ComplianceChecker()
result = checker.check_schedule(employee_id=1)
# Returns: {
#   "is_compliant": bool,
#   "violations": [...],
#   "warnings": [...],
#   "compliance_score": int,
#   "total_hours": float
# }
```

## Database Models

### Employee
- User (FK to Django User)
- Role (Pharmacist, Preparateur, Clerk, etc.)
- Contract type and hours
- Qualification status and license
- Vacation days tracking

### WorkShift
- Employee (FK)
- Date and time range
- Break duration
- Status (draft, confirmed, completed, cancelled)
- Night shift flag
- AI generation flag

### AbsenceRequest
- Employee (FK)
- Type (vacation, sick leave, training, etc.)
- Dates and duration
- Reason and notes
- Status and approval workflow
- Remaining vacation tracking

### ComplianceRule
- Article code and name
- Category (working hours, rest, vacation, etc.)
- Threshold values and units
- Legal reference
- Active flag

### ComplianceViolation
- Rule (FK)
- Employee (FK)
- Shift (FK) optional
- Severity (info, warning, critical)
- Detection and resolution timestamps

### AuditLog
- User and action
- Model and object ID
- Changes (JSON)
- IP address and timestamp

### ChatMessage
- User (FK)
- Role (user, assistant)
- Content
- Timestamp

## Testing & Demo

### Using Mock Data
Set `USE_MOCK_DATA = True` in `hooks/useHRAgent.ts` for offline development.

### Creating Demo Data
```bash
# Via API
curl -X POST http://localhost:8000/api/demo/seed/ \
  -H "Authorization: Token <your-token>"

# Via Django
python manage.py shell
>>> from django.contrib.auth.models import User
>>> from hr_agent.models import Employee
>>> # Create test data...
```

## Deployment

### Django (Production)
```bash
# With Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000

# With environment
export SECRET_KEY='your-production-key'
export DEBUG=False
export ALLOWED_HOSTS='yourdomain.com,www.yourdomain.com'
export ANTHROPIC_API_KEY='sk-ant-...'
```

### Next.js (Vercel)
```bash
# Deploy to Vercel
vercel deploy

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-backend.com/api
```

## Key Libraries

### Backend
- Django 4.2.11
- Django REST Framework 3.14.0
- Anthropic 0.25.0 (Claude API)
- psycopg2-binary (PostgreSQL support)

### Frontend
- Next.js 16.1.6
- React 18
- @tanstack/react-query 5
- shadcn/ui (component library)
- Tailwind CSS
- Lucide Icons

## Architecture Decisions

1. **Django + DRF Backend**: Mature framework with excellent ORM and admin interface for HR data management
2. **Next.js Frontend**: Modern React with SSR capabilities and excellent developer experience
3. **TanStack Query**: Powerful data fetching and caching for complex HR workflows
4. **Claude AI**: State-of-the-art LLM for understanding French labor law context
5. **SQLite Default**: Easy development, upgrade to PostgreSQL for production
6. **Audit Logging**: Complete change tracking for compliance and accountability

## Contributing

1. Follow PEP 8 (Python) and ESLint config (JavaScript)
2. Write tests for new features
3. Document API changes
4. Validate compliance rules with real scenarios
5. Test multi-shift scenarios

## Support

For issues, questions, or suggestions:
1. Check the `IMPLEMENTATION_STATUS.md` file
2. Review Django logs: `backend/` directory
3. Check Next.js build output: Terminal during `npm run dev`
4. Validate API response structure in browser DevTools

## License

This project is created for the Data2Innov hackathon challenge.

## Changelog

### v0.1.0 (Initial Release)
- Complete Django backend with 7 models
- Compliance checking against 9 French labor law articles
- Claude AI integration for intelligent recommendations
- Full REST API with 20+ endpoints
- Next.js dashboard with navigation
- TanStack Query integration for efficient data fetching
- Mock data support for development
- Django admin interface
- Audit logging for all changes

---

**Built with Django, Next.js, Claude AI, and 💙 for French pharmacy managers**
