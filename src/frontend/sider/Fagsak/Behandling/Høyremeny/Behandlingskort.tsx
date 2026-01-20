import styled from 'styled-components';

import { BodyShort, Heading } from '@navikt/ds-react';
import {
    ABorderAction,
    ABorderDanger,
    ABorderDefault,
    ABorderSubtle,
    ABorderSuccess,
    AIconInfo,
    AIconSuccess,
    ATextDanger,
    ATextDefault,
} from '@navikt/ds-tokens/dist/tokens';

import Informasjonsbolk from './Informasjonsbolk';
import {
    BehandlingResultat,
    behandlingsresultater,
    behandlingsstatuser,
    behandlingstyper,
    behandlingÅrsak,
    erBehandlingHenlagt,
} from '../../../../typer/behandling';
import { Datoformat, isoStringTilFormatertString } from '../../../../utils/dato';
import { useFagsakContext } from '../../FagsakContext';
import { sakstype } from '../../Saksoversikt/Saksoversikt';
import { useBehandlingContext } from '../context/BehandlingContext';

const hentResultatfarge = (behandlingResultat: BehandlingResultat) => {
    if (erBehandlingHenlagt(behandlingResultat)) {
        return ABorderSubtle;
    }

    switch (behandlingResultat) {
        case BehandlingResultat.INNVILGET:
        case BehandlingResultat.DELVIS_INNVILGET:
        case BehandlingResultat.FORTSATT_INNVILGET:
            return ABorderSuccess;
        case (BehandlingResultat.ENDRET_UTBETALING, BehandlingResultat.ENDRET_UTEN_UTBETALING):
            return ABorderAction;
        case BehandlingResultat.AVSLÅTT:
        case (BehandlingResultat.OPPHØRT, BehandlingResultat.FORTSATT_OPPHØRT):
            return ABorderDanger;
        case BehandlingResultat.IKKE_VURDERT:
            return ABorderSubtle;
        default:
            return ABorderDefault;
    }
};

const hentResultatfargeTekst = (behandlingResultat: BehandlingResultat) => {
    if (erBehandlingHenlagt(behandlingResultat)) {
        return ATextDefault;
    }

    switch (behandlingResultat) {
        case BehandlingResultat.INNVILGET:
        case BehandlingResultat.DELVIS_INNVILGET:
        case BehandlingResultat.FORTSATT_INNVILGET:
            return AIconSuccess;
        case (BehandlingResultat.ENDRET_UTBETALING, BehandlingResultat.ENDRET_UTEN_UTBETALING):
            return AIconInfo;
        case BehandlingResultat.AVSLÅTT:
        case (BehandlingResultat.OPPHØRT, BehandlingResultat.FORTSATT_OPPHØRT):
            return ATextDanger;
        default:
            return ATextDefault;
    }
};

const Container = styled.div<{ $behandlingResultat: BehandlingResultat }>`
    border: 1px solid ${ABorderSubtle};
    border-left: 0.5rem solid ${ABorderSubtle};
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 0.5rem;
    border-color: ${({ $behandlingResultat }) => hentResultatfarge($behandlingResultat)};
`;

const StyledHeading = styled(Heading)`
    font-size: 1rem;
    margin-bottom: 0.2rem;
`;

const StyledHr = styled.hr`
    border: none;
    border-bottom: 1px solid ${ABorderSubtle};
`;

export function Behandlingskort() {
    const { fagsak } = useFagsakContext();
    const { behandling } = useBehandlingContext();

    const behandlinger = fagsak.behandlinger ?? [];

    const antallBehandlinger = behandlinger.length;
    const behandlingIndex = behandlinger.findIndex(b => b.behandlingId === behandling.behandlingId) + 1;

    const tittel = `${behandlingstyper[behandling.type].navn} (${behandlingIndex}/${antallBehandlinger}) - ${sakstype(behandling).toLowerCase()}`;

    return (
        <Container $behandlingResultat={behandling.resultat}>
            <StyledHeading size={'small'} level={'2'}>
                {tittel}
            </StyledHeading>
            <BodyShort>{behandlingÅrsak[behandling.årsak]}</BodyShort>
            <StyledHr />
            <Informasjonsbolk label="Behandlingsstatus" tekst={behandlingsstatuser[behandling.status]} />
            <Informasjonsbolk
                label="Resultat"
                tekst={behandlingsresultater[behandling.resultat]}
                tekstFarge={hentResultatfargeTekst(behandling.resultat)}
            />
            <div>
                {behandling.søknadMottattDato && (
                    <Informasjonsbolk
                        label="Søknad mottatt"
                        tekst={isoStringTilFormatertString({
                            isoString: behandling.søknadMottattDato,
                            tilFormat: Datoformat.DATO,
                        })}
                    />
                )}
                <Informasjonsbolk
                    label="Opprettet"
                    tekst={isoStringTilFormatertString({
                        isoString: behandling.opprettetTidspunkt,
                        tilFormat: Datoformat.DATO,
                    })}
                />
                <Informasjonsbolk
                    label="Vedtaksdato"
                    tekst={isoStringTilFormatertString({
                        isoString: behandling.vedtak?.vedtaksdato,
                        tilFormat: Datoformat.DATO,
                        defaultString: 'Ikke satt',
                    })}
                />
            </div>

            <Informasjonsbolk
                label="Enhet"
                tekst={behandling.arbeidsfordelingPåBehandling.behandlendeEnhetId}
                tekstHover={behandling.arbeidsfordelingPåBehandling.behandlendeEnhetNavn}
            />
        </Container>
    );
}
