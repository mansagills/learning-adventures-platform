/**
 * Sample CourseRequest test data for CourseDesignBriefSkill testing
 */

export const completeCourseRequest = {
  id: 'test-complete-001',
  userId: 'user-123',

  // Requestor Information
  fullName: 'Sarah Johnson',
  role: 'PARENT',
  email: 'sarah.johnson@example.com',
  phone: '555-0123',
  organization: null,
  preferredContact: 'EMAIL',

  // Student Profile
  studentName: 'Emma Johnson',
  studentAge: 8,
  gradeLevel: '3rd Grade',
  numberOfStudents: '1',
  learningAccommodations: ['Visual aids', 'Extra time'],
  accommodationNotes:
    'Benefits from color-coded materials and step-by-step instructions',

  // Subject & Focus
  primarySubject: 'MATH',
  specificTopics: ['Multiplication tables', 'Division basics', 'Word problems'],
  customTopics: null,
  learningGoal: 'REINFORCE',

  // Learning Challenges
  learningChallenges: [
    'Difficulty with abstract concepts',
    'Needs concrete examples',
  ],
  challengeObservations:
    'Struggles with multi-step word problems but excels with visual representations',

  // Learning Style & Interests
  learningStyles: ['Visual', 'Hands-on', 'Story-based'],
  studentInterests: ['Animals', 'Art', 'Nature'],
  favoriteCharacters: 'Loves characters from Wild Kratts and Bluey',

  // Course Format
  courseLength: 'MEDIUM',
  courseComponents: ['Interactive games', 'Video lessons', 'Practice quizzes'],
  sessionDuration: '30 minutes',

  // Assessment
  successIndicators: ['Improved test scores', 'Increased confidence'],
  reportingPreferences: ['Weekly progress reports', 'Skill mastery updates'],

  // Delivery & Logistics
  preferredStartDate: new Date('2025-01-15'),
  urgencyLevel: 'STANDARD',
  devicePreferences: ['Tablet', 'Computer'],
  offlinePacketsNeeded: 'NO',

  // Budget & Reusability
  budgetTier: 'FREE',
  allowCourseReuse: 'YES_ANONYMIZED',

  // Additional Info
  additionalNotes:
    'Emma loves animals and responds well to gamification. Please include animal-themed examples.',
  consentGiven: true,

  // Status fields
  status: 'SUBMITTED',
  aiProcessingStatus: 'NOT_STARTED',
  submittedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const vagueTopicsCourseRequest = {
  id: 'test-vague-002',
  userId: 'user-456',

  fullName: 'Michael Chen',
  role: 'PARENT',
  email: 'michael.chen@example.com',
  phone: null,
  organization: null,
  preferredContact: 'EMAIL',

  studentName: 'Alex Chen',
  studentAge: 10,
  gradeLevel: '5th Grade',
  numberOfStudents: '1',
  learningAccommodations: [],
  accommodationNotes: null,

  // VAGUE: No specific topics provided
  primarySubject: 'SCIENCE',
  specificTopics: [], // Empty - should trigger clarification
  customTopics: 'just some science stuff',
  learningGoal: 'GET_AHEAD',

  learningChallenges: [],
  challengeObservations: null,

  learningStyles: ['Hands-on'],
  studentInterests: ['Gaming', 'Technology'],
  favoriteCharacters: null,

  courseLength: 'SHORT',
  courseComponents: ['Interactive games'],
  sessionDuration: '45 minutes',

  successIndicators: ['Understanding core concepts'],
  reportingPreferences: ['Monthly summaries'],

  preferredStartDate: null,
  urgencyLevel: 'HIGH',
  devicePreferences: ['Computer'],
  offlinePacketsNeeded: 'NO',

  budgetTier: 'STANDARD',
  allowCourseReuse: 'YES_ANONYMIZED',

  additionalNotes: null,
  consentGiven: true,

  status: 'SUBMITTED',
  aiProcessingStatus: 'NOT_STARTED',
  submittedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const ageMismatchCourseRequest = {
  id: 'test-mismatch-003',
  userId: 'user-789',

  fullName: 'Lisa Martinez',
  role: 'PARENT',
  email: 'lisa.martinez@example.com',
  phone: '555-0456',
  organization: null,
  preferredContact: 'PHONE',

  // MISMATCH: 6-year-old in 8th grade wanting to get ahead
  studentName: 'Sofia Martinez',
  studentAge: 6,
  gradeLevel: '8th Grade', // Unrealistic for age
  numberOfStudents: '1',
  learningAccommodations: ['Gifted program'],
  accommodationNotes: 'Very advanced for age',

  primarySubject: 'MATH',
  specificTopics: ['Algebra', 'Pre-calculus'], // Too advanced for age
  customTopics: null,
  learningGoal: 'GET_AHEAD', // With already advanced grade

  learningChallenges: [],
  challengeObservations: null,

  learningStyles: ['Visual', 'Story-based'],
  studentInterests: ['Reading', 'Puzzles'],
  favoriteCharacters: 'Loves Matilda',

  courseLength: 'LONG',
  courseComponents: ['Video lessons', 'Practice quizzes'],
  sessionDuration: '60 minutes', // Long for a 6-year-old

  successIndicators: ['Test scores', 'Advanced placement'],
  reportingPreferences: ['Weekly progress reports'],

  preferredStartDate: new Date('2025-02-01'),
  urgencyLevel: 'URGENT',
  devicePreferences: ['Computer'],
  offlinePacketsNeeded: 'NO',

  budgetTier: 'PREMIUM',
  allowCourseReuse: 'NO',

  additionalNotes: 'Sofia is extremely gifted and needs advanced material',
  consentGiven: true,

  status: 'SUBMITTED',
  aiProcessingStatus: 'NOT_STARTED',
  submittedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const contradictoryPreferencesCourseRequest = {
  id: 'test-contradiction-004',
  userId: 'user-012',

  fullName: 'David Thompson',
  role: 'TEACHER',
  email: 'david.thompson@school.edu',
  phone: null,
  organization: 'Lincoln Elementary',
  preferredContact: 'EMAIL',

  studentName: 'Classroom Group',
  studentAge: 9,
  gradeLevel: '4th Grade',
  numberOfStudents: '5-10',
  learningAccommodations: ['Screen time limits'], // CONTRADICTION with preferences
  accommodationNotes: 'Students have 30-minute daily screen time limit',

  primarySubject: 'ENGLISH',
  specificTopics: ['Reading comprehension', 'Vocabulary building'],
  customTopics: null,
  learningGoal: 'REINFORCE',

  learningChallenges: ['Short attention spans'],
  challengeObservations: 'Students lose focus after 15 minutes of screen time',

  learningStyles: ['Hands-on', 'Story-based'],
  studentInterests: ['Sports', 'Outdoor activities'],
  favoriteCharacters: null,

  courseLength: 'MEDIUM',
  // CONTRADICTION: Wants all digital content but has screen time limits
  courseComponents: ['Interactive games', 'Video lessons', 'Practice quizzes'],
  sessionDuration: '45 minutes', // Exceeds screen time limit

  successIndicators: ['Improved reading levels'],
  reportingPreferences: ['Weekly progress reports'],

  preferredStartDate: new Date('2025-01-20'),
  urgencyLevel: 'STANDARD',
  devicePreferences: ['Tablet'], // Digital-only
  offlinePacketsNeeded: 'NO', // No offline alternative

  budgetTier: 'FREE',
  allowCourseReuse: 'YES_ANONYMIZED',

  additionalNotes: 'Need activities that work within screen time restrictions',
  consentGiven: true,

  status: 'SUBMITTED',
  aiProcessingStatus: 'NOT_STARTED',
  submittedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const genericInterestsCourseRequest = {
  id: 'test-generic-005',
  userId: 'user-345',

  fullName: 'Amanda Williams',
  role: 'PARENT',
  email: 'amanda.williams@example.com',
  phone: '555-0789',
  organization: null,
  preferredContact: 'EMAIL',

  studentName: 'Jake Williams',
  studentAge: 7,
  gradeLevel: '2nd Grade',
  numberOfStudents: '1',
  learningAccommodations: [],
  accommodationNotes: null,

  primarySubject: 'INTERDISCIPLINARY',
  specificTopics: ['General knowledge'],
  customTopics: null,
  learningGoal: 'CATCH_UP',

  learningChallenges: [],
  challengeObservations: null,

  // GENERIC: No specific interests to theme around
  learningStyles: ['Visual', 'Hands-on', 'Story-based'], // All styles
  studentInterests: ['Everything', 'Anything fun'], // Too vague
  favoriteCharacters: 'Likes all cartoons',

  courseLength: 'SHORT',
  courseComponents: ['Interactive games', 'Practice quizzes'],
  sessionDuration: '15 minutes',

  successIndicators: ['Engagement', 'Completion rate'],
  reportingPreferences: ['Monthly summaries'],

  preferredStartDate: null,
  urgencyLevel: 'LOW',
  devicePreferences: ['Tablet', 'Computer', 'Phone'],
  offlinePacketsNeeded: 'MAYBE',

  budgetTier: 'FREE',
  allowCourseReuse: 'YES_ANONYMIZED',

  additionalNotes: null,
  consentGiven: true,

  status: 'SUBMITTED',
  aiProcessingStatus: 'NOT_STARTED',
  submittedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Export all test cases as an array for easy iteration
export const allTestCases = [
  { name: 'Complete Request (No Clarifications)', data: completeCourseRequest },
  { name: 'Vague Topics (Should Flag)', data: vagueTopicsCourseRequest },
  { name: 'Age/Grade Mismatch (Should Flag)', data: ageMismatchCourseRequest },
  {
    name: 'Contradictory Preferences (Should Flag)',
    data: contradictoryPreferencesCourseRequest,
  },
  {
    name: 'Generic Interests (Should Flag)',
    data: genericInterestsCourseRequest,
  },
];
