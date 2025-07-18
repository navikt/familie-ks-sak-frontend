import React from 'react';

import styled from 'styled-components';

import { Alert, BodyShort, Label } from '@navikt/ds-react';
import type { FormatOptionLabelMeta, GroupBase } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { ISkjema } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import { type IEndretUtbetalingAndelSkjema } from './useEndretUtbetalingAndel';
import type { IBehandling } from '../../../../../../typer/behandling';
import type { OptionType } from '../../../../../../typer/common';
import type { IRestBegrunnelseTilknyttetEndretUtbetaling } from '../../../../../../typer/endretUtbetaling';
import { IEndretUtbetalingAndelÅrsak } from '../../../../../../typer/utbetalingAndel';
import { BegrunnelseType } from '../../../../../../typer/vedtak';
import { begrunnelseTyper, type Begrunnelse } from '../../../../../../typer/vedtak';
import { useBehandlingContext } from '../../../context/BehandlingContext';
import { useHentEndretUtbetalingBegrunnelser } from '../useHentEndretUtbetalingBegrunnelser';

const GroupLabel = styled.div`
    color: black;
`;

interface IProps {
    skjema: ISkjema<IEndretUtbetalingAndelSkjema, IBehandling>;
}

export const EndretUtbetalingAvslagBegrunnelse: React.FC<IProps> = ({ skjema }) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const { endretUtbetalingsbegrunnelser } = useHentEndretUtbetalingBegrunnelser();

    const prevalgtBegrunnelse =
        skjema.felter.vedtaksbegrunnelser.verdi &&
        skjema.felter.vedtaksbegrunnelser.verdi.length > 0
            ? skjema.felter.vedtaksbegrunnelser.verdi[0]
            : undefined;

    const gyldigeBegrunnelseTyper = [BegrunnelseType.AVSLAG];
    const lastedeTekster =
        endretUtbetalingsbegrunnelser.status === RessursStatus.SUKSESS &&
        endretUtbetalingsbegrunnelser.data;

    const grupperteBegrunnelser: GroupBase<OptionType>[] = gyldigeBegrunnelseTyper.map(type => {
        const begrunnelser = lastedeTekster
            ? lastedeTekster[type]
                  .filter(begrunnelse =>
                      begrunnelse.endringsårsaker.includes(
                          IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT
                      )
                  )
                  .map(begrunnelse => ({
                      label: begrunnelse.navn,
                      value: begrunnelse.id,
                  }))
            : [];
        return {
            label: begrunnelseTyper[type],
            options: begrunnelser,
        };
    });

    if (endretUtbetalingsbegrunnelser.status === RessursStatus.FEILET) {
        return (
            <Alert variant="error">
                Klarte ikke å hente inn begrunnelser for endret utbetaling.
            </Alert>
        );
    }

    const finnBegrunnelseType = (begrunnelse: Begrunnelse): BegrunnelseType | undefined => {
        return Object.keys(lastedeTekster).find(begrunnelseType => {
            return lastedeTekster
                ? lastedeTekster[begrunnelseType as BegrunnelseType].find(
                      (begrunnelseTilknyttetVilkår: IRestBegrunnelseTilknyttetEndretUtbetaling) =>
                          begrunnelseTilknyttetVilkår.id === begrunnelse
                  ) !== undefined
                : '';
        }) as BegrunnelseType;
    };

    function finnBegrunnelseForSelect(begrunnelseVerdi?: Begrunnelse) {
        if (!lastedeTekster) return;

        for (const key in lastedeTekster) {
            const valgtBegrunnelse = lastedeTekster[key as BegrunnelseType].find(begrunnelse => {
                return begrunnelse.id === begrunnelseVerdi;
            });

            if (valgtBegrunnelse) {
                return {
                    label: valgtBegrunnelse.navn,
                    value: valgtBegrunnelse.id,
                };
            }
        }
    }

    return (
        <FamilieReactSelect
            {...skjema.felter.vedtaksbegrunnelser.hentNavInputProps(skjema.visFeilmeldinger)}
            value={finnBegrunnelseForSelect(prevalgtBegrunnelse)}
            label={'Velg standardtekst i brev'}
            creatable={false}
            placeholder={'Velg begrunnelse'}
            erLesevisning={vurderErLesevisning()}
            isMulti={false}
            options={grupperteBegrunnelser}
            onChange={options => {
                if (options && 'value' in options) {
                    /* 
                        Vi ønsker kun en begrunnelse her, men modellen tilsier at det skal være en array.
                        Hardkoder dermed den ene valgte verdien som en array med en begrunnelse.
                    */
                    skjema.felter.vedtaksbegrunnelser.validerOgSettFelt([options.value]);
                } else {
                    skjema.felter.vedtaksbegrunnelser.validerOgSettFelt([]);
                }
            }}
            formatGroupLabel={(group: GroupBase<OptionType>) => {
                return (
                    <GroupLabel>
                        <Label>{group.label}</Label>
                        <hr />
                    </GroupLabel>
                );
            }}
            formatOptionLabel={(
                option: OptionType,
                formatOptionLabelMeta: FormatOptionLabelMeta<OptionType>
            ) => {
                if (formatOptionLabelMeta.context == 'value') {
                    // Formatering når alternativet er valgt
                    const begrunnelseType = finnBegrunnelseType(option.value as Begrunnelse);
                    const begrunnelseTypeLabel =
                        begrunnelseTyper[begrunnelseType as BegrunnelseType];
                    return (
                        <BodyShort>
                            <strong>{begrunnelseTypeLabel}</strong>: {option.label}
                        </BodyShort>
                    );
                } else {
                    // Formatering når alternativet er i nedtrekkslisten
                    return <BodyShort>{option.label}</BodyShort>;
                }
            }}
            propSelectStyles={{
                container: provided => ({
                    ...provided,
                    maxWidth: '25rem',
                }),
                groupHeading: provided => ({
                    ...provided,
                    textTransform: 'none',
                }),
            }}
        />
    );
};
