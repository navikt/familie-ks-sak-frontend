import { useState } from 'react';

import { ArrowUndoIcon, CalculatorIcon, ChevronDownIcon, StarsEuIcon, TasklistStartIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button, Stack } from '@navikt/ds-react';

import Styles from './Vedtaksmeny.module.css';
import { BehandlingKategori } from '../../../../../../typer/behandlingstema';
import { vedtakHarFortsattUtbetaling } from '../../../../../../utils/vedtakUtils';
import { useBehandlingContext } from '../../../context/BehandlingContext';
import EndreEndringstidspunkt from '../endringstidspunkt/EndreEndringstidspunkt';
import { OppdaterEndringstidspunktModal } from '../endringstidspunkt/OppdaterEndringstidspunktModal';
import { useFeilutbetaltValutaTabellContext } from '../FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import KorrigerEtterbetaling from '../KorrigerEtterbetaling/KorrigerEtterbetaling';
import KorrigerVedtak from '../KorrigerVedtakModal/KorrigerVedtak';
import KorrigerVedtakModal from '../KorrigerVedtakModal/KorrigerVedtakModal';
import { useRefusjonEøsTabellContext } from '../RefusjonEøs/RefusjonEøsTabellContext';
import { useSammensattKontrollsakContext } from '../SammensattKontrollsak/SammensattKontrollsakContext';

interface Props {
    erBehandlingMedVedtaksbrevutsending: boolean;
}

export function Vedtaksmeny({ erBehandlingMedVedtaksbrevutsending }: Props) {
    const { behandling, vurderErLesevisning } = useBehandlingContext();
    const { erFeilutbetaltValutaTabellSynlig, visFeilutbetaltValutaTabell } = useFeilutbetaltValutaTabellContext();
    const { erRefusjonEøsTabellSynlig, visRefusjonEøsTabell } = useRefusjonEøsTabellContext();
    const [visKorrigerVedtakModal, settVisKorrigerVedtakModal] = useState<boolean>(false);
    const [visEndreEndringstidspunktModal, settVisEndreEndringstidspunktModal] = useState<boolean>(false);
    const {
        skalViseSammensattKontrollsakMenyvalg,
        erSammensattKontrollsak,
        settErSammensattKontrollsak,
        slettSammensattKontrollsak,
    } = useSammensattKontrollsakContext();

    const erLesevisning = vurderErLesevisning();

    return (
        <Stack width={'100%'} justify={'end'} align={'center'}>
            {visKorrigerVedtakModal && (
                <KorrigerVedtakModal
                    behandlingId={behandling.behandlingId}
                    korrigertVedtak={behandling.korrigertVedtak}
                    erLesevisning={erLesevisning}
                    lukkModal={() => settVisKorrigerVedtakModal(false)}
                />
            )}
            {visEndreEndringstidspunktModal && (
                <OppdaterEndringstidspunktModal
                    lukkModal={() => settVisEndreEndringstidspunktModal(false)}
                    åpenBehandling={behandling}
                />
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
                            <KorrigerVedtak
                                åpneModal={() => settVisKorrigerVedtakModal(true)}
                                korrigertVedtak={behandling.korrigertVedtak}
                            />
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
                    {skalViseSammensattKontrollsakMenyvalg &&
                        (erSammensattKontrollsak ? (
                            <ActionMenu.Item onClick={slettSammensattKontrollsak}>
                                <ArrowUndoIcon fontSize={'1.4rem'} />
                                Angre sammensatt kontrollsak
                            </ActionMenu.Item>
                        ) : (
                            <ActionMenu.Item onClick={() => settErSammensattKontrollsak(true)}>
                                <TasklistStartIcon fontSize={'1.4rem'} />
                                Sammensatt kontrollsak
                            </ActionMenu.Item>
                        ))}
                </ActionMenu.Content>
            </ActionMenu>
        </Stack>
    );
}
