import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './link.entity';
import { LINKS_LIST_PAGE_ELEMENTS } from 'src/helpers/consts';

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

  // Получение всех ссылок с пагинацией
  async getAllLinks(
    page: number = 1,
    limit: number = LINKS_LIST_PAGE_ELEMENTS,
  ): Promise<{ links: Link[]; total: number }> {
    const [links, total] = await this.linkRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    return { links, total };
  }

  async getLinkById(id: string): Promise<Link> {
    return this.linkRepository.findOne({ where: { id } });
  }

  async deleteLink(id: string): Promise<void> {
    await this.linkRepository.delete(id);
  }
}
