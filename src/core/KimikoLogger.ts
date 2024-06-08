class KimikoLogger {
    public static log(message: string): void {
        console.log('\x1b[36m[LOG]\x1b[0m', message);
    }
    public static warn(message: string): void {
        console.warn('\x1b[33m[WARN]\x1b[0m', message);
    }
    public static error(message: string): void {
        console.error('\x1b[31m[ERROR]\x1b[0m', message);
    }
    public static debug(message: string): void {
        console.debug('\x1b[35m[DEBUG]\x1b[0m', message);
    }
    public static info(message: string): void {
        console.log('\x1b[32m[INFO]\x1b[0m', message);
    }
}

export default KimikoLogger;