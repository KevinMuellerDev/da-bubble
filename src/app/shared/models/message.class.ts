export class MessageData {
    id: string;
    name: string;
    profilePicture: string;
    message: string;
    timestamp:number;
    emoji:[];

    constructor(obj?: any) {
        this.id = obj ? obj.id : "";
        this.name = obj ? obj.name : "";
        this.profilePicture = obj ? obj.profilePicture : "";
        this.message = obj ? obj.message : "";
        this.timestamp = Date.now()
        this.emoji = obj ? obj.emoji : []
    }

    public toJson(){
        return {
            id: this.id,
            name: this.name,
            profilePicture: this.profilePicture,
            message: this.message,
            timestamp: this.timestamp,
            emoji: this.emoji	
        };
    }



}