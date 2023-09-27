import { EtherscanService } from '../../services/etherscan.service';
import { Block } from '../../models/max-balance.model';
import errorHandler from '../../errors/handler.error';
errorHandler.setErrorListener();

jest.mock('config');

describe('integration etherscan', () => {
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

    it('should throw an error when the API request fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      try {
        await etherscan.getLastBlockNumber();
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(global.SRV_ERROR);
        expect(error.message).toContain('Failed to get the last block number');
      }
    });
  });

  describe('etherscan.getBlock', () => {
    it('should retrieve and return a valid block', async () => {
      const resolvedValue: Block = {
        status: '1',
        result: {
          number: '0x4e3b7',
          transactions: [],
        },
      };
      const mockResponse = {
        json: jest.fn().mockResolvedValue(resolvedValue),
      };
      mockFetch.mockResolvedValue(mockResponse);
      const block = await etherscan.getBlock('0x4e3b7');
      expect(block).toEqual(resolvedValue);
    });

    it('should handle network errors and throw an error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      try {
        await etherscan.getBlock('0x4e3b7');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(global.SRV_ERROR);
        expect(error.message).toContain('Failed to connect to etherscan.io');
      }
    });

    it('should handle API errors and throw an error with custom messages', async () => {
      const resolvedValue: Block = {
        status: '0',
        error: {
          code: -32602,
          message: 'Error! Invalid block number ...',
        },
      };
      const mockResponse = {
        json: jest.fn().mockResolvedValue(resolvedValue),
      };
      mockFetch.mockResolvedValue(mockResponse);
      try {
        await etherscan.getBlock('invalid-block');
        // The function should throw an error, so this line should not be reached
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(global.SRV_ERROR);
        expect(error.message).toContain('Error! Invalid block number [invalid-block]');
      }
    });

    it('should handle repeated API errors and throw an error after retries', async () => {
      const resolvedValue: Block = {
        status: '0',
        error: {
          code: 2128507,
          message: 'Error! Failed to retrieve block after multiple attempts',
        },
      };
      const mockResponse = {
        json: jest.fn().mockResolvedValue(resolvedValue),
      };
      mockFetch.mockResolvedValue(mockResponse);
      try {
        await etherscan.getBlock('0x4e3b7');
        // The function should throw an error, so this line should not be reached
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(global.SRV_ERROR);
        expect(error.message).toContain('Failed to retrieve block after multiple attempts');
      }
    });
  });
});
