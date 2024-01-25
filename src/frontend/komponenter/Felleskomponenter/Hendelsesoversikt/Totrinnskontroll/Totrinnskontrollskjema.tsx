import * as React from 'react';

import styled from 'styled-components';

import {
    BodyShort,
    Button,
    Detail,
    Heading,
    HStack,
    RadioGroup,
    Radio,
    Textarea,
    Fieldset,
} from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import { useApp } from '../../../../context/AppContext';
import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import ØyeGrå from '../../../../ikoner/ØyeGrå';
import ØyeGrønn from '../../../../ikoner/ØyeGrønn';
import ØyeRød from '../../../../ikoner/ØyeRød';
import type { IBehandling } from '../../../../typer/behandling';
import { TotrinnskontrollBeslutning } from '../../../../typer/totrinnskontroll';
import { Datoformat, isoStringTilFormatertString } from '../../../../utils/dato';
import { hentFrontendFeilmelding } from '../../../../utils/ressursUtils';
import { KontrollertStatus } from '../../Venstremeny/sider';

interface IProps {
    innsendtVedtak: Ressurs<IBehandling>;
    sendInnVedtak: (
        beslutning: TotrinnskontrollBeslutning,
        begrunnelse: string,
        egetVedtak: boolean
    ) => void;
    åpenBehandling: IBehandling;
}

const StyledButton = styled(Button)`
    width: fit-content;
`;

const Totrinnskontrollskjema: React.FunctionComponent<IProps> = ({
    innsendtVedtak,
    sendInnVedtak,
    åpenBehandling,
}) => {
    const { trinnPåBehandling } = useBehandling();
    const { innloggetSaksbehandler } = useApp();

    const [beslutning, settBeslutning] = React.useState<TotrinnskontrollBeslutning>(
        TotrinnskontrollBeslutning.IKKE_VURDERT
    );
    const [begrunnelse, settBegrunnelse] = React.useState<string>('');

    const senderInn = innsendtVedtak.status === RessursStatus.HENTER;

    const totrinnskontroll = åpenBehandling.totrinnskontroll;

    const saksbehandler = totrinnskontroll?.saksbehandler ?? 'UKJENT SAKSBEHANDLER';
    const opprettetTidspunkt = totrinnskontroll?.opprettetTidspunkt ?? undefined;

    const egetVedtak =
        totrinnskontroll?.saksbehandler === innloggetSaksbehandler?.displayName ?? false;

    return (
        <Fieldset
            legend={
                egetVedtak ? (
                    <Heading size={'medium'} level={'2'}>
                        Totrinnskontroll
                    </Heading>
                ) : (
                    <BodyShort>
                        Kontrollér opplysninger og faglige vurderinger som er gjort
                    </BodyShort>
                )
            }
        >
            {egetVedtak ? (
                <div>
                    <BodyShort>
                        {isoStringTilFormatertString({
                            isoString: opprettetTidspunkt,
                            tilFormat: Datoformat.DATO_FORLENGET_MED_TID,
                            defaultString: 'UKJENT OPPRETTELSESTIDSPUNKT',
                        })}
                    </BodyShort>
                    <BodyShort>{saksbehandler}</BodyShort>
                    <br />
                    <Detail>Vedtaket er sendt til godkjenning</Detail>
                </div>
            ) : (
                <div>
                    <BodyShort weight={'semibold'}>Kontrollerte trinn</BodyShort>

                    {Object.entries(trinnPåBehandling).map(([_, trinn], index) => {
                        return (
                            <TrinnStatus
                                kontrollertStatus={trinn.kontrollert}
                                navn={`${index + 1}. ${trinn.navn}`}
                            />
                        );
                    })}
                </div>
            )}
            <RadioGroup
                value={beslutning}
                legend={'Vurder om vedtaket er godkjent'}
                hideLegend
                error={hentFrontendFeilmelding(innsendtVedtak)}
            >
                <HStack gap={'2'}>
                    <Radio
                        name={'totrinnskontroll'}
                        value={TotrinnskontrollBeslutning.GODKJENT}
                        onChange={() =>
                            beslutning === TotrinnskontrollBeslutning.GODKJENT
                                ? settBeslutning(TotrinnskontrollBeslutning.IKKE_VURDERT)
                                : settBeslutning(TotrinnskontrollBeslutning.GODKJENT)
                        }
                        disabled={senderInn || egetVedtak}
                    >
                        Godkjent
                    </Radio>
                    <Radio
                        name={'totrinnskontroll'}
                        value={TotrinnskontrollBeslutning.UNDERKJENT}
                        onClick={() =>
                            beslutning === TotrinnskontrollBeslutning.UNDERKJENT
                                ? settBeslutning(TotrinnskontrollBeslutning.IKKE_VURDERT)
                                : settBeslutning(TotrinnskontrollBeslutning.UNDERKJENT)
                        }
                        disabled={senderInn}
                    >
                        Vurdér på nytt
                    </Radio>
                </HStack>
            </RadioGroup>

            {beslutning === TotrinnskontrollBeslutning.UNDERKJENT && (
                <Textarea
                    label={''}
                    defaultValue={begrunnelse}
                    value={begrunnelse}
                    placeholder={'Begrunnelse'}
                    onChange={event => settBegrunnelse(event.target.value)}
                />
            )}

            <StyledButton
                variant={'primary'}
                loading={senderInn}
                disabled={senderInn}
                size={'small'}
                onClick={() => {
                    if (!senderInn) {
                        sendInnVedtak(
                            beslutning,
                            beslutning === TotrinnskontrollBeslutning.UNDERKJENT ? begrunnelse : '',
                            egetVedtak
                        );
                    }
                }}
                children={
                    egetVedtak
                        ? 'Underkjenn eget vedtak'
                        : beslutning === TotrinnskontrollBeslutning.UNDERKJENT
                          ? 'Send til saksbehandler'
                          : 'Godkjenn vedtaket'
                }
            />
        </Fieldset>
    );
};

const Trinn = styled.div`
    display: flex;

    svg {
        margin-right: 1rem;
    }
`;

const TrinnStatus: React.FC<{
    kontrollertStatus: KontrollertStatus;
    navn: string;
}> = ({ kontrollertStatus, navn }) => {
    return (
        <Trinn>
            {kontrollertStatus === KontrollertStatus.IKKE_KONTROLLERT && (
                <ØyeGrå height={24} width={24} />
            )}

            {kontrollertStatus === KontrollertStatus.KONTROLLERT && (
                <ØyeGrønn height={24} width={24} />
            )}

            {kontrollertStatus === KontrollertStatus.MANGLER_KONTROLL && (
                <ØyeRød height={24} width={24} />
            )}
            <span>{navn}</span>
        </Trinn>
    );
};

export default Totrinnskontrollskjema;
