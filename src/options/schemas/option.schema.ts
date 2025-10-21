import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OptionDocument = Option & Document;

@Schema({ timestamps: true })
export class Option {

    @Prop({ required: true })
    name: string;

}

export const OptionSchema = SchemaFactory.createForClass(Option);