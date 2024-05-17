import { expect, it, describe, beforeEach } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { GetUserMetricsUseCase } from './get-user-metrics'

let checkInRepository: InMemoryCheckInsRepository
let sut: GetUserMetricsUseCase

describe('get user metrics use case', async () => {
  beforeEach(async () => {
    checkInRepository = new InMemoryCheckInsRepository()
    sut = new GetUserMetricsUseCase(checkInRepository)
  })

  it('should be able to get check-ins count from metrics', async () => {
    await checkInRepository.create({
      gym_id: 'gym-01',
      user_id: 'user-id',
    })

    await checkInRepository.create({
      gym_id: 'gym-02',
      user_id: 'user-id',
    })

    const { checkInsCount } = await sut.execute({
      userId: 'user-id',
    })

    expect(checkInsCount).toEqual(2)
  })
})
