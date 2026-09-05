import { useErLesevisning } from '@hooks/useErLesevisning';
import { useOpprettVilkårResultat } from '@hooks/useOpprettVilkårResultat';
import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { useEkspanderbareVilkårResultatRader } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import type { IBehandling } from '@typer/behandling';
import type { IGrunnlagPerson } from '@typer/person';
import { type IVilkårConfig, type IVilkårResultat, Resultat } from '@typer/vilkår';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Box, Button, Fieldset, Heading } from '@navikt/ds-react';
import { byggSuksessRessurs } from '@navikt/familie-typer';

import styles from './GeneriskVilkår.module.css';
import { VilkårTabell } from './VilkårTabell';

interface Props {
    person: IGrunnlagPerson;
    vilkårResultater: IVilkårResultat[];
    vilkårFraConfig: IVilkårConfig;
    generiskVilkårKey: string;
}

export function GeneriskVilkår({ person, vilkårFraConfig, vilkårResultater, generiskVilkårKey }: Props) {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { ekspanderRad } = useEkspanderbareVilkårResultatRader();
    const erLesevisning = useErLesevisning();

    const leggTilPeriodeKnappId = `${generiskVilkårKey}__legg_til_periode`;

    const settFokusPåLeggTilPeriodeKnapp = () => {
        document.getElementById(leggTilPeriodeKnappId)?.focus();
    };

    function åpneNyeIkkeVurdertVilkårResultat(oppdatertBehandling: IBehandling) {
        // Dette er gjort slik siden APIet ikke returnerer IDen til det opprettede vilkår resultatet.
        const eksisterendeVilkårResultatIder = behandling.personResultater
            .flatMap(it => it.vilkårResultater)
            .map(it => it.id);

        oppdatertBehandling.personResultater
            .flatMap(it => it.vilkårResultater)
            .filter(it => it.resultat === Resultat.IKKE_VURDERT)
            .filter(it => !eksisterendeVilkårResultatIder.includes(it.id))
            .forEach(it => {
                ekspanderRad(it.id);
            });
    }

    const {
        mutate: opprettVilkårResultat,
        isPending: opprettVilkårResultatIsPending,
        error: opprettVilkårResultatError,
    } = useOpprettVilkårResultat({
        onSuccess: oppdatertBehandling => {
            settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
            åpneNyeIkkeVurdertVilkårResultat(oppdatertBehandling);
        },
    });

    const skalViseLeggTilKnapp =
        !erLesevisning && vilkårResultater.every(vilkårResultat => vilkårResultat.resultat !== Resultat.IKKE_VURDERT);

    return (
        <div className={styles.container}>
            <Fieldset legend={vilkårFraConfig.tittel} hideLegend error={opprettVilkårResultatError?.message}>
                <Heading size="medium" level="3">
                    {vilkårFraConfig.tittel}
                </Heading>
                <VilkårTabell
                    person={person}
                    vilkårFraConfig={vilkårFraConfig}
                    vilkårResultater={vilkårResultater}
                    settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                />
                {skalViseLeggTilKnapp && (
                    <Box marginBlock={'space-20 space-0'}>
                        <Button
                            onClick={() =>
                                opprettVilkårResultat({
                                    behandlingId: behandling.behandlingId,
                                    personIdent: person.personIdent,
                                    vilkårType: vilkårFraConfig.key,
                                })
                            }
                            id={leggTilPeriodeKnappId}
                            loading={opprettVilkårResultatIsPending}
                            variant="tertiary"
                            size="medium"
                            icon={<PlusCircleIcon />}
                        >
                            Legg til periode
                        </Button>
                    </Box>
                )}
            </Fieldset>
        </div>
    );
}
