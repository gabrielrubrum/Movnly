import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';

@Global()
@Module({
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule {}
