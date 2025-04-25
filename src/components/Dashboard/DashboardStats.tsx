import {
  DocumentTextIcon,
  DocumentCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  totalDocuments: number;
  activeDocuments: number;
  pendingReviews: number;
  isLoading: boolean;
}

export default function DashboardStats({
  totalDocuments,
  activeDocuments,
  pendingReviews,
  isLoading,
}: DashboardStatsProps) {
  // Stats cards configuration
  const stats = [
    {
      name: 'Total Documents',
      value: totalDocuments,
      icon: DocumentTextIcon,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Active Documents',
      value: activeDocuments,
      icon: DocumentCheckIcon,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Pending Reviews',
      value: pendingReviews,
      icon: ClockIcon,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-6 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${item.bgColor}`}>
                <item.icon
                  className={`h-6 w-6 ${item.iconColor}`}
                  aria-hidden="true"
                />
              </div>
              <p className="ml-16 text-sm font-medium text-neutral-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              {isLoading ? (
                <div className="animate-pulse h-8 w-16 bg-neutral-200 rounded"></div>
              ) : (
                <p className="text-2xl font-semibold text-neutral-900">
                  {item.value}
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
