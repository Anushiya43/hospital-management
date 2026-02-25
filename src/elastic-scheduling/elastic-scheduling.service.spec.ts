import { Test, TestingModule } from '@nestjs/testing';
import { ElasticSchedulingService } from './elastic-scheduling.service';

describe('ElasticSchedulingService', () => {
  let service: ElasticSchedulingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElasticSchedulingService],
    }).compile();

    service = module.get<ElasticSchedulingService>(ElasticSchedulingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
