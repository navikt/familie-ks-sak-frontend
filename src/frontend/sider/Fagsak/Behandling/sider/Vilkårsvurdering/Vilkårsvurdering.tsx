import { useState } from 'react';

import { useNavigate } from 'react-router';

import { Alert, BodyShort, ErrorMessage, ErrorSummary, List } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { FyllUtVilkårsvurderingITestmiljøKnapp } from './FyllUtVilkårsvurderingITestmiljøKnapp';
import { OppdaterRegisteropplysninger } from './OppdaterRegisteropplysninger';
import { ManglendeSvalbardmerkingVarsel } from './Varsel/ManglendeSvalbardmerkingVarsel';
import { useVilkårsvurderingContext } from './VilkårsvurderingContext';
import VilkårsvurderingSkjema from './VilkårsvurderingSkjema';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import { BehandlingSteg, BehandlingÅrsak } from '../../../../../typer/behandling';
import { Datoformat, isoStringTilFormatertString } from '../../../../../utils/dato';
import { erProd } from '../../../../../utils/miljø';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';
import { useFagsakContext } from '../../../FagsakContext';
import { useBehandlingContext } from '../../context/BehandlingContext';

export function Vilkårsvurdering() {
    const { fagsak } = useFagsakContext();
    const { behandling, vurderErLesevisning, vilkårsvurderingNesteOnClick, behandlingsstegSubmitressurs } =
        useBehandlingContext();

    const { vilkårsvurdering, feiloppsummeringFeil } = useVilkårsvurderingContext();

    const erLesevisning = vurderErLesevisning();

    const [visFeilmeldinger, settVisFeilmeldinger] = useState(false);

    const navigate = useNavigate();

    const uregistrerteBarn =
        behandling.søknadsgrunnlag?.barnaMedOpplysninger.filter(barn => !barn.erFolkeregistrert) ?? [];

    if (vilkårsvurdering.length === 0) {
        return <div>Finner ingen vilkår på behandlingen.</div>;
    }

    const erFeilISkjema = feiloppsummeringFeil.length > 0;

    const skjemaFeilmelding = hentFrontendFeilmelding(behandlingsstegSubmitressurs);

    return (
        <Skjemasteg
            skalViseForrigeKnapp={behandling.årsak === BehandlingÅrsak.SØKNAD}
            tittel={'Vilkårsvurdering'}
            forrigeOnClick={() => {
                navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/registrer-soknad`);
            }}
            nesteOnClick={() => {
                if (erLesevisning) {
                    navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/tilkjent-ytelse`);
                } else if (!erFeilISkjema) {
                    vilkårsvurderingNesteOnClick();
                } else {
                    settVisFeilmeldinger(true);
                }
            }}
            maxWidthStyle={'80rem'}
            senderInn={behandlingsstegSubmitressurs.status === RessursStatus.HENTER}
            steg={BehandlingSteg.VILKÅRSVURDERING}
        >
            <OppdaterRegisteropplysninger />
            {!erProd() && <FyllUtVilkårsvurderingITestmiljøKnapp behandlingId={behandling.behandlingId} />}
            <VilkårsvurderingSkjema />
            {uregistrerteBarn.length > 0 && (
                <Alert variant="info">
                    <BodyShort>Du har registrert følgende barn som ikke er registrert i Folkeregisteret:</BodyShort>
                    <List as={'ol'}>
                        {uregistrerteBarn.map(uregistrertBarn => (
                            <List.Item key={`${uregistrertBarn.navn}_${uregistrertBarn.fødselsdato}`}>
                                <BodyShort>
                                    {`${uregistrertBarn.navn} - ${isoStringTilFormatertString({
                                        isoString: uregistrertBarn.fødselsdato,
                                        tilFormat: Datoformat.DATO,
                                    })}`}
                                </BodyShort>
                            </List.Item>
                        ))}
                    </List>

                    <BodyShort>Dette vil føre til avslag for barna i listen.</BodyShort>
                </Alert>
            )}
            <ManglendeSvalbardmerkingVarsel manglendeSvalbardmerking={behandling.manglendeSvalbardmerking} />
            {erFeilISkjema && visFeilmeldinger && (
                <ErrorSummary heading={'For å gå videre må du rette opp følgende:'}>
                    {feiloppsummeringFeil.map(item => (
                        <ErrorSummary.Item href={`#${item.skjemaelementId}`} key={item.skjemaelementId}>
                            {item.feilmelding}
                        </ErrorSummary.Item>
                    ))}
                </ErrorSummary>
            )}
            {skjemaFeilmelding !== '' && skjemaFeilmelding !== undefined && (
                <ErrorMessage>{skjemaFeilmelding}</ErrorMessage>
            )}
        </Skjemasteg>
    );
}
