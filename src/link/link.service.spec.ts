import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { Link } from './link.entity';
import { LinkService } from './link.service';

describe('LinkService (Unit Test)', () => {
  let app: INestApplication;
  let linkService: LinkService;
  let linkRepository: Repository<Link>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Link],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Link]),
      ],
      providers: [LinkService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    linkService = moduleRef.get<LinkService>(LinkService);
    linkRepository = moduleRef.get<Repository<Link>>(getRepositoryToken(Link));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Очищаем таблицу перед каждым тестом
    await linkRepository.clear();
  });

  it('должен создать ссылку', async () => {
    const url = 'https://example.com';
    const internalName = 'Example';

    const link = await linkService.createLink(url, internalName);

    expect(link).toBeDefined();
    expect(link.url).toBe(url);
    expect(link.internalName).toBe(internalName);
    expect(link.id).toBeDefined();
  });

  it('должен вернуть список всех ссылок', async () => {
    await linkService.createLink('https://example1.com', 'Example 1');
    await linkService.createLink('https://example2.com', 'Example 2');

    const links = await linkService.getAllLinks();

    expect(links).toHaveLength(2);
    expect(links[0].url).toBe('https://example1.com');
    expect(links[1].url).toBe('https://example2.com');
  });

  it('должен получить ссылку по id', async () => {
    const createdLink = await linkService.createLink(
      'https://example.com',
      'Example',
    );

    const foundLink = await linkService.getLinkById(createdLink.id);

    expect(foundLink).toBeDefined();
    expect(foundLink.url).toBe('https://example.com');
  });

  it('должен удалить ссылку', async () => {
    const createdLink = await linkService.createLink(
      'https://example.com',
      'Example',
    );

    await linkService.deleteLink(createdLink.id);

    const foundLink = await linkService.getLinkById(createdLink.id);
    expect(foundLink).toBeNull(); // Ожидаем, что ссылка будет удалена
  });
});
