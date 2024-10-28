import * as React from 'react';
import { useEffect } from 'react';

import styled from 'styled-components';

import { TrashIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Fieldset, Label, Select, TextField } from '@navikt/ds-react';
import { ABorderAction } from '@navikt/ds-tokens/dist/tokens';
import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import { useOvergangsordningAndel } from '../../../context/OvergangsordningAndelContext';
import type { IBehandling } from '../../../typer/behandling';
import type { IRestOvergangsordningAndel } from '../../../typer/overgangsordningAndel';
import { isNumeric } from '../../../utils/eøsValidators';
import { lagPersonLabel } from '../../../utils/formatter';
import { hentFrontendFeilmelding } from '../../../utils/ressursUtils';
import Månedvelger, { DagIMåneden } from '../../Felleskomponenter/Datovelger/Månedvelger';
import Knapperekke from '../../Felleskomponenter/Knapperekke';

const KnapperekkeVenstre = styled.div`
    display: flex;
    flex-direction: row;
`;

const StyledFieldset = styled(Fieldset)`
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    padding-left: 2rem;
    margin-right: 2rem;
    border-left: 0.0625rem solid ${ABorderAction};
    max-width: 30rem;
`;

const StyledPersonvelger = styled(Select)`
    max-width: 20rem;
    z-index: 1000;
`;

const StyledAntallTimerVelger = styled(TextField)`
    max-width: 20rem;
    z-index: 1000;
`;

const Feltmargin = styled.div`
    margin-bottom: 1rem;
`;

const StyledFerdigKnapp = styled(Button)`
    margin-right: 0.5rem;
`;

const FlexDiv = styled.div`
    display: flex;
    gap: 1.125rem;
`;

interface IOvergangsordningAndelSkjemaProps {
    åpenBehandling: IBehandling;
    lukkSkjema: () => void;
}

const OvergangsordningAndelSkjema: React.FunctionComponent<IOvergangsordningAndelSkjemaProps> = ({
    åpenBehandling,
    lukkSkjema,
}) => {
    const { request } = useHttp();
    const { vurderErLesevisning, settÅpenBehandling } = useBehandling();

    const {
        overgangsordningAndel,
        skjema,
        kanSendeSkjema,
        onSubmit,
        hentSkjemaData,
        tilbakestillFelterTilDefault,
    } = useOvergangsordningAndel();

    const oppdaterOvergangsordningAndel = (avbrytOvergangsordningAndelPeriode: () => void) => {
        if (kanSendeSkjema()) {
            onSubmit<IRestOvergangsordningAndel>(
                {
                    method: 'PUT',
                    url: `/familie-ks-sak/api/overgangsordningandel/${åpenBehandling.behandlingId}/${overgangsordningAndel.id}`,
                    påvirkerSystemLaster: true,
                    data: hentSkjemaData(),
                },
                (behandling: Ressurs<IBehandling>) => {
                    if (behandling.status === RessursStatus.SUKSESS) {
                        avbrytOvergangsordningAndelPeriode();
                        settÅpenBehandling(behandling);
                    }
                }
            );
        }
    };

    const slettOvergangsordningAndel = () => {
        request<undefined, IBehandling>({
            method: 'DELETE',
            url: `/familie-ks-sak/api/overgangsordningandel/${åpenBehandling.behandlingId}/${overgangsordningAndel.id}`,
            påvirkerSystemLaster: true,
        }).then((behandling: Ressurs<IBehandling>) => settÅpenBehandling(behandling));
    };

    useEffect(() => {
        if (hentFrontendFeilmelding(skjema.submitRessurs)?.includes('til og med dato')) {
            skjema.felter.tom.nullstill();
        }
    }, [skjema.submitRessurs]);

    const erLesevisning = vurderErLesevisning();

    return (
        <>
            <StyledFieldset
                error={hentFrontendFeilmelding(skjema.submitRessurs)}
                legend={'Skjema for å endre overgangsordningandeler'}
                hideLegend
            >
                <Feltmargin>
                    <StyledPersonvelger
                        {...skjema.felter.personIdent.hentNavBaseSkjemaProps(
                            skjema.visFeilmeldinger
                        )}
                        label={<Label>Velg hvem det gjelder</Label>}
                        value={skjema.felter.personIdent.verdi ?? ''}
                        onChange={(event): void => {
                            skjema.felter.personIdent.validerOgSettFelt(event.target.value);
                        }}
                        readOnly={erLesevisning}
                    >
                        <option value={undefined}>Velg person</option>
                        {åpenBehandling.personer
                            .filter(person =>
                                åpenBehandling.personerMedAndelerTilkjentYtelse
                                    .map(personMedAndeler => personMedAndeler.personIdent)
                                    .includes(person.personIdent)
                            )
                            .map((person, index) => (
                                <option
                                    value={person.personIdent}
                                    key={`${index}_${person.fødselsdato}`}
                                >
                                    {lagPersonLabel(person.personIdent, åpenBehandling.personer)}
                                </option>
                            ))}
                    </StyledPersonvelger>
                </Feltmargin>

                <Feltmargin>
                    <Label>Fastsett periode</Label>
                    <FlexDiv>
                        <Månedvelger
                            felt={skjema.felter.fom}
                            label={'F.o.m.'}
                            visFeilmeldinger={skjema.visFeilmeldinger}
                            dagIMåneden={DagIMåneden.FØRSTE_DAG}
                        />
                        <Månedvelger
                            felt={skjema.felter.tom}
                            label={'T.o.m.'}
                            visFeilmeldinger={skjema.visFeilmeldinger}
                            dagIMåneden={DagIMåneden.SISTE_DAG}
                        />
                    </FlexDiv>
                </Feltmargin>

                <Feltmargin>
                    {erLesevisning ? (
                        <>
                            <Label>Beløp</Label>
                            <BodyShort>{skjema.felter.antallTimer.verdi}</BodyShort>
                        </>
                    ) : (
                        <StyledAntallTimerVelger
                            {...skjema.felter.antallTimer.hentNavBaseSkjemaProps(
                                skjema.visFeilmeldinger
                            )}
                            label={<Label>Antall timer</Label>}
                            value={skjema.felter.antallTimer.verdi ?? ''}
                            onChange={(event): void => {
                                if (isNumeric(event.target.value)) {
                                    skjema.felter.antallTimer.validerOgSettFelt(event.target.value);
                                }
                            }}
                            readOnly={erLesevisning}
                        />
                    )}
                </Feltmargin>
                {!erLesevisning && (
                    <Knapperekke>
                        <KnapperekkeVenstre>
                            <StyledFerdigKnapp
                                size={'small'}
                                variant={'secondary'}
                                onClick={() => oppdaterOvergangsordningAndel(lukkSkjema)}
                            >
                                Bekreft
                            </StyledFerdigKnapp>
                            <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => {
                                    tilbakestillFelterTilDefault();
                                    lukkSkjema();
                                }}
                            >
                                Avbryt
                            </Button>
                        </KnapperekkeVenstre>

                        {!erLesevisning && (
                            <Button
                                variant={'tertiary'}
                                id={`sletteknapp-overgangsordning-andel-${overgangsordningAndel.id}`}
                                size={'small'}
                                onClick={slettOvergangsordningAndel}
                                icon={<TrashIcon />}
                            >
                                {'Fjern periode'}
                            </Button>
                        )}
                    </Knapperekke>
                )}
            </StyledFieldset>
        </>
    );
};

export default OvergangsordningAndelSkjema;
