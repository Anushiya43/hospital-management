import { Test, TestingModule } from '@nestjs/testing';
import { ElasticSchedulingController } from './elastic-scheduling.controller';

describe('ElasticSchedulingController', () => {
  let controller: ElasticSchedulingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElasticSchedulingController],
    }).compile();

    controller = module.get<ElasticSchedulingController>(ElasticSchedulingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
