export class UserData {
    email: string;
    id: string;
    isLoggedIn: boolean;
    name: string;
    profilePicture: string;

    constructor(obj?: any) {
        this.email = obj ? obj.email : "";
        this.id = obj ? obj.id : "";
        this.isLoggedIn = true;
        this.name = obj ? obj.name : "";
        this.profilePicture = obj ? obj.profilePicture : "";
    }

}