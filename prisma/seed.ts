/**
 * Single-file Prisma seed for HuLib.
 *
 * Run against a database whose schema matches `prisma/schema.prisma` exactly
 * (e.g. after `npx prisma migrate reset` or `npx prisma db push --force-reset`).
 * Do NOT run this against a database you care about — step 0 truncates every
 * table this script owns before reseeding, so it is safe to run repeatedly
 * from a clean slate but destructive on anything else.
 *
 * Usage:
 *   npx prisma db seed
 *   # or directly:
 *   npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts
 */
import {
  PrismaClient,
  TopicColor,
  TopicStatus,
  ReadingSessionStatus,
  chatStatus,
  EducationType,
  ModerationActionType,
  ModerationStatus,
  AppealStatus,
} from '@prisma/client';
import { fakerVI as faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Deterministic dataset: rerunning this file produces the same data.
faker.seed(20260824);

// ---------------------------------------------------------------------------
// Fixed lookup values (must match the TS enums the app code uses)
// ---------------------------------------------------------------------------

const GENDER = { male: 1, female: 2, other: 3 } as const;
const ROLE = { admin: 1, humanBook: 2, reader: 3, guest: 4 } as const;
const STATUS = { active: 1, inactive: 2, under_warning: 3 } as const;
const CHAT_TYPE = { txt: 1, img: 2 } as const;

// Plaintext password behind every seeded email/password login (bcrypt-hashed
// before insert). Google-auth libers have no password at all.
const SEED_PASSWORD = 'superSecret123@';

// From src/notifications/notification-type.enum.ts — keep in sync.
const NOTIFICATION_TYPES = [
  'sessionRequest',
  'sessionFinish',
  'account',
  'reviewStory',
  'publishStory',
  'rejectStory',
  'reactStory',
  'shareStory',
  'huberReported',
  'rejectHuber',
  'approveReadingSession',
  'rejectReadingSession',
  'cancelReadingSession',
  'missReadingSession',
  'huberWarning',
  'userAppeal',
  'appealResponse',
  'other',
] as const;

// PublishStatus is stored as an int on `story.publishStatus` (see .claude/rules/stories.md).
const PUBLISH_STATUS = {
  draft: 1,
  published: 2,
  deleted: 3,
  rejected: 4,
  pending: 5,
} as const;

const STICKER_NAMES = [
  'like',
  'confidence',
  'shocking',
  'slapping',
  'stop',
  'hug',
  'no',
  'chill',
  'surprised',
  'relaxed',
];

const TOPIC_NAMES = [
  { name: 'Mối quan hệ', color: TopicColor.yellow },
  { name: 'Du lịch & Khám phá', color: TopicColor.blue },
  { name: 'Sự nghiệp & Định hướng', color: TopicColor.primary },
  { name: 'Sức khoẻ tinh thần', color: TopicColor.lavender },
  { name: 'Gia đình', color: TopicColor.pink },
  { name: 'Phát triển bản thân', color: TopicColor.green },
  { name: 'Vượt qua nghịch cảnh', color: TopicColor.orange },
  { name: 'Tình bạn', color: TopicColor.yellow },
  { name: 'Tình yêu', color: TopicColor.pink },
  { name: 'Khám phá bản thân', color: TopicColor.lavender },
  { name: 'Sức khoẻ & Lối sống', color: TopicColor.green },
  { name: 'HuLib Khoảnh Khắc', color: TopicColor.blue },
];

// A small pool of hand-written stories so seeded content reads naturally
// instead of pure lorem-ipsum. Extra stories beyond this pool get a
// faker-generated title/abstract so counts can scale independently.
const STORY_POOL: { title: string; abstract: string }[] = [
  {
    title: 'Hành trình trở thành phiên bản tốt hơn của chính mình',
    abstract:
      'Có những giai đoạn mình sống chỉ để làm hài lòng người khác, quên mất bản thân thực sự muốn gì. ' +
      'Câu chuyện này là hành trình mình học cách lắng nghe chính mình, chấp nhận thất bại và đứng dậy sau mỗi lần vấp ngã.',
  },
  {
    title: 'Chuyến đi một mình đã thay đổi mình như thế nào',
    abstract:
      'Lần đầu tiên đi xa nhà một mình, mình vừa háo hức vừa lo sợ. Nhưng chính những bỡ ngỡ ban đầu ' +
      'lại dạy mình cách tự lập, cách tin vào bản thân và trân trọng những điều nhỏ bé trên đường đi.',
  },
  {
    title: 'Resilience — Nghệ thuật đứng dậy sau vấp ngã',
    abstract:
      'Năm ngoái là một năm đầy thử thách với mình. Nhưng nếu phải chọn một từ để mô tả hành trình đó, ' +
      'mình sẽ chọn "Resilience" — khả năng phục hồi và đứng dậy sau khó khăn.',
  },
  {
    title: 'Bài học từ lần thất bại đầu tiên',
    abstract:
      'Mình từng nghĩ thất bại là dấu chấm hết. Nhưng chính lần vấp ngã đầu tiên ấy lại là cánh cửa mở ra ' +
      'một cách nhìn khác về bản thân — kiên nhẫn hơn, tử tế hơn với chính mình.',
  },
  {
    title: 'Gia đình — nơi mình luôn có thể quay về',
    abstract:
      'Có những lúc mình mải mê chạy theo những mục tiêu xa vời mà quên mất giá trị của những bữa cơm gia đình. ' +
      'Câu chuyện nhỏ này là lời cảm ơn mình chưa từng nói ra.',
  },
  {
    title: 'Học cách yêu thương bản thân',
    abstract:
      'Thương mình trước rồi hãy thương người — nghe qua tưởng đơn giản nhưng không dễ thực hành. ' +
      'Đây là hành trình mình học cách tha thứ cho những khiếm khuyết của chính mình.',
  },
  {
    title: 'Người thầy đã thay đổi cách mình nhìn cuộc sống',
    abstract:
      'Không phải lúc nào những bài học quan trọng nhất cũng đến từ sách vở. Có một người thầy đã dạy mình ' +
      'rằng thất bại không đáng sợ bằng việc không dám thử.',
  },
  {
    title: 'Khi mình quyết định bước ra khỏi vùng an toàn',
    abstract:
      'Sống trong vùng an toàn khiến mình cảm thấy ổn định nhưng cũng dần đánh mất chính mình. ' +
      'Đây là câu chuyện về lần đầu tiên mình dám thử một điều hoàn toàn mới.',
  },
  {
    title: 'Tình bạn đi cùng năm tháng',
    abstract:
      'Có những người bạn không cần gặp thường xuyên nhưng mỗi lần gặp lại vẫn thân thuộc như chưa từng xa cách. ' +
      'Đây là câu chuyện về tình bạn đã đồng hành cùng mình qua nhiều giai đoạn cuộc đời.',
  },
  {
    title: 'Điều mình ước có ai đó nói với mình sớm hơn',
    abstract:
      'Nếu có thể quay lại vài năm trước, mình sẽ nói với bản thân rằng: chậm một chút cũng không sao, ' +
      'quan trọng là vẫn đang tiến về phía trước.',
  },
];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const pick = <T>(arr: readonly T[]): T => faker.helpers.arrayElement(arr);
const pickMany = <T>(arr: readonly T[], count: number): T[] =>
  faker.helpers.arrayElements(arr, Math.min(count, arr.length));
const randInt = (min: number, max: number) => faker.number.int({ min, max });
const maybe = <T>(value: T, probability = 0.5): T | undefined =>
  faker.datatype.boolean(probability) ? value : undefined;

const placeholderImage = (seed: string, w = 400, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const timeSlotLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

/** Vietnamese-flavoured full name that doesn't collide with real user emails. */
const seededEmail = (fullName: string, index: number) =>
  `${faker.helpers.slugify(fullName).toLowerCase()}${index}@hulib-seed.dev`;

// ---------------------------------------------------------------------------
// 0. Clean slate — delete in FK-safe (child -> parent) order.
// ---------------------------------------------------------------------------

async function cleanDatabase() {
  console.log('🧹 Cleaning existing data...');

  await prisma.appeal.deleteMany();
  await prisma.moderation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.huberFavorite.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.sticker.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationType.deleteMany();
  await prisma.message.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.readingSession.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.storyFavorite.deleteMany();
  await prisma.storyReview.deleteMany();
  await prisma.storyTopic.deleteMany();
  await prisma.story.deleteMany();
  await prisma.work.deleteMany();
  await prisma.education.deleteMany();
  await prisma.humanBooks.deleteMany();
  await prisma.humanBookTopic.deleteMany();
  await prisma.liberTopicOfInterest.deleteMany();
  await prisma.chatType.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.topics.deleteMany();
  await prisma.file.deleteMany();
  await prisma.role.deleteMany();
  await prisma.status.deleteMany();
  await prisma.gender.deleteMany();
}

// ---------------------------------------------------------------------------
// 1. Lookup tables
// ---------------------------------------------------------------------------

async function seedLookups() {
  console.log('🌱 Seeding lookup tables (gender/role/status/chatType)...');

  await prisma.gender.createMany({
    data: [
      { id: GENDER.male, name: 'Male' },
      { id: GENDER.female, name: 'Female' },
      { id: GENDER.other, name: 'Other' },
    ],
  });

  await prisma.role.createMany({
    data: [
      { id: ROLE.admin, name: 'Admin' },
      { id: ROLE.humanBook, name: 'Huber' },
      { id: ROLE.reader, name: 'Liber' },
      { id: ROLE.guest, name: 'Guest' },
    ],
  });

  await prisma.status.createMany({
    data: [
      { id: STATUS.active, name: 'Active' },
      { id: STATUS.inactive, name: 'Inactive' },
      { id: STATUS.under_warning, name: 'Under Warning' },
    ],
  });

  await prisma.chatType.createMany({
    data: [
      { id: CHAT_TYPE.txt, name: 'txt' },
      { id: CHAT_TYPE.img, name: 'img' },
    ],
  });

  await prisma.notificationType.createMany({
    data: NOTIFICATION_TYPES.map((name) => ({ name })),
  });

  await prisma.sticker.createMany({
    data: STICKER_NAMES.map((name) => ({ name, category: 'default' })),
  });
}

async function seedFiles(count: number) {
  console.log(`🌱 Seeding ${count} placeholder files...`);
  const data = Array.from({ length: count }, (_, i) => ({
    path: placeholderImage(`hulib-${i}`),
  }));
  await prisma.file.createMany({ data });
  return prisma.file.findMany();
}

async function seedTopics() {
  console.log(`🌱 Seeding ${TOPIC_NAMES.length} topics...`);
  await prisma.topics.createMany({
    data: TOPIC_NAMES.map(({ name, color }) => ({
      name,
      color,
      status: TopicStatus.active,
    })),
  });
  return prisma.topics.findMany();
}

// ---------------------------------------------------------------------------
// 2. Users
// ---------------------------------------------------------------------------

type SeededUser = Awaited<ReturnType<typeof prisma.user.create>>;

async function seedUsers(files: { id: string }[]) {
  console.log('🌱 Seeding users...');

  const salt = await bcrypt.genSalt();
  const password = await bcrypt.hash(SEED_PASSWORD, salt);

  const admin = await prisma.user.create({
    data: {
      fullName: 'Super Admin',
      email: 'admin@hulib-seed.dev',
      password,
      provider: 'email',
      roleId: ROLE.admin,
      statusId: STATUS.active,
      approval: 'Not requested',
      genderId: GENDER.other,
      photoId: pick(files).id,
    },
  });

  const hubers: SeededUser[] = [];
  const HUBER_COUNT = 14;
  for (let i = 0; i < HUBER_COUNT; i++) {
    const fullName = faker.person.fullName();
    const huberSince = faker.date.past({ years: 1 });
    const banned = i === HUBER_COUNT - 1; // one banned huber for moderation seed data
    const warned = i === HUBER_COUNT - 2; // one warned huber

    const huber = await prisma.user.create({
      data: {
        fullName,
        email: seededEmail(fullName, i),
        password,
        provider: 'email',
        roleId: ROLE.humanBook,
        statusId: banned
          ? STATUS.inactive
          : warned
            ? STATUS.under_warning
            : STATUS.active,
        approval: 'Approved',
        genderId: pick(Object.values(GENDER)),
        huberSince,
        warnCount: warned ? randInt(1, 3) : 0,
        bio: faker.lorem.sentences(2),
        videoUrl: maybe(faker.internet.url(), 0.4),
        address: maybe(faker.location.city(), 0.6),
        phoneNumber: maybe(faker.phone.number(), 0.5),
        photoId: pick(files).id,
        coverImageId: maybe(pick(files).id, 0.7),
        hasSeenHuberOnboarding: true,
      },
    });
    hubers.push(huber);
  }

  // Libers who have an in-flight request to become a Huber (role stays
  // `reader` until an Admin approves it — see .claude/rules/users.md).
  const pendingHuberRequests: SeededUser[] = [];
  for (let i = 0; i < 3; i++) {
    const fullName = faker.person.fullName();
    const user = await prisma.user.create({
      data: {
        fullName,
        email: seededEmail(fullName, 100 + i),
        password,
        provider: 'email',
        roleId: ROLE.reader,
        statusId: STATUS.active,
        approval: 'Pending',
        genderId: pick(Object.values(GENDER)),
        bio: faker.lorem.sentence(),
        photoId: pick(files).id,
      },
    });
    pendingHuberRequests.push(user);
  }

  const libers: SeededUser[] = [];
  const LIBER_COUNT = 40;
  for (let i = 0; i < LIBER_COUNT; i++) {
    const fullName = faker.person.fullName();
    const isGoogleAuth = faker.datatype.boolean(0.3);

    const liber = await prisma.user.create({
      data: {
        fullName,
        email: seededEmail(fullName, 200 + i),
        password: isGoogleAuth ? null : password,
        provider: isGoogleAuth ? 'google' : 'email',
        socialId: isGoogleAuth ? faker.string.numeric(21) : null,
        roleId: ROLE.reader,
        statusId: STATUS.active,
        approval: 'Not requested',
        genderId: maybe(pick(Object.values(GENDER)), 0.7),
        birthday: maybe(
          faker.date
            .birthdate({ min: 16, max: 45, mode: 'age' })
            .toISOString()
            .slice(0, 10),
          0.5,
        ),
        photoId: maybe(pick(files).id, 0.6),
      },
    });
    libers.push(liber);
  }

  console.log(
    `✅ Created 1 admin, ${hubers.length} hubers, ${pendingHuberRequests.length} pending-huber libers, ${libers.length} libers`,
  );

  return { admin, hubers, pendingHuberRequests, libers };
}

async function seedTopicInterests(
  hubers: SeededUser[],
  libers: SeededUser[],
  topics: { id: number }[],
) {
  console.log('🌱 Seeding topic relations...');

  for (const huber of hubers) {
    const chosen = pickMany(topics, randInt(1, 3));
    await prisma.humanBookTopic.createMany({
      data: chosen.map((t) => ({ userId: huber.id, topicId: t.id })),
      skipDuplicates: true,
    });
  }

  for (const liber of libers) {
    const chosen = pickMany(topics, randInt(1, 4));
    await prisma.liberTopicOfInterest.createMany({
      data: chosen.map((t) => ({ userId: liber.id, topicId: t.id })),
      skipDuplicates: true,
    });
  }
}

async function seedEducationAndWork(hubers: SeededUser[]) {
  console.log('🌱 Seeding education/work history...');

  const majors = [
    'Công nghệ thông tin',
    'Quản trị kinh doanh',
    'Tâm lý học',
    'Ngôn ngữ Anh',
    'Y khoa',
    'Kinh tế đối ngoại',
  ];
  const institutions = [
    'Đại học Bách Khoa TP.HCM',
    'Đại học Kinh tế TP.HCM',
    'Đại học Khoa học Xã hội và Nhân văn',
    'Đại học Ngoại thương',
    'RMIT Việt Nam',
  ];
  const companies = [
    'FPT Software',
    'Tiki',
    'VNG Corporation',
    'Momo',
    'Shopee Vietnam',
    'Grab Vietnam',
  ];
  const positions = [
    'Software Engineer',
    'Product Manager',
    'UX Designer',
    'Data Analyst',
    'Marketing Executive',
  ];

  for (const huber of hubers) {
    if (faker.datatype.boolean(0.7)) {
      const startedAt = faker.date.past({ years: 6 });
      const stillOngoing = faker.datatype.boolean(0.4);
      await prisma.education.create({
        data: {
          major: pick(majors),
          institution: pick(institutions),
          startedAt,
          endedAt: stillOngoing
            ? null
            : faker.date.between({ from: startedAt, to: new Date() }),
          huberId: huber.id,
          type: pick(Object.values(EducationType)),
          isPublic: faker.datatype.boolean(0.7),
        },
      });
    }

    if (faker.datatype.boolean(0.6)) {
      const startedAt = faker.date.past({ years: 4 });
      const stillOngoing = faker.datatype.boolean(0.5);
      await prisma.work.create({
        data: {
          position: pick(positions),
          company: pick(companies),
          startedAt,
          endedAt: stillOngoing
            ? null
            : faker.date.between({ from: startedAt, to: new Date() }),
          huberId: huber.id,
        },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Stories
// ---------------------------------------------------------------------------

async function seedStories(
  hubers: SeededUser[],
  topics: { id: number }[],
  files: { id: string }[],
) {
  console.log('🌱 Seeding stories...');

  const stories: Awaited<ReturnType<typeof prisma.story.create>>[] = [];

  for (const huber of hubers) {
    const storyCount = randInt(1, 3);
    for (let i = 0; i < storyCount; i++) {
      const fromPool = faker.datatype.boolean(0.7);
      const { title, abstract } = fromPool
        ? pick(STORY_POOL)
        : {
            title: faker.lorem.sentence({ min: 4, max: 9 }),
            abstract: faker.lorem.paragraphs(3, '\n\n'),
          };

      // Bias toward "published" so browsing/listing has real content to show,
      // but keep some in the admin review queue and a couple rejected/draft.
      const publishStatus = faker.helpers.weightedArrayElement([
        { value: PUBLISH_STATUS.published, weight: 6 },
        { value: PUBLISH_STATUS.pending, weight: 2 },
        { value: PUBLISH_STATUS.draft, weight: 1 },
        { value: PUBLISH_STATUS.rejected, weight: 1 },
      ]);

      const story = await prisma.story.create({
        data: {
          title: `${title}${i > 0 ? ` (${i + 1})` : ''}`,
          abstract,
          humanBookId: huber.id,
          coverId: maybe(pick(files).id, 0.6),
          publishStatus,
          viewCount: randInt(0, 500),
          shareCount: randInt(0, 30),
          likeCount: randInt(0, 80),
          rejectionReason:
            publishStatus === PUBLISH_STATUS.rejected
              ? 'Nội dung chưa đáp ứng tiêu chuẩn kiểm duyệt, vui lòng chỉnh sửa và gửi lại.'
              : null,
          createdAt: faker.date.past({ years: 1 }),
          topics: {
            create: pickMany(topics, randInt(1, 3)).map((t) => ({
              topicId: t.id,
            })),
          },
        },
      });
      stories.push(story);
    }
  }

  console.log(`✅ Created ${stories.length} stories`);
  return stories;
}

async function seedStoryFavoritesAndReviews(
  stories: Awaited<ReturnType<typeof prisma.story.create>>[],
  libers: SeededUser[],
) {
  console.log('🌱 Seeding story favorites/reviews...');

  const publishedStories = stories.filter(
    (s) => s.publishStatus === PUBLISH_STATUS.published,
  );

  const reviewComments = [
    'Câu chuyện rất truyền cảm hứng, cảm ơn bạn đã chia sẻ!',
    'Mình đọc mà thấy đồng cảm quá, cảm ơn vì đã dũng cảm chia sẻ.',
    'Bài viết ý nghĩa, giúp mình nhìn nhận lại nhiều điều.',
    'Cảm ơn tác giả, câu chuyện thật sự chạm đến trái tim mình.',
    'Rất hay và chân thực, mong bạn viết thêm nhiều câu chuyện nữa.',
    'Mình đã khóc khi đọc đến đoạn cuối, cảm ơn bạn rất nhiều.',
  ];

  for (const story of publishedStories) {
    const favoriters = pickMany(
      libers.filter((l) => l.id !== story.humanBookId),
      randInt(0, 6),
    );
    if (favoriters.length) {
      await prisma.storyFavorite.createMany({
        data: favoriters.map((l) => ({ userId: l.id, storyId: story.id })),
        skipDuplicates: true,
      });
    }

    const reviewers = pickMany(
      libers.filter((l) => l.id !== story.humanBookId),
      randInt(0, 4),
    );
    for (const reviewer of reviewers) {
      await prisma.storyReview.create({
        data: {
          rating: randInt(3, 5),
          title: '',
          comment: pick(reviewComments),
          userId: reviewer.id,
          storyId: story.id,
          createdAt: faker.date.recent({ days: 120 }),
        },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Time slots + reading sessions + messages + feedback
// ---------------------------------------------------------------------------

async function seedTimeSlots(hubers: SeededUser[]) {
  console.log('🌱 Seeding time slots...');

  for (const huber of hubers) {
    const days = pickMany([0, 1, 2, 3, 4, 5, 6], randInt(2, 5));
    for (const dayOfWeek of days) {
      await prisma.timeSlot.create({
        data: {
          huberId: huber.id,
          dayOfWeek,
          startTime: timeSlotLabel(pick([8, 9, 14, 15, 19, 20])),
        },
      });
    }
  }
}

async function seedReadingSessions(
  hubers: SeededUser[],
  libers: SeededUser[],
  stories: Awaited<ReturnType<typeof prisma.story.create>>[],
) {
  console.log('🌱 Seeding reading sessions...');

  const storiesByHuber = new Map<number, typeof stories>();
  for (const story of stories) {
    const list = storiesByHuber.get(story.humanBookId) ?? [];
    list.push(story);
    storiesByHuber.set(story.humanBookId, list);
  }

  const sessions: Awaited<ReturnType<typeof prisma.readingSession.create>>[] =
    [];
  const SESSION_COUNT = 30;

  for (let i = 0; i < SESSION_COUNT; i++) {
    const huber = pick(hubers);
    const huberStories = storiesByHuber.get(huber.id);
    if (!huberStories?.length) continue;

    const reader = pick(libers);
    const story = pick(huberStories);
    const status = pick(Object.values(ReadingSessionStatus));

    const startedAt = faker.date.soon({
      days: 30,
      refDate: faker.date.recent({ days: 30 }),
    });
    const endedAt = new Date(startedAt.getTime() + 45 * 60 * 1000);

    const session = await prisma.readingSession.create({
      data: {
        humanBookId: huber.id,
        readerId: reader.id,
        storyId: story.id,
        note: maybe(faker.lorem.sentence(), 0.5),
        sessionUrl: `https://meet.hulib.dev/${faker.string.alphanumeric(10)}`,
        recordingUrl:
          status === ReadingSessionStatus.finished
            ? `https://cdn.hulib.dev/recordings/${faker.string.uuid()}.mp4`
            : null,
        sessionStatus: status,
        preRating: status === ReadingSessionStatus.finished ? randInt(1, 5) : 0,
        rating: status === ReadingSessionStatus.finished ? randInt(3, 5) : 0,
        rejectReason:
          status === ReadingSessionStatus.rejected
            ? 'Huber không sắp xếp được lịch trong khung giờ này.'
            : null,
        startedAt,
        startTime: startedAt.toLocaleTimeString('en-US'),
        endedAt,
        endTime: endedAt.toLocaleTimeString('en-US'),
        createdAt: faker.date.past({ years: 0.5 }),
      },
    });
    sessions.push(session);
  }

  console.log(`✅ Created ${sessions.length} reading sessions`);
  return sessions;
}

async function seedMessagesAndFeedback(
  sessions: Awaited<ReturnType<typeof prisma.readingSession.create>>[],
) {
  console.log('🌱 Seeding session messages/feedback...');

  const chatLines = [
    'Chào bạn, mình đã sẵn sàng cho buổi đọc rồi!',
    'Cảm ơn bạn đã dành thời gian, rất mong được nghe câu chuyện của bạn.',
    'Mình có thể hỏi thêm về đoạn bạn vừa chia sẻ không?',
    'Câu chuyện của bạn thực sự truyền cảm hứng cho mình.',
    'Cảm ơn buổi trò chuyện hôm nay, hẹn gặp lại bạn!',
  ];

  let messageTotal = 0;
  let feedbackTotal = 0;

  for (const session of sessions) {
    if (
      session.sessionStatus === ReadingSessionStatus.finished ||
      session.sessionStatus === ReadingSessionStatus.approved
    ) {
      const messageCount = randInt(2, 6);
      for (let i = 0; i < messageCount; i++) {
        await prisma.message.create({
          data: {
            readingSessionId: session.id,
            humanBookId: session.humanBookId,
            readerId: session.readerId,
            content: pick(chatLines),
            createdAt: faker.date.recent({ days: 30 }),
          },
        });
        messageTotal++;
      }
    }

    if (session.sessionStatus === ReadingSessionStatus.finished) {
      await prisma.feedback.create({
        data: {
          feedbackById: session.readerId,
          feedbackToId: session.humanBookId,
          rating: randInt(3, 5),
          content: maybe(
            'Buổi đọc rất bổ ích, Huber chia sẻ nhiệt tình và chân thành.',
            0.6,
          ),
          createdAt: session.endedAt,
        },
      });
      feedbackTotal++;
    }
  }

  console.log(
    `✅ Created ${messageTotal} messages, ${feedbackTotal} feedback entries`,
  );
}

// ---------------------------------------------------------------------------
// 5. Notifications
// ---------------------------------------------------------------------------

async function seedNotifications(
  admin: SeededUser,
  hubers: SeededUser[],
  libers: SeededUser[],
  stories: Awaited<ReturnType<typeof prisma.story.create>>[],
  sessions: Awaited<ReturnType<typeof prisma.readingSession.create>>[],
) {
  console.log('🌱 Seeding notifications...');

  const notifications: {
    recipientId: number;
    senderId: number;
    typeId: number;
    relatedEntityId?: number;
    extraNote?: string;
    seen?: boolean;
  }[] = [];

  const typeIdByName = new Map(
    (await prisma.notificationType.findMany()).map((t) => [t.name, t.id]),
  );
  const typeId = (name: (typeof NOTIFICATION_TYPES)[number]) =>
    typeIdByName.get(name)!;

  for (const story of pickMany(stories, Math.min(15, stories.length))) {
    if (story.publishStatus === PUBLISH_STATUS.pending) {
      notifications.push({
        recipientId: admin.id,
        senderId: story.humanBookId,
        typeId: typeId('publishStory'),
        relatedEntityId: story.id,
      });
    } else if (story.publishStatus === PUBLISH_STATUS.published) {
      notifications.push({
        recipientId: story.humanBookId,
        senderId: admin.id,
        typeId: typeId('publishStory'),
        relatedEntityId: story.id,
      });
    } else if (story.publishStatus === PUBLISH_STATUS.rejected) {
      notifications.push({
        recipientId: story.humanBookId,
        senderId: admin.id,
        typeId: typeId('rejectStory'),
        relatedEntityId: story.id,
        extraNote: story.rejectionReason ?? undefined,
      });
    }

    const liker = pick(libers);
    notifications.push({
      recipientId: story.humanBookId,
      senderId: liker.id,
      typeId: typeId('reactStory'),
      relatedEntityId: story.id,
    });
  }

  for (const session of pickMany(sessions, Math.min(15, sessions.length))) {
    notifications.push({
      recipientId: session.humanBookId,
      senderId: session.readerId,
      typeId: typeId('sessionRequest'),
      relatedEntityId: session.id,
    });

    if (session.sessionStatus === ReadingSessionStatus.approved) {
      notifications.push({
        recipientId: session.readerId,
        senderId: session.humanBookId,
        typeId: typeId('approveReadingSession'),
        relatedEntityId: session.id,
      });
    } else if (session.sessionStatus === ReadingSessionStatus.rejected) {
      notifications.push({
        recipientId: session.readerId,
        senderId: session.humanBookId,
        typeId: typeId('rejectReadingSession'),
        relatedEntityId: session.id,
      });
    } else if (session.sessionStatus === ReadingSessionStatus.finished) {
      notifications.push({
        recipientId: session.readerId,
        senderId: session.humanBookId,
        typeId: typeId('sessionFinish'),
        relatedEntityId: session.id,
      });
    }
  }

  // `account`/`rejectHuber` carry no related entity (see .claude/rules/notifications.md).
  for (const huber of pickMany(hubers, 4)) {
    notifications.push({
      recipientId: huber.id,
      senderId: admin.id,
      typeId: typeId('account'),
    });
  }

  await prisma.notification.createMany({
    data: notifications.map((n) => ({
      ...n,
      seen: faker.datatype.boolean(0.4),
      createdAt: faker.date.recent({ days: 60 }),
    })),
  });

  console.log(`✅ Created ${notifications.length} notifications`);
}

// ---------------------------------------------------------------------------
// 6. Chat
// ---------------------------------------------------------------------------

async function seedChats(hubers: SeededUser[], libers: SeededUser[]) {
  console.log('🌱 Seeding chats...');

  const chatLines = [
    'Chào bạn, mình là {name}!',
    'Rất vui được kết nối với bạn trên HuLib.',
    'Bạn có thể chia sẻ thêm về chủ đề này không?',
    'Cảm ơn bạn đã phản hồi nhé.',
    'Mình sẽ đặt lịch đọc sớm với bạn.',
  ];

  let chatCount = 0;
  const pairs = pickMany(libers, 15).map(
    (liber) => [liber, pick(hubers)] as const,
  );

  for (const [liber, huber] of pairs) {
    const messageCount = randInt(2, 8);
    for (let i = 0; i < messageCount; i++) {
      const senderIsLiber = i % 2 === 0;
      await prisma.chat.create({
        data: {
          senderId: senderIsLiber ? liber.id : huber.id,
          recipientId: senderIsLiber ? huber.id : liber.id,
          message: pick(chatLines).replace(
            '{name}',
            senderIsLiber
              ? (liber.fullName ?? 'bạn')
              : (huber.fullName ?? 'bạn'),
          ),
          status: i === messageCount - 1 ? chatStatus.sent : chatStatus.read,
          chatTypeId: CHAT_TYPE.txt,
          createdAt: faker.date.recent({ days: 20 }),
        },
      });
      chatCount++;
    }
  }

  console.log(`✅ Created ${chatCount} chat messages`);
}

// ---------------------------------------------------------------------------
// 7. Reports, moderation, appeals, huber favorites
// ---------------------------------------------------------------------------

async function seedModerationAndFavorites(
  admin: SeededUser,
  hubers: SeededUser[],
  libers: SeededUser[],
) {
  console.log('🌱 Seeding reports/moderation/appeals/favorites...');

  const reportReasons = [
    'Nội dung không phù hợp',
    'Spam / quảng cáo',
    'Thông tin sai sự thật',
    'Quấy rối người dùng khác',
  ];

  const bannedHuber = hubers[hubers.length - 1];
  const warnedHuber = hubers[hubers.length - 2];

  const reports: Awaited<ReturnType<typeof prisma.report.create>>[] = [];
  for (const huber of [bannedHuber, warnedHuber]) {
    const reporter = pick(libers);
    const report = await prisma.report.create({
      data: {
        reason: pick(reportReasons),
        reporterId: reporter.id,
        reportedUserId: huber.id,
        markAsResolved: true,
      },
    });
    reports.push(report);
  }

  const banModeration = await prisma.moderation.create({
    data: {
      actionType: ModerationActionType.ban,
      status: ModerationStatus.active,
      userId: bannedHuber.id,
      reportId: reports[0]?.id,
      manualReason: 'Vi phạm nhiều lần điều khoản cộng đồng.',
    },
  });

  await prisma.moderation.create({
    data: {
      actionType: ModerationActionType.warn,
      status: ModerationStatus.active,
      userId: warnedHuber.id,
      reportId: reports[1]?.id,
      manualReason: 'Nội dung câu chuyện có yếu tố nhạy cảm, đã nhắc nhở.',
    },
  });

  await prisma.appeal.create({
    data: {
      moderationId: banModeration.id,
      userId: bannedHuber.id,
      message:
        'Em xin lỗi vì vi phạm, mong Admin xem xét lại và cho em cơ hội khắc phục.',
      status: AppealStatus.pending,
    },
  });

  // Random "favorite huber" relations.
  let favoriteCount = 0;
  for (const liber of pickMany(libers, 20)) {
    const favoriteHubers = pickMany(
      hubers.filter((h) => h.id !== bannedHuber.id),
      randInt(1, 3),
    );
    if (favoriteHubers.length) {
      await prisma.huberFavorite.createMany({
        data: favoriteHubers.map((h) => ({ userId: liber.id, huberId: h.id })),
        skipDuplicates: true,
      });
      favoriteCount += favoriteHubers.length;
    }
  }

  console.log(
    `✅ Created ${reports.length} reports, 2 moderation actions, 1 appeal, ${favoriteCount} huber favorites`,
  );

  void admin; // admin kept for symmetry/future notifications, not otherwise referenced here
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  await cleanDatabase();
  await seedLookups();

  const files = await seedFiles(30);
  const topics = await seedTopics();

  const { admin, hubers, pendingHuberRequests, libers } =
    await seedUsers(files);
  const allLibersIncludingPending = [...libers, ...pendingHuberRequests];

  await seedTopicInterests(hubers, allLibersIncludingPending, topics);
  await seedEducationAndWork(hubers);

  const stories = await seedStories(hubers, topics, files);
  await seedStoryFavoritesAndReviews(stories, allLibersIncludingPending);

  await seedTimeSlots(hubers);
  const sessions = await seedReadingSessions(
    hubers,
    allLibersIncludingPending,
    stories,
  );
  await seedMessagesAndFeedback(sessions);

  await seedNotifications(
    admin,
    hubers,
    allLibersIncludingPending,
    stories,
    sessions,
  );
  await seedChats(hubers, allLibersIncludingPending);
  await seedModerationAndFavorites(admin, hubers, allLibersIncludingPending);

  const emailLoginHubers = hubers.filter((u) => u.provider === 'email');
  const emailLoginLibers = allLibersIncludingPending.filter(
    (u) => u.provider === 'email',
  );

  console.log('🎉 Seed complete.');
  console.log(`\n   Password for every account below: ${SEED_PASSWORD}\n`);
  console.log(`   Admin       : ${admin.email}`);
  console.log('   Hubers      :');
  for (const u of pickMany(emailLoginHubers, 5)) {
    console.log(`     - ${u.email}`);
  }
  console.log('   Libers      :');
  for (const u of pickMany(emailLoginLibers, 5)) {
    console.log(`     - ${u.email}`);
  }
  console.log(
    '\n   (Google-auth libers have no password and cannot log in with email/password.)',
  );
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
