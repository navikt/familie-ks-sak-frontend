import { useState } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import { KorrigerVedtakModal } from '@sider/Fagsak/Behandling/sider/Vedtak/KorrigerVedtakModal/KorrigerVedtakModal';
import { BehandlingKategori } from '@typer/behandlingstema';
import { vedtakHarFortsattUtbetaling } from '@utils/vedtakUtils';

import { CalculatorIcon, ChevronDownIcon, StarsEuIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button, Stack } from '@navikt/ds-react';

import Styles from './Vedtaksmeny.module.css';
import EndreEndringstidspunkt from '../endringstidspunkt/EndreEndringstidspunkt';
import { OppdaterEndringstidspunktModal } from '../endringstidspunkt/OppdaterEndringstidspunktModal';
import { useFeilutbetaltValutaTabellContext } from '../FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import KorrigerEtterbetaling from '../KorrigerEtterbetaling/KorrigerEtterbetaling';
import { KorrigerVedtak } from '../KorrigerVedtakModal/KorrigerVedtak';
import { useRefusjonEøsTabellContext } from '../RefusjonEøs/RefusjonEøsTabellContext';
import { AngreSammensattKontrollsak } from '../SammensattKontrollsak/AngreSammensattKontrollsak';
import { OpprettSammensattKontrollsak } from '../SammensattKontrollsak/OpprettSammensattKontrollsak';
import { useSammensattKontrollsakContext } from '../SammensattKontrollsak/SammensattKontrollsakContext';
import { useSkalViseSammensattKontrollsakMenyvalg } from '../SammensattKontrollsak/useSkalViseSammensattKontrollsakMenyvalg';

interface Props {
    erBehandlingMedVedtaksbrevutsending: boolean;
}

export function Vedtaksmeny({ erBehandlingMedVedtaksbrevutsending }: Props) {
    const { erFeilutbetaltValutaTabellSynlig, visFeilutbetaltValutaTabell } = useFeilutbetaltValutaTabellContext();
    const { erRefusjonEøsTabellSynlig, visRefusjonEøsTabell } = useRefusjonEøsTabellContext();
    const { sammensattKontrollsak } = useSammensattKontrollsakContext();
    const visSammensattKontrollsakMenyvalg = useSkalViseSammensattKontrollsakMenyvalg();

    const behandling = useBehandling();

    const [visKorrigerVedtakModal, settVisKorrigerVedtakModal] = useState<boolean>(false);
    const [visEndreEndringstidspunktModal, settVisEndreEndringstidspunktModal] = useState<boolean>(false);

    return (
        <Stack width={'100%'} justify={'end'} align={'center'}>
            {visKorrigerVedtakModal && <KorrigerVedtakModal lukkModal={() => settVisKorrigerVedtakModal(false)} />}
            {visEndreEndringstidspunktModal && (
                <OppdaterEndringstidspunktModal lukkModal={() => settVisEndreEndringstidspunktModal(false)} />
            )}
            <ActionMenu>
                <ActionMenu.Trigger>
                    <Button size={'small'} variant={'secondary'} icon={<ChevronDownIcon />} iconPosition={'right'}>
                        Vedtaksmeny
                    </Button>
                </ActionMenu.Trigger>
                <ActionMenu.Content className={Styles.menu}>
                    {erBehandlingMedVedtaksbrevutsending && (
                        <>
                            <KorrigerEtterbetaling korrigertEtterbetaling={behandling.korrigertEtterbetaling} />
                            <KorrigerVedtak åpneModal={() => settVisKorrigerVedtakModal(true)} />
                        </>
                    )}
                    {behandling.endringstidspunkt && (
                        <EndreEndringstidspunkt åpneModal={() => settVisEndreEndringstidspunktModal(true)} />
                    )}
                    {!erFeilutbetaltValutaTabellSynlig && behandling.kategori === BehandlingKategori.EØS && (
                        <ActionMenu.Item onClick={visFeilutbetaltValutaTabell}>
                            <CalculatorIcon fontSize={'1.4rem'} />
                            Legg til feilutbetalt valuta
                        </ActionMenu.Item>
                    )}
                    {!erRefusjonEøsTabellSynlig && vedtakHarFortsattUtbetaling(behandling.resultat) && (
                        <ActionMenu.Item onClick={visRefusjonEøsTabell}>
                            <StarsEuIcon fontSize={'1.4rem'} />
                            Legg til refusjon EØS
                        </ActionMenu.Item>
                    )}
                    {visSammensattKontrollsakMenyvalg &&
                        (sammensattKontrollsak ? (
                            <AngreSammensattKontrollsak sammensattKontrollsak={sammensattKontrollsak} />
                        ) : (
                            <OpprettSammensattKontrollsak />
                        ))}
                </ActionMenu.Content>
            </ActionMenu>
        </Stack>
    );
}
