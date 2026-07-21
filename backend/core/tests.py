from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Position, Intern
from datetime import date


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin', password='pass', role=User.Role.ADMIN
        )
        self.manager = User.objects.create_user(
            username='manager', password='pass', role=User.Role.MANAGER
        )
        self.intern_user = User.objects.create_user(
            username='intern1', password='pass', role=User.Role.INTERN
        )

    def get_token(self, username, password='pass'):
        res = self.client.post('/api/token/', {'username': username, 'password': password})
        return res.data['access']

    def test_admin_can_create_position(self):
        token = self.get_token('admin')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.post('/api/positions/', {
            'title': 'Software Intern',
            'department': 'Engineering',
            'description': 'Build things',
            'status': 'open'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_intern_cannot_create_position(self):
        token = self.get_token('intern1')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.post('/api/positions/', {
            'title': 'Software Intern',
            'department': 'Engineering',
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_intern_can_view_positions(self):
        token = self.get_token('intern1')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get('/api/positions/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_me_endpoint(self):
        token = self.get_token('admin')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['username'], 'admin')

    def test_user_can_change_password(self):
        token = self.get_token('admin')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.post('/api/auth/password/', {
            'current_password': 'pass',
            'new_password': 'NewPass123!',
            'confirm_password': 'NewPass123!',
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['detail'], 'Password updated successfully.')

        self.client.credentials(HTTP_AUTHORIZATION='')
        login_res = self.client.post('/api/token/', {'username': 'admin', 'password': 'NewPass123!'})
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_password_change_rejects_wrong_current_password(self):
        token = self.get_token('admin')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.post('/api/auth/password/', {
            'current_password': 'wrongpass',
            'new_password': 'NewPass123!',
            'confirm_password': 'NewPass123!',
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['current_password'][0], 'Current password is incorrect.')

    def test_password_change_rejects_mismatched_passwords(self):
        token = self.get_token('admin')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.post('/api/auth/password/', {
            'current_password': 'pass',
            'new_password': 'NewPass123!',
            'confirm_password': 'Mismatch123!',
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['confirm_password'][0], 'New passwords do not match.')

    def test_admin_can_create_manager_and_view_manager_intern_counts(self):
        token = self.get_token('admin')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        create_res = self.client.post('/api/managers/', {
            'username': 'newmanager',
            'email': 'newmanager@example.com',
            'password': 'Secret123!',
            'first_name': 'New',
            'last_name': 'Manager',
            'role': 'Manager'
        })
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)

        manager_user = User.objects.get(username='newmanager')
        self.assertEqual(manager_user.role, User.Role.MANAGER)
        self.assertTrue(manager_user.check_password('Secret123!'))

        Intern.objects.create(
            user=self.intern_user,
            manager=manager_user,
            name='Assigned Intern',
            university='Test University',
            program='Engineering',
            department='Engineering',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 6, 30),
            status='active',
            personal_email='assigned@example.com',
            phone='1234567890',
        )

        list_res = self.client.get('/api/managers/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item['username'] == 'newmanager' and item['intern_count'] == 1 for item in list_res.data))

    def test_admin_can_create_intern_with_login_credentials_and_manager_assignment(self):
        token = self.get_token('admin')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.post('/api/interns/', {
            'name': 'New Intern',
            'university': 'University of Test',
            'program': 'Software Engineering',
            'department': 'Engineering',
            'start_date': '2026-01-01',
            'end_date': '2026-06-30',
            'status': 'active',
            'personal_email': 'new.intern@example.com',
            'phone': '1234567890',
            'manager': self.manager.id,
            'username': 'newintern',
            'password': 'Secret123!'
        })

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newintern').exists())

        user = User.objects.get(username='newintern')
        self.assertEqual(user.role, User.Role.INTERN)
        self.assertTrue(user.check_password('Secret123!'))

        intern = Intern.objects.get(user=user)
        self.assertEqual(intern.manager_id, self.manager.id)

        login_res = self.client.post('/api/token/', {
            'username': 'newintern',
            'password': 'Secret123!'
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token("manager")}')
        manager_res = self.client.get('/api/interns/')
        self.assertEqual(manager_res.status_code, status.HTTP_200_OK)
        self.assertIn(intern.id, [item['id'] for item in manager_res.data])
