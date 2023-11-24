import * as React from 'react';

import styled, { css } from 'styled-components';

import { Cancel, Warning } from '@navikt/ds-icons';
import { Alert, BodyLong, Button, Modal } from '@navikt/ds-react';
import { Dropdown } from '@navikt/ds-react-internal';
import { FamilieTextarea } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useKorrigerVedtakSkjemaContext } from '../../../../context/KorrigerVedtak/KorrigerVedtakSkjemaContext';
import type { IRestKorrigertVedtak } from '../../../../typer/vedtak';
import Datovelger from '../../../Felleskomponenter/Datovelger/Datovelger';

const AngreKnapp = styled(Button)`
    margin: 0.5rem 0;
`;

const baseSkjemaelementStyle = css`
    margin-bottom: 1.5rem;
`;

const StyledFamilieTextarea = styled(FamilieTextarea)`
    ${baseSkjemaelementStyle}
`;

interface IKorrigerVedtak {
    korrigertVedtak?: IRestKorrigertVedtak;
    behandlingId: number;
    erLesevisning: boolean;
}

const KorrigerVedtak: React.FC<IKorrigerVedtak> = ({
    korrigertVedtak,
    behandlingId,
    erLesevisning,
}) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);

    const { skjema, valideringErOk, lagreKorrigertVedtak, angreKorrigering, restFeil } =
        useKorrigerVedtakSkjemaContext({
            onSuccess: () => settVisModal(false),
            korrigertVedtak,
            behandlingId,
        });

    const lukkModal = () => {
        settVisModal(false);
    };

    const visAngreKnapp = korrigertVedtak != null;

    return (
        <>
            <Dropdown.Menu.List.Item
                onClick={() => {
                    settVisModal(true);
                }}
            >
                <Warning />
                {korrigertVedtak ? <>Vis korrigert vedtak</> : <>Korriger vedtak</>}
            </Dropdown.Menu.List.Item>

            {visModal && (
                <Modal
                    open
                    onClose={lukkModal}
                    header={{ heading: 'Korriger vedtak', size: 'medium' }}
                    width={'35rem'}
                    portal
                >
                    <Modal.Body>
                        <BodyLong>
                            Dersom det har blitt gjort feil tidligere vedtak, kan denne teksten
                            legges til i vedtaksbrevet:
                        </BodyLong>
                        <ul>
                            <li>
                                Vi har oppdaget en feil i vedtaket vi gjorde [DATO]. Derfor har vi
                                vurdert saken din på nytt.
                            </li>
                        </ul>
                        <Datovelger
                            felt={skjema.felter.vedtaksdato}
                            label={'Vedtaksdato'}
                            visFeilmeldinger={skjema.visFeilmeldinger}
                            readOnly={erLesevisning}
                            kanKunVelgeFortid
                        />
                        <StyledFamilieTextarea
                            {...skjema.felter.begrunnelse?.hentNavBaseSkjemaProps(
                                skjema.visFeilmeldinger
                            )}
                            id={'korriger-vedtak-begrunnelse'}
                            label={'Begrunnelse (valgfri)'}
                            description={'Begrunn hva som er gjort feil i tidligere vedtak'}
                            erLesevisning={erLesevisning}
                            value={skjema.felter.begrunnelse.verdi}
                            onChange={changeEvent =>
                                skjema.felter.begrunnelse.validerOgSettFelt(
                                    changeEvent.target.value
                                )
                            }
                        />
                        {restFeil && (
                            <Alert variant="error" style={{ marginBottom: '1.5rem' }} inline>
                                {restFeil}
                            </Alert>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        {!erLesevisning && (
                            <>
                                <Button
                                    onClick={lagreKorrigertVedtak}
                                    variant={valideringErOk() ? 'primary' : 'secondary'}
                                    loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                                    disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                                >
                                    {korrigertVedtak ? 'Oppdater' : 'Legg til'}
                                </Button>
                                <Button onClick={lukkModal} variant={'tertiary'}>
                                    Avbryt
                                </Button>
                                {visAngreKnapp && (
                                    <AngreKnapp
                                        size={'small'}
                                        onClick={angreKorrigering}
                                        variant={'tertiary'}
                                        loading={
                                            skjema.submitRessurs.status === RessursStatus.HENTER
                                        }
                                        disabled={
                                            skjema.submitRessurs.status === RessursStatus.HENTER
                                        }
                                        icon={<Cancel />}
                                    >
                                        Fjern korrigering
                                    </AngreKnapp>
                                )}
                            </>
                        )}
                        {erLesevisning && <Button onClick={lukkModal}>Lukk</Button>}
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default KorrigerVedtak;
