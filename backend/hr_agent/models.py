from django.db import models
from django.contrib.auth.models import User
from datetime import datetime, timedelta


class Employee(models.Model):
    ROLES = [
        ('pharmacist_titular', 'Pharmacien Titulaire'),
        ('pharmacist_adjoint', 'Pharmacien Adjoint'),
        ('preparateur', 'Préparateur en Pharmacie'),
        ('clerk', 'Employé de Rayon'),
        ('intern', 'Stagiaire'),
    ]
    CONTRACT_TYPES = [
        ('cdi_full', 'CDI Temps Plein'),
        ('cdi_part', 'CDI Temps Partiel'),
        ('cdd', 'CDD'),
        ('alternance', 'Alternance'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=30, choices=ROLES)
    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPES)
    contract_hours = models.DecimalField(max_digits=4, decimal_places=1, default=35.0)
    is_qualified_pharmacist = models.BooleanField(default=False)
    license_number = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=20)
    hire_date = models.DateField()
    remaining_vacation_days = models.DecimalField(max_digits=5, decimal_places=1, default=25.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'hr_employees'
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
    
    def __str__(self):
        return f"{self.user.get_full_name()} — {self.get_role_display()}"


class WorkShift(models.Model):
    STATUS = [
        ('draft', 'Brouillon'),
        ('confirmed', 'Confirmé'),
        ('cancelled', 'Annulé'),
        ('completed', 'Terminé'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shifts')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    break_duration = models.IntegerField(default=60, help_text="Break in minutes")
    status = models.CharField(max_length=20, choices=STATUS, default='draft')
    is_night_shift = models.BooleanField(default=False)
    generated_by_ai = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def duration_hours(self):
        start = datetime.combine(self.date, self.start_time)
        end = datetime.combine(self.date, self.end_time)
        duration = (end - start).total_seconds() / 3600
        return round(duration - (self.break_duration / 60), 2)
    
    class Meta:
        db_table = 'hr_shifts'
        unique_together = ['employee', 'date', 'start_time']
        verbose_name = 'Work Shift'
        verbose_name_plural = 'Work Shifts'
    
    def __str__(self):
        return f"{self.employee.user.first_name} - {self.date} ({self.start_time}-{self.end_time})"


class AbsenceRequest(models.Model):
    TYPES = [
        ('conge_paye', 'Congé Payé'),
        ('rtt', 'RTT'),
        ('maladie', 'Arrêt Maladie'),
        ('formation', 'Formation'),
        ('maternite', 'Congé Maternité/Paternité'),
        ('evenement_familial', 'Événement Familial'),
        ('autre', 'Autre'),
    ]
    STATUS = [
        ('pending', 'En Attente'),
        ('approved', 'Approuvé'),
        ('refused', 'Refusé'),
        ('cancelled', 'Annulé'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='absences')
    type = models.CharField(max_length=30, choices=TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    manager_comment = models.TextField(blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_absences')
    days_count = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hr_absences'
        verbose_name = 'Absence Request'
        verbose_name_plural = 'Absence Requests'
    
    def __str__(self):
        return f"{self.employee.user.first_name} - {self.get_type_display()} ({self.start_date} → {self.end_date})"


class ComplianceRule(models.Model):
    CATEGORIES = [
        ('working_time', 'Durée du Travail'),
        ('rest', 'Temps de Repos'),
        ('night_work', 'Travail de Nuit'),
        ('overtime', 'Heures Supplémentaires'),
        ('vacation', 'Congés Payés'),
        ('pharmacy_specific', 'Spécifique Pharmacie'),
    ]
    
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=CATEGORIES)
    description = models.TextField()
    legal_reference = models.CharField(max_length=200)
    threshold_value = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    threshold_unit = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'hr_compliance_rules'
        verbose_name = 'Compliance Rule'
        verbose_name_plural = 'Compliance Rules'
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class ComplianceViolation(models.Model):
    SEVERITY = [
        ('info', 'Information'),
        ('warning', 'Avertissement'),
        ('critical', 'Critique'),
    ]
    
    rule = models.ForeignKey(ComplianceRule, on_delete=models.CASCADE, related_name='violations')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='violations')
    shift = models.ForeignKey(WorkShift, on_delete=models.CASCADE, null=True, blank=True, related_name='violations')
    severity = models.CharField(max_length=20, choices=SEVERITY)
    description = models.TextField()
    detected_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'hr_compliance_violations'
        verbose_name = 'Compliance Violation'
        verbose_name_plural = 'Compliance Violations'
    
    def __str__(self):
        return f"{self.employee.user.first_name} - {self.rule.code} ({self.get_severity_display()})"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)
    model_name = models.CharField(max_length=50)
    object_id = models.IntegerField(null=True, blank=True)
    changes = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'hr_audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['model_name', 'object_id']),
        ]
    
    def __str__(self):
        return f"{self.user.username if self.user else 'System'} - {self.action} ({self.timestamp})"


class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(max_length=10, choices=[('user', 'User'), ('assistant', 'Assistant')])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'hr_chat_messages'
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.user.username} - {self.role} ({self.timestamp})"
