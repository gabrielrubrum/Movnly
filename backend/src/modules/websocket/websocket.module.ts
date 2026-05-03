import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './gateways/events.gateway';
import { ChatGateway } from './gateways/chat.gateway';

@Global()
@Module({
    providers: [EventsGateway, ChatGateway],
    exports: [EventsGateway, ChatGateway],
})
export class WebsocketModule { }
