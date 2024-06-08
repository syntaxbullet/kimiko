enum terminalColors {
    reset = "\x1b[0m",
    fgBlack = "\x1b[30m",
    fgRed = "\x1b[31m",
    fgGreen = "\x1b[32m",
    fgYellow = "\x1b[33m",
    fgBlue = "\x1b[34m",
    fgMagenta = "\x1b[35m",
    fgCyan = "\x1b[36m",
    fgWhite = "\x1b[37m",
    bgBlack = "\x1b[40m",
    bgRed = "\x1b[41m",
    bgGreen = "\x1b[42m",
    bgYellow = "\x1b[43m",
    bgBlue = "\x1b[44m",
    bgMagenta = "\x1b[45m",
    bgCyan = "\x1b[46m",
    bgWhite = "\x1b[47m",
}

class KimikoLogger {
    static sendLog(sign: string, signFgColor: terminalColors, signBgColor: terminalColors, message: string) {
        console.log(`${signFgColor}${signBgColor}${sign}${terminalColors.reset} ${message}`);
    }
    public static info(message: string) {
        this.sendLog(' INFO ', terminalColors.fgWhite, terminalColors.bgBlue, message);
    }
    public static error(message: string) {
        this.sendLog(' ERROR ', terminalColors.fgWhite, terminalColors.bgRed, message);
    }
    public static warn(message: string) {
        this.sendLog(' WARN ', terminalColors.fgBlack, terminalColors.bgYellow, message);
    }
    public static debug(message: string) {
        this.sendLog(' DEBUG ', terminalColors.fgWhite, terminalColors.bgGreen, message);
    }
    public static trace(message: string) {
        this.sendLog(' TRACE ', terminalColors.fgWhite, terminalColors.bgMagenta, message);
    }
    public static fatal(message: string) {
        this.sendLog(' FATAL ', terminalColors.fgWhite, terminalColors.bgRed, message);
    }
    public static success(message: string) {
        this.sendLog(' SUCCESS ', terminalColors.fgWhite, terminalColors.bgGreen, message);
    }
    public static custom(sign: string, signFgColor: terminalColors, signBgColor: terminalColors, message: string) {
        this.sendLog(sign, signFgColor, signBgColor, message);
    }

}

export default KimikoLogger;