import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Item, UserProfile } from '../backend';
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
        // Handle authorization errors gracefully
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

export function useCreateItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createItem(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userItems'] });
    },
  });
}

export function useListUserItems(user?: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ['userItems', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      try {
        return await actor.listUserItems(user);
      } catch (error: any) {
        // Handle authorization errors gracefully
        if (error.message?.includes('Unauthorized') || error.message?.includes('Anonymous')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!user,
    retry: (failureCount, error: any) => {
      // Don't retry on authorization errors
      if (error.message?.includes('Unauthorized') || error.message?.includes('Anonymous')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useGetItem(id?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Item | null>({
    queryKey: ['item', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getItem(id);
      } catch (error: any) {
        // Handle authorization errors gracefully
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

export function useGetSharedItem(id?: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Item | null>({
    queryKey: ['sharedItem', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getSharedItem(id);
    },
    enabled: !!actor && !actorFetching && !!id,
    retry: false,
  });
}

export function useDeleteItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userItems'] });
    },
  });
}

export function useShareItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.shareItem(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['userItems'] });
      queryClient.invalidateQueries({ queryKey: ['item', id] });
    },
  });
}

export function useUnshareItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unshareItem(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['userItems'] });
      queryClient.invalidateQueries({ queryKey: ['item', id] });
    },
  });
}
