import { config, chainId } from './store';
import { readContract, writeContract, multicall, watchContractEvent } from '@wagmi/core';
import { get } from 'svelte/store';

import { parseAbi } from 'viem'

const BASE_EGGS = '0xAd43AbaeD15e41176F666DF2935f1249560e4456';

const abi = parseAbi([
    'function usersHash(address user) view returns (bytes32)'
]);


export async function getSalt(user) {
    const data = await readContract(get(config), {
        address: BASE_EGGS,
        abi,
        functionName: 'usersHash',
        args: [user],
        blockTag: 'latest',
    });
    
    return data;
}