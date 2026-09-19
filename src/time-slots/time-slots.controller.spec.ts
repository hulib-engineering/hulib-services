import { Test } from '@nestjs/testing';
import { TimeSlotController } from './time-slots.controller';
import { TimeSlotService } from './time-slots.service';

describe('TimeSlotController', () => {
  let controller: TimeSlotController;
  let timeSlotService: { [K in keyof TimeSlotService]: jest.Mock };

  beforeEach(async () => {
    timeSlotService = {
      createMany: jest.fn(),
      findAll: jest.fn(),
      findByHuber: jest.fn(),
      findOne: jest.fn(),
    } as never;

    const moduleRef = await Test.createTestingModule({
      controllers: [TimeSlotController],
      providers: [{ provide: TimeSlotService, useValue: timeSlotService }],
    }).compile();

    controller = moduleRef.get(TimeSlotController);
  });

  it('should delegate create to the service with the request user id', async () => {
    const dto = { timeSlots: [{ dayOfWeek: 1, startTime: '09:00' }] };
    const result = { id: 1 };
    timeSlotService.createMany.mockResolvedValue(result);

    await expect(
      controller.create(dto as never, { user: { id: 7 } }),
    ).resolves.toEqual(result);
    expect(timeSlotService.createMany).toHaveBeenCalledWith(dto, 7);
  });

  it('should return all time slots for the request user in findAll', async () => {
    const result = [{ id: 1 }, { id: 2 }];
    timeSlotService.findAll.mockResolvedValue(result);

    await expect(
      controller.findAll({ user: { id: 7 } }),
    ).resolves.toEqual(result);
    expect(timeSlotService.findAll).toHaveBeenCalledWith(7);
  });

  it('should delegate findByHuber with the path param id', async () => {
    const result = [{ id: 1 }];
    timeSlotService.findByHuber.mockResolvedValue(result);

    await expect(controller.findByHuber('7')).resolves.toEqual(result);
    expect(timeSlotService.findByHuber).toHaveBeenCalledWith('7');
  });

  it('should delegate findOne with the path param id', async () => {
    const result = { id: 1 };
    timeSlotService.findOne.mockResolvedValue(result);

    await expect(controller.findOne(1)).resolves.toEqual(result);
    expect(timeSlotService.findOne).toHaveBeenCalledWith(1);
  });
});