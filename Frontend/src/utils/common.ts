import { toast } from 'react-toastify';

export function isEmail(email: string) {
    var re = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/;
    return re.test(String(email).toLowerCase());
}

export function isNumber(number: string) {
    var re = /^[0-9]+$/;
    return re.test(number);
}

export function isAddress(address: string) {
    var re = /^0x[a-fA-F0-9]{40}$/;
    return re.test(address);
}

export function formatNumber(number: string) {
    if (Number(number) === 0) {
        return 0;
    }

    if (number === '-') {
        return '-';
    }

    if (parseFloat(number) - parseInt(number) === 0) {
        return formatNumberCurrent(parseInt(number));
    }

    let index = number.indexOf('.');
    if (index !== -1) {
        let result = number.slice(0, index).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        result += number.slice(index, number.length);
        return result;
    }

    let result = number.slice(index, 1).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    return result;
}

export function formatNumberCurrent(number: number) {
    let result = number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    return result;
}

export function toFixedCustom(num: number, fixed: number) {
    fixed = fixed || 0;
    fixed = Math.pow(10, fixed);
    return Math.floor(num * fixed) / fixed;
}

export function customNumber(number: number, decimal = 2) {
    if (isNaN(number)) {
        return '-';
    }

    if (Number(number) === 0 || number === undefined) {
        return 0;
    }

    parseFloatFixedNoRound(number, decimal);

    let result = toFixedCustom(number, decimal).toFixed(decimal);

    if (parseFloat(result) - parseInt(result) === 0) {
        return formatNumberCurrent(parseInt(result));
    }

    result = Number(result).toString();
    return formatNumber(result);
}

export function makeMeTwoDigits(value: number) {
    return (value < 10 ? "0" : "") + value;
}

export const parseFloatFixedNoRound = (value: number, decimals = 3) => {
    if (Number(value) === 0 || value === undefined || isNaN(value)) {
        return 0;
    }

    const number: string = `${value}e${decimals}`;
    const firstPart = value > 0 ? Math.floor(Number(number)) : Math.ceil(Number(number))
    const secondPart = `e-${decimals}`;
    let result: any = Number(`${firstPart}${secondPart}`);
    result = result.toFixed(decimals);

    if (parseFloat(result) - parseInt(result) === 0) {
        return formatNumberCurrent(parseInt(result));
    }

    return result;
}

export const parseFloatFixed = (value: number, number = 1) => {
    const data = parseFloat(value.toString()).toFixed(number);
    return Number(data);
};

export function truncateTxHash(str: string, n = 5) {
    let string = str.substring(n + 2, 66 - n);
    return str.replace(string, '...');
}

export function showToastMessage(message: string) {
    if (message === 'Not found') {
        return;
    }

    return toast.error(message);
}

export function truncateDecimals(number: number, digits = 3) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
}

export function truncateAddress(str: string, n = 15) {
    let string = str.substring(n + 2, 42 - n);
    return str.replace(string, '...');
}

export function formatAddress(address: string) {
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
}

export const validateUserName = (str: string) => {
    let isError = false;
    if (typeof str !== 'string') {
        isError = true;
    }

    // 4 to 18 Characters
    if (str.length < 4 || str.length > 18) {
        isError = true;
    }

    // A-Z (uppercase)
    if (str !== str.toUpperCase()) {
        isError = true;
    }

    // Cannot start with number
    if (!isNaN(Number(str.charAt(0)))) {
        isError = true;
    }

    // No special characters
    const regex = /^[A-Z0-9]+$/;
    if (!regex.test(str)) {
        isError = true;
    }

    // No space between characters
    if (str.indexOf(' ') !== -1) {
        isError = true;
    }

    return isError;
}