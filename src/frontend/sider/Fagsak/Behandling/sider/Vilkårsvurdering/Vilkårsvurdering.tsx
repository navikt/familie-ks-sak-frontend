import * as React from 'react';

import classNames from 'classnames';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { ArrowsSquarepathIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Button, Detail, ErrorMessage, ErrorSummary } from '@navikt/ds-react';
import { ASpacing2 } from '@navikt/ds-tokens/dist/tokens';
import type { Ressurs } from '@navikt/familie-typer';
import { byggHenterRessurs, byggTomRessurs, RessursStatus } from '@navikt/familie-typer';

import { FyllUtVilkårsvurderingITestmiljøKnapp } from './FyllUtVilkårsvurderingITestmiljøKnapp';
import { ManglendeSvalbardmerkingVarsel } from './Varsel/ManglendeSvalbardmerkingVarsel';
import { useVilkårsvurderingContext } from './VilkårsvurderingContext';
import VilkårsvurderingSkjema from './VilkårsvurderingSkjema';
import useSakOgBehandlingParams from '../../../../../hooks/useSakOgBehandlingParams';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import type { IBehandling } from '../../../../../typer/behandling';
import { BehandlingSteg, BehandlingÅrsak } from '../../../../../typer/behandling';
import { Datoformat, isoStringTilFormatertString } from '../../../../../utils/dato';
import { erProd } from '../../../../../utils/miljø';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';
import { useBehandlingContext } from '../../context/BehandlingContext';

const UregistrerteBarnListe = styled.ol`
    margin: ${ASpacing2} 0;
`;

const HentetLabelOgKnappDiv = styled.div`
    display: flex;
    justify-content: left;
    align-items: center;

    .knapp__spinner {
        margin: 0 !important;
    }

    margin-bottom: ${ASpacing2};
`;

interface IProps {
    åpenBehandling: IBehandling;
}

const Vilkårsvurdering: React.FunctionComponent<IProps> = ({ åpenBehandling }) => {
    const { fagsakId } = useSakOgBehandlingParams();

    const { vilkårsvurdering, feiloppsummeringFeil } = useVilkårsvurderingContext();
    const {
        vurderErLesevisning,
        oppdaterRegisteropplysninger,
        vilkårsvurderingNesteOnClick,
        behandlingsstegSubmitressurs,
    } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();

    const registeropplysningerHentetTidpsunkt = vilkårsvurdering[0]?.person?.registerhistorikk?.hentetTidspunkt;

    const [visFeilmeldinger, settVisFeilmeldinger] = React.useState(false);
    const [hentOpplysningerRessurs, settHentOpplysningerRessurs] = React.useState(byggTomRessurs());

    const navigate = useNavigate();

    const uregistrerteBarn =
        åpenBehandling.søknadsgrunnlag?.barnaMedOpplysninger.filter(barn => !barn.erFolkeregistrert) ?? [];

    if (vilkårsvurdering.length === 0) {
        return <div>Finner ingen vilkår på behandlingen.</div>;
    }

    const erFeilISkjema = feiloppsummeringFeil.length > 0;

    const skjemaFeilmelding = hentFrontendFeilmelding(behandlingsstegSubmitressurs);

    return (
        <Skjemasteg
            skalViseForrigeKnapp={åpenBehandling.årsak === BehandlingÅrsak.SØKNAD}
            tittel={'Vilkårsvurdering'}
            forrigeOnClick={() => {
                navigate(`/fagsak/${fagsakId}/${åpenBehandling.behandlingId}/registrer-soknad`);
            }}
            nesteOnClick={() => {
                if (erLesevisning) {
                    navigate(`/fagsak/${fagsakId}/${åpenBehandling.behandlingId}/tilkjent-ytelse`);
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
            <>
                <HentetLabelOgKnappDiv>
                    <Detail
                        textColor="subtle"
                        children={
                            registeropplysningerHentetTidpsunkt
                                ? `Registeropplysninger hentet ${isoStringTilFormatertString({
                                      isoString: registeropplysningerHentetTidpsunkt,
                                      tilFormat: Datoformat.DATO_TID_SEKUNDER,
                                  })} fra Folkeregisteret`
                                : 'Kunne ikke hente innhentingstidspunkt for registeropplysninger'
                        }
                    />
                    {!erLesevisning && (
                        <Button
                            className={classNames('oppdater-registeropplysninger-knapp')}
                            id={'oppdater-registeropplysninger'}
                            aria-label={'Oppdater registeropplysninger'}
                            title={'Oppdater'}
                            onClick={() => {
                                settHentOpplysningerRessurs(byggHenterRessurs());
                                oppdaterRegisteropplysninger().then((response: Ressurs<IBehandling>) => {
                                    settHentOpplysningerRessurs(response);
                                });
                            }}
                            loading={hentOpplysningerRessurs.status === RessursStatus.HENTER}
                            variant="tertiary"
                            size="small"
                            icon={<ArrowsSquarepathIcon fontSize={'1.5rem'} focusable="false" />}
                        />
                    )}
                </HentetLabelOgKnappDiv>
                {hentOpplysningerRessurs.status === RessursStatus.FEILET && (
                    <ErrorMessage>{hentOpplysningerRessurs.frontendFeilmelding}</ErrorMessage>
                )}
            </>

            {!erProd() && <FyllUtVilkårsvurderingITestmiljøKnapp behandlingId={åpenBehandling.behandlingId} />}

            <VilkårsvurderingSkjema />
            {uregistrerteBarn.length > 0 && (
                <Alert variant="info">
                    <BodyShort>Du har registrert følgende barn som ikke er registrert i Folkeregisteret:</BodyShort>
                    <UregistrerteBarnListe>
                        {uregistrerteBarn.map(uregistrertBarn => (
                            <li key={`${uregistrertBarn.navn}_${uregistrertBarn.fødselsdato}`}>
                                <BodyShort>
                                    {`${uregistrertBarn.navn} - ${isoStringTilFormatertString({
                                        isoString: uregistrertBarn.fødselsdato,
                                        tilFormat: Datoformat.DATO,
                                    })}`}
                                </BodyShort>
                            </li>
                        ))}
                    </UregistrerteBarnListe>

                    <BodyShort>Dette vil føre til avslag for barna i listen.</BodyShort>
                </Alert>
            )}
            <ManglendeSvalbardmerkingVarsel manglendeSvalbardmerking={åpenBehandling.manglendeSvalbardmerking} />
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
};

export default Vilkårsvurdering;
