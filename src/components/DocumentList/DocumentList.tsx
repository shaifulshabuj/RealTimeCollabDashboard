import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import useDocumentStore from '@/store/documentStore';
import { Document, DocumentStatus, WorkflowType } from '@/types/document';

export default function DocumentList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [workflowFilter, setWorkflowFilter] = useState<string>(
    searchParams.get('workflow') || 'all'
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get('sort') || 'updatedAt'
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    (searchParams.get('direction') as 'asc' | 'desc') || 'desc'
  );

  const documents = useDocumentStore((state) => state.documents);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);

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

  useEffect(() => {
    // Update URL params when filters change
    const params: Record<string, string> = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (workflowFilter !== 'all') params.workflow = workflowFilter;
    if (sortBy !== 'updatedAt') params.sort = sortBy;
    if (sortDirection !== 'desc') params.direction = sortDirection;
    
    setSearchParams(params, { replace: true });
  }, [statusFilter, workflowFilter, sortBy, sortDirection, setSearchParams]);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      // Status filter
      if (statusFilter !== 'all' && doc.status !== statusFilter) {
        return false;
      }
      
      // Workflow filter
      if (workflowFilter !== 'all' && doc.workflowType !== workflowFilter) {
        return false;
      }
      
      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          doc.title.toLowerCase().includes(searchLower) ||
          doc.createdBy.name.toLowerCase().includes(searchLower) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
          
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
          
        case 'createdBy':
          aValue = a.createdBy.name.toLowerCase();
          bValue = b.createdBy.name.toLowerCase();
          break;
          
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
          
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Toggle sort direction or change sort field
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setWorkflowFilter('all');
    setSearchTerm('');
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Documents</h1>
          <p className="mt-2 text-sm text-neutral-700">
            A list of all documents in your organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/documents/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Document
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search documents"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Menu as="div" className="relative inline-block text-left ml-3">
            <div>
              <Menu.Button className="inline-flex justify-center w-full rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-neutral-400" aria-hidden="true" />
                Filter
                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-neutral-700 border-b border-neutral-200">
                    Status
                  </div>
                  {Object.values(DocumentStatus).map((status) => (
                    <Menu.Item key={status}>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'
                          } flex items-center w-full px-4 py-2 text-sm ${
                            statusFilter === status ? 'font-medium' : ''
                          }`}
                          onClick={() => setStatusFilter(status)}
                        >
                          <span className="flex-1">{status.replace('_', ' ')}</span>
                          {statusFilter === status && (
                            <CheckIcon className="h-5 w-5 text-primary-500" aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'
                        } flex items-center w-full px-4 py-2 text-sm ${
                          statusFilter === 'all' ? 'font-medium' : ''
                        }`}
                        onClick={() => setStatusFilter('all')}
                      >
                        <span className="flex-1">All</span>
                        {statusFilter === 'all' && (
                          <CheckIcon className="h-5 w-5 text-primary-500" aria-hidden="true" />
                        )}
                      </button>
                    )}
                  </Menu.Item>
                  
                  <div className="px-4 py-2 text-sm text-neutral-700 border-b border-neutral-200 mt-2">
                    Workflow Type
                  </div>
                  {Object.values(WorkflowType).map((workflow) => (
                    <Menu.Item key={workflow}>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'
                          } flex items-center w-full px-4 py-2 text-sm ${
                            workflowFilter === workflow ? 'font-medium' : ''
                          }`}
                          onClick={() => setWorkflowFilter(workflow)}
                        >
                          <span className="flex-1">{workflow.replace('_', ' ')}</span>
                          {workflowFilter === workflow && (
                            <CheckIcon className="h-5 w-5 text-primary-500" aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700'
                        } flex items-center w-full px-4 py-2 text-sm ${
                          workflowFilter === 'all' ? 'font-medium' : ''
                        }`}
                        onClick={() => setWorkflowFilter('all')}
                      >
                        <span className="flex-1">All</span>
                        {workflowFilter === 'all' && (
                          <CheckIcon className="h-5 w-5 text-primary-500" aria-hidden="true" />
                        )}
                      </button>
                    )}
                  </Menu.Item>
                  
                  <div className="px-4 py-2 border-t border-neutral-200">
                    <button
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      onClick={clearFilters}
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center">
          <span className="text-sm text-neutral-500 mr-2">
            {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
          </span>
          <button
            type="button"
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => fetchDocuments()}
          >
            <span className="sr-only">Refresh</span>
            <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Document list */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="px-4 py-6 sm:px-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="rounded-md bg-neutral-200 h-14 w-14"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <ul className="divide-y divide-neutral-200">
            {filteredDocuments.map((document) => (
              <li key={document.id}>
                <Link
                  to={`/documents/${document.id}`}
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
                            {document.title}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-neutral-500 mr-4">
                            <p>
                              Created {new Date(document.createdAt).toLocaleDateString()} by{' '}
                              {document.createdBy.name}
                            </p>
                          </div>
                          <div className="flex items-center text-sm text-neutral-500">
                            <p>
                              Last updated {new Date(document.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              document.status === DocumentStatus.PUBLISHED
                                ? 'bg-green-100 text-green-800'
                                : document.status === DocumentStatus.IN_REVIEW
                                ? 'bg-yellow-100 text-yellow-800'
                                : document.status === DocumentStatus.DRAFT
                                ? 'bg-blue-100 text-blue-800'
                                : document.status === DocumentStatus.ARCHIVED
                                ? 'bg-neutral-100 text-neutral-800'
                                : 'bg-purple-100 text-purple-800'
                            }
                          `}
                        >
                          {document.status.replace('_', ' ')}
                        </span>
                        
                        <div className="mt-2 flex items-center">
                          {document.collaborators.slice(0, 3).map((collaborator, index) => (
                            <div
                              key={collaborator.id}
                              className={`-ml-2 first:ml-0 inline-block h-6 w-6 rounded-full text-xs text-white ring-2 ring-white flex items-center justify-center bg-primary-600`}
                              style={{ zIndex: 30 - index }}
                              title={collaborator.name}
                            >
                              {collaborator.name.charAt(0)}
                            </div>
                          ))}
                          {document.collaborators.length > 3 && (
                            <div className="-ml-2 inline-block h-6 w-6 rounded-full text-xs text-white ring-2 ring-white flex items-center justify-center bg-neutral-400" style={{ zIndex: 26 }}>
                              +{document.collaborators.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {document.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap">
                        {document.tags.map((tag) => (
                          <span
                            key={tag}
                            className="mr-2 mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <DocumentTextIcon className="h-12 w-12 text-neutral-400 mb-4" aria-hidden="true" />
            <h3 className="mt-2 text-sm font-medium text-neutral-900">No documents found</h3>
            <p className="mt-1 text-sm text-neutral-500">
              {searchTerm || statusFilter !== 'all' || workflowFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by creating a new document.'}
            </p>
            <div className="mt-6">
              {searchTerm || statusFilter !== 'all' || workflowFilter !== 'all' ? (
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/documents/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Document
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Icon component for checkmarks in filter menu
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
