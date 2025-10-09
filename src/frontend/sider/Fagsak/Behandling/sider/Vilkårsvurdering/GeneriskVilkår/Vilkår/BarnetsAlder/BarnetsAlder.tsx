import { isBefore } from 'date-fns';

import { Label, Radio, RadioGroup } from '@navikt/ds-react';

import { muligeUtdypendeVilkårsvurderinger, useBarnetsAlder } from './BarnetsAlderContext';
import Datovelger from '../../../../../../../../komponenter/Datovelger/Datovelger';
import { Lovverk } from '../../../../../../../../typer/lovverk';
import { Resultat } from '../../../../../../../../typer/vilkår';
import {
    datoForLovendringAugust24,
    type IIsoDatoPeriode,
    isoStringTilDate,
    isoStringTilDateEllerUndefinedHvisUgyldigDato,
} from '../../../../../../../../utils/dato';
import { utledLovverk } from '../../../../../../../../utils/lovverk';
import { useBehandlingContext } from '../../../../../context/BehandlingContext';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import { VilkårEkspanderbarRad } from '../../VilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';

const hentSpørsmålForLovverkFør2025 = (periode: IIsoDatoPeriode) => {
    const fraOgMedDato = isoStringTilDateEllerUndefinedHvisUgyldigDato(periode.fom);
    const fraOgMedErFørLovendring = fraOgMedDato && isBefore(fraOgMedDato, datoForLovendringAugust24);
    if (fraOgMedErFørLovendring) {
        return 'Er barnet mellom 1 og 2 år eller adoptert?';
    } else {
        return 'Er barnet mellom 13 og 19 måneder eller adoptert?';
    }
};

const hentSpørsmålForLovverk = (lovverk: Lovverk | undefined, periode: IIsoDatoPeriode) => {
    if (!lovverk) {
        throw Error('Lovverk skal finnes på barnets alder');
    }
    if (lovverk === Lovverk.LOVENDRING_FEBRUAR_2025) {
        return 'Er barnet mellom 12 og 20 måneder eller adoptert?';
    } else {
        return hentSpørsmålForLovverkFør2025(periode);
    }
};

type BarnetsAlderProps = IVilkårSkjemaBaseProps;

export const BarnetsAlder: React.FC<BarnetsAlderProps> = ({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: BarnetsAlderProps) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();

    const { vilkårSkjemaContext, finnesEndringerSomIkkeErLagret } = useBarnetsAlder(lagretVilkårResultat, person);

    const { toggleForm, erVilkårEkspandert } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret: finnesEndringerSomIkkeErLagret,
        lagretVilkårResultat,
    });

    const skjema = vilkårSkjemaContext.skjema;

    const lovverk = utledLovverk(isoStringTilDate(person.fødselsdato), skjema.felter.adopsjonsdato.verdi);
    const spørsmål = hentSpørsmålForLovverk(lovverk, skjema.felter.periode.verdi);

    return (
        <VilkårEkspanderbarRad
            lagretVilkårResultat={lagretVilkårResultat}
            erVilkårEkspandert={erVilkårEkspandert}
            toggleForm={toggleForm}
        >
            <VilkårSkjema
                vilkårSkjemaContext={vilkårSkjemaContext}
                visVurderesEtter={false}
                visSpørsmål={false}
                muligeUtdypendeVilkårsvurderinger={muligeUtdypendeVilkårsvurderinger}
                lagretVilkårResultat={lagretVilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                toggleForm={toggleForm}
                person={person}
                lesevisning={erLesevisning}
                settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                utdypendeVilkårsvurderingChildren={
                    skjema.felter.adopsjonsdato.erSynlig ? (
                        <Datovelger
                            felt={skjema.felter.adopsjonsdato}
                            label="Adopsjonsdato"
                            visFeilmeldinger={skjema.visFeilmeldinger}
                            kanKunVelgeFortid
                            readOnly={erLesevisning}
                        />
                    ) : null
                }
            >
                <RadioGroup
                    readOnly={erLesevisning}
                    value={skjema.felter.resultat.verdi}
                    legend={<Label>{spørsmål}</Label>}
                    error={skjema.visFeilmeldinger ? skjema.felter.resultat.feilmelding : ''}
                >
                    <Radio
                        name={`${lagretVilkårResultat.vilkårType}_${lagretVilkårResultat.id}`}
                        value={Resultat.OPPFYLT}
                        onChange={() => {
                            skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT);
                            skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(false);
                            skjema.felter.avslagBegrunnelser.validerOgSettFelt([]);
                        }}
                    >
                        Ja
                    </Radio>
                    <Radio
                        name={`${lagretVilkårResultat.vilkårType}_${lagretVilkårResultat.id}`}
                        value={Resultat.IKKE_OPPFYLT}
                        onChange={() => skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_OPPFYLT)}
                    >
                        Nei
                    </Radio>
                </RadioGroup>
            </VilkårSkjema>
        </VilkårEkspanderbarRad>
    );
};
