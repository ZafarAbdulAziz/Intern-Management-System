from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Position, Application, Intern,
    OnboardingChecklist, Document, Task,
    Evaluation, OffboardingChecklist, ConversionDecision
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    list_display = ['username', 'email', 'role', 'is_staff']
    list_filter = ['role']


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'status', 'created_at']
    list_filter = ['status', 'department']


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['candidate_name', 'position', 'status', 'applied_date']
    list_filter = ['status']


@admin.register(Intern)
class InternAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'manager', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'department']


@admin.register(OnboardingChecklist)
class OnboardingChecklistAdmin(admin.ModelAdmin):
    list_display = ['item', 'intern', 'status', 'completed_date']
    list_filter = ['status']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['type', 'intern', 'signed_status', 'uploaded_at']
    list_filter = ['type', 'signed_status']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'intern', 'status', 'due_date']
    list_filter = ['status']


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ['intern', 'evaluator', 'period', 'created_at']
    list_filter = ['period']


@admin.register(OffboardingChecklist)
class OffboardingChecklistAdmin(admin.ModelAdmin):
    list_display = ['item', 'intern', 'status', 'completed_date']
    list_filter = ['status']


@admin.register(ConversionDecision)
class ConversionDecisionAdmin(admin.ModelAdmin):
    list_display = ['intern', 'decision', 'decided_by', 'decided_at']
    list_filter = ['decision']
