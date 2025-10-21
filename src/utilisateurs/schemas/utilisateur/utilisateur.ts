import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UtilisateurDocument = Utilisateur & Document;

export enum Role {
    ADMIN = 'ADMIN',
    ETUDIANT = 'ETUDIANT',
}

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

    // prosit 3 attribute
    @Prop()
    avatar?: string;

    // timestamps will be added automatically (createdAt, updatedAt)

    // prosit 4 attribute
    @Prop({ required: true })
    password: string;

    @Prop({ type: String, enum: Role, default: Role.ETUDIANT })
    role: Role;

}

export const UtilisateurSchema = SchemaFactory.createForClass(Utilisateur);