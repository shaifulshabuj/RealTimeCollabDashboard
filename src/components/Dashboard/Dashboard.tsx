import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import useDocumentStore from '@/store/documentStore';
import { DocumentStatus, WorkflowType } from '@/types/document';
import RecentActivityCard from './RecentActivityCard';
import DashboardStats from './DashboardStats';

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const documents = useDocumentStore((state) => state.documents);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);
  
  // Statistics for dashboard
  const totalDocuments = documents.length;
  const activeDocuments = documents.filter(
    (doc) => doc.status !== DocumentStatus.ARCHIVED
  ).length;
  const pendingReviews = documents.filter(
    (doc) => doc.status === DocumentStatus.IN_REVIEW
  ).length;
  
  // Filter for recent documents (created in the last 7 days)
  const recentDocuments = documents
    .filter((doc) => {
      const createdAt = new Date(doc.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdAt >= sevenDaysAgo;
    })
    .sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, 5);
  
  // Filter for documents that need attention (in review or last updated > 30 days ago)
  const needsAttentionDocs = documents
    .filter((doc) => {
      if (doc.status === DocumentStatus.IN_REVIEW) return true;
      
      const updatedAt = new Date(doc.updatedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return updatedAt <= thirtyDaysAgo && doc.status !== DocumentStatus.ARCHIVED;
    })
    .slice(0, 5);
  
  // Load documents on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        await fetchDocuments();
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocuments();
  }, [fetchDocuments]);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <Link
          to="/documents/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Document
        </Link>
      </div>
      
      {/* Stats cards */}
      <DashboardStats 
        totalDocuments={totalDocuments}
        activeDocuments={activeDocuments}
        pendingReviews={pendingReviews}
        isLoading={isLoading}
      />
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Documents */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-neutral-900">
                Recent Documents
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">
                Documents created or updated in the last 7 days.
              </p>
            </div>
            <ClockIcon className="h-6 w-6 text-neutral-400" aria-hidden="true" />
          </div>
          
          <div className="border-t border-neutral-200">
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-6 py-1">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : recentDocuments.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {recentDocuments.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      to={`/documents/${doc.id}`}
                      className="block hover:bg-neutral-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <div className="flex items-center">
                              <DocumentTextIcon 
                                className="flex-shrink-0 mr-2 h-5 w-5 text-neutral-400" 
                                aria-hidden="true" 
                              />
                              <p className="text-sm font-medium text-primary-600 truncate">
                                {doc.title}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center">
                              <p className="text-xs text-neutral-500">
                                Last edited by {doc.lastEditedBy.name} on{' '}
                                {new Date(doc.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${
                                  doc.status === DocumentStatus.PUBLISHED
                                    ? 'bg-green-100 text-green-800'
                                    : doc.status === DocumentStatus.IN_REVIEW
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : doc.status === DocumentStatus.DRAFT
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-neutral-100 text-neutral-800'
                                }
                              `}
                            >
                              {doc.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <DocumentTextIcon 
                  className="h-10 w-10 text-neutral-400 mb-2" 
                  aria-hidden="true" 
                />
                <p className="text-sm text-neutral-500">
                  No recent documents found.
                </p>
                <Link
                  to="/documents/new"
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Create your first document
                </Link>
              </div>
            )}
          </div>
          
          <div className="bg-neutral-50 px-4 py-4 sm:px-6 border-t border-neutral-200">
            <Link
              to="/documents"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all documents
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
        
        {/* Needs Attention */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-neutral-900">
                Needs Attention
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">
                Documents in review or not updated recently.
              </p>
            </div>
            <CheckCircleIcon 
              className="h-6 w-6 text-neutral-400" 
              aria-hidden="true" 
            />
          </div>
          
          <div className="border-t border-neutral-200">
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-6 py-1">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : needsAttentionDocs.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {needsAttentionDocs.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      to={`/documents/${doc.id}`}
                      className="block hover:bg-neutral-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <div className="flex items-center">
                              <DocumentTextIcon 
                                className="flex-shrink-0 mr-2 h-5 w-5 text-neutral-400" 
                                aria-hidden="true" 
                              />
                              <p className="text-sm font-medium text-primary-600 truncate">
                                {doc.title}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center">
                              <p className="text-xs text-neutral-500">
                                {doc.status === DocumentStatus.IN_REVIEW
                                  ? 'Waiting for review'
                                  : `Last updated ${getTimeSince(doc.updatedAt)}`}
                              </p>
                            </div>
                          </div>
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${
                                  doc.status === DocumentStatus.IN_REVIEW
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }
                              `}
                            >
                              {doc.status === DocumentStatus.IN_REVIEW
                                ? 'In Review'
                                : 'Needs Update'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <CheckCircleIcon 
                  className="h-10 w-10 text-green-500 mb-2" 
                  aria-hidden="true" 
                />
                <p className="text-sm text-neutral-500">
                  All documents are up to date!
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-neutral-50 px-4 py-4 sm:px-6 border-t border-neutral-200">
            <Link
              to="/documents?filter=needs_attention"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all documents needing attention
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mt-8">
        <RecentActivityCard isLoading={isLoading} />
      </div>
    </div>
  );
}

// Helper function to format time since a date
function getTimeSince(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  
  return 'just now';
}
