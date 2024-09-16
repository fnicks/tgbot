import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './link.entity';
import { LinkService } from './link.service';

@Module({
  imports: [TypeOrmModule.forFeature([Link])],
  providers: [LinkService],
})
export class LinkModule {}
