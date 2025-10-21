import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UtilisateurDocument = Utilisateur & Document;

@Schema({ timestamps: true })
export class Utilisateur {

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    studentId: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    age: number;

    @Prop()
    avatar?: string;
}

export const UtilisateurSchema = SchemaFactory.createForClass(Utilisateur);