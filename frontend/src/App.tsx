import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { AppShell } from './components/layout/AppShell';
import BuilderPage from './pages/BuilderPage';
import MyCreationsPage from './pages/MyCreationsPage';
import CreationViewerPage from './pages/CreationViewerPage';
import SharedViewerPage from './pages/SharedViewerPage';
import DownloadedCreationViewerPage from './pages/DownloadedCreationViewerPage';

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: BuilderPage,
});

const myCreationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-creations',
  component: MyCreationsPage,
});

const viewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/creation/$id',
  component: CreationViewerPage,
});

const sharedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shared/$id',
  component: SharedViewerPage,
});

const downloadedViewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/downloaded-creation',
  component: DownloadedCreationViewerPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute, 
  myCreationsRoute, 
  viewerRoute, 
  sharedRoute,
  downloadedViewerRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
