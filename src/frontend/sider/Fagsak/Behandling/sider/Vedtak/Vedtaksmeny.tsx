import * as React from 'react';

import styled from 'styled-components';

import { ArrowUndoIcon, CalculatorIcon, ChevronDownIcon, StarsEuIcon, TasklistStartIcon } from '@navikt/aksel-icons';
import { Button, Dropdown } from '@navikt/ds-react';
import { ASpacing10 } from '@navikt/ds-tokens/dist/tokens';

import EndreEndringstidspunkt from './endringstidspunkt/EndreEndringstidspunkt';
import KorrigerEtterbetaling from './KorrigerEtterbetaling/KorrigerEtterbetaling';
import KorrigerVedtak from './KorrigerVedtakModal/KorrigerVedtak';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/SammensattKontrollsakContext';
import type { IBehandling } from '../../../../../typer/behandling';
import { BehandlingKategori } from '../../../../../typer/behandlingstema';
import { vedtakHarFortsattUtbetaling } from '../../../../../utils/vedtakUtils';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

interface IVedtakmenyProps {
    åpenBehandling: IBehandling;
    erBehandlingMedVedtaksbrevutsending: boolean;
    visFeilutbetaltValuta: () => void;
    visRefusjonEøs: () => void;
}

const KnappHøyreHjørne = styled(Button)`
    position: absolute;
    top: ${ASpacing10};
    right: ${ASpacing10};
`;

const StyledDropdownMeny = styled(Dropdown.Menu)`
    width: 36ch;
`;

const Vedtaksmeny: React.FunctionComponent<IVedtakmenyProps> = ({
    åpenBehandling,
    erBehandlingMedVedtaksbrevutsending,
    visFeilutbetaltValuta,
    visRefusjonEøs,
}) => {
    const { vurderErLesevisning } = useBehandlingContext();

    const {
        skalViseSammensattKontrollsakMenyvalg,
        erSammensattKontrollsak,
        settErSammensattKontrollsak,
        slettSammensattKontrollsak,
    } = useSammensattKontrollsakContext();

    const erLesevisning = vurderErLesevisning();

    return (
        <Dropdown>
            <KnappHøyreHjørne
                forwardedAs={Dropdown.Toggle}
                size="small"
                variant="secondary"
                icon={<ChevronDownIcon />}
                iconPosition="right"
            >
                Vedtaksmeny
            </KnappHøyreHjørne>
            <StyledDropdownMeny>
                <Dropdown.Menu.List>
                    {erBehandlingMedVedtaksbrevutsending && (
                        <>
                            <KorrigerEtterbetaling korrigertEtterbetaling={åpenBehandling.korrigertEtterbetaling} />
                            <KorrigerVedtak
                                erLesevisning={erLesevisning}
                                korrigertVedtak={åpenBehandling.korrigertVedtak}
                                behandlingId={åpenBehandling.behandlingId}
                            />
                        </>
                    )}
                    {åpenBehandling.endringstidspunkt && <EndreEndringstidspunkt åpenBehandling={åpenBehandling} />}
                    {åpenBehandling.kategori === BehandlingKategori.EØS && (
                        <Dropdown.Menu.List.Item onClick={visFeilutbetaltValuta}>
                            <CalculatorIcon fontSize={'1.4rem'} />
                            Legg til feilutbetalt valuta
                        </Dropdown.Menu.List.Item>
                    )}
                    {vedtakHarFortsattUtbetaling(åpenBehandling.resultat) && (
                        <Dropdown.Menu.List.Item onClick={visRefusjonEøs}>
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
            </StyledDropdownMeny>
        </Dropdown>
    );
};

export default Vedtaksmeny;
