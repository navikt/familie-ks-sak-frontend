import * as React from 'react';

import styled from 'styled-components';

import { StarsEuIcon } from '@navikt/aksel-icons';
import { Calculator, ExpandFilled } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';
import { Dropdown } from '@navikt/ds-react-internal';
import { ASpacing10 } from '@navikt/ds-tokens/dist/tokens';

import KorrigerVedtak from './KorrigerVedtakModal/KorrigerVedtak';
import EndreEndringstidspunkt from './VedtakBegrunnelserTabell/EndreEndringstidspunkt';
import { useApp } from '../../../context/AppContext';
import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import type { IBehandling } from '../../../typer/behandling';
import { BehandlingKategori } from '../../../typer/behandlingstema';
import { ToggleNavn } from '../../../typer/toggles';
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
    const { toggles } = useApp();

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
                        <KorrigerVedtak
                            erLesevisning={vurderErLesevisning()}
                            korrigertVedtak={åpenBehandling.korrigertVedtak}
                            behandlingId={åpenBehandling.behandlingId}
                        />
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
                    {toggles[ToggleNavn.brukEøs] &&
                        vedtakHarFortsattUtbetaling(åpenBehandling.resultat) && (
                            <Dropdown.Menu.List.Item onClick={visRefusjonEøs}>
                                <StarsEuIcon />
                                Legg til refusjon EØS
                            </Dropdown.Menu.List.Item>
                        )}
                </Dropdown.Menu.List>
            </StyledDropdownMeny>
        </Dropdown>
    );
};

export default Vedtaksmeny;
