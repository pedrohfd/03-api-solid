import { expect, it, describe, beforeEach, vi, afterEach } from 'vitest'
import { CheckInUseCase } from './check-in'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'
import { MaxDistanceError } from './errors/max-distance-error'

let checkInRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('check in use case', async () => {
  beforeEach(async () => {
    checkInRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInRepository, gymsRepository)

    vi.useFakeTimers()

    await gymsRepository.create({
      id: 'gym-id',
      title: 'Gym Name',
      description: '',
      phone: '',
      latitude: -23.5516545,
      longitude: -47.458847,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -23.5516545,
      userLongitude: -47.458847,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice a day', async () => {
    vi.setSystemTime(new Date(2024, 1, 12, 0, 0, 0))

    await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -23.5516545,
      userLongitude: -47.458847,
    })

    await expect(
      sut.execute({
        gymId: 'gym-id',
        userId: 'user-id',
        userLatitude: -23.5516545,
        userLongitude: -47.458847,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be able to check in twice a day but in different days', async () => {
    vi.setSystemTime(new Date(2024, 1, 12, 0, 0, 0))

    await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -23.5516545,
      userLongitude: -47.458847,
    })

    vi.setSystemTime(new Date(2024, 1, 13, 0, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-id',
      userId: 'user-id',
      userLatitude: -23.5516545,
      userLongitude: -47.458847,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distant gym', async () => {
    gymsRepository.items.push({
      id: 'gym-id',
      title: 'Gym Name',
      description: '',
      phone: '',
      latitude: new Decimal(-23.7170894),
      longitude: new Decimal(-47.4111542),
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-id',
        userId: 'user-id',
        userLatitude: -23.7294595,
        userLongitude: -47.469122,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
