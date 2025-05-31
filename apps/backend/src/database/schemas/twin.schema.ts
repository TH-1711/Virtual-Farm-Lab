import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Twin extends Document {
  @Prop({ required: true, unique: true })
  twinId: string;

  @Prop({ required: true })
  modelId: string;

  @Prop({ type: Object })
  properties: Record<string, any>;
}

export const TwinSchema = SchemaFactory.createForClass(Twin);
