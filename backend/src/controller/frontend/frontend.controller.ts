import {ApiDefaultResponse, ApiTags} from "@nestjs/swagger";
import {Controller, Get, Res} from "@nestjs/common";
import {Response} from "express";
import {join} from "path";

@Controller()
@ApiTags('frontend')
export class FrontendController {
    @Get()
    @ApiDefaultResponse({
        description: "This endpoint provides access to to the frontend"
    })
    catchAll(@Res() response: Response) {
        response.sendFile(join(__dirname, '..', '..', "..", "..", 'frontend', 'dist', 'index.html'));
    }
}