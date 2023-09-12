// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import net from 'net';
import { Service } from '../../../../services/service';

describe('connectToServer function', () => {
  let service: Service;

  beforeEach(() => {
    service = new Service();
  });

  it('should resolve when successfully connected to the Redis server', async () => {
    // Mock the createConnection function to simulate a successful connection
    const mockCreateConnection = jest.spyOn(net, 'createConnection');
    mockCreateConnection.mockImplementation(() => {
      const mockSocket = new net.Socket();
      process.nextTick(() => mockSocket.emit('connect')); // Simulate a successful connection
      return mockSocket;
    });

    await expect(service.connectToServer()).resolves.toBeUndefined();

    // Ensure createConnection was called with the correct arguments
    expect(mockCreateConnection).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'your-redis-host', port: 6379 }),
      expect.any(Function),
    );

    // Restore the original createConnection function
    mockCreateConnection.mockRestore();
  });

  it('should reject with an error when unable to connect to the Redis server', async () => {
    // Mock the createConnection function to simulate an error during connection
    const mockCreateConnection = jest.spyOn(net, 'createConnection');
    mockCreateConnection.mockImplementation(() => {
      const mockSocket = new net.Socket();
      process.nextTick(() => mockSocket.emit('error', new Error('Connection error'))); // Simulate an error
      return mockSocket;
    });

    await expect(service.connectToServer()).rejects.toThrowError('Error connecting to the Redis server!');

    // Ensure createConnection was called with the correct arguments
    expect(mockCreateConnection).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'your-redis-host', port: 6379 }),
      expect.any(Function),
    );

    // Restore the original createConnection function
    mockCreateConnection.mockRestore();
  });
});
