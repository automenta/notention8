
export interface Quantity {
    value: number;
    unit: string;
}

const UNIT_ALIASES: Record<string, string> = {
    // Currency
    '$': 'USD', 'dollar': 'USD', 'dollars': 'USD', 'usd': 'USD',
    '€': 'EUR', 'euro': 'EUR', 'euros': 'EUR', 'eur': 'EUR',
    '£': 'GBP', 'pound': 'GBP', 'pounds': 'GBP', 'gbp': 'GBP',
    'sats': 'sats', 'satoshis': 'sats', 'btc': 'BTC',

    // Distance
    'm': 'm', 'meter': 'm', 'meters': 'm',
    'km': 'km', 'kilometer': 'km', 'kilometers': 'km',
    'cm': 'cm', 'centimeter': 'cm', 'centimeters': 'cm',
    'mm': 'mm', 'millimeter': 'mm', 'millimeters': 'mm',
    'mi': 'mi', 'mile': 'mi', 'miles': 'mi',
    'ft': 'ft', 'foot': 'ft', 'feet': 'ft',
    'in': 'in', 'inch': 'in', 'inches': 'in',

    // Mass
    'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg',
    'g': 'g', 'gram': 'g', 'grams': 'g',
    'lb': 'lb', 'lbs': 'lb', 'pound': 'lb', 'pounds': 'lb',
    'oz': 'oz', 'ounce': 'oz', 'ounces': 'oz',

    // Time (Duration)
    's': 's', 'sec': 's', 'second': 's', 'seconds': 's',
    'min': 'min', 'minute': 'min', 'minutes': 'min',
    'h': 'h', 'hr': 'h', 'hour': 'h', 'hours': 'h',
    'd': 'd', 'day': 'd', 'days': 'd',
    'wk': 'wk', 'week': 'wk', 'weeks': 'wk',
    'mo': 'mo', 'month': 'mo', 'months': 'mo',
    'yr': 'yr', 'year': 'yr', 'years': 'yr',
};

// Conversions to base unit within category
// Categories: distance (m), mass (kg), time (s), currency (USD - strictly explicit rates only, maybe ignore for now due to fluctuation)
const CONVERSIONS: Record<string, number> = {
    // Distance (base: m)
    'm': 1,
    'km': 1000,
    'cm': 0.01,
    'mm': 0.001,
    'mi': 1609.34,
    'ft': 0.3048,
    'in': 0.0254,

    // Mass (base: kg)
    'kg': 1,
    'g': 0.001,
    'lb': 0.453592,
    'oz': 0.0283495,

    // Time (base: s)
    's': 1,
    'min': 60,
    'h': 3600,
    'd': 86400,
    'wk': 604800,
    'mo': 2629800, // approx 1 month (30.44 days)
    'yr': 31557600, // approx 1 year (365.25 days)
};

const CATEGORIES: Record<string, string> = {
    'm': 'distance', 'km': 'distance', 'cm': 'distance', 'mm': 'distance', 'mi': 'distance', 'ft': 'distance', 'in': 'distance',
    'kg': 'mass', 'g': 'mass', 'lb': 'mass', 'oz': 'mass',
    's': 'time', 'min': 'time', 'h': 'time', 'd': 'time', 'wk': 'time', 'mo': 'time', 'yr': 'time',
    'USD': 'currency', 'EUR': 'currency', 'GBP': 'currency', 'sats': 'currency', 'BTC': 'currency'
};

export const parseQuantity = (text: string): Quantity | null => {
    if (!text) return null;
    const clean = text.trim();

    // Regex to capture number part and unit part
    // Handles: "100 km", "100km", "$100", "100 USD", "100 USD/hr"

    // 1. Currency Symbol prefix: $100
    const prefixMatch = clean.match(/^([$€£])\s*([\d,\.]+)\s*(.*)$/);
    if (prefixMatch) {
        const symbol = prefixMatch[1];
        const valStr = prefixMatch[2].replace(/,/g, '');
        const suffix = prefixMatch[3] ? prefixMatch[3].trim() : ''; // could be "/hr"
        const val = parseFloat(valStr);
        if (isNaN(val)) return null;

        const baseUnit = normalizeUnit(symbol);
        if (suffix.startsWith('/')) {
             const rateUnit = normalizeUnit(suffix.slice(1));
             return { value: val, unit: `${baseUnit}/${rateUnit}` };
        }
        return { value: val, unit: baseUnit };
    }

    // 2. Suffix units: 100 km, 100 km/h
    const suffixMatch = clean.match(/^([\d,\.]+)\s*([a-zA-Z\/\$€£]+)$/);
    if (suffixMatch) {
        const valStr = suffixMatch[1].replace(/,/g, '');
        const rawUnit = suffixMatch[2];
        const val = parseFloat(valStr);
        if (isNaN(val)) return null;

        // Check for compound unit (e.g. km/h, USD/mo)
        if (rawUnit.includes('/')) {
            const [u1, u2] = rawUnit.split('/');
            const n1 = normalizeUnit(u1);
            const n2 = normalizeUnit(u2);
            return { value: val, unit: `${n1}/${n2}` };
        }

        return { value: val, unit: normalizeUnit(rawUnit) };
    }

    // 3. Just number
    const val = parseFloat(clean.replace(/,/g, ''));
    if (!isNaN(val) && isFinite(val) && String(val) === clean.replace(/,/g, '')) {
         return { value: val, unit: '' }; // Unitless
    }

    return null;
};

export const normalizeUnit = (u: string): string => {
    const clean = u.toLowerCase().trim();
    return UNIT_ALIASES[clean] || UNIT_ALIASES[u.trim()] || u.trim(); // Check lowercase alias, then raw
};

export const compareQuantities = (a: Quantity, b: Quantity): number | null => {
    // Returns 1 if a > b, -1 if a < b, 0 if equal, null if not comparable

    // 1. Identity
    if (a.unit === b.unit) {
        return a.value > b.value ? 1 : a.value < b.value ? -1 : 0;
    }

    // 2. Compound units (rate)
    // Only support if denominators match or are convertible AND numerators match or are convertible
    if (a.unit.includes('/') && b.unit.includes('/')) {
        const [aNum, aDen] = a.unit.split('/');
        const [bNum, bDen] = b.unit.split('/');

        // Simplify: Only convert if numerators are compatible and denominators are compatible
        // Strategy: Convert A to B's unit

        // Convert numerator A to numerator B
        const numFactor = getConversionFactor(aNum, bNum);
        // Convert denominator A to denominator B
        const denFactor = getConversionFactor(aDen, bDen);

        if (numFactor !== null && denFactor !== null) {
            // value = val * numFactor / denFactor
            // e.g. 100 km/h vs m/s
            // km -> m (1000)
            // h -> s (3600)
            // 100 * 1000 / 3600 = 27.7 m/s

            const convertedAValue = a.value * numFactor / denFactor;
            return convertedAValue > b.value ? 1 : convertedAValue < b.value ? -1 : 0;
        }
    } else if (!a.unit.includes('/') && !b.unit.includes('/')) {
        // Simple unit conversion
        const factor = getConversionFactor(a.unit, b.unit);
        if (factor !== null) {
            const convertedA = a.value * factor;
             return convertedA > b.value ? 1 : convertedA < b.value ? -1 : 0;
        }
    }

    return null; // Not comparable
};

const getConversionFactor = (from: string, to: string): number | null => {
    if (from === to) return 1;

    // Check categories
    const catA = CATEGORIES[from];
    const catB = CATEGORIES[to];

    // If currency (and different), we assume not convertible for now (unless we have rates, which we don't for USD->EUR)
    if (catA === 'currency' || catB === 'currency') return null;

    if (catA && catB && catA === catB) {
        const rateA = CONVERSIONS[from];
        const rateB = CONVERSIONS[to];
        if (rateA && rateB) {
            // Convert from A to Base, then Base to B
            // Value in Base = ValueA * rateA
            // Value in B = ValueBase / rateB
            return rateA / rateB;
        }
    }
    return null;
}
