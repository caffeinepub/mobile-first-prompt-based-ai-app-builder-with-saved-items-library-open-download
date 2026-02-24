import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile } from './useQueries';

export function useCurrentUser() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = identity?.getPrincipal();
  const displayName = userProfile?.name || 'User';

  return {
    isAuthenticated,
    principal,
    displayName,
    userProfile,
    isLoading: loginStatus === 'initializing' || profileLoading,
    isFetched,
  };
}
