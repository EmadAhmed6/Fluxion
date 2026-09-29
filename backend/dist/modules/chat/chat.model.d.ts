import mongoose, { Types } from "mongoose";
interface IChat {
    sender: Types.ObjectId;
    recipient: Types.ObjectId;
    message: string;
    imageUrl: string;
    isDeleted: boolean;
    isRead: boolean;
    isEdited?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Chat: mongoose.Model<IChat, {}, {}, {}, mongoose.Document<unknown, {}, IChat, {}, mongoose.DefaultSchemaOptions> & IChat & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IChat>;
export default Chat;
//# sourceMappingURL=chat.model.d.ts.map