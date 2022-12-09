import React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';

import { BodyShort } from '@navikt/ds-react';
import { FamilieDatovelger, FamilieSelect } from '@navikt/familie-form-elements';
import type { ISkjema } from '@navikt/familie-skjema';

import { useApp } from '../../../../../context/AppContext';
import type { IBehandling } from '../../../../../typer/behandling';
import {
    BehandlingStatus,
    Behandlingstype,
    BehandlingÅrsak,
    behandlingÅrsak,
    erBehandlingHenlagt,
} from '../../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../../typer/fagsak';
import { FagsakStatus } from '../../../../../typer/fagsak';
import { Tilbakekrevingsbehandlingstype } from '../../../../../typer/tilbakekrevingsbehandling';
import { ToggleNavn } from '../../../../../typer/toggles';
import { hentAktivBehandlingPåMinimalFagsak } from '../../../../../utils/fagsak';
import { BehandlingstemaSelect } from '../../../../Felleskomponenter/BehandlingstemaSelect';
import type { VisningBehandling } from '../../../Saksoversikt/visningBehandling';
import type { IOpprettBehandlingSkjemaFelter } from './useOpprettBehandling';

const FixedDatoVelger = styled(FamilieDatovelger)`
    .nav-datovelger__kalenderPortal__content {
        position: fixed;
    }
    .nav-datovelger__kalenderknapp {
        z-index: 0;
    }
    margin-top: 2rem;
`;

const FeltFeilmelding = styled(BodyShort)`
    margin-top: 0.5rem;
    font-weight: 600;
    color: ${navFarger.redError};
`;

const StyledFamilieSelect = styled(FamilieSelect)`
    label {
        margin-top: 2rem;
    }
`;

const StyledBehandlingstemaSelect = styled(BehandlingstemaSelect)`
    label {
        margin-top: 2rem;
    }
`;

interface IProps {
    opprettBehandlingSkjema: ISkjema<IOpprettBehandlingSkjemaFelter, IBehandling>;
    minimalFagsak?: IMinimalFagsak;
    erLesevisning?: boolean;
    manuellJournalfør?: boolean;
}

interface BehandlingstypeSelect extends HTMLSelectElement {
    value: Behandlingstype | '';
}

interface BehandlingÅrsakSelect extends HTMLSelectElement {
    value: BehandlingÅrsak | '';
}

const OpprettBehandlingValg: React.FC<IProps> = ({
    opprettBehandlingSkjema,
    minimalFagsak,
    erLesevisning = false,
    manuellJournalfør = false,
}) => {
    const { toggles } = useApp();

    const aktivBehandling: VisningBehandling | undefined = minimalFagsak
        ? hentAktivBehandlingPåMinimalFagsak(minimalFagsak)
        : undefined;

    const kanOppretteBehandling =
        !aktivBehandling || aktivBehandling?.status === BehandlingStatus.AVSLUTTET;
    const kanOppretteFørstegangsbehandling = !minimalFagsak
        ? true
        : minimalFagsak.status !== FagsakStatus.LØPENDE && kanOppretteBehandling;
    const kanOppretteRevurdering = !minimalFagsak
        ? false
        : minimalFagsak.behandlinger.filter(behandling => !erBehandlingHenlagt(behandling.resultat))
              .length > 0 && kanOppretteBehandling;
    const kanOppretteTekniskEndring =
        kanOppretteRevurdering && toggles[ToggleNavn.kanBehandleTekniskEndring];
    const kanOppretteTilbakekreving = !manuellJournalfør;

    const visFeilmeldinger = opprettBehandlingSkjema.visFeilmeldinger;

    const {
        behandlingsårsak,
        behandlingstype,
        behandlingstema,
        søknadMottattDato,
        kravMotattDato,
    } = opprettBehandlingSkjema.felter;

    return (
        <>
            <FamilieSelect
                {...behandlingstype.hentNavBaseSkjemaProps(
                    opprettBehandlingSkjema.visFeilmeldinger
                )}
                erLesevisning={erLesevisning}
                name={'Behandling'}
                label={'Velg type behandling'}
                onChange={(event: React.ChangeEvent<BehandlingstypeSelect>): void => {
                    behandlingstype.onChange(event.target.value);
                }}
            >
                <option disabled={true} value={''}>
                    Velg
                </option>
                <option
                    aria-selected={behandlingstype.verdi === Behandlingstype.FØRSTEGANGSBEHANDLING}
                    disabled={!kanOppretteFørstegangsbehandling}
                    value={Behandlingstype.FØRSTEGANGSBEHANDLING}
                >
                    Førstegangsbehandling
                </option>
                <option
                    aria-selected={behandlingstype.verdi === Behandlingstype.REVURDERING}
                    disabled={!kanOppretteRevurdering}
                    value={Behandlingstype.REVURDERING}
                >
                    Revurdering
                </option>

                {kanOppretteTekniskEndring && (
                    <option
                        aria-selected={behandlingstype.verdi === Behandlingstype.TEKNISK_ENDRING}
                        disabled={!kanOppretteRevurdering}
                        value={Behandlingstype.TEKNISK_ENDRING}
                    >
                        Teknisk endring
                    </option>
                )}

                <option
                    aria-selected={
                        behandlingstype.verdi === Tilbakekrevingsbehandlingstype.TILBAKEKREVING
                    }
                    disabled={!kanOppretteTilbakekreving}
                    value={Tilbakekrevingsbehandlingstype.TILBAKEKREVING}
                >
                    Tilbakekreving
                </option>

                {toggles[ToggleNavn.kanBehandleKlage] && (
                    <option
                        aria-selected={behandlingstype.verdi === Behandlingstype.KLAGE}
                        value={Behandlingstype.KLAGE}
                    >
                        Klage
                    </option>
                )}
            </FamilieSelect>

            {behandlingsårsak.erSynlig && (
                <StyledFamilieSelect
                    {...behandlingsårsak.hentNavBaseSkjemaProps(visFeilmeldinger)}
                    erLesevisning={erLesevisning}
                    name={'Behandlingsårsak'}
                    label={'Velg årsak'}
                    onChange={(event: React.ChangeEvent<BehandlingÅrsakSelect>): void => {
                        behandlingsårsak.onChange(event.target.value);
                    }}
                >
                    <option disabled={true} value={''}>
                        Velg
                    </option>
                    {Object.values(BehandlingÅrsak)
                        .filter(
                            årsak =>
                                årsak !== BehandlingÅrsak.SATSENDRING &&
                                (årsak !== BehandlingÅrsak.KORREKSJON_VEDTAKSBREV ||
                                    toggles[ToggleNavn.kanManueltKorrigereMedVedtaksbrev])
                        )
                        .map(årsak => {
                            return (
                                <option
                                    key={årsak}
                                    aria-selected={behandlingsårsak.verdi === årsak}
                                    value={årsak}
                                >
                                    {behandlingÅrsak[årsak]}
                                </option>
                            );
                        })}
                </StyledFamilieSelect>
            )}

            {behandlingstema.erSynlig && (
                <StyledBehandlingstemaSelect
                    behandlingstema={behandlingstema}
                    erLesevisning={erLesevisning}
                    visFeilmeldinger={opprettBehandlingSkjema.visFeilmeldinger}
                    name="Behandlingstema"
                    label="Velg behandlingstema"
                />
            )}

            {søknadMottattDato?.erSynlig && (
                <>
                    <FixedDatoVelger
                        {...søknadMottattDato.hentNavInputProps(
                            opprettBehandlingSkjema.visFeilmeldinger
                        )}
                        valgtDato={søknadMottattDato.verdi}
                        label={'Mottatt dato'}
                        placeholder={'DD.MM.ÅÅÅÅ'}
                        limitations={{
                            maxDate: new Date().toISOString(),
                        }}
                    />
                    {søknadMottattDato.feilmelding && opprettBehandlingSkjema.visFeilmeldinger && (
                        <FeltFeilmelding>{søknadMottattDato.feilmelding}</FeltFeilmelding>
                    )}
                </>
            )}

            {kravMotattDato?.erSynlig && (
                <>
                    <FixedDatoVelger
                        {...kravMotattDato.hentNavInputProps(
                            opprettBehandlingSkjema.visFeilmeldinger
                        )}
                        valgtDato={kravMotattDato.verdi}
                        label={'Mottatt dato'}
                        placeholder={'DD.MM.ÅÅÅÅ'}
                        limitations={{
                            maxDate: new Date().toISOString(),
                        }}
                    />
                    {kravMotattDato.feilmelding && opprettBehandlingSkjema.visFeilmeldinger && (
                        <FeltFeilmelding>{kravMotattDato.feilmelding}</FeltFeilmelding>
                    )}
                </>
            )}
        </>
    );
};

export default OpprettBehandlingValg;
