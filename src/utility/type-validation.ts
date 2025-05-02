export const isString = (value: any): boolean => typeof value == "string";
export const isNumber = (value: any): boolean => typeof value == "number" && !isNaN(value);
export const isBigInt = (value: any): boolean => typeof value == "bigint";
export const isBoolean = (value: any): boolean => typeof value == 'boolean';

export const isArrayNumber = (array: any): boolean => Array.isArray(array) && array.every(item => isNumber(item));
export const isArrayString = (array: any): boolean =>  Array.isArray(array) && array.every(item => isString(item));

export const isFalsy = (value: any): boolean => {
    if(isString(value) && value.trim() == "") return true;

    return value === undefined || value === null;
};

export const hasSymbolsOrNumbers = (someString: string): boolean => {
    // Este metodo de regex sirve par apoder aceptar todas la letras que hay en el Español (A-z) (a-z) incluyendo la 'Ñ" y acentos.
    const regex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/g;
    if (!regex.test(someString)) return true;

    return false;
};