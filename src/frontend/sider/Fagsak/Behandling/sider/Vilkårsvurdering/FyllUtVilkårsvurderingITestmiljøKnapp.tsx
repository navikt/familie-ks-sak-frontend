import { useFyllUtVilkårsvurderingITestmiljø } from '@hooks/useFyllUtVilkårsvurderingITestmiljø';
import { Box, Button } from '@navikt/ds-react';
import { erProd } from '@utils/miljø';

interface Props {
    behandlingId: number;
}

export function FyllUtVilkårsvurderingITestmiljøKnapp({ behandlingId }: Props) {
    const { mutate: fyllUtVilkårsvurdering, isPending } = useFyllUtVilkårsvurderingITestmiljø({
        onSuccess: () => window.location.reload(),
    });

    function onFyllUtVilkårsvurderingClicked() {
        if (erProd()) {
            return;
        }
        fyllUtVilkårsvurdering({ behandlingId });
    }

    return (
        <Box marginBlock={'space-32 space-0'}>
            <Button size={'small'} loading={isPending} onClick={onFyllUtVilkårsvurderingClicked}>
                Fyll ut vilkårsvurdering
            </Button>
        </Box>
    );
}
