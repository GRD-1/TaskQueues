import { EtherscanService } from '../../_src/services/etherscan.service';

describe('etherscan service', () => {
  const etherscan = new EtherscanService();
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('etherscan.getLastBlockNumber', () => {
    it('should return the last block number as a string', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ result: '0x4e3b7' }),
      };
      mockFetch.mockResolvedValue(mockResponse);
      const result = await etherscan.getLastBlockNumber();
      expect(result).toBe('0x4e3b7');
    });
  });

  // describe('getBlock', () => {
  // it('should update a specific existing Ingredient entry', async () => {
  //   await ingredientDal.update(ingredientId, {
  //     description: 'A legume',
  //   });
  //   const ingredient = await Ingredient.findByPk(ingredientId);
  //   expect(ingredient?.description).toEqual('A legume');
  // });
  // });

  // describe('findOrCreate method', () => {
  //   beforeAll(async () => {
  //     await Ingredient.create({
  //       name: 'Brown Rice',
  //       slug: 'brown-rice',
  //     });
  //   });
  //   it('should create a new entry when none with matching name exists', async () => {
  //     const payload = {
  //       name: 'Rice',
  //       slug: 'rice',
  //     };
  //     await ingredientDal.findOrCreate(payload);
  //     const ingredientsFound = await Ingredient.findAll({ where: { name: 'Rice' } });
  //     expect(ingredientsFound.length).toEqual(1);
  //   });
  //   it('should return an existing entry where one with same name exists without updating it', async () => {
  //     const payload = {
  //       name: 'Brown Rice',
  //       slug: 'brownrice',
  //       description: 'test',
  //     };
  //     await ingredientDal.findOrCreate(payload);
  //     const ingredientsFound = await Ingredient.findAll({ where: { name: 'Brown Rice' } });
  //
  //     expect(ingredientsFound.length).toEqual(1);
  //     expect(ingredientsFound[0].slug).toEqual('brown-rice');
  //     expect(ingredientsFound[0].description).toBeNull();
  //   });
  // });
});
