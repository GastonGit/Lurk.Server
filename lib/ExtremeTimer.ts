export default class ExtremeTimer {
    static async timeOut(ms: number): Promise<any> {
        return new Promise((res) => setTimeout(res, ms));
    }
}
