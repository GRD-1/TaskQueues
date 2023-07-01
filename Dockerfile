# Base image for RabbitMQ
FROM rabbitmq:3.12-management AS rabbitmq

# Expose RabbitMQ ports
EXPOSE 5672 15672

# Base image for Redis
FROM redis:6.0.16 AS redis

# Expose Redis port
EXPOSE 6379
