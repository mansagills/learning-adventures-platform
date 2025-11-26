'use client';

import { DetailedStudent } from '@/hooks/useOversight';
import Icon from '@/components/Icon';
import { format } from 'date-fns';
import { useRef } from 'react';

interface ProgressReportProps {
  student: DetailedStudent;
  reportType?: 'summary' | 'detailed';
  periodStart?: Date;
  periodEnd?: Date;
}

export default function ProgressReport({
  student,
  reportType = 'detailed',
  periodStart,
  periodEnd
}: ProgressReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create a simple CSV export
    const csvData = generateCSV(student);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${student.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const reportDate = format(new Date(), 'MMMM dd, yyyy');
  const periodLabel = periodStart && periodEnd
    ? `${format(periodStart, 'MMM dd')} - ${format(periodEnd, 'MMM dd, yyyy')}`
    : 'All Time';

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 print:hidden">
        <div>
          <h3 className="text-lg font-semibold text-ink-800">Progress Report</h3>
          <p className="text-sm text-ink-500">Export or print this report</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Icon name="download" size={16} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            <Icon name="printer" size={16} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="p-8 print:p-0">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink-900 mb-2">
                Learning Progress Report
              </h1>
              <p className="text-lg text-ink-600 mb-1">{student.name}</p>
              <p className="text-sm text-ink-500">Grade {student.gradeLevel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink-500">Report Date</p>
              <p className="text-lg font-semibold text-ink-800">{reportDate}</p>
              <p className="text-sm text-ink-500 mt-2">Period</p>
              <p className="text-sm font-medium text-ink-700">{periodLabel}</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-ink-900 mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-ink-500 mb-1">Adventures Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {student.stats.completedAdventures}
              </p>
              <p className="text-xs text-ink-400 mt-1">
                of {student.stats.totalAdventures} started
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-ink-500 mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-brand-600">
                {student.stats.completionRate}%
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-ink-500 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-amber-600">
                {student.stats.averageScore}%
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-ink-500 mb-1">Total Time</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatTime(student.stats.totalTimeSpent)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-bold text-ink-900 mb-3">Progress Metrics</h3>
            <div className="space-y-3 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">In Progress Adventures</span>
                <span className="text-lg font-semibold text-ink-800">
                  {student.stats.inProgressAdventures}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">Current Level</span>
                <span className="text-lg font-semibold text-brand-600">
                  {student.stats.currentLevel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">Total XP Earned</span>
                <span className="text-lg font-semibold text-brand-600">
                  {student.stats.totalXP.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">Current Streak</span>
                <span className="text-lg font-semibold text-orange-600">
                  {student.stats.currentStreak} days 🔥
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-ink-900 mb-3">Goals & Achievements</h3>
            <div className="space-y-3 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">Badges Earned</span>
                <span className="text-lg font-semibold text-amber-600">
                  {student.achievements.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">Active Goals</span>
                <span className="text-lg font-semibold text-brand-600">
                  {student.stats.activeGoals}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">Completed Goals</span>
                <span className="text-lg font-semibold text-green-600">
                  {student.stats.completedGoals}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Breakdown */}
        {reportType === 'detailed' && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ink-900 mb-4">
              Performance by Subject
            </h2>
            <div className="space-y-4">
              {Object.entries(student.stats.byCategory).map(([category, stats]) => {
                const completion = stats.total > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0;
                const avgScore = stats.completed > 0
                  ? Math.round(stats.totalScore / stats.completed)
                  : 0;

                return (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-ink-800 capitalize">
                        {category}
                      </h3>
                      <div className="flex items-center space-x-6 text-sm">
                        <div>
                          <span className="text-ink-500">Completed: </span>
                          <span className="font-semibold text-ink-800">
                            {stats.completed}/{stats.total}
                          </span>
                        </div>
                        <div>
                          <span className="text-ink-500">Avg Score: </span>
                          <span className="font-semibold text-amber-600">{avgScore}%</span>
                        </div>
                        <div>
                          <span className="text-ink-500">Time: </span>
                          <span className="font-semibold text-blue-600">
                            {formatTime(stats.totalTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-brand-600 h-3 rounded-full"
                        style={{ width: `${completion}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-ink-600 mt-2">{completion}% complete</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {reportType === 'detailed' && student.achievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ink-900 mb-4">Recent Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {student.achievements.slice(0, 6).map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="border border-gray-200 rounded-lg p-3 flex items-center space-x-3"
                >
                  <span className="text-3xl">{achievement.icon || '🏆'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">
                      {achievement.achievementId}
                    </p>
                    <p className="text-xs text-ink-500">
                      {format(new Date(achievement.earnedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="border-t-2 border-gray-200 pt-6 mt-8">
          <h2 className="text-xl font-bold text-ink-900 mb-4">Recommendations</h2>
          <div className="space-y-2 text-sm text-ink-700">
            {generateRecommendations(student).map((rec, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-brand-500 mt-0.5">•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-ink-500">
          <p>
            This report was generated by Learning Adventures Platform on {reportDate}
          </p>
          <p className="mt-1">
            For questions or concerns, please contact your teacher or administrator
          </p>
        </div>
      </div>
    </div>
  );
}

function generateCSV(student: DetailedStudent): string {
  const lines = [
    ['Learning Progress Report'],
    [''],
    ['Student Name', student.name],
    ['Grade Level', student.gradeLevel],
    ['Report Date', format(new Date(), 'yyyy-MM-dd')],
    [''],
    ['Overall Metrics'],
    ['Metric', 'Value'],
    ['Adventures Completed', student.stats.completedAdventures.toString()],
    ['Total Adventures Started', student.stats.totalAdventures.toString()],
    ['Completion Rate', `${student.stats.completionRate}%`],
    ['Average Score', `${student.stats.averageScore}%`],
    ['Total Time Spent (minutes)', student.stats.totalTimeSpent.toString()],
    ['Current Level', student.stats.currentLevel.toString()],
    ['Total XP', student.stats.totalXP.toString()],
    ['Current Streak (days)', student.stats.currentStreak.toString()],
    ['Badges Earned', student.achievements.length.toString()],
    ['Active Goals', student.stats.activeGoals.toString()],
    ['Completed Goals', student.stats.completedGoals.toString()],
    [''],
    ['Subject Breakdown'],
    ['Subject', 'Completed', 'Total', 'Completion %', 'Avg Score %', 'Time (minutes)']
  ];

  Object.entries(student.stats.byCategory).forEach(([category, stats]) => {
    const completion = stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;
    const avgScore = stats.completed > 0
      ? Math.round(stats.totalScore / stats.completed)
      : 0;

    lines.push([
      category,
      stats.completed.toString(),
      stats.total.toString(),
      completion.toString(),
      avgScore.toString(),
      stats.totalTime.toString()
    ]);
  });

  return lines.map(row => row.join(',')).join('\n');
}

function generateRecommendations(student: DetailedStudent): string[] {
  const recommendations: string[] = [];

  // Based on completion rate
  if (student.stats.completionRate < 50) {
    recommendations.push(
      'Encourage completing started adventures before beginning new ones to improve completion rate.'
    );
  } else if (student.stats.completionRate > 80) {
    recommendations.push(
      'Excellent completion rate! Consider challenging the student with more advanced content.'
    );
  }

  // Based on average score
  if (student.stats.averageScore < 70) {
    recommendations.push(
      'Consider reviewing foundational concepts to improve understanding and scores.'
    );
  } else if (student.stats.averageScore > 90) {
    recommendations.push(
      'Outstanding performance! The student is mastering the material and ready for advanced challenges.'
    );
  }

  // Based on subject performance
  const categoryScores = Object.entries(student.stats.byCategory).map(([cat, stats]) => ({
    category: cat,
    avgScore: stats.completed > 0 ? stats.totalScore / stats.completed : 0
  }));

  const weakest = categoryScores.sort((a, b) => a.avgScore - b.avgScore)[0];
  const strongest = categoryScores.sort((a, b) => b.avgScore - a.avgScore)[0];

  if (weakest && weakest.avgScore < 75) {
    recommendations.push(
      `Focus on ${weakest.category} content to strengthen understanding in this area.`
    );
  }

  if (strongest && strongest.avgScore > 85) {
    recommendations.push(
      `The student excels in ${strongest.category}. Consider advanced enrichment in this subject.`
    );
  }

  // Based on streak
  if (student.stats.currentStreak < 3) {
    recommendations.push(
      'Establish a consistent daily learning routine to build momentum and retention.'
    );
  } else if (student.stats.currentStreak > 7) {
    recommendations.push(
      'Great learning streak! Consistent practice is building strong study habits.'
    );
  }

  // Based on goals
  if (student.stats.activeGoals === 0) {
    recommendations.push(
      'Setting learning goals can help maintain motivation and track progress toward specific objectives.'
    );
  }

  // Default if no specific recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      'Continue with current learning pace and consider exploring new subject areas.'
    );
  }

  return recommendations;
}
