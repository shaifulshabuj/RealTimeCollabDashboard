import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCircleIcon,
  DocumentIcon,
  PencilIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: 'edit' | 'comment' | 'status_change' | 'create' | 'share';
  userId: string;
  userName: string;
  userAvatar?: string;
  documentId: string;
  documentTitle: string;
  timestamp: string;
  details?: string;
}

interface RecentActivityCardProps {
  isLoading: boolean;
}

export default function RecentActivityCard({ isLoading }: RecentActivityCardProps) {
  // In a real implementation, this would be fetched from a store or API
  const [activities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      type: 'edit',
      userId: 'user-1',
      userName: 'John Doe',
      documentId: 'doc-1',
      documentTitle: 'Logistics Process Workflow',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(), // 25 minutes ago
    },
    {
      id: 'act-2',
      type: 'comment',
      userId: 'user-2',
      userName: 'Jane Smith',
      documentId: 'doc-1',
      documentTitle: 'Logistics Process Workflow',
      timestamp: new Date(Date.now() - 40 * 60000).toISOString(), // 40 minutes ago
      details: 'We should include the inspection step in this process.',
    },
    {
      id: 'act-3',
      type: 'status_change',
      userId: 'user-3',
      userName: 'Bob Johnson',
      documentId: 'doc-2',
      documentTitle: 'Inventory Management Guidelines',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
      details: 'Published',
    },
    {
      id: 'act-4',
      type: 'create',
      userId: 'user-1',
      userName: 'John Doe',
      documentId: 'doc-3',
      documentTitle: 'Shipment Tracking System - Requirements',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), // 5 hours ago
    },
    {
      id: 'act-5',
      type: 'share',
      userId: 'user-4',
      userName: 'Emily Wilson',
      userAvatar: '/avatar-emily.jpg',
      documentId: 'doc-2',
      documentTitle: 'Inventory Management Guidelines',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
      details: 'Shared with Marketing team',
    },
  ]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'edit':
        return (
          <PencilIcon
            className="h-5 w-5 text-blue-500"
            aria-hidden="true"
          />
        );
      case 'comment':
        return (
          <ChatBubbleLeftIcon
            className="h-5 w-5 text-primary-500"
            aria-hidden="true"
          />
        );
      case 'status_change':
        return (
          <CheckCircleIcon
            className="h-5 w-5 text-green-500"
            aria-hidden="true"
          />
        );
      case 'create':
        return (
          <DocumentIcon
            className="h-5 w-5 text-purple-500"
            aria-hidden="true"
          />
        );
      case 'share':
        return (
          <ArrowPathIcon
            className="h-5 w-5 text-yellow-500"
            aria-hidden="true"
          />
        );
      default:
        return null;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'edit':
        return `edited`;
      case 'comment':
        return `commented on`;
      case 'status_change':
        return `changed status of`;
      case 'create':
        return `created`;
      case 'share':
        return `shared`;
      default:
        return 'updated';
    }
  };

  // Helper function to format time since a date
  const getTimeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    
    return 'just now';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-neutral-900">
            Recent Activity
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Latest actions across all documents.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      
      <div className="border-t border-neutral-200">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-pulse flex flex-col w-full px-4 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="rounded-full bg-neutral-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activities.length > 0 ? (
          <div className="flow-root">
            <ul className="divide-y divide-neutral-200">
              {activities.map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {activity.userAvatar ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={activity.userAvatar}
                          alt={activity.userName}
                        />
                      ) : (
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                          <span className="text-sm font-medium leading-none text-neutral-700">
                            {activity.userName.charAt(0)}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-900">
                          {activity.userName}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {getTimeSince(activity.timestamp)}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center">
                        <span className="mr-1.5">{getActivityIcon(activity.type)}</span>
                        <p className="text-sm text-neutral-500">
                          {getActivityText(activity)} {' '}
                          <Link
                            to={`/documents/${activity.documentId}`}
                            className="font-medium text-primary-600 hover:text-primary-500"
                          >
                            {activity.documentTitle}
                          </Link>
                          {activity.details && activity.type === 'comment' && (
                            <span className="mt-1 block italic text-neutral-600">
                              "{activity.details}"
                            </span>
                          )}
                          {activity.details && activity.type !== 'comment' && (
                            <span className="ml-1 text-neutral-600">
                              ({activity.details})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <UserCircleIcon 
              className="h-10 w-10 text-neutral-400 mb-2" 
              aria-hidden="true" 
            />
            <p className="text-sm text-neutral-500">
              No recent activity to display.
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-neutral-50 px-4 py-4 sm:px-6 border-t border-neutral-200">
        <Link
          to="/activity"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          View all activity
          <span aria-hidden="true"> &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
