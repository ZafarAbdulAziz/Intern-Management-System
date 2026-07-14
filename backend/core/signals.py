from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Application, Intern, OnboardingChecklist, OffboardingChecklist

# Default onboarding items every intern gets
DEFAULT_ONBOARDING_ITEMS = [
    'Sign NDA',
    'Submit Tax Form',
    'Submit University Agreement',
    'Receive laptop & equipment',
    'Get system access (email, tools)',
    'Complete orientation',
    'Meet assigned manager',
]

# Default offboarding items
DEFAULT_OFFBOARDING_ITEMS = [
    'Return laptop & equipment',
    'Revoke system access',
    'Complete exit survey',
    'Final evaluation completed',
    'Collect certificate of completion',
]


@receiver(post_save, sender=Intern)
def create_default_checklists(sender, instance, created, **kwargs):
    """
    When a new Intern is created, automatically generate
    their onboarding and offboarding checklists.
    """
    if created:
        for item in DEFAULT_ONBOARDING_ITEMS:
            OnboardingChecklist.objects.get_or_create(
                intern=instance,
                item=item,
                defaults={'status': 'pending'}
            )
        for item in DEFAULT_OFFBOARDING_ITEMS:
            OffboardingChecklist.objects.get_or_create(
                intern=instance,
                item=item,
                defaults={'status': 'pending'}
            )


@receiver(post_save, sender=Application)
def convert_application_to_intern(sender, instance, **kwargs):
    """
    When an application status changes to 'accepted',
    log a note. Actual Intern creation is done manually
    by HR via POST /api/interns/ to allow manager assignment.
    You could auto-create here if preferred.
    """
    if instance.status == Application.Status.ACCEPTED:
        # placeholder for email notification or auto-creation logic
        pass
