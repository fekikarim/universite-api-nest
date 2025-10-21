import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { Utilisateur } from './entities/utilisateur.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UtilisateurDocument } from './schemas/utilisateur/utilisateur';
import { isValidObjectId, Model } from 'mongoose';

@Injectable()
export class UtilisateursService {
  
  constructor(
    @InjectModel(Utilisateur.name) private utilisateurModel: Model<UtilisateurDocument>,
  ) {}

  async create(dto: CreateUtilisateurDto) {
    const createdUtilisateur = new this.utilisateurModel(dto);
    return createdUtilisateur.save();
  }

  async findAll() {
    return this.utilisateurModel.find().exec();
  }

  async findOne(id: string){
    if(!isValidObjectId(id)) throw new BadRequestException(`Invalid ID format: ${id}`);
    const u = await this.utilisateurModel.findById(id).exec();
    if(!u) throw new NotFoundException(`Utilisateur ${id} not found`);
    return u;
  }

  async update(id: string, dto: UpdateUtilisateurDto) {
    if(!isValidObjectId(id)) throw new BadRequestException(`Invalid ID format: ${id}`);
    const u = await this.utilisateurModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if(!u) throw new NotFoundException(`Utilisateur ${id} not found`);
    return u;
  }

  async remove(id: string) {
    if(!isValidObjectId(id)) throw new BadRequestException(`Invalid ID format: ${id}`);
    const u = await this.utilisateurModel.findByIdAndDelete(id).exec();
    if(!u) throw new NotFoundException(`Utilisateur ${id} not found`);
    return u;
  }
  
}
