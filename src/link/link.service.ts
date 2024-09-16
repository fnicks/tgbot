import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './link.entity';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
  ) {}

  async createLink(url: string, internalName: string): Promise<Link> {
    const link = this.linkRepository.create({ url, internalName });
    return this.linkRepository.save(link);
  }

  async getAllLinks(): Promise<Link[]> {
    return this.linkRepository.find();
  }

  async getLinkById(id: string): Promise<Link> {
    return this.linkRepository.findOne({ where: { id } });
  }

  async deleteLink(id: string): Promise<void> {
    await this.linkRepository.delete(id);
  }
}
