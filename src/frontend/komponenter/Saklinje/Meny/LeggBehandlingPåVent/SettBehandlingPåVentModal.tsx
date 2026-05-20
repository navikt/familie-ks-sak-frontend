import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import type { IBehandling, IBehandlingPåVent } from '@typer/behandling';
import { settPåVentÅrsaker } from '@typer/behandling';
import { dateTilIsoDatoString } from '@utils/dato';
import { hentFrontendFeilmelding } from '@utils/ressursUtils';

import { BodyShort, Box, Button, Fieldset, Modal, Select, VStack } from '@navikt/ds-react';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { hentAlleÅrsaker } from './settPåVentUtils';
import { useSettPåVentSkjema } from './useSettPåVentSkjema';
import Datovelger from '../../../Datovelger/Datovelger';

interface IProps {
    lukkModal: () => void;
}

export const SettBehandlingPåVentModal = ({ lukkModal }: IProps) => {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const årsaker = hentAlleÅrsaker();
    const { skjema, kanSendeSkjema, onSubmit } = useSettPåVentSkjema(behandling.behandlingPåVent);

    const { årsak, frist } = skjema.felter;

    const erBehandlingAlleredePåVent = !!behandling.behandlingPåVent;

    const url = erBehandlingAlleredePåVent
        ? `/familie-ks-sak/api/behandlinger/${behandling.behandlingId}/sett-på-vent/oppdater`
        : `/familie-ks-sak/api/behandlinger/${behandling.behandlingId}/sett-på-vent`;

    const settBehandlingPåVent = () => {
        if (kanSendeSkjema() && årsak.verdi && frist.verdi) {
            onSubmit<IBehandlingPåVent>(
                {
                    method: erBehandlingAlleredePåVent ? 'PUT' : 'POST',
                    data: { frist: dateTilIsoDatoString(frist.verdi), årsak: årsak.verdi },
                    url: url,
                },
                (ressurs: Ressurs<IBehandling>) => {
                    settÅpenBehandling(ressurs);
                    lukkModal();
                }
            );
        }
    };

    return (
        <Modal
            open
            onClose={lukkModal}
            width={'35rem'}
            header={{
                heading: erBehandlingAlleredePåVent ? 'Endre ventende behandling' : 'Sett behandling på vent',
                size: 'small',
            }}
            portal
        >
            <Modal.Body>
                <Fieldset
                    error={hentFrontendFeilmelding(skjema.submitRessurs)}
                    errorPropagation={false}
                    legend={'Sett behandling på vent'}
                    hideLegend
                >
                    {erBehandlingAlleredePåVent && (
                        <Box marginBlock={'space-8 space-40'}>
                            <BodyShort>Behandlingen er satt på vent.</BodyShort>
                        </Box>
                    )}
                    <VStack gap={'space-32'}>
                        <Datovelger
                            felt={frist}
                            label={'Frist'}
                            visFeilmeldinger={skjema.visFeilmeldinger}
                            kanKunVelgeFremtid
                        />
                        <Select {...skjema.felter.årsak.hentNavInputProps(skjema.visFeilmeldinger)} label={'Årsak'}>
                            <option value={undefined}>Velg årsak</option>
                            {årsaker.map(årsak => (
                                <option value={årsak.valueOf()} key={årsak.valueOf()}>
                                    {settPåVentÅrsaker[årsak]}
                                </option>
                            ))}
                        </Select>
                    </VStack>
                </Fieldset>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant={'primary'}
                    key={erBehandlingAlleredePåVent ? 'Oppdater' : 'Bekreft'}
                    size={'medium'}
                    onClick={settBehandlingPåVent}
                    children={erBehandlingAlleredePåVent ? 'Oppdater' : 'Bekreft'}
                    loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                    disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                />
                <Button variant={'tertiary'} key={'Avbryt'} size="medium" onClick={lukkModal} children={'Avbryt'} />
            </Modal.Footer>
        </Modal>
    );
};
