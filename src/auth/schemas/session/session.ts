import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true })
  jti: string; // JWT ID unique pour ce refresh token

  @Prop({ required: true })
  refreshTokenHash: string; // Hash bcrypt du refresh token

  @Prop({ required: true, index: true })
  expiresAt: Date; // Date d'expiration

  @Prop({ default: null })
  revokedAt: Date; // null = actif, Date = révoqué

  @Prop({ default: null })
  replacedBy: string; // jti du token qui l'a remplacé (rotation)

  @Prop()
  ip?: string; // IP du client (optionnel, sécurité)

  @Prop()
  userAgent?: string; // User-Agent (optionnel, sécurité)
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Index TTL: expire exactement à expiresAt
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });