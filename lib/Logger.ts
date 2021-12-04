export default class Logger {
    public static special(
        poi: string,
        result: string,
        errorMessage: string,
    ): void {
        console.error(
            '\x1b[35m%s\x1b[0m',
            poi + ' :: ' + result + ' :: ' + errorMessage,
        );
    }

    public static error(
        poi: string,
        result: string,
        errorMessage: string,
    ): void {
        console.error(
            '\x1b[31m%s\x1b[0m',
            poi + ' :: ' + result + ' :: ' + errorMessage,
        );
    }

    public static info(poi: string, result: string): void {
        console.log('\x1b[34m%s\x1b[0m', poi + ' :: ' + result);
    }

    public static success(poi: string, result: string): void {
        console.log('\x1b[32m%s\x1b[0m', poi + ' :: SUCCESS :: ' + result);
    }

    public static failure(
        poi: string,
        result: string,
        errorMessage: string,
    ): void {
        console.error(
            '\x1b[33m%s\x1b[0m',
            poi + ':: FAILURE ::' + result + ' :: ' + errorMessage,
        );
    }
}
