import { Test, TestingModule } from '@nestjs/testing';
import { AvailableExceptionService } from './available-exception.service';

describe('AvailableExceptionService', () => {
  let service: AvailableExceptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvailableExceptionService],
    }).compile();

    service = module.get<AvailableExceptionService>(AvailableExceptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
