import { Alert, ErrorSummary } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import Annet from './Annet';
import Barna from './Barna';
import { LeggTilBarnKnapp } from './LeggTilBarnKnapp';
import { useSøknadContext } from './SøknadContext';
import { LeggTilBarnModal } from '../../../../../komponenter/Modal/LeggTilBarn/LeggTilBarnModal';
import { LeggTilBarnModalContextProvider } from '../../../../../komponenter/Modal/LeggTilBarn/LeggTilBarnModalContext';
import MålformVelger from '../../../../../komponenter/MålformVelger';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import { BehandlingSteg } from '../../../../../typer/behandling';
import type { IBarnMedOpplysninger } from '../../../../../typer/søknad';
import { useBehandlingContext } from '../../context/BehandlingContext';

const RegistrerSøknad = () => {
    const { behandling, vurderErLesevisning } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();

    const { hentFeilTilOppsummering, nesteAction, skjema, søknadErLastetFraBackend } = useSøknadContext();

    const harBrevmottaker = behandling.brevmottakere.length > 0;

    function onLeggTilBarn(barn: IBarnMedOpplysninger) {
        skjema.felter.barnaMedOpplysninger.validerOgSettFelt([...skjema.felter.barnaMedOpplysninger.verdi, barn]);
    }

    return (
        <LeggTilBarnModalContextProvider
            barn={skjema.felter.barnaMedOpplysninger.verdi}
            onLeggTilBarn={onLeggTilBarn}
            harBrevmottaker={harBrevmottaker}
        >
            {!erLesevisning && <LeggTilBarnModal />}
            <Skjemasteg
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

                {!erLesevisning && <LeggTilBarnKnapp />}

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
                            <ErrorSummary.Item key={item.skjemaelementId} href={`#${item.skjemaelementId}`}>
                                {item.feilmelding}
                            </ErrorSummary.Item>
                        ))}
                    </ErrorSummary>
                )}
            </Skjemasteg>
        </LeggTilBarnModalContextProvider>
    );
};

export default RegistrerSøknad;
