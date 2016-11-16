/**
 * This is the PMT function such as used in Excel
 *
 * @param float rate
 * @param int nper
 * @param float pv
 * @param float fv
 * @param int type
 * @return float
 */
var PMT = function(rate = 0, nper = 0, pv = 0, fv = 0, type = 0) {
    nper = Math.round(nper);
    type = Math.round(type);
    if (type > 1) {
        type = 1;
    }
    if (rate > 0) {
        return (-fv - pv * Math.pow(1 + rate, nper)) / (1 + rate * type) /
            ((Math.pow(1 + rate, nper) - 1) / rate);
    } else {
        return (pv - fv) / nper;
    }
};

class Context {
    Constants:Object;
    Functions:Object;
    Variables:Object;

    constructor() {
        this.Constants = {
            pi: 3.1415926535897932384,
            phi: 1.6180339887498948482
        };

        this.Functions = {
            abs: Math.abs,
            acos: Math.acos,
            asin: Math.asin,
            atan: Math.atan,
            ceil: Math.ceil,
            cos: Math.cos,
            exp: Math.exp,
            floor: Math.floor,
            log: Math.log,
            pow: Math.pow,
            random: Math.random,
            sin: Math.sin,
            sqrt: Math.sqrt,
            tan: Math.tan,
            pmt: PMT
        };

        this.Variables = {};
    }
}

export = Context;