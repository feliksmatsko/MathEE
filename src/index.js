var MathEE = require('./js/evaluator');

if (typeof window !== 'undefined') {
    // In desktop environments, have a way
    // to restore the old value for `MathEE`
    window.MathEE = window.MathEE || MathEE;
} else {
    // In Node.JS environments
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = MathEE;
    } else {
        exports.MathEE = MathEE;
    }
}