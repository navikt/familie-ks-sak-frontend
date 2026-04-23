import { useState } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFagsak } from '@hooks/useFagsak';
import { useOppdaterVilkårsvurdering } from '@hooks/useOppdaterVilkårsvurdering';
import { BehandlingSteg, BehandlingÅrsak } from '@typer/behandling';
import { defaultFunksjonellFeil } from '@typer/feilmeldinger';
import { Datoformat, isoStringTilFormatertString } from '@utils/dato';
import { erProd } from '@utils/miljø';
import { useNavigate } from 'react-router';

import { InformationSquareIcon } from '@navikt/aksel-icons';
import { BodyShort, ErrorMessage, ErrorSummary, InfoCard, List } from '@navikt/ds-react';
import { byggSuksessRessurs } from '@navikt/familie-typer';

import { FyllUtVilkårsvurderingITestmiljøKnapp } from './FyllUtVilkårsvurderingITestmiljøKnapp';
import { OppdaterRegisteropplysninger } from './OppdaterRegisteropplysninger';
import { ManglendeSvalbardmerkingVarsel } from './Varsel/ManglendeSvalbardmerkingVarsel';
import { useVilkårsvurderingContext } from './VilkårsvurderingContext';
import VilkårsvurderingSkjema from './VilkårsvurderingSkjema';
import Skjemasteg, { MAX_SKJEMASTEG_BREDDE } from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import { useBehandlingContext } from '../../context/BehandlingContext';

export function Vilkårsvurdering() {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { vilkårsvurdering, feiloppsummeringFeil } = useVilkårsvurderingContext();

    const fagsak = useFagsak();
    const erLesevisning = useErLesevisning();
    const navigate = useNavigate();

    const {
        mutate: oppdaterVilkårsvurdering,
        isPending: oppdaterVilkårsvurderingIsPending,
        error: oppdaterVilkårsvurderingError,
    } = useOppdaterVilkårsvurdering({
        onSuccess: behandling => {
            settÅpenBehandling(byggSuksessRessurs(behandling));
            navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/tilkjent-ytelse`);
        },
    });

    const [visFeilmeldinger, settVisFeilmeldinger] = useState(false);

    const uregistrerteBarn =
        behandling.søknadsgrunnlag?.barnaMedOpplysninger.filter(barn => !barn.erFolkeregistrert) ?? [];

    if (vilkårsvurdering.length === 0) {
        return <div>Finner ingen vilkår på behandlingen.</div>;
    }

    const erFeilISkjema = feiloppsummeringFeil.length > 0;

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
                    oppdaterVilkårsvurdering({ behandlingId: behandling.behandlingId });
                } else {
                    settVisFeilmeldinger(true);
                }
            }}
            maxWidthStyle={MAX_SKJEMASTEG_BREDDE}
            senderInn={oppdaterVilkårsvurderingIsPending}
            steg={BehandlingSteg.VILKÅRSVURDERING}
        >
            <OppdaterRegisteropplysninger />
            {!erProd() && <FyllUtVilkårsvurderingITestmiljøKnapp behandlingId={behandling.behandlingId} />}
            <VilkårsvurderingSkjema />
            {uregistrerteBarn.length > 0 && (
                <InfoCard data-color="info">
                    <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                        <InfoCard.Title>
                            Du har registrert følgende barn som ikke er registrert i Folkeregisteret:
                        </InfoCard.Title>
                    </InfoCard.Header>
                    <InfoCard.Content>
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
                    </InfoCard.Content>
                </InfoCard>
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
            {oppdaterVilkårsvurderingError && (
                <ErrorMessage>{oppdaterVilkårsvurderingError.message ?? defaultFunksjonellFeil}</ErrorMessage>
            )}
        </Skjemasteg>
    );
}
