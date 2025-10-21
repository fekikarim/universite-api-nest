import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Option as OptionSchemaClass, OptionDocument } from './schemas/option.schema';
import { Model, isValidObjectId } from 'mongoose';

@Injectable()
export class OptionsService { 
  
  constructor(
    @InjectModel(OptionSchemaClass.name) private optionModel: Model<OptionDocument>,
  ) {}

  async create(dto: CreateOptionDto) {
    const createdOption = new this.optionModel(dto);
    return createdOption.save();
  } 

  async findAll() {
    return this.optionModel.find().exec();
  }

  async findOne(id: string){
    if(!isValidObjectId(id)) throw new BadRequestException(`Invalid ID format: ${id}`);
    const o = await this.optionModel.findById(id).exec();
    if(!o) throw new NotFoundException(`Option ${id} not found`);
    return o;
  }

  async update(id: string, dto: UpdateOptionDto) {
    if(!isValidObjectId(id)) throw new BadRequestException(`Invalid ID format: ${id}`);
    const o = await this.optionModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if(!o) throw new NotFoundException(`Option ${id} not found`);
    return o;
  }

  async remove(id: string) {
    if(!isValidObjectId(id)) throw new BadRequestException(`Invalid ID format: ${id}`);
    const o = await this.optionModel.findByIdAndDelete(id).exec();
    if(!o) throw new NotFoundException(`Option ${id} not found`);
    return o;
  }

}