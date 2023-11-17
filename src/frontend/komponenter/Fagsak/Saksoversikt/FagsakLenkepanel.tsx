import React from 'react';

import styled, { css } from 'styled-components';

import { BodyShort, Label, LinkPanel, Panel } from '@navikt/ds-react';

import type { VisningBehandling } from './visningBehandling';
import { BehandlingStatus } from '../../../typer/behandling';
import type { IBehandlingstema } from '../../../typer/behandlingstema';
import { tilBehandlingstema } from '../../../typer/behandlingstema';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { hentAktivBehandlingPåMinimalFagsak, hentFagsakStatusVisning } from '../../../utils/fagsak';

interface IFagsakLinkPanel {
    minimalFagsak: IMinimalFagsak;
}

interface IInnholdstabell {
    minimalFagsak: IMinimalFagsak;
    behandling?: VisningBehandling;
}

const StyledLabel = styled(Label)`
    display: inline-block;
    font-size: var(--a-font-size-xlarge);
    font-weight: var(--a-font-weight-regular);
`;

const StyledBodyShort = styled(BodyShort)`
    font-size: var(--a-font-size-heading-medium);
    font-weight: var(--a-font-weight-bold);
`;

const Container = styled.div`
    width: 100%;
    display: flex;

    div:first-child {
        margin-right: 5rem;
    }
`;

const Innholdstabell: React.FC<IInnholdstabell> = ({ minimalFagsak }) => {
    const behandlingstema: IBehandlingstema | undefined =
        minimalFagsak.løpendeKategori && tilBehandlingstema(minimalFagsak.løpendeKategori);

    return (
        <Container>
            <div>
                <StyledLabel for={'behandlingstema'} spacing>
                    Behandlingstema
                </StyledLabel>
                <StyledBodyShort name={'behandlingstema'}>
                    {behandlingstema ? behandlingstema.navn : '-'}
                </StyledBodyShort>
            </div>
            <div>
                <StyledLabel for={'status'} spacing>
                    Status
                </StyledLabel>
                <StyledBodyShort name={'status'}>
                    {hentFagsakStatusVisning(minimalFagsak)}
                </StyledBodyShort>
            </div>
        </Container>
    );
};

const panelStyle = css`
    width: 39rem;
    padding: 2rem;
`;

const StyledLinkPanel = styled(LinkPanel)`
    ${panelStyle}
`;

const StyledPanel = styled(Panel)`
    ${panelStyle}
`;

const genererHoverTekst = (behandling: VisningBehandling) => {
    return behandling.status === BehandlingStatus.AVSLUTTET
        ? 'Gå til gjeldende vedtak'
        : 'Gå til åpen behandling';
};

const FagsakLenkepanel: React.FC<IFagsakLinkPanel> = ({ minimalFagsak }) => {
    const aktivBehandling: VisningBehandling | undefined =
        hentAktivBehandlingPåMinimalFagsak(minimalFagsak);

    return aktivBehandling ? (
        <>
            <StyledLinkPanel
                title={genererHoverTekst(aktivBehandling)}
                href={`/fagsak/${minimalFagsak.id}/${aktivBehandling.behandlingId}`}
            >
                <LinkPanel.Description>
                    <Innholdstabell minimalFagsak={minimalFagsak} />
                </LinkPanel.Description>
            </StyledLinkPanel>
        </>
    ) : (
        <>
            <StyledPanel border>
                <Innholdstabell minimalFagsak={minimalFagsak} />
            </StyledPanel>
        </>
    );
};

export default FagsakLenkepanel;
