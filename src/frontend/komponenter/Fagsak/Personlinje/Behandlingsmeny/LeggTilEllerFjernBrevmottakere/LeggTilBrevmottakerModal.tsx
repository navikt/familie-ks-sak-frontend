import React, { useState } from 'react';

import styled from 'styled-components';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Alert, Button, Heading, Modal } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BrevmottakerSkjema from './BrevmottakerSkjema';
import BrevmottakerTabell from './BrevmottakerTabell';
import type {
    BrevmottakerUseSkjema,
    IRestBrevmottaker,
    SkjemaBrevmottaker,
} from './useBrevmottakerSkjema';
import { useBrevmottakerSkjema } from './useBrevmottakerSkjema';

const StyledAlert = styled(Alert)`
    margin: 1rem 0 2.5rem;
`;
const StyledHeading = styled(Heading)`
    margin: 1rem 0 0.75rem;
`;
const LeggTilKnapp = styled(Button)`
    margin-top: 1rem;
`;
const LukkKnapp = styled(Button)`
    margin-top: 2.5rem;
`;

interface Props<T extends SkjemaBrevmottaker | IRestBrevmottaker> {
    lukkModal: () => void;
    brevmottakere: T[];
    lagreMottaker: (useSkjema: BrevmottakerUseSkjema) => void;
    fjernMottaker: (mottaker: T) => void;
    erLesevisning: boolean;
}

const utledHeading = (antallMottakere: number, erLesevisning: boolean) => {
    if (erLesevisning) {
        return antallMottakere === 1 ? 'Brevmottaker' : 'Brevmottakere';
    } else {
        return antallMottakere === 0
            ? 'Legg til brevmottaker'
            : antallMottakere === 1
              ? 'Legg til eller fjern brevmottaker'
              : 'Brevmottakere';
    }
};

export const LeggTilBrevmottakerModal = <T extends SkjemaBrevmottaker | IRestBrevmottaker>({
    lukkModal,
    brevmottakere,
    lagreMottaker,
    fjernMottaker,
    erLesevisning,
}: Props<T>) => {
    const { verdierFraBrevmottakerUseSkjema, navnErPreutfylt } = useBrevmottakerSkjema({
        eksisterendeMottakere: brevmottakere,
    });

    const [visSkjemaNårDetErÉnBrevmottaker, settVisSkjemaNårDetErÉnBrevmottaker] = useState(false);

    const { skjema, valideringErOk } = verdierFraBrevmottakerUseSkjema;
    const heading = utledHeading(brevmottakere.length, erLesevisning);

    const erSkjemaSynlig =
        (brevmottakere.length === 0 && !erLesevisning) ||
        (brevmottakere.length === 1 && visSkjemaNårDetErÉnBrevmottaker);

    const lukkModalOgSkjema = () => {
        lukkModal();
        settVisSkjemaNårDetErÉnBrevmottaker(false);
    };

    return (
        <Modal
            open
            onClose={lukkModalOgSkjema}
            header={{ heading: heading, size: 'medium' }}
            width={'35rem'}
            portal
        >
            <Modal.Body>
                <StyledAlert variant="info">
                    Brev sendes til brukers folkeregistrerte adresse eller annen foretrukken kanal.
                    Legg til mottaker dersom brev skal sendes til utenlandsk adresse, fullmektig,
                    verge eller dødsbo'.
                </StyledAlert>
                {brevmottakere.map(mottaker => (
                    <BrevmottakerTabell
                        mottaker={mottaker}
                        key={`mottaker-${mottaker}`}
                        fjernMottaker={fjernMottaker}
                        erLesevisning={erLesevisning}
                    />
                ))}
                {erSkjemaSynlig ? (
                    <>
                        {brevmottakere.length === 1 && (
                            <StyledHeading size="medium">Ny mottaker</StyledHeading>
                        )}
                        <BrevmottakerSkjema
                            erLesevisning={erLesevisning}
                            skjema={skjema}
                            navnErPreutfylt={navnErPreutfylt}
                        />
                    </>
                ) : (
                    <>
                        {brevmottakere.length === 1 && !erLesevisning && (
                            <LeggTilKnapp
                                variant="tertiary"
                                size="small"
                                icon={<PlusCircleIcon />}
                                onClick={() => settVisSkjemaNårDetErÉnBrevmottaker(true)}
                            >
                                Legg til ny mottaker
                            </LeggTilKnapp>
                        )}
                        <div>
                            <LukkKnapp onClick={lukkModal}>Lukk vindu</LukkKnapp>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                {!erLesevisning ? (
                    <>
                        <Button variant="tertiary" onClick={lukkModal}>
                            Avbryt
                        </Button>
                        <Button
                            variant={valideringErOk() ? 'primary' : 'secondary'}
                            loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                            disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                            onClick={() => lagreMottaker(verdierFraBrevmottakerUseSkjema)}
                        >
                            Legg til mottaker
                        </Button>
                    </>
                ) : (
                    <Button onClick={lukkModal}>Lukk</Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};