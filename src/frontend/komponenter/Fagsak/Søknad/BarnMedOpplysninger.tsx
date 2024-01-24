import * as React from 'react';
import { useState } from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { BodyShort, Button, Checkbox, Modal } from '@navikt/ds-react';

import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import { useSøknad } from '../../../context/SøknadContext';
import Slett from '../../../ikoner/Slett';
import type { IBarnMedOpplysninger } from '../../../typer/søknad';
import { formaterIdent, hentAlderSomString } from '../../../utils/formatter';

interface IProps {
    barn: IBarnMedOpplysninger;
}

const CheckboxOgSlettknapp = styled.div`
    display: flex;
    text-align: center;
`;

const StyledCheckbox = styled(Checkbox)`
    margin-left: 1rem;
    > label {
        width: 100%;
    }
`;

const LabelContent = styled.div`
    display: flex;
    white-space: nowrap;
`;

const LabelTekst = styled.p`
    margin: 0;
    text-overflow: ellipsis;
    overflow: hidden;
`;

const FjernBarnKnapp = styled(Button)`
    margin-left: 1rem;
`;

const BarnMedOpplysninger: React.FunctionComponent<IProps> = ({ barn }) => {
    const { skjema, barnMedLøpendeUtbetaling } = useSøknad();
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();
    const [visHarLøpendeModal, settVisHarLøpendeModal] = useState(false);

    const barnetHarLøpendeUtbetaling = barnMedLøpendeUtbetaling.has(barn.ident);

    const navnOgIdentTekst = `${barn.navn ?? 'Navn ukjent'} (${hentAlderSomString(
        barn.fødselsdato
    )}) | ${formaterIdent(barn.ident)} ${barnetHarLøpendeUtbetaling ? '(løpende)' : ''}`;

    const oppdaterBarnMerket = (nyMerketStatus: boolean) => {
        skjema.felter.barnaMedOpplysninger.validerOgSettFelt(
            skjema.felter.barnaMedOpplysninger.verdi.map(
                (barnMedOpplysninger: IBarnMedOpplysninger) =>
                    barnMedOpplysninger.ident === barn.ident
                        ? {
                              ...barnMedOpplysninger,
                              merket: nyMerketStatus,
                          }
                        : barnMedOpplysninger
            )
        );
    };

    return (
        <CheckboxOgSlettknapp>
            {erLesevisning ? (
                barn.merket ? (
                    <BodyShort
                        className={classNames('skjemaelement', 'lese-felt')}
                        children={
                            <LabelContent>
                                <LabelTekst title={navnOgIdentTekst}>{navnOgIdentTekst}</LabelTekst>
                            </LabelContent>
                        }
                    />
                ) : null
            ) : (
                <StyledCheckbox value={barn.ident}>
                    <LabelContent>
                        <LabelTekst title={navnOgIdentTekst}>{navnOgIdentTekst}</LabelTekst>
                    </LabelContent>
                </StyledCheckbox>
            )}
            {barn.manueltRegistrert && !erLesevisning && (
                <FjernBarnKnapp
                    variant={'tertiary'}
                    id={`fjern__${barn.ident}`}
                    size={'small'}
                    icon={<Slett />}
                    onClick={() => {
                        skjema.felter.barnaMedOpplysninger.validerOgSettFelt([
                            ...skjema.felter.barnaMedOpplysninger.verdi.filter(
                                barnMedOpplysninger =>
                                    barnMedOpplysninger.ident !== barn.ident ||
                                    barnMedOpplysninger.navn !== barn.navn ||
                                    barnMedOpplysninger.fødselsdato !== barn.fødselsdato
                            ),
                        ]);
                    }}
                >
                    {'Fjern barn'}
                </FjernBarnKnapp>
            )}
            {visHarLøpendeModal && (
                <Modal
                    open
                    portal
                    onClose={() => settVisHarLøpendeModal(false)}
                    width={'35rem'}
                    header={{
                        heading: 'Søker mottar allerede kontantstøtte for dette barnet',
                        size: 'small',
                    }}
                >
                    <Modal.Body>
                        <BodyShort>
                            Barnet ({formaterIdent(barn.ident)}) har løpende kontantstøtte. Du skal
                            kun velge barn som det ikke utbetales kontantstøtte for.
                        </BodyShort>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant={'secondary'}
                            key={'velg-barnet'}
                            size={'small'}
                            onClick={() => {
                                settVisHarLøpendeModal(false);
                                oppdaterBarnMerket(true);
                            }}
                            children={'Velg barnet'}
                        />
                        <Button
                            variant={'secondary'}
                            key={'avbryt'}
                            size={'small'}
                            onClick={() => {
                                settVisHarLøpendeModal(false);
                            }}
                            children={'Avbryt'}
                        />
                    </Modal.Footer>
                </Modal>
            )}
        </CheckboxOgSlettknapp>
    );
};
export default BarnMedOpplysninger;
