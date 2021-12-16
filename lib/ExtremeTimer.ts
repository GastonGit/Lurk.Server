export default class ExtremeTimer {
    static async timeOut(ms: number): Promise<void> {
        return new Promise((res) => setTimeout(res, ms));
    }
}
