import { useState } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import { EndreEndringstidspunkt } from '@sider/Fagsak/Behandling/sider/Vedtak/Endringstidspunkt/EndreEndringstidspunkt';
import { OppdaterEndringstidspunktModal } from '@sider/Fagsak/Behandling/sider/Vedtak/Endringstidspunkt/OppdaterEndringstidspunktModal';
import { FeilutbetaltValuta } from '@sider/Fagsak/Behandling/sider/Vedtak/FeilutbetaltValuta/FeilutbetaltValuta';
import { useSkalViseFeilutbetaltValutaMenyvalg } from '@sider/Fagsak/Behandling/sider/Vedtak/FeilutbetaltValuta/useSkalViseFeilutbetaltValutaMenyvalg';
import { KorrigerEtterbetaling } from '@sider/Fagsak/Behandling/sider/Vedtak/KorrigerEtterbetaling/KorrigerEtterbetaling';
import { KorrigerVedtak } from '@sider/Fagsak/Behandling/sider/Vedtak/KorrigerVedtak/KorrigerVedtak';
import { KorrigerVedtakModal } from '@sider/Fagsak/Behandling/sider/Vedtak/KorrigerVedtak/KorrigerVedtakModal';
import { RefusjonEøs } from '@sider/Fagsak/Behandling/sider/Vedtak/RefusjonEøs/RefusjonEøs';
import { useSkalViseRefusjonEøsMenyvalg } from '@sider/Fagsak/Behandling/sider/Vedtak/RefusjonEøs/useSkalViseRefusjonEøsMenyvalg';

import { ChevronDownIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button, Stack } from '@navikt/ds-react';

import Styles from './Vedtaksmeny.module.css';
import { AngreSammensattKontrollsak } from '../SammensattKontrollsak/AngreSammensattKontrollsak';
import { OpprettSammensattKontrollsak } from '../SammensattKontrollsak/OpprettSammensattKontrollsak';
import { useSammensattKontrollsakContext } from '../SammensattKontrollsak/SammensattKontrollsakContext';
import { useSkalViseSammensattKontrollsakMenyvalg } from '../SammensattKontrollsak/useSkalViseSammensattKontrollsakMenyvalg';

export function Vedtaksmeny() {
    const { sammensattKontrollsak } = useSammensattKontrollsakContext();

    const visRefusjonEøsMenyvalg = useSkalViseRefusjonEøsMenyvalg();
    const visFeilutbetaltValutaMenyvalg = useSkalViseFeilutbetaltValutaMenyvalg();
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
                    <KorrigerEtterbetaling />
                    <KorrigerVedtak åpneModal={() => settVisKorrigerVedtakModal(true)} />
                    {behandling.endringstidspunkt && (
                        <EndreEndringstidspunkt åpneModal={() => settVisEndreEndringstidspunktModal(true)} />
                    )}
                    {visFeilutbetaltValutaMenyvalg && <FeilutbetaltValuta />}
                    {visRefusjonEøsMenyvalg && <RefusjonEøs />}
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
