import { Test, TestingModule } from '@nestjs/testing';
import { UtilisateursController } from './utilisateurs.controller';
import { UtilisateursService } from './utilisateurs.service';

describe('UtilisateursController', () => {
  let controller: UtilisateursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UtilisateursController],
      providers: [UtilisateursService],
    }).compile();

    controller = module.get<UtilisateursController>(UtilisateursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
