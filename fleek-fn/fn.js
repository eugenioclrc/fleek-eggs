import { createPublicClient,createWalletClient, http, keccak256, encodePacked, parseAbi } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts';

// addr: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
// @todo this is a test wallet DO NOT USE IN PRODUCTION
const MINTER_PK = '0x2a871d0';


const TYPES = [
    6, // id: 0, 6 leading zeros
    7, // id: 1, 7 leading zeros
    8, // id: 2, 8 leading zeros
    9, // id: 3, 9 leading zeros
    10  // id: 4, 10 leading zeros
  ];
  
 
const publicClient = createPublicClient({ 
  chain: baseSepolia,
  transport: http()
})


const BASE_EGGS = '0xAd43AbaeD15e41176F666DF2935f1249560e4456';

const abi = parseAbi([
    'function usersHash(address user) view returns (bytes32)',
    'function mintBatch(address to, uint256[] ids, uint256[] amounts)'
]);


export async function getSalt(user) {
    const data = await publicClient.readContract({
        address: BASE_EGGS,
        abi,
        functionName: 'usersHash',
        args: [user],
        blockTag: 'latest',
    });
    
    return data;
}

function queryStringToJSON(queryString) {
  var pairs = queryString.split('&');
  var result = {};
  pairs.forEach(function(pair) {
    var parts = pair.split('=');
    var key = decodeURIComponent(parts[0]);
    var value = decodeURIComponent(parts[1]);
    if (key in result) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  });
  return result;
}

export default async function POST({request}) {
  if(typeof request.body == 'string') {
    request.body = queryStringToJSON(request.body);
  }
  
    const user = request.body.user;
    const salt = await getSalt(user);
    const nonces = request.body.nonces.split(',').map(e => `0x${e}`);
    const items = checkSalts(user, salt, nonces);

    if(items.ids && items.ids.length>0) {
        const tx = await mintToUser(user, items.ids, items.amounts);
        if(tx) {
          return renderMinting(tx, items);
        } else {
          return renderFailure();
        }
    }
    // failure
    return renderLand();
}

function renderMinting(tx, items) {
  return `<html>
  
  Congraturlations!! your items are being mint on 
  <a href="https://sepolia.basescan.org/tx/${tx}">${tx}</a>
  </html>`
}


function renderFailure() {
  return `
  <html>
  There has been some issue on your submission :()
  </html>
  `
}

function renderLand() {
  return `<html>
  Hey, you shoulndt supposed to be here, goto to the main page.
  // redir with JS
  </html>`
}


function checkSalts(to, userHash, salts) {
  
    const amounts = new Array(TYPES.length).fill(0);
    for(let i = 0; i < salts.length; i++) {
      let message = encodePacked(
        ['address', 'bytes32', 'uint256'],
        [to, userHash, salts[i]]
      );
  
      let zeros = countLeadingZeros(keccak256(message));
      if (zeros > TYPES[TYPES.length - 1]) zeros = TYPES[TYPES.length - 1];
      amounts[TYPES.findIndex(x => x == zeros)]++;
    }
    const ids = amounts.map((a, i) => { if(a != 0) return i; }).filter(x => x != undefined);
    const filterAmounts = amounts.map(a => { if(a != 0) return a; }).filter(x => x != undefined);
  
    return { ids, amounts: filterAmounts };
  }
  
  function countLeadingZeros(hash) {
    return hash.slice(2).match(/^0+/)[0].length;
  }

  async function mintToUser(to, ids, amounts) {
    const walletClient = createWalletClient({
        account: privateKeyToAccount(MINTER_PK),
        chain: baseSepolia,
        transport: http()
      });
      
      const { request } = await publicClient.simulateContract({
        address: BASE_EGGS,
        abi,
        functionName: 'mintBatch',
        args: [
          to,
          ids,
          amounts,
        ],
        account: privateKeyToAccount(MINTER_PK),
      });
      return await walletClient.writeContract(request)
  }