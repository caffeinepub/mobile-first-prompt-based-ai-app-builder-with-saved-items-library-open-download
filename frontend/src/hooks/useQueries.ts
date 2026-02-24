import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { AppCreation, UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error: any) {
        if (error.message?.includes('Unauthorized') || error.message?.includes('Anonymous')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGenerateAppCreation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateAppCreation(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCreations'] });
    },
  });
}

export function useUpdateAppCreation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAppCreation(id, content);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['userCreations'] });
      queryClient.invalidateQueries({ queryKey: ['appCreation', id] });
    },
  });
}

export function useListUserCreations(user?: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AppCreation[]>({
    queryKey: ['userCreations', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      try {
        return await actor.listUserAppCreations(user);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized') || error.message?.includes('Anonymous')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!user,
    retry: (failureCount, error: any) => {
      if (error.message?.includes('Unauthorized') || error.message?.includes('Anonymous')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useGetAppCreation(id?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AppCreation | null>({
    queryKey: ['appCreation', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getAppCreation(id);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized') || error.message?.includes('Anonymous')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!id,
    retry: false,
  });
}

export function useGetSharedAppCreation(id?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AppCreation | null>({
    queryKey: ['sharedAppCreation', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getSharedAppCreation(id);
    },
    enabled: !!actor && !actorFetching && !!id,
    retry: false,
  });
}

export function useDeleteAppCreation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAppCreation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCreations'] });
    },
  });
}

export function useShareAppCreation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.shareAppCreation(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['userCreations'] });
      queryClient.invalidateQueries({ queryKey: ['appCreation', id] });
    },
  });
}

export function useUnshareAppCreation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unshareAppCreation(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['userCreations'] });
      queryClient.invalidateQueries({ queryKey: ['appCreation', id] });
    },
  });
}

// Legacy aliases for backward compatibility (kept for any remaining references)
export const useCreateItem = useGenerateAppCreation;
export const useListUserItems = useListUserCreations;
export const useGetItem = useGetAppCreation;
export const useGetSharedItem = useGetSharedAppCreation;
export const useDeleteItem = useDeleteAppCreation;
export const useShareItem = useShareAppCreation;
export const useUnshareItem = useUnshareAppCreation;
