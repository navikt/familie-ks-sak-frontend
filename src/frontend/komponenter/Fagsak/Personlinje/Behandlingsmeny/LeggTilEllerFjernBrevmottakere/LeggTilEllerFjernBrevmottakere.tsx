import React, { useState } from 'react';

import { Dropdown } from '@navikt/ds-react';

import { LeggTilBrevmottakerModalBehandling } from './LeggTilBrevmottakerModalBehandling';
import type { IBehandling } from '../../../../../typer/behandling';

interface BehandlingProps {
    behandling: IBehandling;
    erLesevisning: boolean;
}

const utledMenyinnslag = (antallMottakere: number, erLesevisning: boolean) => {
    if (erLesevisning) {
        return antallMottakere === 1 ? 'Se brevmottaker' : 'Se brevmottakere';
    } else {
        return antallMottakere === 0
            ? 'Legg til brevmottaker'
            : antallMottakere === 1
              ? 'Legg til eller fjern brevmottaker'
              : 'Se eller fjern brevmottakere';
    }
};

export const LeggTilEllerFjernBrevmottakere = (props: BehandlingProps) => {
    const [visModal, settVisModal] = useState(false);

    const brevmottakere = props.behandling.brevmottakere;

    const menyinnslag = utledMenyinnslag(brevmottakere.length, props.erLesevisning);

    return (
        <>
            <Dropdown.Menu.List.Item onClick={() => settVisModal(true)}>
                {menyinnslag}
            </Dropdown.Menu.List.Item>

            {visModal && (
                <LeggTilBrevmottakerModalBehandling
                    lukkModal={() => settVisModal(false)}
                    behandling={props.behandling}
                    erLesevisning={props.erLesevisning}
                />
            )}
        </>
    );
};
