import { useErLesevisning } from '@hooks/useErLesevisning';
import { useHentAlleBegrunnelser } from '@hooks/useHentAlleBegrunnelser';
import type { OptionType } from '@typer/common';
import type { Begrunnelse } from '@typer/vedtak';
import type { Regelverk, VilkårType } from '@typer/vilkår';

import { ErrorMessage, LocalAlert, Stack, UNSAFE_Combobox } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

import useAvslagBegrunnelseMultiselect from './useAvslagBegrunnelseMultiselect';

interface IProps {
    vilkårType: VilkårType;
    begrunnelser: Felt<Begrunnelse[]>;
    regelverk?: Regelverk;
}

const AvslagBegrunnelseMultiselect = ({ vilkårType, begrunnelser, regelverk }: IProps) => {
    const erLesevisning = useErLesevisning();

    const {
        data: alleBegrunnelser,
        isPending: hentAlleBegrunnelserIsPending,
        error: hentAlleBegrunnelserError,
    } = useHentAlleBegrunnelser();

    const { grupperteAvslagsbegrunnelser } = useAvslagBegrunnelseMultiselect(vilkårType, alleBegrunnelser, regelverk);

    const valgteBegrunnlser = begrunnelser
        ? begrunnelser.verdi.map((valgtBegrunnelse: Begrunnelse) => ({
              value: valgtBegrunnelse?.toString() ?? '',
              label:
                  grupperteAvslagsbegrunnelser.find(
                      (restVedtakBegrunnelseTilknyttetVilkår: OptionType) =>
                          restVedtakBegrunnelseTilknyttetVilkår.value === valgtBegrunnelse
                  )?.label ?? '',
          }))
        : [];

    const onChangeBegrunnelse = (option: string, isSelected: boolean) => {
        if (isSelected) {
            begrunnelser.validerOgSettFelt([...begrunnelser.verdi, option as Begrunnelse]);
        } else {
            begrunnelser.validerOgSettFelt(begrunnelser.verdi.filter(begrunnelse => begrunnelse !== option));
        }
    };

    if (hentAlleBegrunnelserError) {
        return (
            <LocalAlert status={'error'}>
                <LocalAlert.Header>
                    <LocalAlert.Title>En teknisk feil oppstod.</LocalAlert.Title>
                </LocalAlert.Header>
                <LocalAlert.Content>
                    <Stack direction={'column'} gap={'space-16'}>
                        Klarte ikke å hente inn avslag begrunnelser for vilkår.
                        <ErrorMessage>{hentAlleBegrunnelserError.message}</ErrorMessage>
                    </Stack>
                </LocalAlert.Content>
            </LocalAlert>
        );
    }

    return (
        <UNSAFE_Combobox
            selectedOptions={valgteBegrunnlser}
            label={'Velg standardtekst i brev'}
            placeholder={'Velg begrunnelse(r)'}
            readOnly={erLesevisning}
            isMultiSelect
            onToggleSelected={onChangeBegrunnelse}
            isLoading={hentAlleBegrunnelserIsPending}
            options={grupperteAvslagsbegrunnelser}
        />
    );
};

export default AvslagBegrunnelseMultiselect;
