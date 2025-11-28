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
import { CorsExceptionFilter } from './filters/cors-exception.filter';

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  if (!cachedServer) {
    const expressApp: Express = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule.forRoot(), adapter, {
      logger: ['error', 'warn', 'log'],
    });

    // CORS is handled at the Lambda level, not by NestJS
    // This prevents conflicts with our manual CORS headers

    // Add global exception filter to ensure CORS headers on all errors
    app.useGlobalFilters(new CorsExceptionFilter());

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
  const rawPath = event.rawPath || event.path || '/';
  // Remove any spaces or encode the path properly
  const cleanPath = rawPath.replace(/ /g, '');
  
  const v1Event: any = {
    httpMethod: event.requestContext?.http?.method || event.httpMethod,
    path: cleanPath,
    queryStringParameters: event.queryStringParameters || null,
    headers: event.headers || {},
    body: event.body || null,
    isBase64Encoded: event.isBase64Encoded || false,
    requestContext: {
      accountId: event.requestContext?.accountId || '',
      apiId: event.requestContext?.apiId || '',
      protocol: event.requestContext?.http?.protocol || 'HTTP/1.1',
      httpMethod: event.requestContext?.http?.method || event.httpMethod,
      path: cleanPath,
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
    
    // Handle OPTIONS requests for CORS preflight
    const httpMethod = (event as any).requestContext?.http?.method || (event as any).httpMethod;
    if (httpMethod === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      
      // Get the origin from the request
      const requestOrigin = (event as any).headers?.origin || (event as any).headers?.Origin;
      
      // Determine allowed origin
      let allowedOrigin = 'https://d3mdmjrv9mx88k.cloudfront.net'; // Default production
      
      // Check if request is from localhost (for local testing)
      if (requestOrigin && requestOrigin.includes('localhost')) {
        allowedOrigin = requestOrigin;
      } else if (process.env.FRONTEND_URL) {
        allowedOrigin = process.env.FRONTEND_URL;
      } else if (requestOrigin) {
        // Use the request origin if it matches our allowed list
        const allowedOrigins = [
          'https://d3mdmjrv9mx88k.cloudfront.net',
          'http://localhost:5173',
          'http://localhost:5174',
        ];
        if (allowedOrigins.includes(requestOrigin)) {
          allowedOrigin = requestOrigin;
        }
      }
      
      console.log('CORS preflight - Request origin:', requestOrigin, 'Allowed origin:', allowedOrigin);
      
      return {
        statusCode: 200,
        headers: {
          'access-control-allow-origin': allowedOrigin,
          'access-control-allow-credentials': 'true',
          'access-control-allow-methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
          'access-control-allow-headers': 'content-type,authorization,accept,x-requested-with,origin',
          'access-control-max-age': '86400',
          'vary': 'Origin',
        },
        body: '',
      };
    }
    
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
          
          // Ensure CORS headers are present in all responses
          // Get the origin from the request
          const requestOrigin = (v1Event as any).headers?.origin || (v1Event as any).headers?.Origin;
          
          // Determine allowed origin
          let allowedOrigin = 'https://d3mdmjrv9mx88k.cloudfront.net'; // Default production
          
          // Check if request is from localhost (for local testing)
          if (requestOrigin && requestOrigin.includes('localhost')) {
            allowedOrigin = requestOrigin;
          } else if (process.env.FRONTEND_URL) {
            allowedOrigin = process.env.FRONTEND_URL;
          } else if (requestOrigin) {
            // Use the request origin if it matches our allowed list
            const allowedOrigins = [
              'https://d3mdmjrv9mx88k.cloudfront.net',
              'http://localhost:5173',
              'http://localhost:5174',
            ];
            if (allowedOrigins.includes(requestOrigin)) {
              allowedOrigin = requestOrigin;
            }
          }
          
          const corsHeaders = {
            'access-control-allow-origin': allowedOrigin,
            'access-control-allow-credentials': 'true',
            'access-control-allow-methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
            'access-control-allow-headers': 'content-type,authorization,accept,x-requested-with,origin',
            'vary': 'Origin',
          };
          
          resolve({
            statusCode: res.statusCode,
            headers: {
              ...res.headers,
              ...corsHeaders,
            },
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
    
    // Get the origin from the request
    const requestOrigin = (event as any).headers?.origin || (event as any).headers?.Origin;
    
    // Determine allowed origin
    let allowedOrigin = 'https://d3mdmjrv9mx88k.cloudfront.net'; // Default production
    
    // Check if request is from localhost (for local testing)
    if (requestOrigin && requestOrigin.includes('localhost')) {
      allowedOrigin = requestOrigin;
    } else if (process.env.FRONTEND_URL) {
      allowedOrigin = process.env.FRONTEND_URL;
    } else if (requestOrigin) {
      // Use the request origin if it matches our allowed list
      const allowedOrigins = [
        'https://d3mdmjrv9mx88k.cloudfront.net',
        'http://localhost:5173',
        'http://localhost:5174',
      ];
      if (allowedOrigins.includes(requestOrigin)) {
        allowedOrigin = requestOrigin;
      }
    }
    
    return {
      statusCode: 500,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': allowedOrigin,
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
        'access-control-allow-headers': 'content-type,authorization,accept,x-requested-with,origin',
        'vary': 'Origin',
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    };
  }
};
