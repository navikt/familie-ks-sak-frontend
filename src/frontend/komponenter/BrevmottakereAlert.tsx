import { useState } from 'react';

import { useLocation } from 'react-router';

import { InformationSquareIcon, MagnifyingGlassIcon } from '@navikt/aksel-icons';
import { Box, Button, InfoCard } from '@navikt/ds-react';

import BrevmottakerListe from '../sider/Fagsak/Behandling/Høyremeny/Brev/BrevmottakerListe';
import { sider } from '../sider/Fagsak/Behandling/sider/sider';
import type { IBehandling } from '../typer/behandling';
import type { IPersonInfo } from '../typer/person';
import { hentSideHref } from '../utils/miljø';
import { LeggTilBrevmottakerModalBehandling } from './Saklinje/Meny/LeggTilEllerFjernBrevmottakere/LeggTilBrevmottakerModalBehandling';
import { LeggTilBrevmottakerModalFagsak } from './Saklinje/Meny/LeggTilEllerFjernBrevmottakere/LeggTilBrevmottakerModalFagsak';
import type {
    IRestBrevmottaker,
    SkjemaBrevmottaker,
} from './Saklinje/Meny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';

interface Props {
    bruker: IPersonInfo;
    className?: string;
}

export interface BrevmottakereAlertBehandlingProps extends Props {
    erPåBehandling: true;
    erLesevisning: boolean;
    brevmottakere: IRestBrevmottaker[];
    åpenBehandling: IBehandling;
}

interface BrevmottakereAlertFagsakProps extends Props {
    erPåBehandling: false;
    brevmottakere: SkjemaBrevmottaker[];
}

export const BrevmottakereAlert = (props: BrevmottakereAlertBehandlingProps | BrevmottakereAlertFagsakProps) => {
    const location = useLocation();
    const [visManuelleMottakereModal, settVisManuelleMottakereModal] = useState(false);

    const brevmottakere = props.brevmottakere;

    function hentBrevtypetekst(pathname: string) {
        if (hentSideHref(pathname) === sider.SIMULERING.href) {
            return 'Varsel';
        } else if (pathname.includes('dokumentutsending')) {
            return 'Informasjonsbrev';
        } else {
            return 'Vedtak';
        }
    }

    return (
        <>
            {brevmottakere && brevmottakere.length !== 0 && (
                <Box marginBlock={'space-0 space-24'} className={props.className}>
                    <InfoCard data-color="info">
                        <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                            <InfoCard.Title>Brevmottaker(e) er endret</InfoCard.Title>
                        </InfoCard.Header>
                        <InfoCard.Content>
                            {hentBrevtypetekst(location.pathname)} sendes til:
                            <BrevmottakerListe brevmottakere={brevmottakere} bruker={props.bruker} />
                            <Button
                                variant={'tertiary'}
                                onClick={() => settVisManuelleMottakereModal(true)}
                                icon={<MagnifyingGlassIcon />}
                                size={'xsmall'}
                            >
                                Se detaljer
                            </Button>
                        </InfoCard.Content>
                    </InfoCard>
                </Box>
            )}

            {visManuelleMottakereModal &&
                (props.erPåBehandling ? (
                    <LeggTilBrevmottakerModalBehandling lukkModal={() => settVisManuelleMottakereModal(false)} />
                ) : (
                    <LeggTilBrevmottakerModalFagsak lukkModal={() => settVisManuelleMottakereModal(false)} />
                ))}
        </>
    );
};
