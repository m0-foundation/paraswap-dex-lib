import { Contract } from 'web3-eth-contract';
import { FxProtocolPoolState } from './types';
import { Interface, AbiCoder } from '@ethersproject/abi';

export async function getOnChainState(
  multiContract: Contract,
  marketAddress: string,
  marketInterface: Interface,
  ethWeETHOracleAddress: string,
  ethWeETHOracleIface: Interface,
  blockNumber: number | 'latest',
): Promise<FxProtocolPoolState> {
  const data: { returnData: any[] } = await multiContract.methods
    .aggregate([
      {
        target: marketAddress,
        callData: marketInterface.encodeFunctionData(
          'fTokenRedeemFeeRatio',
          [],
        ),
      },
      {
        target: ethWeETHOracleAddress,
        callData: ethWeETHOracleIface.encodeFunctionData('latestAnswer', []),
      },
    ])
    .call({}, blockNumber);

  const redeemFee = BigInt(
    marketInterface.decodeFunctionResult(
      'fTokenRedeemFeeRatio',
      data.returnData[0],
    )[0],
  );
  const weETHPrice = BigInt(
    ethWeETHOracleIface.decodeFunctionResult(
      'latestAnswer',
      data.returnData[1],
    )[0],
  );
  return {
    nav: 1000000000000000000n,
    redeemFee,
    weETHPrice,
  };
}
