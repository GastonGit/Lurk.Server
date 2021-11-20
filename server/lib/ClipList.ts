export default class ClipList {
    private currentList: string[] = [];

    getList(): Array<string> {
        return this.currentList;
    }

    addClip(clip: string): void {
        this.currentList.push(clip);
    }

    removeClip(): void {
        this.currentList.shift();
    }
}
