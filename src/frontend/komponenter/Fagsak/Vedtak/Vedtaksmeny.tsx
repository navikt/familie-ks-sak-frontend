import * as React from 'react';

import styled from 'styled-components';

import { ArrowUndoIcon, StarsEuIcon, TasklistStartIcon } from '@navikt/aksel-icons';
import { Calculator, ExpandFilled } from '@navikt/ds-icons';
import { Button, Dropdown } from '@navikt/ds-react';
import { ASpacing10 } from '@navikt/ds-tokens/dist/tokens';

import KorrigerEtterbetaling from './KorrigerEtterbetaling/KorrigerEtterbetaling';
import KorrigerVedtak from './KorrigerVedtakModal/KorrigerVedtak';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/useSammensattKontrollsakContext';
import EndreEndringstidspunkt from './VedtakBegrunnelserTabell/EndreEndringstidspunkt';
import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import type { IBehandling } from '../../../typer/behandling';
import { BehandlingKategori } from '../../../typer/behandlingstema';
import { vedtakHarFortsattUtbetaling } from '../../../utils/vedtakUtils';

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
    const { vurderErLesevisning } = useBehandling();

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
                icon={<ExpandFilled />}
                iconPosition="right"
            >
                Vedtaksmeny
            </KnappHøyreHjørne>
            <StyledDropdownMeny>
                <Dropdown.Menu.List>
                    {erBehandlingMedVedtaksbrevutsending && (
                        <>
                            <KorrigerEtterbetaling
                                erLesevisning={erLesevisning}
                                korrigertEtterbetaling={åpenBehandling.korrigertEtterbetaling}
                                behandlingId={åpenBehandling.behandlingId}
                            />
                            <KorrigerVedtak
                                erLesevisning={erLesevisning}
                                korrigertVedtak={åpenBehandling.korrigertVedtak}
                                behandlingId={åpenBehandling.behandlingId}
                            />
                        </>
                    )}
                    {åpenBehandling.endringstidspunkt && (
                        <EndreEndringstidspunkt åpenBehandling={åpenBehandling} />
                    )}
                    {åpenBehandling.kategori === BehandlingKategori.EØS && (
                        <Dropdown.Menu.List.Item onClick={visFeilutbetaltValuta}>
                            <Calculator />
                            Legg til feilutbetalt valuta
                        </Dropdown.Menu.List.Item>
                    )}
                    {vedtakHarFortsattUtbetaling(åpenBehandling.resultat) && (
                        <Dropdown.Menu.List.Item onClick={visRefusjonEøs}>
                            <StarsEuIcon />
                            Legg til refusjon EØS
                        </Dropdown.Menu.List.Item>
                    )}
                    {skalViseSammensattKontrollsakMenyvalg &&
                        (erSammensattKontrollsak ? (
                            <Dropdown.Menu.List.Item onClick={slettSammensattKontrollsak}>
                                <ArrowUndoIcon />
                                Angre sammensatt kontrollsak
                            </Dropdown.Menu.List.Item>
                        ) : (
                            <Dropdown.Menu.List.Item
                                onClick={() => settErSammensattKontrollsak(true)}
                            >
                                <TasklistStartIcon />
                                Sammensatt kontrollsak
                            </Dropdown.Menu.List.Item>
                        ))}
                </Dropdown.Menu.List>
            </StyledDropdownMeny>
        </Dropdown>
    );
};

export default Vedtaksmeny;
