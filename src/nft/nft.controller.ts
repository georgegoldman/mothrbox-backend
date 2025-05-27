// import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
// import { NftService, MintTokenDto } from './nft.service';

// @Controller('nft')
// export class NftController {
//   constructor(private readonly nftService: NftService) {}

//   @Post('mint')
//   async mintToken(@Body() mintData: MintTokenDto, @Req() req: any) {
//     const userAddress = req.user?.walletAddress || mintData.privateKey; // Get from authenticated user
    
//     if (!userAddress) {
//       throw new BadRequestException('User wallet address is required');
//     }

//     return await this.nftService.mintToken(mintData, userAddress, mintData.privateKey);
//   }

//   @Get('tokens/:address')
//   async getTokensByOwner(@Param('address') address: string) {
//     return await this.nftService.getTokensByOwner(address);
//   }

//   @Get('token/:id')
//   async getTokenById(@Param('id') id: string) {
//     return await this.nftService.getTokenById(id);
//   }
// }
