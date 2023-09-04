import { EtherscanService } from '../../_src/services/etherscan.service';

describe('etherscan service methods', () => {
  const etherscan = new EtherscanService();
  // beforeAll(async () => {
  //   const etherscan = new EtherscanService();
  // });
  // afterAll(async () => {
  //   // await dbTeardown();
  // });

  describe('Get the last block number from etherscan.io', () => {
    it('the return value must be the hex number', async () => {
      const lastBlockNumber = await etherscan.getLastBlockNumber();
      const lastBlockNumberDecimal = parseInt(lastBlockNumber, 16);
      expect(lastBlockNumber).not.toBeNull();
      expect(lastBlockNumberDecimal).toBeGreaterThan(1000);
    });
  });

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

  // describe('getBlock', () => {
  // it('should update a specific existing Ingredient entry', async () => {
  //   await ingredientDal.update(ingredientId, {
  //     description: 'A legume',
  //   });
  //   const ingredient = await Ingredient.findByPk(ingredientId);
  //   expect(ingredient?.description).toEqual('A legume');
  // });
  // });
});
