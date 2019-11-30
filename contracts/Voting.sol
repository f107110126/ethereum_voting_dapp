pragma solidity >=0.4.0 <0.6.0;
// We have to specify what version of compiler this code with compile whit

contract Voting {

    // We use the struct datatype to store the voter information.
    struct voter {
        address voterAddress; // The address of the voter
        uint tokensBought; // The total no. of tokens this voter owns.
        uint[] tokensUsedPerCandidate; // Array to keep track of votes per candidate.
        /*
         * We have an array of candidates initialized below.
         * Every time this voter votes with her tokens, the value at that index is
         * incremented. Example, if candidateList array declared below has ['Rama',
         * 'Nick', 'Jose'] and this voter votes 10 tokens to Nick, the
         * tokensUsedPerCandidate[1] will be incremented by 10.
         */
    }

    mapping (address => voter) public voterInfo;

    /*
     * mapping field below is equivalent to an associative array or hash.
     * The key of the mapping is candidate name stored as type bytes32 and value is
     * an unsigned integer to store the vote count.
     */

    mapping (bytes32 => uint256) public votesReceived;

    /*
     * Solidity doesn't let you pass in an array of strings in the constructor (yet).
     * We will use an array of bytes32 instead to store the list of candidates.
     */

    bytes32[] public candidateList;

    uint public totalTokens; // Total no. of tokens available for election
    uint public balanceTokens; // Total no. of tokens still available for purchase
    uint public tokenPrice; // Price per token

    /*
     * This is the constructor which will be called once when you deploy the contract
     * to the blockchain. When we deploy the contract, we will pass an array of
     * candidates who will be contesting in the election.
     */

    constructor(uint tokens, uint pricePerToken, bytes32[] memory candidateNames) public {
        totalTokens = tokens;
        balanceTokens = tokens;
        tokenPrice = pricePerToken;
        candidateList = candidateNames;
    }

    // This function returns the votes a candidate has received so far
    function totalVotesFor(bytes32 candidate) public view returns (uint256) {
        require(validCandidate(candidate), "Candidate doesn't found.");
        return votesReceived[candidate];
    }

    // This function increments the vote count for the specified candidate. This is
    // equivalent to casting a vote.
    // Instead of just taking the candidate name as an argument, we now also
    // require the no . of tokens this voter wants to vote for the candidate
    function voteForCandidate(bytes32 candidate, uint votesInTokens) public {
        uint index = indexOfCandidate(candidate);
        require(index != uint(-1), "Candidate doesn't found.");

        // msg.sender gives us the address of the account/voter who is trying to call
        // this function.
        if (voterInfo[msg.sender].tokensUsedPerCandidate.length == 0) {
            for (uint i = 0; i < candidateList.length; i ++) {
                voterInfo[msg.sender].tokensUsedPerCandidate.push(0);
            }
        }

        // Make sure this voter has enough tokens to cast the vote
        uint availableTokens = voterInfo[msg.sender].tokensBought - totalTokensUsed(voterInfo[msg.sender].tokensUsedPerCandidate);
        require(availableTokens >= votesInTokens, "Voter doesn't have enough tokens.");

        votesReceived[candidate] += votesInTokens;

        // Store how many tokens were used for this candidate
        voterInfo[msg.sender].tokensUsedPerCandidate[index] += votesInTokens;
    }

    // Return the sum of all the tokens used by this voter.
    function totalTokensUsed(uint[] memory _tokensUsedPerCandidate) private pure returns (uint) {
        uint totalUsedTokens = 0;
        for(uint i = 0; i < _tokensUsedPerCandidate.length; i++) {
            totalUsedTokens += _tokensUsedPerCandidate[i];
        }
    }

    function indexOfCandidate(bytes32 candidate) public view returns (uint) {
        for(uint i = 0; i < candidateList.length; i++) {
            if (candidateList[i] == candidate) {
                return i;
            }
        }
        return uint(-1);
    }

    function validCandidate(bytes32 candidate) public view returns (bool) {
        uint index = indexOfCandidate(candidate);
        return (index == uint(-1) ? false : true);
    }
}