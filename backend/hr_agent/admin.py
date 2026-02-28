from django.contrib import admin
from hr_agent.models import (
    Employee, WorkShift, AbsenceRequest, ComplianceRule,
    ComplianceViolation, AuditLog, ChatMessage
)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'role', 'contract_type', 'is_qualified_pharmacist', 'hire_date']
    list_filter = ['role', 'contract_type', 'is_qualified_pharmacist', 'hire_date']
    search_fields = ['user__first_name', 'user__last_name', 'license_number']
    readonly_fields = ['created_at']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'


@admin.register(WorkShift)
class WorkShiftAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'start_time', 'end_time', 'duration_hours', 'status', 'is_night_shift']
    list_filter = ['status', 'date', 'is_night_shift', 'generated_by_ai']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']
    readonly_fields = ['duration_hours', 'created_at', 'updated_at']
    date_hierarchy = 'date'


@admin.register(AbsenceRequest)
class AbsenceRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'type', 'start_date', 'end_date', 'days_count', 'status']
    list_filter = ['type', 'status', 'start_date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Request Info', {'fields': ('employee', 'type', 'start_date', 'end_date', 'days_count')}),
        ('Reason', {'fields': ('reason',)}),
        ('Decision', {'fields': ('status', 'manager_comment', 'approved_by')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(ComplianceRule)
class ComplianceRuleAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['code', 'name']
    readonly_fields = ['created_at']


@admin.register(ComplianceViolation)
class ComplianceViolationAdmin(admin.ModelAdmin):
    list_display = ['rule', 'employee', 'severity', 'detected_at', 'resolved']
    list_filter = ['severity', 'resolved', 'detected_at']
    search_fields = ['employee__user__first_name', 'rule__code']
    readonly_fields = ['detected_at']
    date_hierarchy = 'detected_at'


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'model_name', 'timestamp']
    list_filter = ['action', 'model_name', 'timestamp']
    search_fields = ['user__username', 'action', 'model_name']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'timestamp']
    list_filter = ['role', 'timestamp']
    search_fields = ['user__username']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
