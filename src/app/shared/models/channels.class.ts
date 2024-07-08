export class ChannelData {
    collection: string;
    description: string;
    title: string;
    users: string[];

    constructor(obj?: any) {
        this.collection = obj ? obj.collection : "";
        this.description = obj ? obj.description : "";
        this.title = obj ? obj.title : "";
        this.users = obj ? obj.users : [];
    }

    public setData(collection: string, description: string, title: string) {
        this.collection = collection;
        this.description = description;
        this.title = title;
        this.users = [];
    }

    public toJson() {
        return {
            collection: this.collection,
            description: this.description,
            title: this.title,
            users: this.users
        };
    }
}