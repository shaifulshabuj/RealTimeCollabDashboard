import { Fragment, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon },
  { name: 'Team', href: '/team', icon: UserGroupIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
];

const userNavigation = [
  { name: 'Your Profile', href: '/profile' },
  { name: 'Settings', href: '/settings' },
  { name: 'Sign out', href: '#' }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-neutral-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-neutral-800">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-xl font-bold text-white">Collab Dashboard</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        group flex items-center px-2 py-2 text-base font-medium rounded-md
                        ${
                          location.pathname === item.href
                            ? 'bg-neutral-900 text-white'
                            : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                        }
                      `}
                    >
                      <item.icon
                        className={`
                          mr-4 flex-shrink-0 h-6 w-6
                          ${
                            location.pathname === item.href
                              ? 'text-white'
                              : 'text-neutral-400 group-hover:text-neutral-300'
                          }
                        `}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              {user && (
                <div className="flex-shrink-0 flex border-t border-neutral-700 p-4">
                  <div className="flex-shrink-0 group block">
                    <div className="flex items-center">
                      <div>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-600">
                          <span className="text-sm font-medium leading-none text-white">
                            {user.name.charAt(0)}
                          </span>
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-base font-medium text-white">{user.name}</p>
                        <p className="text-sm font-medium text-neutral-400 group-hover:text-neutral-300">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 bg-neutral-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-white">Collab Dashboard</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${
                        location.pathname === item.href
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 flex-shrink-0 h-6 w-6
                        ${
                          location.pathname === item.href
                            ? 'text-white'
                            : 'text-neutral-400 group-hover:text-neutral-300'
                        }
                      `}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            {user && (
              <div className="flex-shrink-0 flex border-t border-neutral-700 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-600">
                        <span className="text-sm font-medium leading-none text-white">
                          {user.name.charAt(0)}
                        </span>
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs font-medium text-neutral-400 group-hover:text-neutral-300">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-neutral-200 text-neutral-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              {/* Search bar placeholder, could be implemented later */}
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-neutral-400 focus-within:text-neutral-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                    {/* Could add search icon here */}
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <span className="sr-only">Open user menu</span>
                    <UserCircleIcon className="h-8 w-8 text-neutral-400" aria-hidden="true" />
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
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          item.name === 'Sign out' ? (
                            <button
                              onClick={handleSignOut}
                              className={`${
                                active ? 'bg-neutral-100' : ''
                              } block w-full text-left px-4 py-2 text-sm text-neutral-700`}
                            >
                              {item.name}
                            </button>
                          ) : (
                            <Link
                              to={item.href}
                              className={`${
                                active ? 'bg-neutral-100' : ''
                              } block px-4 py-2 text-sm text-neutral-700`}
                            >
                              {item.name}
                            </Link>
                          )
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
