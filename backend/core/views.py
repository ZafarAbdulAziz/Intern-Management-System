from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    User, Position, Application, Intern,
    OnboardingChecklist, Document, Task,
    Evaluation, OffboardingChecklist, ConversionDecision
)
from .serializers import (
    UserSerializer, UserRegisterSerializer,
    PositionSerializer, ApplicationSerializer,
    InternSerializer, OnboardingChecklistSerializer,
    DocumentSerializer, TaskSerializer,
    EvaluationSerializer, OffboardingChecklistSerializer,
    ConversionDecisionSerializer
)
from .permissions import IsAdmin, IsAdminOrManager, IsAdminOrOwnerIntern


# ─────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """Admin-only: create a new user (any role)."""
    serializer_class = UserRegisterSerializer
    permission_classes = [IsAdmin]


class MeView(APIView):
    """Return the currently authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class ManagerListView(generics.ListCreateAPIView):
    """List and create manager accounts for the admin management tab."""
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return User.objects.filter(role=User.Role.MANAGER).order_by('username')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserRegisterSerializer
        return UserSerializer


class ManagerDetailView(generics.DestroyAPIView):
    """Delete a manager account from the admin management tab."""
    permission_classes = [IsAdmin]
    queryset = User.objects.filter(role=User.Role.MANAGER)
    serializer_class = UserSerializer


# ─────────────────────────────────────────────
# 1. POSITIONS
# ─────────────────────────────────────────────

class PositionListCreateView(generics.ListCreateAPIView):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAuthenticated()]


class PositionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdmin()]
        return [IsAuthenticated()]


# ─────────────────────────────────────────────
# 2. APPLICATIONS
# ─────────────────────────────────────────────

class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAdminOrManager]

    def get_queryset(self):
        return Application.objects.all()


class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAdminOrManager]


# ─────────────────────────────────────────────
# 3. INTERN PROFILES
# ─────────────────────────────────────────────

class InternListCreateView(generics.ListCreateAPIView):
    serializer_class = InternSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Intern.objects.all()
        if user.role == User.Role.MANAGER:
            return Intern.objects.filter(manager=user)
        if user.role == User.Role.INTERN:
            if hasattr(user, 'intern_profile'):
                return Intern.objects.filter(pk=user.intern_profile.pk)
        return Intern.objects.none()


class InternDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Intern.objects.all()
    serializer_class = InternSerializer
    permission_classes = [IsAdminOrOwnerIntern]


# ─────────────────────────────────────────────
# 4. ONBOARDING
# ─────────────────────────────────────────────

class OnboardingChecklistListCreateView(generics.ListCreateAPIView):
    serializer_class = OnboardingChecklistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return OnboardingChecklist.objects.all()
        if user.role == User.Role.MANAGER:
            return OnboardingChecklist.objects.filter(intern__manager=user)
        if user.role == User.Role.INTERN and hasattr(user, 'intern_profile'):
            return OnboardingChecklist.objects.filter(intern=user.intern_profile)
        return OnboardingChecklist.objects.none()

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)


class OnboardingChecklistDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OnboardingChecklist.objects.all()
    serializer_class = OnboardingChecklistSerializer
    permission_classes = [IsAdminOrManager]


class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Document.objects.all()
        if user.role == User.Role.MANAGER:
            return Document.objects.filter(intern__manager=user)
        if user.role == User.Role.INTERN and hasattr(user, 'intern_profile'):
            return Document.objects.filter(intern=user.intern_profile)
        return Document.objects.none()


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAdmin]


# ─────────────────────────────────────────────
# 5. TASKS
# ─────────────────────────────────────────────

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Task.objects.all()
        if user.role == User.Role.MANAGER:
            return Task.objects.filter(intern__manager=user)
        if user.role == User.Role.INTERN and hasattr(user, 'intern_profile'):
            return Task.objects.filter(intern=user.intern_profile)
        return Task.objects.none()

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrManager()]
        return [IsAuthenticated()]


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['DELETE']:
            return [IsAdminOrManager()]
        return [IsAuthenticated()]


# ─────────────────────────────────────────────
# 6. EVALUATIONS
# ─────────────────────────────────────────────

class EvaluationListCreateView(generics.ListCreateAPIView):
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Evaluation.objects.all()
        if user.role == User.Role.MANAGER:
            return Evaluation.objects.filter(intern__manager=user)
        if user.role == User.Role.INTERN and hasattr(user, 'intern_profile'):
            return Evaluation.objects.filter(intern=user.intern_profile)
        return Evaluation.objects.none()

    def perform_create(self, serializer):
        serializer.save(evaluator=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrManager()]
        return [IsAuthenticated()]


class EvaluationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [IsAdminOrManager]


# ─────────────────────────────────────────────
# 7. OFFBOARDING
# ─────────────────────────────────────────────

class OffboardingChecklistListCreateView(generics.ListCreateAPIView):
    serializer_class = OffboardingChecklistSerializer
    permission_classes = [IsAdminOrManager]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return OffboardingChecklist.objects.all()
        return OffboardingChecklist.objects.filter(intern__manager=user)


class OffboardingChecklistDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OffboardingChecklist.objects.all()
    serializer_class = OffboardingChecklistSerializer
    permission_classes = [IsAdminOrManager]


class ConversionDecisionListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversionDecisionSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return ConversionDecision.objects.all()

    def perform_create(self, serializer):
        serializer.save(decided_by=self.request.user)


class ConversionDecisionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ConversionDecision.objects.all()
    serializer_class = ConversionDecisionSerializer
    permission_classes = [IsAdmin]
