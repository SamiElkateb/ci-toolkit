const fs = require('fs');
const checkIsString = (val: unknown): val is string => {
    return typeof val === 'string';
};

const checkIsNumber = (val: unknown): val is number => {
    return typeof val === 'number' && !isNaN(val);
};

const checkIsBoolean = (val: unknown): val is boolean => {
    return typeof val === 'boolean';
};
const checkIsObject = (val: unknown): val is object => {
    return typeof val === 'object' && val !== null;
};

const checkIsStrictObject = (val: unknown): val is object => {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
};

const checkIsArray = (val: unknown): val is Array<unknown> => {
    return Array.isArray(val);
};

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
    obj: X,
    prop: Y
): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(prop);
}

export {
    checkIsBoolean,
    checkIsString,
    checkIsArray,
    checkIsObject,
    hasOwnProperty,
    checkIsNumber,
    checkIsStrictObject,
};
