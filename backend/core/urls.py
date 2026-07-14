from django.urls import path
from .views import (
    RegisterView, MeView, ManagerListView, ManagerDetailView,
    PositionListCreateView, PositionDetailView,
    ApplicationListCreateView, ApplicationDetailView,
    InternListCreateView, InternDetailView,
    OnboardingChecklistListCreateView, OnboardingChecklistDetailView,
    DocumentListCreateView, DocumentDetailView,
    TaskListCreateView, TaskDetailView,
    EvaluationListCreateView, EvaluationDetailView,
    OffboardingChecklistListCreateView, OffboardingChecklistDetailView,
    ConversionDecisionListCreateView, ConversionDecisionDetailView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('managers/', ManagerListView.as_view(), name='manager-list'),
    path('managers/<int:pk>/', ManagerDetailView.as_view(), name='manager-detail'),

    # 1. Positions
    path('positions/', PositionListCreateView.as_view(), name='position-list'),
    path('positions/<int:pk>/', PositionDetailView.as_view(), name='position-detail'),

    # 2. Applications
    path('applications/', ApplicationListCreateView.as_view(), name='application-list'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),

    # 3. Interns
    path('interns/', InternListCreateView.as_view(), name='intern-list'),
    path('interns/<int:pk>/', InternDetailView.as_view(), name='intern-detail'),

    # 4. Onboarding
    path('onboarding/', OnboardingChecklistListCreateView.as_view(), name='onboarding-list'),
    path('onboarding/<int:pk>/', OnboardingChecklistDetailView.as_view(), name='onboarding-detail'),
    path('documents/', DocumentListCreateView.as_view(), name='document-list'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),

    # 5. Tasks
    path('tasks/', TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),

    # 6. Evaluations
    path('evaluations/', EvaluationListCreateView.as_view(), name='evaluation-list'),
    path('evaluations/<int:pk>/', EvaluationDetailView.as_view(), name='evaluation-detail'),

    # 7. Offboarding
    path('offboarding/', OffboardingChecklistListCreateView.as_view(), name='offboarding-list'),
    path('offboarding/<int:pk>/', OffboardingChecklistDetailView.as_view(), name='offboarding-detail'),
    path('conversions/', ConversionDecisionListCreateView.as_view(), name='conversion-list'),
    path('conversions/<int:pk>/', ConversionDecisionDetailView.as_view(), name='conversion-detail'),
]
