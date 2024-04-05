import { BegrunnelseType } from '../../../typer/vedtak';
import type {
    IRestVedtaksbegrunnelse,
    IVedtaksperiodeMedBegrunnelser,
} from '../../../typer/vedtaksperiode';
import { Vedtaksperiodetype } from '../../../typer/vedtaksperiode';
import type { IsoDatoString } from '../../dato';

interface IMockVedtaksperiode {
    fom?: IsoDatoString;
    tom?: IsoDatoString;
    begrunnelser?: IRestVedtaksbegrunnelse[];
    eøsBegrunnelser?: IRestVedtaksbegrunnelse[];
}

const mockBegrunnelse = (): IRestVedtaksbegrunnelse => {
    return {
        begrunnelse: 'Test',
        begrunnelseType: BegrunnelseType.INNVILGET,
        støtterFritekst: false,
    };
};

const mockEøsBegrunnelse = (): IRestVedtaksbegrunnelse => {
    return {
        begrunnelse: 'Test',
        begrunnelseType: BegrunnelseType.EØS_INNVILGET,
        støtterFritekst: false,
    };
};

export const mockUtbetalingsperiode = ({
    fom = '2020-01-01',
    tom = '2020-02-28',
    begrunnelser = [mockBegrunnelse()],
    eøsBegrunnelser = [mockEøsBegrunnelse()],
}: IMockVedtaksperiode = {}): IVedtaksperiodeMedBegrunnelser => {
    return {
        id: 0,
        fom,
        tom,
        type: Vedtaksperiodetype.UTBETALING,
        begrunnelser,
        fritekster: [],
        gyldigeBegrunnelser: [],
        utbetalingsperiodeDetaljer: [],
        eøsBegrunnelser,
        støtterFritekst: false,
    };
};

export const mockOpphørsperiode = ({
    fom = '2020-03-01',
    tom = '',
    begrunnelser = [mockBegrunnelse()],
    eøsBegrunnelser = [mockEøsBegrunnelse()],
}: IMockVedtaksperiode = {}): IVedtaksperiodeMedBegrunnelser => {
    return {
        id: 0,
        fom,
        tom,
        type: Vedtaksperiodetype.OPPHØR,
        begrunnelser,
        fritekster: [],
        gyldigeBegrunnelser: [],
        utbetalingsperiodeDetaljer: [],
        eøsBegrunnelser,
        støtterFritekst: true,
    };
};

export const mockAvslagsperiode = ({
    fom = '2019-06-01',
    tom = '2019-06-30',
    begrunnelser = [mockBegrunnelse()],
    eøsBegrunnelser = [mockEøsBegrunnelse()],
}: IMockVedtaksperiode = {}): IVedtaksperiodeMedBegrunnelser => {
    return {
        id: 0,
        fom,
        tom,
        type: Vedtaksperiodetype.AVSLAG,
        begrunnelser,
        fritekster: [],
        gyldigeBegrunnelser: [],
        utbetalingsperiodeDetaljer: [],
        eøsBegrunnelser,
        støtterFritekst: true,
    };
};
