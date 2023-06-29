class Condition {

    static EqualTo(a, b) {
        return a === b;
    }

    static EqualOrLesserThan(a, b) {
        return a <= b;
    }

    static LesserThan(a, b) {
        return a < b;
    }

    static EqualOrGreaterThan(a, b) {
        return a >= b;
    }

    static GreaterThan(a, b) {
        return a > b;
    }

}

export const MathConditions = {
    "equal-to" : (a, b) => a === b,
    "equal-or-less-than" : (a, b) => a <= b,
    "less-than" : (a, b) => a < b,
    "equal-or-greater-than" : (a, b) => a >= b,
    "greater-than" : (a, b) => a > b
}
