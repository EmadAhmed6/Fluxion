import mongoose, { Types } from "mongoose";
interface INotification extends Document {
    recipient: Types.ObjectId;
    sender: Types.ObjectId;
    type: "follow" | "comment" | "like" | "share" | "reply" | "like_comment" | "like_reply";
    post?: Types.ObjectId;
    comment?: Types.ObjectId;
    reply?: Types.ObjectId;
    isRead: boolean;
}
declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, INotification>;
export default Notification;
//# sourceMappingURL=notifications.model.d.ts.map