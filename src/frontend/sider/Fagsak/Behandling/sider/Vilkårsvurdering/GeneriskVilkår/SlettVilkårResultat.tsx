import { useSlettVilkårResultat } from '@hooks/useSlettVilkårResultat';
import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { useEkspanderbareVilkårResultatRader } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import { type IVilkårResultat } from '@typer/vilkår';

import { TrashIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { byggSuksessRessurs } from '@navikt/familie-typer';

interface Props {
    personIdent: string;
    vilkårResultat: IVilkårResultat;
}

export function SlettVilkårResultat({ personIdent, vilkårResultat }: Props) {
    const { behandling, settÅpenBehandling } = useBehandlingContext();

    const { ekspanderRad, kollapsRad } = useEkspanderbareVilkårResultatRader();

    const { mutate: slettVilkårResultat, isPending: slettVilkårResultatIsPending } = useSlettVilkårResultat({
        onSuccess: nyBehandling => {
            kollapsRad(vilkårResultat.id);

            const iderFraNyBehandling = nyBehandling.personResultater
                .flatMap(it => it.vilkårResultater)
                .map(it => it.id);

            const iderFraGammelBehandling = behandling.personResultater
                .flatMap(it => it.vilkårResultater)
                .map(it => it.id);

            const nylagedeIder = iderFraNyBehandling.filter(id => !iderFraGammelBehandling.includes(id));
            nylagedeIder.forEach(id => ekspanderRad(id));

            settÅpenBehandling(byggSuksessRessurs(nyBehandling));
        },
    });

    function onSlettClicked() {
        slettVilkårResultat({
            behandlingId: behandling.behandlingId,
            vilkårResultatId: vilkårResultat.id,
            personIdent: personIdent,
        });
    }

    return (
        <Button
            variant={'tertiary'}
            onClick={() => onSlettClicked()}
            loading={slettVilkårResultatIsPending}
            size={'medium'}
            icon={<TrashIcon />}
        >
            Fjern
        </Button>
    );
}
