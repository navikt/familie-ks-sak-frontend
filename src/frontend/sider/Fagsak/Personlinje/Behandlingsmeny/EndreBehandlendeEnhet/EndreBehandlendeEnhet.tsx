import React, { useState } from 'react';

import { Button, Select, Textarea, Dropdown, Modal, Fieldset } from '@navikt/ds-react';
import { byggTomRessurs, hentDataFraRessurs, RessursStatus } from '@navikt/familie-typer';

import useEndreBehandlendeEnhet from './useEndreBehandlendeEnhet';
import { useAppContext } from '../../../../../context/AppContext';
import { BehandlingSteg, hentStegNummer } from '../../../../../typer/behandling';
import type { IArbeidsfordelingsenhet } from '../../../../../typer/enhet';
import { behandendeEnheter } from '../../../../../typer/enhet';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

const EndreBehandlendeEnhet: React.FC = () => {
    const { åpenBehandling, vurderErLesevisning, erBehandleneEnhetMidlertidig } =
        useBehandlingContext();
    const [visModal, settVisModal] = useState(erBehandleneEnhetMidlertidig);
    const { innloggetSaksbehandler } = useAppContext();

    const {
        begrunnelse,
        settBegrunnelse,
        endreEnhet,
        enhetId,
        fjernState,
        settEnhetId,
        settSubmitRessurs,
        submitRessurs,
    } = useEndreBehandlendeEnhet(() => settVisModal(false));

    const lukkBehandlendeEnhetModal = () => {
        fjernState();
        settVisModal(false);
    };

    const erLesevisningPåBehandling = () => {
        const åpenBehandlingData = hentDataFraRessurs(åpenBehandling);
        const steg = åpenBehandlingData?.steg;
        if (
            steg &&
            hentStegNummer(steg) === hentStegNummer(BehandlingSteg.BESLUTTE_VEDTAK) &&
            innloggetSaksbehandler?.navIdent !==
                åpenBehandlingData?.totrinnskontroll?.saksbehandlerId
        ) {
            return false;
        } else {
            return vurderErLesevisning(false, true);
        }
    };

    return (
        <>
            <Dropdown.Menu.List.Item onClick={() => settVisModal(true)}>
                Endre behandlende enhet
            </Dropdown.Menu.List.Item>
            {visModal && (
                <Modal
                    open
                    onClose={lukkBehandlendeEnhetModal}
                    width={'35rem'}
                    header={{
                        heading: 'Endre enhet for denne behandlingen',
                        size: 'small',
                    }}
                    portal
                >
                    <Modal.Body>
                        <Fieldset
                            error={hentFrontendFeilmelding(submitRessurs)}
                            legend="Endre enhet"
                            hideLegend
                        >
                            <Select
                                readOnly={erLesevisningPåBehandling()}
                                name="enhet"
                                value={enhetId}
                                label={'Velg ny enhet'}
                                onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
                                    settEnhetId(event.target.value);
                                    settSubmitRessurs(byggTomRessurs());
                                }}
                            >
                                {behandendeEnheter.map((enhet: IArbeidsfordelingsenhet) => {
                                    return (
                                        <option
                                            aria-selected={enhetId === enhet.enhetId}
                                            key={enhet.enhetId}
                                            value={enhet.enhetId}
                                            disabled={
                                                hentDataFraRessurs(åpenBehandling)
                                                    ?.arbeidsfordelingPåBehandling
                                                    .behandlendeEnhetId === enhet.enhetId
                                            }
                                        >
                                            {`${enhet.enhetId} ${enhet.enhetNavn}`}
                                        </option>
                                    );
                                })}
                            </Select>

                            <Textarea
                                disabled={submitRessurs.status === RessursStatus.HENTER}
                                readOnly={erLesevisningPåBehandling()}
                                label={'Begrunnelse'}
                                value={begrunnelse}
                                maxLength={4000}
                                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                                    settBegrunnelse(event.target.value);
                                    settSubmitRessurs(byggTomRessurs());
                                }}
                            />
                        </Fieldset>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            key={'bekreft'}
                            variant="primary"
                            size="small"
                            disabled={submitRessurs.status === RessursStatus.HENTER}
                            onClick={() => {
                                if (åpenBehandling.status === RessursStatus.SUKSESS) {
                                    endreEnhet(åpenBehandling.data.behandlingId);
                                }
                            }}
                            children={'Bekreft'}
                            loading={submitRessurs.status === RessursStatus.HENTER}
                        />
                        <Button
                            key={'avbryt'}
                            size="small"
                            variant="secondary"
                            onClick={lukkBehandlendeEnhetModal}
                            children={'Avbryt'}
                        />
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default EndreBehandlendeEnhet;
