import { fyllUtVilkårsvurderingITestmiljø } from '@api/fyllUtVilkårsvurderingITestmiljø';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';

interface Parameters {
    behandlingId: number;
}

type Options = Omit<UseMutationOptions<string, DefaultError, Parameters>, 'mutationFn'>;

export function useFyllUtVilkårsvurderingITestmiljø(options?: Options) {
    return useMutation({
        mutationFn: ({ behandlingId }: Parameters) => fyllUtVilkårsvurderingITestmiljø(behandlingId),
        ...options,
    });
}
