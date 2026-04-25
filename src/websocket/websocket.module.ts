import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatGateway } from './chat.gateway';

@Global()
@Module({
    providers: [EventsGateway, ChatGateway],
    exports: [EventsGateway, ChatGateway],
})
export class WebsocketModule { }
