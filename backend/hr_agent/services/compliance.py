from datetime import datetime, timedelta
from decimal import Decimal
from hr_agent.models import ComplianceViolation, ComplianceRule, WorkShift, Employee

FRENCH_PHARMACY_RULES = {
    "MAX_WEEKLY_HOURS": {
        "code": "ART_L3121_20",
        "value": 48,
        "unit": "hours",
        "description": "Durée maximale hebdomadaire absolue",
        "reference": "Article L3121-20 Code du Travail"
    },
    "STANDARD_WEEKLY_HOURS": {
        "code": "ART_L3121_27",
        "value": 35,
        "unit": "hours",
        "description": "Durée légale hebdomadaire",
        "reference": "Article L3121-27 Code du Travail"
    },
    "MIN_DAILY_REST": {
        "code": "ART_L3131_1",
        "value": 11,
        "unit": "hours",
        "description": "Repos quotidien minimum consécutif",
        "reference": "Article L3131-1 Code du Travail"
    },
    "MIN_WEEKLY_REST": {
        "code": "ART_L3132_2",
        "value": 35,
        "unit": "hours",
        "description": "Repos hebdomadaire minimum",
        "reference": "Article L3132-2 Code du Travail"
    },
    "MAX_DAILY_HOURS": {
        "code": "ART_L3121_18",
        "value": 10,
        "unit": "hours",
        "description": "Durée maximale journalière",
        "reference": "Article L3121-18 Code du Travail"
    },
    "BREAK_THRESHOLD": {
        "code": "ART_L3121_16",
        "value": 6,
        "unit": "hours",
        "description": "Pause obligatoire après 6h de travail",
        "reference": "Article L3121-16 Code du Travail"
    },
    "NIGHT_SHIFT_MAX": {
        "code": "ART_L3122_7",
        "value": 8,
        "unit": "hours",
        "description": "Durée maximale shift de nuit",
        "reference": "Article L3122-7 Code du Travail"
    },
    "PHARMACIST_MANDATORY_PRESENCE": {
        "code": "ART_L5125_4",
        "value": 1,
        "unit": "pharmacist",
        "description": "Présence obligatoire pharmacien qualifié pendant heures d'ouverture",
        "reference": "Article L5125-4 Code de la Santé Publique"
    },
    "MIN_VACATION_DAYS": {
        "code": "ART_L3141_3",
        "value": 25,
        "unit": "days",
        "description": "Congés payés annuels minimum",
        "reference": "Article L3141-3 Code du Travail"
    }
}


class ComplianceChecker:
    """Checks work schedules against French labor law regulations"""
    
    def __init__(self):
        self.rules = FRENCH_PHARMACY_RULES
    
    def check_schedule(self, employee_id: int, week_start_date=None) -> dict:
        """Run all compliance checks for an employee's weekly schedule"""
        if week_start_date is None:
            today = datetime.now().date()
            week_start_date = today - timedelta(days=today.weekday())
        
        week_end_date = week_start_date + timedelta(days=6)
        
        week_shifts = list(WorkShift.objects.filter(
            employee_id=employee_id,
            date__range=[week_start_date, week_end_date],
            status__in=['confirmed', 'draft']
        ).order_by('date', 'start_time'))
        
        violations = []
        warnings = []
        
        violations.extend(self._check_weekly_hours(employee_id, week_shifts))
        violations.extend(self._check_daily_max(week_shifts))
        violations.extend(self._check_daily_rest(week_shifts))
        violations.extend(self._check_breaks(week_shifts))
        warnings.extend(self._check_night_shifts(week_shifts))
        
        return {
            "is_compliant": len(violations) == 0,
            "violations": violations,
            "warnings": warnings,
            "compliance_score": self._calculate_score(violations, warnings),
            "total_hours": round(sum(float(s.duration_hours) for s in week_shifts), 2)
        }
    
    def check_pharmacy_coverage(self, date, all_shifts=None) -> dict:
        """Verify pharmacy always has qualified pharmacist on duty"""
        if all_shifts is None:
            all_shifts = WorkShift.objects.filter(
                date=date,
                status__in=['confirmed', 'draft']
            ).select_related('employee')
        
        qualified_on_duty = [
            s for s in all_shifts
            if s.employee.is_qualified_pharmacist
        ]
        
        is_covered = len(qualified_on_duty) > 0
        
        return {
            "is_covered": is_covered,
            "qualified_pharmacists_on_duty": [
                f"{s.employee.user.get_full_name()} ({s.start_time}-{s.end_time})"
                for s in qualified_on_duty
            ],
            "coverage_status": "✓ Couverte" if is_covered else "✗ Non couverte"
        }
    
    def validate_absence_request(self, absence) -> dict:
        """Check if absence would create compliance issues"""
        try:
            employee = Employee.objects.get(id=absence.employee_id)
        except Employee.DoesNotExist:
            return {"is_valid": False, "reason": "Employee not found"}
        
        # Check vacation days remaining
        if absence.type == 'conge_paye':
            if absence.days_count > employee.remaining_vacation_days:
                return {
                    "is_valid": False,
                    "reason": f"Not enough vacation days. Requested: {absence.days_count}, Available: {employee.remaining_vacation_days}"
                }
        
        # Check pharmacy coverage during absence period
        affected_shifts = WorkShift.objects.filter(
            date__range=[absence.start_date, absence.end_date],
            employee=employee,
            status='confirmed'
        )
        
        if affected_shifts.exists() and employee.is_qualified_pharmacist:
            affected_count = affected_shifts.count()
            return {
                "is_valid": True,
                "warning": f"Absence of qualified pharmacist for {affected_count} scheduled shifts. Coverage replacement needed.",
                "severity": "warning"
            }
        
        return {
            "is_valid": True,
            "message": "Absence request is valid"
        }
    
    def _check_weekly_hours(self, employee_id: int, shifts: list) -> list:
        """Check Article L3121-20 and L3121-27: weekly hours limits"""
        violations = []
        
        if not shifts:
            return violations
        
        total_hours = sum(float(s.duration_hours) for s in shifts)
        
        if total_hours > 48:
            violations.append({
                "rule": "MAX_WEEKLY_HOURS",
                "severity": "critical",
                "message": f"Dépassement max hebdomadaire: {total_hours}h > 48h",
                "legal_ref": "Art. L3121-20",
                "current_value": total_hours,
                "threshold": 48
            })
        elif total_hours > 44:
            violations.append({
                "rule": "STANDARD_WEEKLY_HOURS",
                "severity": "warning",
                "message": f"Heures supplémentaires importantes: {total_hours}h",
                "legal_ref": "Art. L3121-27",
                "current_value": total_hours,
                "threshold": 35
            })
        
        return violations
    
    def _check_daily_max(self, shifts: list) -> list:
        """Check Article L3121-18: maximum daily hours (10h)"""
        violations = []
        
        for shift in shifts:
            if shift.duration_hours > 10:
                violations.append({
                    "rule": "MAX_DAILY_HOURS",
                    "severity": "critical",
                    "message": f"Dépassement durée journalière: {shift.duration_hours}h > 10h ({shift.date})",
                    "legal_ref": "Art. L3121-18",
                    "current_value": shift.duration_hours,
                    "threshold": 10,
                    "shift_id": shift.id
                })
        
        return violations
    
    def _check_daily_rest(self, shifts: list) -> list:
        """Check Article L3131-1: minimum 11h daily rest between shifts"""
        violations = []
        
        if len(shifts) < 2:
            return violations
        
        for i in range(len(shifts) - 1):
            current_shift = shifts[i]
            next_shift = shifts[i + 1]
            
            # Calculate rest period
            current_end = datetime.combine(current_shift.date, current_shift.end_time)
            next_start = datetime.combine(next_shift.date, next_shift.start_time)
            
            rest_hours = (next_start - current_end).total_seconds() / 3600
            
            if rest_hours < 11:
                violations.append({
                    "rule": "MIN_DAILY_REST",
                    "severity": "critical",
                    "message": f"Repos insuffisant entre {current_shift.date} et {next_shift.date}: {rest_hours}h < 11h",
                    "legal_ref": "Art. L3131-1",
                    "current_value": rest_hours,
                    "threshold": 11
                })
        
        return violations
    
    def _check_breaks(self, shifts: list) -> list:
        """Check Article L3121-16: mandatory break after 6h"""
        violations = []
        
        for shift in shifts:
            if shift.duration_hours > 6:
                if shift.break_duration < 20:  # minimum 20 minutes
                    violations.append({
                        "rule": "BREAK_THRESHOLD",
                        "severity": "warning",
                        "message": f"Pause insuffisante pour shift > 6h ({shift.date}): {shift.break_duration}min < 20min",
                        "legal_ref": "Art. L3121-16",
                        "current_value": shift.break_duration,
                        "threshold": 20,
                        "shift_id": shift.id
                    })
        
        return violations
    
    def _check_night_shifts(self, shifts: list) -> list:
        """Check Article L3122-7: night shift maximum 8h"""
        warnings = []
        
        for shift in shifts:
            if shift.is_night_shift and shift.duration_hours > 8:
                warnings.append({
                    "rule": "NIGHT_SHIFT_MAX",
                    "severity": "warning",
                    "message": f"Travail de nuit: {shift.duration_hours}h > 8h ({shift.date})",
                    "legal_ref": "Art. L3122-7",
                    "current_value": shift.duration_hours,
                    "threshold": 8,
                    "shift_id": shift.id
                })
        
        return warnings
    
    def _calculate_score(self, violations: list, warnings: list) -> int:
        """Calculate compliance score (0-100)"""
        score = 100
        score -= len([v for v in violations if v['severity'] == 'critical']) * 30
        score -= len([v for v in violations if v['severity'] == 'warning']) * 10
        score -= len(warnings) * 5
        return max(0, score)
    
    def initialize_rules(self):
        """Create compliance rules in database if not exist"""
        for key, rule_data in FRENCH_PHARMACY_RULES.items():
            ComplianceRule.objects.get_or_create(
                code=rule_data['code'],
                defaults={
                    'name': rule_data['description'],
                    'category': 'working_time' if 'WEEKLY' in key or 'DAILY' in key else 'rest' if 'REST' in key else 'night_work' if 'NIGHT' in key else 'vacation' if 'VACATION' in key else 'pharmacy_specific',
                    'description': rule_data['description'],
                    'legal_reference': rule_data['reference'],
                    'threshold_value': Decimal(str(rule_data.get('value', 0))),
                    'threshold_unit': rule_data.get('unit', ''),
                }
            )
