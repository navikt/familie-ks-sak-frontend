import React, { useState } from 'react';

import { Calender } from '@navikt/ds-icons';
import { Dropdown } from '@navikt/ds-react-internal';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { OppdaterEndringstidspunktModal } from './OppdaterEndringstidspunktModal';
import { useOppdaterEndringstidspunktSkjema } from './useOppdaterEndringstidspunktSkjema';
import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import type { IBehandling } from '../../../../typer/behandling';
import type { IRestOverstyrtEndringstidspunkt } from '../../../../typer/vedtaksperiode';
import { dateTilIsoDatoString } from '../../../../utils/dato';

const EndreEndringstidspunkt: React.FC<{
    åpenBehandling: IBehandling;
}> = ({ åpenBehandling }) => {
    const [visModal, settVisModal] = useState(false);
    const { settÅpenBehandling } = useBehandling();
    const { skjema, kanSendeSkjema, onSubmit } = useOppdaterEndringstidspunktSkjema(
        åpenBehandling.endringstidspunkt,
        visModal
    );
    const oppdaterEndringstidspunkt = () => {
        if (kanSendeSkjema()) {
            onSubmit<IRestOverstyrtEndringstidspunkt>(
                {
                    method: 'PUT',
                    data: {
                        overstyrtEndringstidspunkt: dateTilIsoDatoString(
                            skjema.felter.endringstidspunkt.verdi
                        ),
                        behandlingId: åpenBehandling.behandlingId,
                    },
                    url: `/familie-ks-sak/api/vedtaksperioder/endringstidspunkt`,
                },
                (response: Ressurs<IBehandling>) => {
                    if (response.status === RessursStatus.SUKSESS) {
                        settVisModal(false);
                        settÅpenBehandling(response);
                    }
                }
            );
        }
    };

    return (
        <>
            <Dropdown.Menu.List.Item
                onClick={() => {
                    settVisModal(true);
                }}
            >
                <Calender />
                Oppdater endringstidspunkt
            </Dropdown.Menu.List.Item>

            {visModal && (
                <OppdaterEndringstidspunktModal
                    onAvbryt={() => settVisModal(false)}
                    oppdaterEndringstidspunkt={oppdaterEndringstidspunkt}
                    skjema={skjema}
                />
            )}
        </>
    );
};

export default EndreEndringstidspunkt;
