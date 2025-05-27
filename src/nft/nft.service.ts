// import {
//   Injectable,
//   BadRequestException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { Logger } from '@nestjs/common';
// import { firstValueFrom } from 'rxjs';

// export interface MintTokenDto {
//   value: string;
//   imageUrl: string;
//   description: string;
//   tokenType: 'MTXAccess' | 'MTXKey';
//   kioskId: string;
//   ownerCapId: string;
// }

// export interface WithdrawTokenDto {
//   kioskId: string;
//   ownerCapId: string;
//   tokenId: string;
//   tokenType: 'MTXAccess' | 'MTXKey';
// }

// export interface LockTokenDto {
//   kioskId: string;
//   ownerCapId: string;
//   policyId: string;
//   tokenType: 'MTXAccess' | 'MTXKey';
// }

// export interface ListTokenDto {
//   kioskId: string;
//   ownerCapId: string;
//   tokenId: string;
//   price: string; // in MIST (1 SUI = 1,000,000,000 MIST)
//   tokenType: 'MTXAccess' | 'MTXKey';
// }

// export interface DashTokenDto {
//   kioskId: string;
//   ownerCapId: string;
//   tokenId: string;
//   recipient: string;
//   tokenType: 'MTXAccess' | 'MTXKey';
// }

// export interface BuyTokenDto {
//   kioskId: string;
//   tokenId: string;
//   paymentCoinId: string;
//   policyId: string;
//   tokenType: 'MTXAccess' | 'MTXKey';
// }

// export interface ValidateTokenDto {
//   kioskId: string;
//   ownerCapId: string;
//   tokenId: string;
//   tokenType: 'MTXAccess' | 'MTXKey';
// }

// @Injectable()
// export class NftService {
//   private readonly logger = new Logger(NftService.name);
//   private readonly suiRpcUrl: string;
//   private readonly packageId: string;
//   private readonly moduleId: string;

//   constructor(private readonly httpService: HttpService) {
//     this.suiRpcUrl =
//       process.env.SUI_RPC_URL || 'https://fullnode.devnet.sui.io:443';
//     this.packageId = process.env.MOTHRBOX_PACKAGE_ID as string;
//     this.moduleId = 'key_validator';

//     if (!this.packageId) {
//       throw new Error('MOTHRBOX_PACKAGE_ID environment variable is required');
//     }
//   }

//   /**
//    * Mint a new NFT token using mint_token_and_kiosk function
//    */
//   async mintToken(mintData: MintTokenDto): Promise<any> {
//     try {
//       this.logger.log(
//         `Building mint transaction for ${mintData.tokenType} token`,
//       );
//       this.validateMintInput(mintData);

//       const typeArgument = this.getTypeArgument(mintData.tokenType);
//       const transactionBlock = {
//         version: 1,
//         expiration: { None: null },
//         gasData: {
//           payment: [],
//           price: '1000',
//           budget: '10000000',
//         },
//         inputs: [
//           { type: 'pure', valueType: 'string', value: mintData.value },
//           { type: 'pure', valueType: 'string', value: mintData.imageUrl },
//           { type: 'pure', valueType: 'string', value: mintData.description },
//           {
//             type: 'object',
//             objectType: 'sharedObject',
//             objectId: mintData.kioskId,
//           },
//           {
//             type: 'object',
//             objectType: 'immOrOwnedObject',
//             objectId: mintData.ownerCapId,
//           },
//         ],
//         transactions: [
//           {
//             kind: 'moveCall',
//             target: `${this.packageId}::${this.moduleId}::mint_token_and_kiosk`,
//             typeArguments: [typeArgument],
//             arguments: [
//               { kind: 'Input', index: 0 }, // value
//               { kind: 'Input', index: 1 }, // image_url
//               { kind: 'Input', index: 2 }, // description
//               { kind: 'Input', index: 3 }, // kiosk
//               { kind: 'Input', index: 4 }, // cap
//             ],
//           },
//         ],
//       };

//       return {
//         success: true,
//         transactionBlock,
//         message: 'Mint transaction ready',
//       };
//     } catch (error) {
//       this.logger.error('Error building mint transaction:', error);
//       throw new InternalServerErrorException(
//         `Failed to build mint transaction: ${error.message}`,
//       );
//     }
//   }
//   validateMintInput(mintData: MintTokenDto) {
//     throw new Error('Method not implemented.');
//   }
//   getTypeArgument(tokenType: string) {
//     throw new Error('Method not implemented.');
//   }

//   /**
//    * Create a new kiosk using create_kiosk function
//    */
//   async createKiosk(): Promise<any> {
//     try {
//       this.logger.log('Building kiosk creation transaction');

//       const transactionBlock = {
//         version: 1,
//         expiration: { None: null },
//         gasData: {
//           payment: [],
//           price: '1000',
//           budget: '5000000',
//         },
//         inputs: [],
//         transactions: [
//           {
//             kind: 'moveCall',
//             target: `${this.packageId}::${this.moduleId}::create_kiosk`,
//             typeArguments: [],
//             arguments: [],
//           },
//         ],
//       };

//       return {
//         success: true,
//         transactionBlock,
//         message: 'Kiosk creation transaction ready',
//       };
//     } catch (error) {
//       this.logger.error('Error building kiosk creation transaction:', error);
//       throw new InternalServerErrorException(
//         `Failed to build kiosk creation transaction: ${error.message}`,
//       );
//     }
//   }

//   /**
//    * Withdraw token from kiosk using withdraw function
//    */
//   async withdrawToken(withdrawData: WithdrawTokenDto): Promise<any> {
//     try {
//       this.logger.log(
//         `Building withdraw transaction for token: ${withdrawData.tokenId}`,
//       );

//       const typeArgument = this.getTypeArgument(withdrawData.tokenType);
//       const transactionBlock = {
//         version: 1,
//         expiration: { None: null },
//         gasData: {
//           payment: [],
//           price: '1000',
//           budget: '5000000',
//         },
//         inputs: [
//           {
//             type: 'object',
//             objectType: 'sharedObject',
//             objectId: withdrawData.kioskId,
//           },
//           {
//             type: 'object',
//             objectType: 'immOrOwnedObject',
//             objectId: withdrawData.ownerCapId,
//           },
//           { type: 'pure', valueType: 'address', value: withdrawData.tokenId },
//         ],
//         transactions: [
//           {
//             kind: 'moveCall',
//             target: `${this.packageId}::${this.moduleId}::withdraw`,
//             typeArguments: [typeArgument],
//             arguments: [
//               { kind: 'Input', index: 0 }, // kiosk
//               { kind: 'Input', index: 1 }, // cap
//               { kind: 'Input', index: 2 }, // item_id
//             ],
//           },
//         ],
//       };

//       return {
//         success: true,
//         transactionBlock,
//         message: 'Withdraw transaction ready',
//       };
//     } catch (error) {
//       this.logger.error('Error building withdraw transaction:', error);
//       throw new InternalServerErrorException(
//         `Failed to build withdraw transaction: ${error.message}`,
//       );
//     }
//   }

//   /**
//    * Lock token in kiosk using lock_fun function
//    */
//   async lockToken(lockData: LockTokenDto): Promise<any> {
//     try {
//       this.logger.log('Building lock transaction');

//       const typeArgument = this.getTypeArgument(lockData.tokenType);
//       const transactionBlock = {
//         version: 1,
//         expiration: { None: null },
//         gasData: {
//           payment: [],
//           price: '1000',
//           budget: '5000000',
//         },
//         inputs: [
//           {
//             type: 'object',
//             objectType: 'sharedObject',
//             objectId: lockData.kioskId,
//           },
//           {
//             type: 'object',
//             objectType: 'immOrOwnedObject',
//             objectId: lockData.ownerCapId,
//           },
//           {
//             type: 'object',
//             objectType: 'sharedObject',
//             objectId: lockData.policyId,
//           },
//         ],
//         transactions: [
//           {
//             kind: 'moveCall',
//             target: `${this.packageId}::${this.moduleId}::lock_fun`,
//             typeArguments: [typeArgument],
//             arguments: [
//               { kind: 'Input', index: 0 }, // kiosk
//               { kind: 'Input', index: 1 }, // cap
//               { kind: 'Input', index: 2 }, // policy
//             ],
//           },
//         ],
//       };

//       return {
//         success: true,
//         transactionBlock,
//         message: 'Lock transaction ready',
//       };
//     } catch (error) {
//       this.logger.error('Error building lock transaction:', error);
//       throw new InternalServerErrorException(
//         `Failed to build lock transaction: ${error.message}`,
//       );
//     }
//   }

//   /**
//    * List token for sale using listing function
//    */
//   async listToken(listData: ListTokenDto): Promise<any> {
//     try {
//       this.logger.log(
//         `Building listing transaction for token: ${listData.tokenId}`,
//       );

//       const typeArgument = this.getTypeArgument(listData.tokenType);
//       const transactionBlock = {
//         version: 1,
//         expiration: { None: null },
//         gasData: {
//           payment: [],
//           price: '1000',
//           budget: '5000000',
//         },
//         inputs: [
//           {
//             type: 'object',
//             objectType: 'sharedObject',
//             objectId: listData.kioskId,
//           },
//           {
//             type: 'object',
//             objectType: 'immOrOwnedObject',
//             objectId: listData.ownerCapId,
//           },
//           { type: 'pure', valueType: 'address', value: listData.tokenId },
//           { type: 'pure', valueType: 'u64', value: listData.price },
//         ],
//         transactions: [
//           {
//             kind: 'moveCall',
//             target: `${this.packageId}::${this.moduleId}::listing`,
//             typeArguments: [typeArgument],
//             arguments: [
//               { kind: 'Input', index: 0 }, // kiosk
//               { kind: 'Input', index: 1 }, // cap
//               { kind: 'Input', index: 2 }, // id
//               { kind: 'Input', index: 3 }, // price
//             ],
//           },
//         ],
//       };

//       return {
//         success: true,
//         transactionBlock,
//         message: 'Listing transaction ready',
//       };
//     } catch (error) {
//       this.logger.error('Error building listing transaction:', error);
//       throw new InternalServerErrorException(
//         `Failed to build listing transaction: ${error.message}`,
//       );
//     }
//   }

//   /**
//    * Transfer token to another address using dash_item function
//    */
//   async dashToken(dashData: DashTokenDto): Promise<any> {
//     try {
//       this.logger.log(
//         `Building dash transaction for token: ${dashData.tokenId}`,
//       );

//       const typeArgument = this.getTypeArgument(dashData.tokenType);
//       const transactionBlock = {
//         version: 1,
//         expiration: { None: null },
//         gasData: {
//           payment: [],
//           price: '1000',
//           budget: '5000000',
//         },
//         inputs: [
//           {
//             type: 'object',
//             objectType: 'sharedObject',
//             objectId: dashData.kioskId,
//           },
//           {
//             type: 'object',
//             objectType: 'immOrOwnedObject',
//             objectId: dashData.ownerCapId,
//           },
//           { type: 'pure', valueType: 'address', value: dashData.tokenId },
//           { type: 'pure', valueType: 'address', value: dashData.recipient },
//         ],
//         transactions: [
//           {
//             kind: 'moveCall',
//             target: `${this.packageId}::${this.moduleId}::dash_item`,
//             typeArguments: [typeArgument],
//             arguments: [
//               { kind: 'Input', index: 0 }, // kiosk
//               { kind: 'Input', index: 1 }, // cap
//               { kind: 'Input', index: 2 }, // id
//               { kind: 'Input', index: 3 }, // recipient
//             ],
//           },
//         ],
//       };

//       return {
//         success: true,
//         transactionBlock,
//         message: 'Dash transaction ready',
//       };
//     } catch (error) {
//       this.logger.error('Error building dash transaction:', error);
//       throw new InternalServerErrorException(
//         `Failed to build dash transaction: ${error.message}`,
//       );
//     }
//   }

//   /**
//    * Buy token from kiosk using buy_token_from_kiosk function
//    */
//   async buyToken(buyData: BuyTokenDto): Promise<any> {
//     try {
//       this.logger.log(`Building buy transaction for token: ${buyData.tokenId}`);

//       const typeArgument = this.getTypeArgument(buyData.tokenType);
//       const transactionBlock = {
//         version: 1,
//         expiration: { None: null },
//         gasData: {
//           payment: [],
//           price: '1000',
//           budget: '10000000',
//         },
//         inputs: [
//           {
//             type: 'object',
//             objectType: 'sharedObject',
//             objectId: buyData.kioskId,
//           },
//           { type: 'pure', valueType: 'address', value: buyData.tokenId },
//           {
//             type: 'object',
//             objectType: 'immOrOwnedObject',
//             objectId: buyData.paymentCoinId,
//           },
//           {
//             type: 'object',
//             objectType: 'sharedObject',
//             objectId: buyData.policyId,
//           },
//         ],
//         transactions: [
//           {
//             kind: 'moveCall',
//             target: `${this.packageId}::${this.moduleId}::buy_token_from_kiosk`,
//             typeArguments: [typeArgument],
//             arguments: [
//               { kind: 'Input', index: 0 }, // kiosk
//               { kind: 'Input', index: 1 }, // id
//               { kind: 'Input', index: 2 }, // payment
//               { kind: 'Input', index: 3 }, // policy
//             ],
//           },
//         ],
//       };

//       return {
//         success: true,
//         transactionBlock,
//         message: 'Buy transaction ready',
//       };
//     } catch (error) {
//       this.logger.error('Error building buy transaction:', error);
//       throw new InternalServerErrorException(
//         `Failed to build buy transaction: ${error.message}`,
//       );
//     }
//   }
// }
