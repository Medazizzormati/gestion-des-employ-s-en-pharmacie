from rest_framework import serializers
from django.contrib.auth.models import User
from hr_agent.models import (
    Employee, WorkShift, AbsenceRequest, ComplianceRule,
    ComplianceViolation, AuditLog, ChatMessage
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    contract_type_display = serializers.CharField(source='get_contract_type_display', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'role', 'role_display', 'contract_type', 'contract_type_display',
            'contract_hours', 'is_qualified_pharmacist', 'license_number', 'phone',
            'hire_date', 'remaining_vacation_days', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class WorkShiftSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    duration_hours = serializers.FloatField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = WorkShift
        fields = [
            'id', 'employee', 'employee_name', 'date', 'start_time', 'end_time',
            'break_duration', 'status', 'status_display', 'is_night_shift',
            'generated_by_ai', 'duration_hours', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duration_hours']


class AbsenceRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = AbsenceRequest
        fields = [
            'id', 'employee', 'employee_name', 'type', 'type_display', 'start_date',
            'end_date', 'reason', 'status', 'status_display', 'manager_comment',
            'approved_by', 'approved_by_name', 'days_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ComplianceRuleSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = ComplianceRule
        fields = [
            'id', 'code', 'name', 'category', 'category_display', 'description',
            'legal_reference', 'threshold_value', 'threshold_unit', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ComplianceViolationSerializer(serializers.ModelSerializer):
    rule_code = serializers.CharField(source='rule.code', read_only=True)
    rule_name = serializers.CharField(source='rule.name', read_only=True)
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = ComplianceViolation
        fields = [
            'id', 'rule', 'rule_code', 'rule_name', 'employee', 'employee_name',
            'shift', 'severity', 'severity_display', 'description', 'detected_at',
            'resolved', 'resolved_at'
        ]
        read_only_fields = ['id', 'detected_at']


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_name', 'action', 'model_name', 'object_id',
            'changes', 'ip_address', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class ChatMessageSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'user_name', 'role', 'content', 'timestamp']
        read_only_fields = ['id', 'timestamp']
