import * as React from 'react';

import styled from 'styled-components';

import { Alert, ErrorSummary } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import Annet from './Annet';
import Barna from './Barna';
import { useSøknadContext } from './SøknadContext';
import MålformVelger from '../../../../../komponenter/MålformVelger';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import { BehandlingSteg } from '../../../../../typer/behandling';
import { useBehandlingContext } from '../../../Behandling/sider/Vedtak/VedtakBegrunnelserTabell/Context/BehandlingContext';

const StyledSkjemasteg = styled(Skjemasteg)`
    max-width: 40rem;
`;

const RegistrerSøknad: React.FC = () => {
    const { vurderErLesevisning } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();

    const { hentFeilTilOppsummering, nesteAction, skjema, søknadErLastetFraBackend } =
        useSøknadContext();

    return (
        <StyledSkjemasteg
            className={'søknad'}
            tittel={'Registrer opplysninger fra søknaden'}
            nesteOnClick={() => {
                nesteAction(false);
            }}
            nesteKnappTittel={erLesevisning ? 'Neste' : 'Bekreft og fortsett'}
            senderInn={skjema.submitRessurs.status === RessursStatus.HENTER}
            steg={BehandlingSteg.REGISTRERE_SØKNAD}
        >
            {søknadErLastetFraBackend && !erLesevisning && (
                <>
                    <br />
                    <Alert
                        variant="warning"
                        children={
                            'En søknad er allerede registrert på behandlingen. Vi har fylt ut søknaden i skjemaet.'
                        }
                    />
                    <br />
                </>
            )}

            <Barna />

            <MålformVelger
                målformFelt={skjema.felter.målform}
                visFeilmeldinger={skjema.visFeilmeldinger}
                erLesevisning={erLesevisning}
            />

            <Annet />

            {(skjema.submitRessurs.status === RessursStatus.FEILET ||
                skjema.submitRessurs.status === RessursStatus.IKKE_TILGANG) && (
                <Alert variant="error">{skjema.submitRessurs.frontendFeilmelding}</Alert>
            )}
            {skjema.visFeilmeldinger && hentFeilTilOppsummering().length > 0 && (
                <ErrorSummary heading={'For å gå videre må du rette opp følgende:'}>
                    {hentFeilTilOppsummering().map(item => (
                        <ErrorSummary.Item
                            key={item.skjemaelementId}
                            href={`#${item.skjemaelementId}`}
                        >
                            {item.feilmelding}
                        </ErrorSummary.Item>
                    ))}
                </ErrorSummary>
            )}
        </StyledSkjemasteg>
    );
};

export default RegistrerSøknad;
