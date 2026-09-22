import { Resultat, type UtdypendeVilkårsvurdering, UtdypendeVilkårsvurderingGenerell } from '@typer/vilkår';
import { useWatch } from 'react-hook-form';

import { AntallTimerFelt } from './AntallTimerFelt';
import { utledBarnehageplassResultat } from './BarnehageplassUtils';
import { HarBarnehageplassFelt } from './HarBarnehageplassFelt';
import { SøkerHarMeldtFraOmBarnehageplassFelt } from './SøkerHarMeldtFraOmBarnehageplassFelt';
import { useVilkårResultatSkjema, VilkårResultatFelt } from '../../useVilkårResultatSkjema';
import { VilkårSkjema, type VilkårProps } from '../../VilkårSkjema';
import { VilkårTabellRad } from '../../VilkårTabellRad';

const MULIGE_UTDYPENDE_VILKÅRSVURDERINGER: UtdypendeVilkårsvurdering[] = [
    UtdypendeVilkårsvurderingGenerell.SOMMERFERIE,
];

export function Barnehageplass({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: VilkårProps) {
    const { form, onSubmit } = useVilkårResultatSkjema({
        lagretVilkårResultat,
        person,
        settFokusPåLeggTilPeriodeKnapp,
    });

    const { control, getValues, setValue } = form;

    const harBarnehageplass = useWatch({ control, name: VilkårResultatFelt.HAR_BARNEHAGEPLASS });
    const periode = useWatch({ control, name: VilkårResultatFelt.PERIODE });

    const oppdaterResultat = (antallTimer = getValues(VilkårResultatFelt.ANTALL_TIMER)) => {
        const nyttResultat = utledBarnehageplassResultat(
            getValues(VilkårResultatFelt.HAR_BARNEHAGEPLASS),
            antallTimer,
            getValues(VilkårResultatFelt.UTDYPENDE_VILKÅRSVURDERINGER)
        );
        setValue(VilkårResultatFelt.RESULTAT, nyttResultat, { shouldDirty: true });
        if (nyttResultat !== Resultat.IKKE_OPPFYLT) {
            setValue(VilkårResultatFelt.ER_EKSPLISITT_AVSLAG_PÅ_SØKNAD, false, { shouldDirty: true });
            setValue(VilkårResultatFelt.AVSLAG_BEGRUNNELSER, [], { shouldDirty: true });
        }
    };

    return (
        <VilkårTabellRad lagretVilkårResultat={lagretVilkårResultat} form={form} onSubmit={onSubmit}>
            <VilkårSkjema
                lagretVilkårResultat={lagretVilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                person={person}
                bestemMuligeUtdypendeVilkårsvurderinger={({ harBarnehageplass }) =>
                    harBarnehageplass ? [] : MULIGE_UTDYPENDE_VILKÅRSVURDERINGER
                }
                onUtdypendeVilkårsvurderingerEndret={() => oppdaterResultat()}
                periodeChildren={periode.tom ? <SøkerHarMeldtFraOmBarnehageplassFelt /> : null}
                onPeriodeEndret={nyPeriode => {
                    if (!nyPeriode.tom) {
                        setValue(VilkårResultatFelt.SØKER_HAR_MELDT_FRA_OM_BARNEHAGEPLASS, false, {
                            shouldDirty: true,
                        });
                    }
                }}
            >
                <HarBarnehageplassFelt
                    legend={vilkårFraConfig.spørsmål ? vilkårFraConfig.spørsmål() : ''}
                    onEndret={nyHarBarnehageplass => {
                        if (!nyHarBarnehageplass) {
                            setValue(VilkårResultatFelt.ANTALL_TIMER, '', { shouldDirty: true });
                        }
                        oppdaterResultat();
                    }}
                />
                {harBarnehageplass && <AntallTimerFelt onEndret={oppdaterResultat} />}
            </VilkårSkjema>
        </VilkårTabellRad>
    );
}
