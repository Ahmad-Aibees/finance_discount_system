class Condition {
    label;
    type;
    required;
    max;
    min;
    enumValues;
    errorMessage;

    constructor({label, type, required, max, enumValues, min, errorMessage}) {
        this.label = label;
        this.type = type;
        this.required = required;
        this.max = max;
        this.min = min;
        this.enumValues = enumValues;
        this.errorMessage = errorMessage || new FixedErrorMessage({});
    }

    validate(value) {
        if (!value) if (this.required) return [false, this.label];
        else {
            if (this.type) {
                let invalid;
                switch (this.type) {
                    case 'list':
                        if (typeof value !== 'object') invalid = false;
                        else value = value.length;
                        break;
                    default:
                        invalid = typeof value !== this.type;
                }
                if (invalid)
                    return [false, new Error(this.errorMessage.unacceptableValue || 'unacceptable-value')];
            }
            if (typeof this.max === 'number' && value > this.max)
                return [false, new Error(this.errorMessage.maxValueBreached || 'max-value-breached')];
            if (typeof this.min === 'number' && value < this.min)
                return [false, new Error(this.errorMessage.minValueBreached || 'min-value-breached')];
            if (this.enumValues && this.enumValues.length && this.enumValues.indexOf(value) === -1)
                return [false, new Error(this.errorMessage.unacceptableValue || 'unacceptable-value')];
        }
        return [true];
    }
}

class FixedErrorMessage {
    unacceptableValue;
    maxValueBreached;
    minValueBreached;

    constructor({unacceptableValue, maxValueBreached, minValueBreached}) {
        this.minValueBreached = minValueBreached;
        this.unacceptableValue = unacceptableValue;
        this.maxValueBreached = maxValueBreached;
    }
}

module.exports = {
    Condition: Condition,
    FixedErrorMessage: FixedErrorMessage
};
