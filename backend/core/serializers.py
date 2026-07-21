from rest_framework import serializers
from .models import (
    User, Position, Application, Intern,
    OnboardingChecklist, Document, Task,
    Evaluation, OffboardingChecklist, ConversionDecision
)


# USER

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    intern_count = serializers.SerializerMethodField()
    assigned_interns = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'role', 'intern_count', 'assigned_interns']
        # role is read-only for managers and interns
        read_only_fields = ['role', 'intern_count', 'assigned_interns']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_intern_count(self, obj):
        if obj.role == User.Role.MANAGER:
            return Intern.objects.filter(manager=obj).count()
        return 0

    def get_assigned_interns(self, obj):
        if obj.role != User.Role.MANAGER:
            return []
        return list(Intern.objects.filter(manager=obj).order_by('name').values_list('name', flat=True))


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'New passwords do not match.'})
        return attrs


# ─────────────────────────────────────────────
# 1. RECRUITING & APPLICATIONS
# ─────────────────────────────────────────────

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'title', 'department', 'description', 'status', 'created_at']
        read_only_fields = ['created_at']


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            'id', 'position', 'candidate_name', 'email', 'university',
            'resume_url', 'status', 'interview_notes', 'applied_date'
        ]
        read_only_fields = ['applied_date']

    # hide sensitive fields from interns
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and hasattr(request.user, 'role'):
            if request.user.role == User.Role.INTERN:
                data.pop('interview_notes', None)
                data.pop('email', None)
        return data


# ─────────────────────────────────────────────
# 2. INTERN PROFILE
# ─────────────────────────────────────────────

class InternSerializer(serializers.ModelSerializer):
    manager_name = serializers.SerializerMethodField()
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Intern
        fields = [
            'id', 'name', 'university', 'program', 'department',
            'start_date', 'end_date', 'status', 'manager', 'manager_name',
            # private — filtered out for interns below
            'personal_email', 'phone', 'emergency_contact',
            'username', 'password',
        ]
        extra_kwargs = {
            'manager': {'required': False, 'allow_null': True},
        }

    def get_manager_name(self, obj):
        if obj.manager:
            return obj.manager.get_full_name() or obj.manager.username
        return None

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=username,
            password=password,
            role=User.Role.INTERN,
            email=validated_data.get('personal_email', '')
        )

        intern = Intern.objects.create(user=user, **validated_data)
        return intern

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and hasattr(request.user, 'role'):
            if request.user.role == User.Role.INTERN:
                data.pop('personal_email', None)
                data.pop('phone', None)
                data.pop('emergency_contact', None)
        return data


# ─────────────────────────────────────────────
# 3. ONBOARDING
# ─────────────────────────────────────────────

class OnboardingChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingChecklist
        fields = ['id', 'intern', 'item', 'status', 'completed_date', 'assigned_by']
        read_only_fields = ['assigned_by']


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'intern', 'type', 'file_url', 'signed_status', 'uploaded_at']
        read_only_fields = ['uploaded_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and hasattr(request.user, 'role'):
            if request.user.role == User.Role.MANAGER:
                data.pop('file_url', None)
        return data


# ─────────────────────────────────────────────
# 4. TASK & PROJECT MANAGEMENT
# ─────────────────────────────────────────────

class TaskSerializer(serializers.ModelSerializer):
    assigned_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'intern', 'title', 'description', 'status',
            'due_date', 'assigned_by', 'assigned_by_name', 'created_at'
        ]
        read_only_fields = ['assigned_by', 'created_at']

    def get_assigned_by_name(self, obj):
        if obj.assigned_by:
            return obj.assigned_by.get_full_name() or obj.assigned_by.username
        return None


# ─────────────────────────────────────────────
# 5. PERFORMANCE & EVALUATION
# ─────────────────────────────────────────────

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = [
            'id', 'intern', 'evaluator', 'period',
            'scores', 'comments', 'internal_notes', 'created_at'
        ]
        read_only_fields = ['evaluator', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and hasattr(request.user, 'role'):
            if request.user.role == User.Role.INTERN:
                data.pop('internal_notes', None)
                data.pop('evaluator', None)
        return data


# ─────────────────────────────────────────────
# 6. OFFBOARDING & CONVERSION
# ─────────────────────────────────────────────

class OffboardingChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = OffboardingChecklist
        fields = ['id', 'intern', 'item', 'status', 'completed_date']


class ConversionDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversionDecision
        fields = ['id', 'intern', 'decision', 'notes', 'decided_by', 'decided_at']
        read_only_fields = ['decided_by', 'decided_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and hasattr(request.user, 'role'):
            # interns cannot see their conversion decision via the API
            if request.user.role == User.Role.INTERN:
                return {}
        return data
