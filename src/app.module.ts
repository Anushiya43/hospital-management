import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloModule } from './hello/hello.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [HelloModule,PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
