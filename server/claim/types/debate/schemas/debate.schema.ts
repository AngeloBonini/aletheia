import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Speech } from "../../speech/schemas/speech.schema";
import * as mongoose from "mongoose";

export type DebateDocument = Debate & mongoose.Document;

@Schema({ toObject: { virtuals: true }, toJSON: { virtuals: true } })
export class Debate {
    @Prop({
        default: "debate",
        required: true,
    })
    type: string;

    @Prop({ required: true })
    data_hash: string;

    @Prop({
        type: [
            {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: "Speech",
            },
        ],
    })
    content: Speech[];

    // TODO: move this to the prop object and formalize the claim specification
    @Prop({ type: Boolean, default: false, required: true })
    isLive: boolean;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

const DebateSchemaRaw = SchemaFactory.createForClass(Debate);
DebateSchemaRaw.pre("find", function () {
    this.populate("content");
});

export const DebateSchema = DebateSchemaRaw;
