import React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';

import { BodyShort } from '@navikt/ds-react';
import { FamilieDatovelger, FamilieSelect } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';

import { useApp } from '../../../../../context/AppContext';
import {
    BehandlingStatus,
    Behandlingstype,
    BehandlingÅrsak,
    behandlingÅrsak,
    erBehandlingHenlagt,
} from '../../../../../typer/behandling';
import type { IBehandlingstema } from '../../../../../typer/behandlingstema';
import type { IMinimalFagsak } from '../../../../../typer/fagsak';
import { FagsakStatus } from '../../../../../typer/fagsak';
import { Tilbakekrevingsbehandlingstype } from '../../../../../typer/tilbakekrevingsbehandling';
import { ToggleNavn } from '../../../../../typer/toggles';
import { hentAktivBehandlingPåMinimalFagsak } from '../../../../../utils/fagsak';
import type { FamilieIsoDate } from '../../../../../utils/kalender';
import { BehandlingstemaSelect } from '../../../../Felleskomponenter/BehandlingstemaSelect';
import type { VisningBehandling } from '../../../Saksoversikt/visningBehandling';

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
    behandlingstype: Felt<Behandlingstype | Tilbakekrevingsbehandlingstype | ''>;
    behandlingsårsak: Felt<BehandlingÅrsak | ''>;
    behandlingstema: Felt<IBehandlingstema | undefined>;
    søknadMottattDato?: Felt<FamilieIsoDate | undefined>;
    minimalFagsak?: IMinimalFagsak;
    visFeilmeldinger: boolean;
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
    behandlingstype,
    behandlingsårsak,
    behandlingstema,
    søknadMottattDato = undefined,
    minimalFagsak,
    visFeilmeldinger,
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

    return (
        <>
            <FamilieSelect
                {...behandlingstype.hentNavBaseSkjemaProps(visFeilmeldinger)}
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
                                årsak !== BehandlingÅrsak.TEKNISK_ENDRING &&
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
                    visFeilmeldinger={visFeilmeldinger}
                    name="Behandlingstema"
                    label="Velg behandlingstema"
                />
            )}

            {søknadMottattDato?.erSynlig && (
                <>
                    <FixedDatoVelger
                        {...søknadMottattDato.hentNavInputProps(visFeilmeldinger)}
                        valgtDato={søknadMottattDato.verdi}
                        label={'Mottatt dato'}
                        placeholder={'DD.MM.ÅÅÅÅ'}
                        limitations={{
                            maxDate: new Date().toISOString(),
                        }}
                    />
                    {søknadMottattDato.feilmelding && visFeilmeldinger && (
                        <FeltFeilmelding>{søknadMottattDato.feilmelding}</FeltFeilmelding>
                    )}
                </>
            )}
        </>
    );
};

export default OpprettBehandlingValg;
