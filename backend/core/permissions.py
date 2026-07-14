from rest_framework.permissions import BasePermission
from .models import User


class IsAdmin(BasePermission):
    """Only HR/Admin users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.ADMIN


class IsManager(BasePermission):
    """Only Manager users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.MANAGER


class IsIntern(BasePermission):
    """Only Intern users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.INTERN


class IsAdminOrManager(BasePermission):
    """Admin or Manager — useful for most write operations."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            User.Role.ADMIN, User.Role.MANAGER
        ]


class IsAdminOrOwnerIntern(BasePermission):
    """
    Admin can access all. Intern can only access their own record.
    Use has_object_permission for detail views.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == User.Role.ADMIN:
            return True
        # obj is an Intern instance
        if request.user.role == User.Role.INTERN:
            return hasattr(request.user, 'intern_profile') and request.user.intern_profile == obj
        # Manager can access their own interns
        if request.user.role == User.Role.MANAGER:
            return obj.manager == request.user
        return False
