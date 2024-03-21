import {NestFactory} from "@nestjs/core"
import {AppModule} from "./app.module"
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger"
import * as cookieParser from 'cookie-parser'
import {SeederService} from "./services/seeder/seeder.service";
import * as dotenv from 'dotenv';

async function bootstrap() {
    dotenv.config();
    const app = await NestFactory.create(AppModule)
    const config = new DocumentBuilder()
        .setTitle('TicTacToe API')
        .setDescription('The game API description')
        .setVersion('1.0')
        .addTag('game')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)

    app.use(cookieParser())

    // Enable CORS for frontend origin
    app.enableCors({
        origin: 'http://localhost:5173', // Specify the frontend origin
        credentials: true, // Allow sending cookies and authorization headers with the request
        methods: '*', // Specify allowed methods
        allowedHeaders: '*', // Specify allowed headers
    })
    const seeder = app.get(SeederService);
    await seeder.seedDemoUsers()
    await app.listen(process.env.PORT || 3000)
}

bootstrap()
