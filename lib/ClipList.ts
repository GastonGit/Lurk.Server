export default class ClipList {
    private currentList: string[] = [];

    setList(list: string[]): void {
        this.currentList = [...list];
    }

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
