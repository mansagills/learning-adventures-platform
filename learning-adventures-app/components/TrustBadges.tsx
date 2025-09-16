import Icon from './Icon';

export default function TrustBadges() {
  const badges = [
    { icon: 'shield', text: 'COPPA Compliant' },
    { icon: 'academic', text: 'Curriculum Aligned' },
    { icon: 'heart', text: 'Parent Approved' },
  ];

  return (
    <div className="flex flex-wrap justify-center lg:justify-start gap-4">
      {badges.map((badge, index) => (
        <div key={badge.text} className="trust-badge">
          <Icon name={badge.icon} size={16} className="mr-2" />
          <span>{badge.text}</span>
        </div>
      ))}
    </div>
  );
}