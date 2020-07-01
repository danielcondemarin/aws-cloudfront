const { createComponent, assertHasOrigin } = require('../test-utils')

const {
  mockCreateDistribution,
  mockUpdateDistribution,
  mockGetDistributionConfigPromise,
  mockUpdateDistributionPromise
} = require('aws-sdk')

describe('Working with an existing distribution', () => {
  let component

  beforeEach(async () => {
    mockGetDistributionConfigPromise.mockResolvedValue({
      ETag: 'etag',
      DistributionConfig: {
        Origins: {
          Items: []
        }
      }
    })
    mockUpdateDistributionPromise.mockResolvedValueOnce({
      Distribution: {
        Id: 'xyz'
      }
    })

    component = await createComponent()
  })

  it('does not create a new distribution', async () => {
    await component.default({
      distributionId: 'abc',
      origins: ['https://exampleorigin.com']
    })

    expect(mockCreateDistribution).not.toBeCalled()
  })

  it('updates existing distribution using input distribution ID', async () => {
    await component.default({
      distributionId: 'fake-distribution-id',
      origins: ['https://exampleorigin.com']
    })

    expect(mockUpdateDistribution).toBeCalledWith(
      expect.objectContaining({
        Id: 'fake-distribution-id'
      })
    )
  })

  it('updates distribution with new input origin', async () => {
    mockGetDistributionConfigPromise.mockResolvedValueOnce({
      ETag: 'etag',
      DistributionConfig: {
        Origins: {
          Quantity: 1,
          Items: [{ Id: 'existingorigin.com', DomainName: 'existingorigin.com' }]
        }
      }
    })

    await component.default({
      distributionId: 'fake-distribution-id',
      origins: ['https://neworigin.com']
    })

    // any existing origins are kept
    assertHasOrigin(mockUpdateDistribution, {
      Id: 'existingorigin.com',
      DomainName: 'existingorigin.com'
    })
    assertHasOrigin(mockUpdateDistribution, {
      Id: 'neworigin.com',
      DomainName: 'neworigin.com'
    })
  })
})
