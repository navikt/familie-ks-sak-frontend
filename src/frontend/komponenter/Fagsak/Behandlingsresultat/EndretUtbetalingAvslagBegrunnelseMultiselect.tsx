import React from 'react';

import type { GroupBase } from 'react-select';
import styled from 'styled-components';

import { Alert, BodyShort, Label } from '@navikt/ds-react';
import { ASurfaceActionHover } from '@navikt/ds-tokens/dist/tokens';
import type { ActionMeta, FormatOptionLabelMeta } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import { useHentEndretUtbetalingBegrunnelser } from './useHentEndretUtbetalingBegrunnelser';
import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import type { Begrunnelse } from '../../../typer/vedtak';
import type { OptionType } from '../../../typer/common';

interface IProps {
    // vilkårType: VilkårType;
    begrunnelse: Felt<Begrunnelse>;
    // regelverk?: Regelverk;
}

const GroupLabel = styled.div`
    color: black;
`;

const EndretUtbetalingAvslagBegrunnelseMultiselect: React.FC<IProps> = ({
    // vilkårType,
    begrunnelse,
    // regelverk,
}) => {
    const { vurderErLesevisning } = useBehandling();
    const { vedtaksbegrunnelseTekster } = useHentEndretUtbetalingBegrunnelser();

    // const { grupperteAvslagsbegrunnelser } = useAvslagBegrunnelseMultiselect(vilkårType, regelverk);

    const valgtBegrunnelse = undefined;

    const onChangeBegrunnelse = (action: ActionMeta<OptionType>) => {
        switch (action.action) {
            case 'select-option':
                if (action.option) {
                    begrunnelse.validerOgSettFelt(action.option.value as Begrunnelse);
                } else {
                    throw new Error('Klarer ikke legge til begrunnelse');
                }
                break;
            case 'pop-value':
            case 'remove-value':
                begrunnelse.validerOgSettFelt('');
                break;
            case 'clear':
                begrunnelse.validerOgSettFelt('');
                break;
            default:
                throw new Error('Ukjent action ved onChange på vedtakbegrunnelser');
        }
    };

    if (vedtaksbegrunnelseTekster.status === RessursStatus.FEILET) {
        return <Alert variant="error">Klarte ikke å hente inn begrunnelser for vilkår.</Alert>;
    }

    return (
        <FamilieReactSelect
            value={valgtBegrunnelse}
            label={'Velg standardtekst i brev'}
            creatable={false}
            placeholder={'Velg begrunnelse(r)'}
            erLesevisning={vurderErLesevisning()}
            isMulti={true}
            onChange={(_, action: ActionMeta<OptionType>) => {
                onChangeBegrunnelse(action);
            }}
            options={grupperteAvslagsbegrunnelser}
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
                    const begrunnelseType = finnBegrunnelseType(
                        vedtaksbegrunnelseTekster,
                        option.value as Begrunnelse
                    );
                    const begrunnelseTypeLabel =
                        begrunnelseTyper[begrunnelseType as BegrunnelseType];
                    return (
                        <BodyShort>
                            <b>{begrunnelseTypeLabel}</b>: {option.label}
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
                multiValue: provided => {
                    return {
                        ...provided,
                        backgroundColor: hentBakgrunnsfarge(BegrunnelseType.AVSLAG),
                        border: `1px solid ${hentBorderfarge(BegrunnelseType.AVSLAG)}`,
                        borderRadius: '0.5rem',
                    };
                },
                multiValueLabel: provided => ({
                    ...provided,
                    whiteSpace: 'pre-wrap',
                    textOverflow: 'hidden',
                    overflow: 'hidden',
                }),
                multiValueRemove: provided => ({
                    ...provided,
                    ':hover': {
                        backgroundColor: ASurfaceActionHover,
                        color: 'white',
                        borderRadius: '0 .4rem .4rem 0',
                    },
                }),
            }}
        />
    );
};

export default AvslagBegrunnelseMultiselect;
