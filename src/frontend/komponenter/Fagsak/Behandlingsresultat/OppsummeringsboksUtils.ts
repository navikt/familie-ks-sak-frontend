export const hentBarnehageplassBeskrivelse = (antallTimer: number) => {
    switch (true) {
        case antallTimer === 0:
            return 'Ingen plass';
        case antallTimer < 9:
            return 'Under 9 timer';
        case antallTimer < 17:
            return 'Mellom 9 og 16 timer';
        case antallTimer < 25:
            return 'Mellom 17 og 24 timer';
        case antallTimer < 33:
            return 'Mellom 25 og 32 timer';
        default:
            return 'Over 33 timer';
    }
};
