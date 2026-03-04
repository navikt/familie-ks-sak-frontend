import { Activity, type MouseEvent } from 'react';

import { NavLink } from 'react-router';
import styled from 'styled-components';

import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, HStack, Stack, VStack } from '@navikt/ds-react';
import {
    BgNeutralModerateHoverA,
    BgNeutralSoft,
    BgWarningModerate,
    BorderAccent,
    BorderFocus,
    BorderWarning,
    Space24,
    Space32,
    Space8,
    TextNeutral,
    TextNeutralSubtle,
} from '@navikt/ds-tokens/dist/tokens';

import { useVenstremeny } from './useVenstremeny';
import Styles from './Venstremeny.module.css';
import { useFagsakId } from '../../../../hooks/useFagsakId';
import { useBehandlingContext } from '../context/BehandlingContext';
import type { IUnderside } from '../sider/sider';
import { erSidenAktiv } from '../sider/sider';

const MenyLenke = styled(NavLink)<{ $erLenkenAktiv: boolean }>`
    text-decoration: none;
    color: ${props => (props.$erLenkenAktiv ? TextNeutral : TextNeutralSubtle)};
    padding: ${Space8} ${Space32};

    &:focus {
        box-shadow: 0 0 0 3px ${BorderFocus};
        outline: none;
    }

    &.active {
        background-color: ${BgNeutralSoft};
        box-shadow: inset 0.35rem 0 0 0 ${BorderAccent};
    }

    ${props => {
        if (props.$erLenkenAktiv)
            return `
                &:hover {
                    background: ${BgNeutralModerateHoverA};
                }
        `;
    }};
`;

const UndersideSirkel = styled.span`
    border-color: ${BorderWarning};
    border-radius: 50%;
    background-color: ${BgWarningModerate};
    display: inline-grid;
    grid-column: circle;
    place-items: center;
    height: ${Space24};
    width: ${Space24};
`;

export function Venstremeny() {
    const { behandling, trinnPåBehandling } = useBehandlingContext();

    const fagsakId = useFagsakId();
    const [erÅpen, settErÅpen] = useVenstremeny();

    const stansNavigeringDersomSidenIkkeErAktiv = (event: MouseEvent, sidenErAktiv: boolean) => {
        if (!sidenErAktiv) {
            event.preventDefault();
        }
    };

    const icon = erÅpen ? (
        <ChevronLeftIcon aria-label={'Vis venstremeny'} />
    ) : (
        <ChevronRightIcon aria-label={'Skjul venstremeny'} />
    );

    return (
        <Stack direction={'row-reverse'}>
            <Button
                title={erÅpen ? 'Skjul venstremeny' : 'Vis venstremeny'}
                aria-label={erÅpen ? 'Skjul venstremeny' : 'Vis venstremeny'}
                className={Styles.knapp}
                variant={'secondary'}
                size={'small'}
                icon={icon}
                onMouseDown={e => e.preventDefault()}
                onClick={() => settErÅpen(prev => !prev)}
            />
            <Activity mode={erÅpen ? 'visible' : 'hidden'}>
                <Box as={'nav'} paddingBlock={'space-8'}>
                    {Object.entries(trinnPåBehandling).map(([sideId, side], index) => {
                        const tilPath = `/fagsak/${fagsakId}/${behandling.behandlingId}/${side.href}`;
                        const undersider = side.undersider ? side.undersider(behandling) : [];
                        const sidenErAktiv = erSidenAktiv(side, behandling);
                        return (
                            <VStack key={sideId}>
                                <MenyLenke
                                    id={sideId}
                                    to={tilPath}
                                    $erLenkenAktiv={sidenErAktiv}
                                    onClick={event => stansNavigeringDersomSidenIkkeErAktiv(event, sidenErAktiv)}
                                >
                                    {`${side.steg ? `${index + 1}. ` : ''}${side.navn}`}
                                </MenyLenke>
                                {undersider.map((underside: IUnderside) => {
                                    const antallAksjonspunkter = underside.antallAksjonspunkter();
                                    return (
                                        <MenyLenke
                                            key={`${sideId}_${underside.hash}`}
                                            id={`${sideId}_${underside.hash}`}
                                            to={`${tilPath}#${underside.hash}`}
                                            $erLenkenAktiv={sidenErAktiv}
                                            onClick={event =>
                                                stansNavigeringDersomSidenIkkeErAktiv(event, sidenErAktiv)
                                            }
                                        >
                                            <HStack align={'center'} gap={'space-4'}>
                                                {antallAksjonspunkter > 0 ? (
                                                    <UndersideSirkel>{antallAksjonspunkter}</UndersideSirkel>
                                                ) : (
                                                    <Box padding={'space-12'} />
                                                )}
                                                <BodyShort size={'small'}>{underside.navn}</BodyShort>
                                            </HStack>
                                        </MenyLenke>
                                    );
                                })}
                            </VStack>
                        );
                    })}
                </Box>
            </Activity>
        </Stack>
    );
}
