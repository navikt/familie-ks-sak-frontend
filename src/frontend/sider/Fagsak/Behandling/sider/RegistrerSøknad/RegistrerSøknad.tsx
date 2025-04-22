import * as React from 'react';

import styled from 'styled-components';

import { Alert, BodyShort, Button, ErrorSummary, Modal } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import Annet from './Annet';
import Barna from './Barna';
import { useSøknadContext } from './SøknadContext';
import { useBehandling } from '../../../../../context/behandlingContext/BehandlingContext';
import MålformVelger from '../../../../../komponenter/MålformVelger';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import { BehandlingSteg } from '../../../../../typer/behandling';

const FjernVilkårAdvarsel = styled(BodyShort)`
    white-space: pre-wrap;
    padding-bottom: 3.5rem;
`;

const StyledSkjemasteg = styled(Skjemasteg)`
    max-width: 40rem;
`;

const RegistrerSøknad: React.FC = () => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const {
        hentFeilTilOppsummering,
        nesteAction,
        settVisBekreftModal,
        skjema,
        søknadErLastetFraBackend,
        visBekreftModal,
    } = useSøknadContext();

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

            {visBekreftModal && (
                <Modal
                    open
                    onClose={() => settVisBekreftModal(false)}
                    header={{
                        heading: 'Er du sikker på at du vil gå videre?',
                        size: 'small',
                        closeButton: false,
                    }}
                    width={'35rem'}
                >
                    <Modal.Body>
                        <FjernVilkårAdvarsel>
                            {skjema.submitRessurs.status === RessursStatus.FEILET ||
                                (skjema.submitRessurs.status === RessursStatus.FUNKSJONELL_FEIL &&
                                    skjema.submitRessurs.frontendFeilmelding)}
                        </FjernVilkårAdvarsel>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            key={'ja'}
                            variant={'primary'}
                            size={'small'}
                            onClick={() => {
                                settVisBekreftModal(false);
                                nesteAction(true);
                            }}
                            children={'Ja'}
                            loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                            disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                        />
                        <Button
                            variant={'secondary'}
                            key={'nei'}
                            size={'small'}
                            onClick={() => {
                                settVisBekreftModal(false);
                            }}
                            children={'Nei'}
                        />
                    </Modal.Footer>
                </Modal>
            )}
        </StyledSkjemasteg>
    );
};

export default RegistrerSøknad;
