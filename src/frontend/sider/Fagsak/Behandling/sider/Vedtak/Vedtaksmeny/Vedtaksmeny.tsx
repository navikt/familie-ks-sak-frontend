import { ArrowUndoIcon, CalculatorIcon, ChevronDownIcon, StarsEuIcon, TasklistStartIcon } from '@navikt/aksel-icons';
import { Button, Dropdown, Stack } from '@navikt/ds-react';

import Styles from './Vedtaksmeny.module.css';
import { BehandlingKategori } from '../../../../../../typer/behandlingstema';
import { vedtakHarFortsattUtbetaling } from '../../../../../../utils/vedtakUtils';
import { useBehandlingContext } from '../../../context/BehandlingContext';
import EndreEndringstidspunkt from '../endringstidspunkt/EndreEndringstidspunkt';
import { useFeilutbetaltValutaTabellContext } from '../FeilutbetaltValutaNy/FeilutbetaltValutaTabellContext';
import KorrigerEtterbetaling from '../KorrigerEtterbetaling/KorrigerEtterbetaling';
import KorrigerVedtak from '../KorrigerVedtakModal/KorrigerVedtak';
import { useRefusjonEøsTabellContext } from '../RefusjonEøs/RefusjonEøsTabellContext';
import { useSammensattKontrollsakContext } from '../SammensattKontrollsak/SammensattKontrollsakContext';

interface Props {
    erBehandlingMedVedtaksbrevutsending: boolean;
}

export function Vedtaksmeny({ erBehandlingMedVedtaksbrevutsending }: Props) {
    const { behandling, vurderErLesevisning } = useBehandlingContext();
    const { erFeilutbetaltValutaTabellSynlig, visFeilutbetaltValutaTabell } = useFeilutbetaltValutaTabellContext();
    const { erRefusjonEøsTabellSynlig, visRefusjonEøsTabell } = useRefusjonEøsTabellContext();

    const {
        skalViseSammensattKontrollsakMenyvalg,
        erSammensattKontrollsak,
        settErSammensattKontrollsak,
        slettSammensattKontrollsak,
    } = useSammensattKontrollsakContext();

    const erLesevisning = vurderErLesevisning();

    return (
        <Stack width={'100%'} justify={'end'} align={'center'}>
            <Dropdown>
                <Button
                    as={Dropdown.Toggle}
                    size={'small'}
                    variant={'secondary'}
                    icon={<ChevronDownIcon />}
                    iconPosition={'right'}
                >
                    Vedtaksmeny
                </Button>
                <Dropdown.Menu className={Styles.menu}>
                    <Dropdown.Menu.List>
                        {erBehandlingMedVedtaksbrevutsending && (
                            <>
                                <KorrigerEtterbetaling korrigertEtterbetaling={behandling.korrigertEtterbetaling} />
                                <KorrigerVedtak
                                    erLesevisning={erLesevisning}
                                    korrigertVedtak={behandling.korrigertVedtak}
                                    behandlingId={behandling.behandlingId}
                                />
                            </>
                        )}
                        {behandling.endringstidspunkt && <EndreEndringstidspunkt åpenBehandling={behandling} />}
                        {!erFeilutbetaltValutaTabellSynlig && behandling.kategori === BehandlingKategori.EØS && (
                            <Dropdown.Menu.List.Item onClick={visFeilutbetaltValutaTabell}>
                                <CalculatorIcon fontSize={'1.4rem'} />
                                Legg til feilutbetalt valuta
                            </Dropdown.Menu.List.Item>
                        )}
                        {!erRefusjonEøsTabellSynlig && vedtakHarFortsattUtbetaling(behandling.resultat) && (
                            <Dropdown.Menu.List.Item onClick={visRefusjonEøsTabell}>
                                <StarsEuIcon fontSize={'1.4rem'} />
                                Legg til refusjon EØS
                            </Dropdown.Menu.List.Item>
                        )}
                        {skalViseSammensattKontrollsakMenyvalg &&
                            (erSammensattKontrollsak ? (
                                <Dropdown.Menu.List.Item onClick={slettSammensattKontrollsak}>
                                    <ArrowUndoIcon fontSize={'1.4rem'} />
                                    Angre sammensatt kontrollsak
                                </Dropdown.Menu.List.Item>
                            ) : (
                                <Dropdown.Menu.List.Item onClick={() => settErSammensattKontrollsak(true)}>
                                    <TasklistStartIcon fontSize={'1.4rem'} />
                                    Sammensatt kontrollsak
                                </Dropdown.Menu.List.Item>
                            ))}
                    </Dropdown.Menu.List>
                </Dropdown.Menu>
            </Dropdown>
        </Stack>
    );
}
