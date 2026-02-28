from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from datetime import datetime, timedelta, date
import json

from hr_agent.models import (
    Employee, WorkShift, AbsenceRequest, ComplianceRule,
    ComplianceViolation, AuditLog, ChatMessage
)
from hr_agent.services import ComplianceChecker, PharmacyHRAgent
from .serializers import (
    EmployeeSerializer, WorkShiftSerializer, AbsenceRequestSerializer,
    ComplianceRuleSerializer, ComplianceViolationSerializer,
    AuditLogSerializer, ChatMessageSerializer
)


class EmployeeViewSet(viewsets.ModelViewSet):
    """CRUD operations for employees"""
    queryset = Employee.objects.select_related('user').all()
    serializer_class = EmployeeSerializer
    permission_classes = []
    filterset_fields = ['role', 'contract_type', 'is_qualified_pharmacist']
    search_fields = ['user__first_name', 'user__last_name', 'license_number']
    ordering_fields = ['hire_date', 'user__last_name']
    ordering = ['-hire_date']
    
    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        """Get employee's schedule for current week"""
        employee = self.get_object()
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        shifts = WorkShift.objects.filter(
            employee=employee,
            date__range=[week_start, week_end]
        ).order_by('date', 'start_time')
        
        return Response({
            "employee": EmployeeSerializer(employee).data,
            "week": f"{week_start} to {week_end}",
            "shifts": WorkShiftSerializer(shifts, many=True).data
        })
    
    @action(detail=True, methods=['get'])
    def compliance_status(self, request, pk=None):
        """Check compliance status for employee"""
        employee = self.get_object()
        checker = ComplianceChecker()
        
        result = checker.check_schedule(employee.id)
        
        return Response({
            "employee": EmployeeSerializer(employee).data,
            "compliance": result
        })


class WorkShiftViewSet(viewsets.ModelViewSet):
    """CRUD operations for work shifts"""
    queryset = WorkShift.objects.select_related('employee__user').all()
    serializer_class = WorkShiftSerializer
    permission_classes = []
    filterset_fields = ['employee', 'date', 'status', 'is_night_shift']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']
    ordering_fields = ['date', 'start_time']
    ordering = ['date', 'start_time']
    
    @action(detail=False, methods=['get'])
    def this_week(self, request):
        """Get all shifts for this week"""
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        shifts = WorkShift.objects.filter(
            date__range=[week_start, week_end]
        ).select_related('employee__user').order_by('date', 'start_time')
        
        return Response({
            "week": f"{week_start} to {week_end}",
            "shifts": WorkShiftSerializer(shifts, many=True).data
        })
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple shifts at once"""
        shifts_data = request.data.get('shifts', [])
        created = []
        errors = []
        
        for shift_data in shifts_data:
            try:
                serializer = self.get_serializer(data=shift_data)
                if serializer.is_valid():
                    serializer.save()
                    created.append(serializer.data)
                else:
                    errors.append(serializer.errors)
            except Exception as e:
                errors.append(str(e))
        
        return Response({
            "created": len(created),
            "shifts": created,
            "errors": errors
        }, status=status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST)


class AbsenceRequestViewSet(viewsets.ModelViewSet):
    """CRUD operations for absence requests"""
    queryset = AbsenceRequest.objects.select_related('employee__user', 'approved_by').all()
    serializer_class = AbsenceRequestSerializer
    permission_classes = []
    filterset_fields = ['employee', 'type', 'status']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']
    ordering_fields = ['created_at', 'start_date']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending absence requests"""
        absences = AbsenceRequest.objects.filter(status='pending').order_by('-created_at')
        return Response({
            "count": absences.count(),
            "absences": AbsenceRequestSerializer(absences, many=True).data
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an absence request"""
        absence = self.get_object()
        absence.status = 'approved'
        absence.approved_by = request.user
        absence.save()
        
        return Response({
            "status": "approved",
            "absence": AbsenceRequestSerializer(absence).data
        })
    
    @action(detail=True, methods=['post'])
    def refuse(self, request, pk=None):
        """Refuse an absence request"""
        absence = self.get_object()
        absence.status = 'refused'
        absence.manager_comment = request.data.get('reason', '')
        absence.approved_by = request.user
        absence.save()
        
        return Response({
            "status": "refused",
            "absence": AbsenceRequestSerializer(absence).data
        })


class ComplianceRuleViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to compliance rules"""
    queryset = ComplianceRule.objects.filter(is_active=True).all()
    serializer_class = ComplianceRuleSerializer
    filterset_fields = ['category']
    ordering_fields = ['code', 'name']
    ordering = ['code']


class ComplianceViolationViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to compliance violations"""
    queryset = ComplianceViolation.objects.select_related('rule', 'employee__user', 'shift').all()
    serializer_class = ComplianceViolationSerializer
    permission_classes = []
    filterset_fields = ['employee', 'rule', 'severity', 'resolved']
    ordering_fields = ['detected_at', 'severity']
    ordering = ['-detected_at']
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark violation as resolved"""
        violation = self.get_object()
        violation.resolved = True
        violation.resolved_at = datetime.now()
        violation.save()
        
        return Response({
            "status": "resolved",
            "violation": ComplianceViolationSerializer(violation).data
        })


class ChatAPIView(APIView):
    """Chat interface with AI agent"""
    permission_classes = []
    
    def post(self, request):
        """Send message to AI agent"""
        message = request.data.get('message', '')
        
        if not message:
            return Response(
                {"error": "Message is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        agent = PharmacyHRAgent()
        
        # Override MVP authentication and set a baseline user
        from django.contrib.auth.models import User
        if request.user and request.user.is_authenticated:
            user_id = request.user.id
        else:
            first_user = User.objects.first()
            user_id = first_user.id if first_user else 1
            
        response = agent.chat(message, user_id)
        
        return Response(response)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get chat history for current user"""
        messages = ChatMessage.objects.filter(user=request.user).order_by('timestamp')
        return Response({
            "count": messages.count(),
            "messages": ChatMessageSerializer(messages, many=True).data
        })


class ComplianceCheckAPIView(APIView):
    """Check compliance for employee or shift"""
    permission_classes = []
    
    def post(self, request):
        """Run compliance check"""
        employee_id = request.data.get('employee_id')
        week_start = request.data.get('week_start')
        
        if not employee_id:
            return Response(
                {"error": "employee_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        checker = ComplianceChecker()
        
        if week_start:
            result = checker.check_schedule(employee_id, week_start)
        else:
            result = checker.check_schedule(employee_id)
        
        # Check pharmacy coverage if applicable
        today = date.today()
        coverage = checker.check_pharmacy_coverage(today)
        
        return Response({
            "employee_id": employee_id,
            "compliance": result,
            "pharmacy_coverage": coverage
        })


class ForecastAPIView(APIView):
    """Predict staffing needs and activity using ML model"""
    permission_classes = []
    
    def get(self, request):
        """Get activity forecast using ML model"""
        import os
        import joblib
        import pandas as pd
        
        days_ahead = int(request.query_params.get('days', 7))
        forecast_data = []
        today = date.today()
        
        # Load ML pipeline
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'models')
        pipeline_path = os.path.join(models_dir, 'forecast_pipeline.pkl')
        
        try:
            pipeline = joblib.load(pipeline_path)
            model_hours = pipeline['model_hours']
            model_shifts = pipeline['model_shifts']
            model_activity = pipeline['model_activity']
            features = pipeline['features']
        except FileNotFoundError:
            return Response(
                {"error": "ML model not found. Please train the model first."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
            
        for i in range(days_ahead):
            current_date = today + timedelta(days=i)
            
            # Prepare features for prediction
            day_of_week = current_date.weekday()
            month = current_date.month
            is_weekend = 1 if day_of_week in [5, 6] else 0
            flu_season = 1 if month in [11, 12, 1, 2] else 0
            
            input_data = pd.DataFrame([{
                'day_of_week': day_of_week,
                'month': month,
                'is_weekend': is_weekend,
                'flu_season': flu_season
            }], columns=features)
            
            # Make predictions
            predicted_hours = model_hours.predict(input_data)[0]
            predicted_shifts = model_shifts.predict(input_data)[0]
            predicted_activity = model_activity.predict(input_data)[0]
            
            # Get actual scheduled shifts if applicable
            shifts = WorkShift.objects.filter(date=current_date, status__in=['confirmed', 'draft'])
            scheduled_pharmacists = shifts.filter(employee__is_qualified_pharmacist=True).count()
            
            forecast_data.append({
                "date": str(current_date),
                "day_of_week": current_date.strftime('%A'),
                "predicted_shifts": max(2, int(round(predicted_shifts))),
                "predicted_hours": max(16.0, round(predicted_hours, 1)),
                "expected_activity": predicted_activity,
                "currently_scheduled_pharmacists": scheduled_pharmacists,
                "currently_scheduled_shifts": shifts.count()
            })
        
        return Response({
            "forecast_days": days_ahead,
            "forecast": forecast_data,
            "model_version": pipeline.get('metadata', {}).get('version', '1.0')
        })


class SeedDemoDataView(APIView):
    """Create demo data for testing"""
    permission_classes = []
    
    def post(self, request):
        """Create demo employees, shifts, and absences"""
        return self.seed(request)
        
    def get(self, request):
        """Allow seeding via GET for manual initialization"""
        return self.seed(request)

    def seed(self, request):
        """Main seeding logic"""
        from django.contrib.auth.models import User
        from hr_agent.models import Employee, WorkShift, ComplianceRule
        from hr_agent.services import ComplianceChecker
        from datetime import datetime, time
        
        # Create demo users and employees
        demo_employees = [
            {"first_name": "Mohamed Aziz", "last_name": "Zormati", "role": "pharmacist_titular", "is_qualified": True},
            {"first_name": "Haythem", "last_name": "Mighri", "role": "pharmacist_adjoint", "is_qualified": True},
            {"first_name": "Badis", "last_name": "Abid", "role": "preparateur", "is_qualified": False},
            {"first_name": "Erij", "last_name": "AI", "role": "preparateur", "is_qualified": False},
            {"first_name": "Leila", "last_name": "HR", "role": "clerk", "is_qualified": False},
        ]
        
        created_employees = []
        
        # Create admin superuser if not exists
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@pharmacy.local', 'password123')
            print("Created admin superuser")
        else:
            admin_user = User.objects.get(username='admin')
            admin_user.set_password('password123')
            admin_user.save()
            
        for emp_data in demo_employees:
            user, _ = User.objects.get_or_create(
                username=f"{emp_data['first_name'].lower()}.{emp_data['last_name'].lower()}",
                defaults={
                    'first_name': emp_data['first_name'],
                    'last_name': emp_data['last_name'],
                    'email': f"{emp_data['first_name'].lower()}@pharmacy.local"
                }
            )
            
            employee, created = Employee.objects.get_or_create(
                user=user,
                defaults={
                    'role': emp_data['role'],
                    'contract_type': 'cdi_full',
                    'contract_hours': 35,
                    'is_qualified_pharmacist': emp_data['is_qualified'],
                    'phone': '06XX000000',
                    'hire_date': date.today() - timedelta(days=365)
                }
            )
            
            if created:
                created_employees.append(EmployeeSerializer(employee).data)
        
        # Create demo shifts
        created_shifts = []
        today = date.today()
        
        for emp in Employee.objects.all()[:3]:
            for day_offset in range(5):
                shift_date = today + timedelta(days=day_offset)
                
                if shift_date.weekday() < 5:  # Weekdays only
                    shift, created = WorkShift.objects.get_or_create(
                        employee=emp,
                        date=shift_date,
                        start_time=time(8, 30),
                        defaults={
                            'end_time': time(18, 30),
                            'break_duration': 60,
                            'status': 'confirmed'
                        }
                    )
                    
                    if created:
                        created_shifts.append(WorkShiftSerializer(shift).data)
        
        # Initialize compliance rules
        checker = ComplianceChecker()
        checker.initialize_rules()
        
        return Response({
            "status": "demo_data_created",
            "employees_created": len(created_employees),
            "employees": created_employees,
            "shifts_created": len(created_shifts),
            "compliance_rules_initialized": ComplianceRule.objects.filter(is_active=True).count()
        }, status=status.HTTP_201_CREATED)
