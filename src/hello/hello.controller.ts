import { Controller, Get } from '@nestjs/common';
import { HelloService } from './hello.service';

@Controller('hello')
export class HelloController {
    constructor(private helloService:HelloService){}

    @Get()
    hello(){
        return this.helloService.hello()
    }
}
