import { Test, TestingModule } from '@nestjs/testing';
import { CampanhasController } from './campanhas.controller';

describe('CampanhasController', () => {
  let controller: CampanhasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampanhasController],
    }).compile();

    controller = module.get<CampanhasController>(CampanhasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
