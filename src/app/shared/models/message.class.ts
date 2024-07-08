export class MessageData {
    id: string;
    msgId: string;
    name: string;
    profilePicture: string;
    message: string;
    timestamp: number;
    email: string;
    emoji: [];

    constructor(obj?: any) {
        this.id = obj ? obj.id : "";
        this.name = obj ? obj.name : "";
        this.profilePicture = obj ? obj.profilePicture : "";
        this.message = obj ? obj.message : "";
        this.timestamp = Date.now();
        this.email = obj ? obj.email : ""
        this.emoji = obj ? obj.emoji : [];
        this.msgId = obj ? obj.msgId : "";
    }

    public toJson() {
        return {
            id: this.id,
            name: this.name,
            profilePicture: this.profilePicture,
            message: this.message,
            timestamp: this.timestamp,
            email: this.email,
            emoji: this.emoji,
            msgId: this.msgId
        };
    }
}