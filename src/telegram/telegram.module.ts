import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramService } from './telegram.service';
import { Link } from 'src/link/link.entity';
import { LinkService } from 'src/link/link.service';

@Module({
  imports: [TypeOrmModule.forFeature([Link])],
  providers: [LinkService, TelegramService],
})
export class TelegramModule {}
