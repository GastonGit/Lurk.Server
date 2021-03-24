
module.exports = {
    ensureArgument: function(arg, type){
        if (typeof arg === "undefined"){
            throw new TypeError("Argument is undefined");
        }

        if (type === 'string'){
            if (typeof arg !== 'string'){
                throw new TypeError("Argument is not a string");
            }
        } else if(type === 'number'){
            if (typeof (parseInt(arg)) === 'number' && typeof arg !== 'number'){
                throw new TypeError("Argument is an unparsed number");
            }
            if (typeof (parseInt(arg)) !== 'number'){
                throw new TypeError("Argument is not a number");
            }
        } else if(type === 'boolean'){
            if (typeof arg === 'string' && (arg === 'true' || arg === 'false')){
                throw new TypeError("Argument is a string including a boolean");
            }
            if (typeof arg !== 'boolean'){
                throw new TypeError("Argument is not a boolean");
            }
        } else if(type === 'array'){
            if (typeof arg === 'string' && (arg.includes('[') && arg.includes(']'))){
                throw new TypeError("Argument is a string including an array");
            }
            if (!Array.isArray(arg)){
                throw new TypeError("Argument is not an array");
            }
        } else if(type === 'object'){
            if (typeof arg === 'string' && (arg.includes('{') && arg.includes('}'))){
                throw new TypeError("Argument is a string including an object");
            }
            if (typeof arg !== 'object' || Array.isArray(arg)){
                throw new TypeError("Argument is not an object");
            }
        }
    }
}