import React, { useState } from 'react';

import { useLocation } from 'react-router';
import styled from 'styled-components';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Alert, Button, Heading, Modal } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BrevmottakerSkjema from './BrevmottakerSkjema';
import BrevmottakerTabell from './BrevmottakerTabell';
import type { BrevmottakerUseSkjema, IRestBrevmottaker, SkjemaBrevmottaker } from './useBrevmottakerSkjema';
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

    const erPåDokumentutsendingPåFagsak = useLocation().pathname.includes('dokumentutsending');

    const lukkModalOgSkjema = () => {
        lukkModal();
        settVisSkjemaNårDetErÉnBrevmottaker(false);
    };

    return (
        <Modal open onClose={lukkModalOgSkjema} header={{ heading: heading, size: 'medium' }} width={'35rem'} portal>
            <Modal.Body>
                <StyledAlert variant="info">
                    Brev sendes til brukers folkeregistrerte adresse eller annen foretrukken kanal. Legg til mottaker
                    dersom brev skal sendes til utenlandsk adresse, fullmektig
                    {erPåDokumentutsendingPåFagsak ? ' eller verge' : ', verge eller dødsbo'}.
                </StyledAlert>
                {brevmottakere.map((mottaker, index) => (
                    <BrevmottakerTabell
                        mottaker={mottaker}
                        key={`mottaker-${index}`}
                        fjernMottaker={fjernMottaker}
                        erLesevisning={erLesevisning}
                    />
                ))}
                {erSkjemaSynlig ? (
                    <>
                        {brevmottakere.length === 1 && <StyledHeading size="medium">Ny mottaker</StyledHeading>}
                        <BrevmottakerSkjema
                            erLesevisning={erLesevisning}
                            skjema={skjema}
                            navnErPreutfylt={navnErPreutfylt}
                        />
                    </>
                ) : (
                    brevmottakere.length === 1 &&
                    !erLesevisning && (
                        <LeggTilKnapp
                            variant="tertiary"
                            size="small"
                            icon={<PlusCircleIcon />}
                            onClick={() => settVisSkjemaNårDetErÉnBrevmottaker(true)}
                        >
                            Legg til ny mottaker
                        </LeggTilKnapp>
                    )
                )}
            </Modal.Body>
            <Modal.Footer>
                {!erLesevisning && erSkjemaSynlig ? (
                    <>
                        <Button
                            variant={valideringErOk() ? 'primary' : 'secondary'}
                            loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                            disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                            onClick={() => lagreMottaker(verdierFraBrevmottakerUseSkjema)}
                        >
                            Legg til mottaker
                        </Button>
                        <Button variant="tertiary" onClick={lukkModal}>
                            Avbryt
                        </Button>
                    </>
                ) : (
                    <Button onClick={lukkModal}>Lukk vindu</Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};
