import * as React from 'react';

import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Refresh } from '@navikt/ds-icons';
import { Alert, BodyShort, Detail, ErrorMessage, ErrorSummary } from '@navikt/ds-react';
import { ASpacing2 } from '@navikt/ds-tokens/dist/tokens';
import { FamilieKnapp } from '@navikt/familie-form-elements';
import type { Ressurs } from '@navikt/familie-typer';
import { byggHenterRessurs, byggTomRessurs, RessursStatus } from '@navikt/familie-typer';

import { FyllUtVilkårsvurderingITestmiljøKnapp } from './FyllUtVilkårsvurderingITestmiljøKnapp';
import VilkårsvurderingSkjema from './VilkårsvurderingSkjema';
import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import { useVilkårsvurdering } from '../../../context/Vilkårsvurdering/VilkårsvurderingContext';
import useSakOgBehandlingParams from '../../../hooks/useSakOgBehandlingParams';
import type { IBehandling } from '../../../typer/behandling';
import { BehandlingSteg, BehandlingÅrsak } from '../../../typer/behandling';
import { Datoformat, isoStringTilFormatertString } from '../../../utils/dato';
import { erProd } from '../../../utils/miljø';
import { hentFrontendFeilmelding } from '../../../utils/ressursUtils';
import Skjemasteg from '../../Felleskomponenter/Skjemasteg/Skjemasteg';

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

    const { vilkårsvurdering, feiloppsummeringFeil } = useVilkårsvurdering();
    const {
        vurderErLesevisning,
        oppdaterRegisteropplysninger,
        vilkårsvurderingNesteOnClick,
        behandlingsstegSubmitressurs,
    } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const registeropplysningerHentetTidpsunkt =
        vilkårsvurdering[0]?.person?.registerhistorikk?.hentetTidspunkt;

    const [visFeilmeldinger, settVisFeilmeldinger] = React.useState(false);
    const [hentOpplysningerRessurs, settHentOpplysningerRessurs] = React.useState(byggTomRessurs());

    const navigate = useNavigate();

    const uregistrerteBarn =
        åpenBehandling.søknadsgrunnlag?.barnaMedOpplysninger.filter(
            barn => !barn.erFolkeregistrert
        ) ?? [];

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
                    <FamilieKnapp
                        className={classNames('oppdater-registeropplysninger-knapp')}
                        id={'oppdater-registeropplysninger'}
                        aria-label={'Oppdater registeropplysninger'}
                        title={'Oppdater'}
                        onClick={() => {
                            settHentOpplysningerRessurs(byggHenterRessurs());
                            oppdaterRegisteropplysninger().then(
                                (response: Ressurs<IBehandling>) => {
                                    settHentOpplysningerRessurs(response);
                                }
                            );
                        }}
                        loading={hentOpplysningerRessurs.status === RessursStatus.HENTER}
                        variant="tertiary"
                        size="small"
                        erLesevisning={erLesevisning}
                    >
                        {hentOpplysningerRessurs.status !== RessursStatus.HENTER && (
                            <Refresh style={{ fontSize: '1.5rem' }} role="img" focusable="false" />
                        )}
                    </FamilieKnapp>
                </HentetLabelOgKnappDiv>
                {hentOpplysningerRessurs.status === RessursStatus.FEILET && (
                    <ErrorMessage>{hentOpplysningerRessurs.frontendFeilmelding}</ErrorMessage>
                )}
            </>

            {!erProd() && (
                <FyllUtVilkårsvurderingITestmiljøKnapp behandlingId={åpenBehandling.behandlingId} />
            )}

            <VilkårsvurderingSkjema />
            {uregistrerteBarn.length > 0 && (
                <Alert variant="info">
                    <BodyShort>
                        Du har registrert følgende barn som ikke er registrert i Folkeregisteret:
                    </BodyShort>
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
            {erFeilISkjema && visFeilmeldinger && (
                <ErrorSummary heading={'For å gå videre må du rette opp følgende:'}>
                    {feiloppsummeringFeil.map(item => (
                        <ErrorSummary.Item
                            href={`#${item.skjemaelementId}`}
                            key={item.skjemaelementId}
                        >
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
