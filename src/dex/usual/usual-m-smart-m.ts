import {
  Address,
  NumberAsString,
  DexExchangeParam,
  DexConfigMap,
} from '../../types';
import { SwapSide, Network } from '../../constants';
import { IDexHelper } from '../../dex-helper/idex-helper';
import { DexParams } from './types';
import { Interface, JsonFragment } from '@ethersproject/abi';
import { Usual } from './usual';
import { getDexKeysWithNetwork } from '../../utils';
import USUALM_ABI from '../../abi/usual-m-smart-m/usualM.abi.json';

const Config: DexConfigMap<DexParams> = {
  UsualMSmartM: {
    [Network.MAINNET]: {
      fromToken: {
        address: '0x437cc33344a0b27a429f795ff6b469c72698b291',
        decimals: 6,
      },
      toToken: {
        address: '0xfe274c305b365dc38e188e8f01c4fae2171ce927',
        decimals: 6,
      },
    },
  },
};

export class UsualMSmartM extends Usual {
  public static dexKeysWithNetwork: { key: string; networks: Network[] }[] =
    getDexKeysWithNetwork(Config);

  usualMIface: Interface;

  constructor(
    readonly network: Network,
    readonly dexKey: string,
    readonly dexHelper: IDexHelper,
  ) {
    super(network, dexKey, dexHelper, Config[dexKey][network]);
    this.usualMIface = new Interface(USUALM_ABI as JsonFragment[]);
  }

  async getDexParam(
    srcToken: Address,
    destToken: Address,
    srcAmount: NumberAsString,
    destAmount: NumberAsString,
    recipient: Address,
    data: {},
    side: SwapSide,
  ): Promise<DexExchangeParam> {
    if (this.isFromToken(srcToken) && this.isToToken(destToken)) {
      const exchangeData = this.usualMIface.encodeFunctionData(
        'wrap(address, uint256)',
        [recipient, srcAmount],
      );

      return {
        needWrapNative: false,
        dexFuncHasRecipient: true,
        exchangeData,
        targetExchange: this.config.toToken.address,
        returnAmountPos: undefined,
      };
    }

    throw new Error('LOGIC ERROR');
  }
}