import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { TransformInterceptor } from './interceptor/transform.interceptor';
import { HttpExceptionFilter } from './filters/http-execption.filter';
import { AllExceptionsFilter } from './filters/any-exception.filter';

import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

// import { InitMiddleware } from './middleware/init.middleware';

async function bootstrap() {
  // 在 create 方法中指定泛型 NestExpressApplication ，表示使用的是 express 平台
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // cors: {
    //   // origin: ['http://localhost', 'http://localhost:3000'],
    //   origin: ['*'],
    //   credentials: true,
    // },
    bufferLogs: true,
    // logger: new Logger(),
  });

  // 允许跨域
  app.enableCors();

  const setupSwagger = (app) => {
    const config = new DocumentBuilder()
      .setTitle('blog-serve')
      .setDescription('接口文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger-doc', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  };

  // 全局路由前缀
  app.setGlobalPrefix('api');

  app.useStaticAssets('public', {
    prefix: '/static/', // 配置虚拟目录之后，就无法通过 localhost:3000/rule.png 来访问图片，必须使用 localhost:3000/static/rule.png
  });

  // 配置模板引擎文件的位置
  // app.setBaseViewsDir('views');

  // 配置使用的模板引擎
  // app.setViewEngine('ejs');

  // 配置 cookie 中间件
  app.use(cookieParser());

  // 配置 session 中间件
  app.use(
    // 设置 rolling 是为了在每次返回的请求的时候，都重置保存在客户端中 cookie
    session({ secret: 'keyboard', cookie: { maxAge: 10 }, rolling: true }),
  );

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  // 使用日志中间件（如果需要使用全局中间件，则必须使用函数式中间件）
  // app.use(new LoggerMiddleware());

  setupSwagger(app);

  await app.listen(7788);
}

bootstrap();
