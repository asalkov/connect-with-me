// Lambda Handler for NestJS Application
// This file adapts the NestJS app to work with AWS Lambda

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import express, { Express } from 'express';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyEventV2 } from 'aws-lambda';
import { createServer, proxy, Response } from 'aws-serverless-express';
import { Server } from 'http';

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  if (!cachedServer) {
    const expressApp: Express = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule.forRoot(), adapter, {
      logger: ['error', 'warn', 'log'],
    });

    // Enable CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    });

    // Enable validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    // Set global prefix
    app.setGlobalPrefix('api');

    await app.init();

    cachedServer = createServer(expressApp);
  }

  return cachedServer;
}

// Convert API Gateway HTTP API v2 event to v1 format
function convertV2ToV1Event(event: any): APIGatewayProxyEvent {
  // Check if it's already v1 format
  if (event.version === '1.0' || event.httpMethod) {
    return event as APIGatewayProxyEvent;
  }

  // Convert v2 to v1
  const v1Event: any = {
    httpMethod: event.requestContext?.http?.method || event.httpMethod,
    path: event.rawPath || event.path || '/',
    queryStringParameters: event.queryStringParameters || null,
    headers: event.headers || {},
    body: event.body || null,
    isBase64Encoded: event.isBase64Encoded || false,
    requestContext: {
      accountId: event.requestContext?.accountId || '',
      apiId: event.requestContext?.apiId || '',
      protocol: event.requestContext?.http?.protocol || 'HTTP/1.1',
      httpMethod: event.requestContext?.http?.method || event.httpMethod,
      path: event.rawPath || event.path || '/',
      stage: event.requestContext?.stage || '$default',
      requestId: event.requestContext?.requestId || '',
      requestTime: event.requestContext?.time || '',
      requestTimeEpoch: event.requestContext?.timeEpoch || 0,
      identity: {
        sourceIp: event.requestContext?.http?.sourceIp || '',
        userAgent: event.requestContext?.http?.userAgent || '',
      },
    },
  };

  return v1Event as APIGatewayProxyEvent;
}

// Lambda handler
export const handler = async (
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // Enable connection reuse for AWS SDK
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    const server = await bootstrapServer();
    
    // Convert v2 event to v1 format if needed
    const v1Event = convertV2ToV1Event(event);
    
    console.log('Converted event:', JSON.stringify(v1Event, null, 2));
    
    // Use aws-serverless-express to proxy the request
    return await new Promise((resolve, reject) => {
      const response = proxy(server, v1Event, context, 'PROMISE').promise as Promise<Response>;
      response
        .then((res) => {
          console.log('Response:', res.statusCode);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.body,
            isBase64Encoded: res.isBase64Encoded,
          });
        })
        .catch((error) => {
          console.error('Proxy error:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    };
  }
};
