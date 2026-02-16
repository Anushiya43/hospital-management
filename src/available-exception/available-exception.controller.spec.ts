import { Test, TestingModule } from '@nestjs/testing';
import { AvailableExceptionController } from './available-exception.controller';
import { AvailableExceptionService } from './available-exception.service';

describe('AvailableExceptionController', () => {
  let controller: AvailableExceptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailableExceptionController],
      providers: [AvailableExceptionService],
    }).compile();

    controller = module.get<AvailableExceptionController>(AvailableExceptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
