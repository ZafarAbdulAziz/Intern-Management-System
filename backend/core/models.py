from django.contrib.auth.models import AbstractUser
from django.db import models


# ─────────────────────────────────────────────
# USER (Custom) — roles: Admin, Manager, Intern
# ─────────────────────────────────────────────

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'Admin', 'Admin'
        MANAGER = 'Manager', 'Manager'
        INTERN = 'Intern', 'Intern'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.INTERN)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ─────────────────────────────────────────────
# 1. RECRUITING & APPLICATIONS
# ─────────────────────────────────────────────

class Position(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        CLOSED = 'closed', 'Closed'

    title = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='positions'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.department})"


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = 'applied', 'Applied'
        SCREENED = 'screened', 'Screened'
        INTERVIEWED = 'interviewed', 'Interviewed'
        OFFERED = 'offered', 'Offered'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'

    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='applications')
    candidate_name = models.CharField(max_length=255)
    email = models.EmailField()
    university = models.CharField(max_length=255)
    resume_url = models.URLField(blank=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.APPLIED)
    interview_notes = models.TextField(blank=True)
    applied_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.candidate_name} → {self.position.title} [{self.status}]"


# ─────────────────────────────────────────────
# 2. INTERN PROFILE (core entity)
# ─────────────────────────────────────────────

class Intern(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        CONVERTED = 'converted', 'Converted'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='intern_profile')
    application = models.OneToOneField(
        Application, on_delete=models.SET_NULL, null=True, blank=True, related_name='intern'
    )
    manager = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='managed_interns'
    )
    name = models.CharField(max_length=255)
    university = models.CharField(max_length=255)
    program = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.ACTIVE)
    # private fields
    personal_email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.name} — {self.department}"


# ─────────────────────────────────────────────
# 3. ONBOARDING
# ─────────────────────────────────────────────

class OnboardingChecklist(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETE = 'complete', 'Complete'

    intern = models.ForeignKey(Intern, on_delete=models.CASCADE, related_name='onboarding_items')
    item = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    completed_date = models.DateField(null=True, blank=True)
    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='onboarding_assignments'
    )

    def __str__(self):
        return f"[{self.status}] {self.item} — {self.intern.name}"


class Document(models.Model):
    class DocType(models.TextChoices):
        NDA = 'NDA', 'NDA'
        TAX = 'Tax Form', 'Tax Form'
        ID = 'ID', 'ID'
        UNIVERSITY = 'University Agreement', 'University Agreement'
        OTHER = 'Other', 'Other'

    intern = models.ForeignKey(Intern, on_delete=models.CASCADE, related_name='documents')
    type = models.CharField(max_length=30, choices=DocType.choices)
    file_url = models.URLField()
    signed_status = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} — {self.intern.name}"


# ─────────────────────────────────────────────
# 4. TASK & PROJECT MANAGEMENT
# ─────────────────────────────────────────────

class Task(models.Model):
    class Status(models.TextChoices):
        TODO = 'todo', 'To Do'
        IN_PROGRESS = 'in_progress', 'In Progress'
        DONE = 'done', 'Done'

    intern = models.ForeignKey(Intern, on_delete=models.CASCADE, related_name='tasks')
    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='assigned_tasks'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.TODO)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} [{self.status}] — {self.intern.name}"


# ─────────────────────────────────────────────
# 5. PERFORMANCE & EVALUATION
# ─────────────────────────────────────────────

class Evaluation(models.Model):
    class Period(models.TextChoices):
        MIDPOINT = 'mid-point', 'Mid-Point'
        FINAL = 'final', 'Final'

    intern = models.ForeignKey(Intern, on_delete=models.CASCADE, related_name='evaluations')
    evaluator = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='conducted_evaluations'
    )
    period = models.CharField(max_length=15, choices=Period.choices)
    scores = models.JSONField(default=dict)   # e.g. {"communication": 4, "initiative": 3}
    comments = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)  # HR/Manager only
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.period} evaluation — {self.intern.name}"


# ─────────────────────────────────────────────
# 6. OFFBOARDING & CONVERSION
# ─────────────────────────────────────────────

class OffboardingChecklist(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETE = 'complete', 'Complete'

    intern = models.ForeignKey(Intern, on_delete=models.CASCADE, related_name='offboarding_items')
    item = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    completed_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"[{self.status}] {self.item} — {self.intern.name}"


class ConversionDecision(models.Model):
    class Decision(models.TextChoices):
        CONVERT = 'convert', 'Convert to Full-Time'
        EXTEND = 'extend', 'Extend Internship'
        NOT_CONVERTING = 'not_converting', 'Not Converting'

    intern = models.OneToOneField(
        Intern, on_delete=models.CASCADE, related_name='conversion_decision'
    )
    decision = models.CharField(max_length=20, choices=Decision.choices)
    notes = models.TextField(blank=True)
    decided_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='conversion_decisions'
    )
    decided_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.intern.name} → {self.decision}"
