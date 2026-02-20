import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/components/Container';
import CourseRequestWizard from '@/components/course-request/CourseRequestWizard';

export const metadata = {
  title: 'Request Custom Course | Learning Adventures',
  description:
    "Create a personalized learning course tailored to your student's needs",
};

export default function CourseRequestPage() {
  return (
    <ProtectedRoute allowedRoles={['PARENT', 'TEACHER', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-ocean-50">
        <Container>
          <CourseRequestWizard />
        </Container>
      </div>
    </ProtectedRoute>
  );
}
