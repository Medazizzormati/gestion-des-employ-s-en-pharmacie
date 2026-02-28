from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from hr_agent.models import WorkShift, AbsenceRequest, AuditLog


@receiver(post_save, sender=WorkShift)
def log_shift_change(sender, instance, created, **kwargs):
    """Log shift creation/updates to audit trail"""
    action = 'SHIFT_CREATED' if created else 'SHIFT_UPDATED'
    AuditLog.objects.create(
        action=action,
        model_name='WorkShift',
        object_id=instance.id,
        changes={'shift_id': instance.id, 'employee_id': instance.employee.id}
    )


@receiver(post_save, sender=AbsenceRequest)
def log_absence_change(sender, instance, created, **kwargs):
    """Log absence request changes to audit trail"""
    action = 'ABSENCE_CREATED' if created else 'ABSENCE_UPDATED'
    AuditLog.objects.create(
        action=action,
        model_name='AbsenceRequest',
        object_id=instance.id,
        changes={'status': instance.status, 'employee_id': instance.employee.id}
    )
