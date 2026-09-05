import { useFyllUtVilkårsvurderingITestmiljø } from '@hooks/useFyllUtVilkårsvurderingITestmiljø';
import { erProd } from '@utils/miljø';

import { Box, Button } from '@navikt/ds-react';

interface Props {
    behandlingId: number;
}

export function FyllUtVilkårsvurderingITestmiljøKnapp({ behandlingId }: Props) {
    const { mutate: fyllUtVilkårsvurdering, isPending } = useFyllUtVilkårsvurderingITestmiljø({
        onSuccess: () => window.location.reload(),
    });

    if (erProd()) {
        return null;
    }

    return (
        <Box marginBlock={'space-32 space-0'}>
            <Button size={'small'} loading={isPending} onClick={() => fyllUtVilkårsvurdering({ behandlingId })}>
                Fyll ut vilkårsvurdering
            </Button>
        </Box>
    );
}
