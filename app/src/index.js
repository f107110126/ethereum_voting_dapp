// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';

/*
 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */

const rpc_url = [
    'https://ropsten-rpc.linkpool.io/',
    'https://ropsten.rpc.fiews.io/v1/free'
];

let account;

import voting_artifacts from '../../build/contracts/Voting.json';
import { toChecksumAddress } from 'web3-utils';

window.Voting = contract(voting_artifacts);

let candidates = {}

window.voteForCandidate = function () {
    let candidateName = $('#candidate').val();
    let voteTokens = $('#vote-tokens').val();
    $('#msg').html('Vote has been submitted.'
        + ' The vote count will increment as soon as the'
        + ' vote is recorded on the blockchain. Please wait.');
    $('#candidate').val('');
    $('#vote-tokens').val('');

    /*
     * Voting.deployed() returns an instance of the contract. Every call
     * in Truffle returns a promise which is why we have used then()
     * everywhere we have a transaction call
     */
    Voting.deployed().then(function (contractInstance) {
        contractInstance.voteForCandidate(
            web3.utils.asciiToHex(candidateName),
            voteTokens,
            { gas: 150000, from: account }
        ).then(function () {
            let div_id = candidates[candidateName];
            return contractInstance.totalVotesFor.call(web3.utils.asciiToHex(candidateName))
                .then(function (v) {
                    $('#' + div_id).html(v.toString());
                    $('#msg').html('');
                });
        }).catch(err => console.error(err));
    });
}

window.buyTokens = function () {
    let tokensToBuy = $('#buy').val();
    let price = tokensToBuy * tokenPrice;
    $('#buy-msg').html('Purchase order has been submitted. Please wait.');
    Voting.deployed().then(function (contractInstance) {
        contractInstance.buy({ value: web3.utils.toWei(price, 'ether'), from: account })
            .then(function (v) {
                $('#buy-msg').html('');
                web3.eth.getBalance(contractInstance.address, function (error, result) {
                    $('#contract-balance').html(web3.utils.fromWei(result.toString()) + ' Ether');
                });
            });
    });
    populateTokenData();
}

window.lookupVoterInfo = function () {
    let address = $('#voter-info').val();
    Voting.deployed().then(function (contractInstance) {
        contractInstancevoterDetails.call(address).then(function (v) {
            $('#tokens-bought').html('Total tokens bought: ' + v[0].toString());
            let votesPerCandidate = v[1];
            $('#votes-cast').empty();
            $('#votes-cast').append('Votes cast per candidate: <br>');
            let allCandidates = Object.keys(candidates);
            for (let i = 0; i < allCandidates.length; i++) {
                $('#votes-cast').append(allCandidates[i] + ': ' + votesPerCandidate[i] + '<br>');
            }
        })
    })
}

function populateCandidates() {
    Voting.deployed().then(function (contractInstance) {
        console.log(account)
        contractInstance.candiddateName.call(0).then(function(v) {
            console.log(v);
        });
        contractInstance.allCandidates.call().then(function (candidateArray) {
            console.log('after call');
            for (let i = 0; i < candidateArray.length; i++) {
                /*
                 * We store the candidate names as bytes32 on the blockain. We use
                 * the handy toUtf8 method to convert from bytes32 to string.
                 */
                candidates[web3.toUtf8(candidateArray[i])] = 'candidate-' + i;
            }
            setupCandidateRows();
            populateCandidateVotes();
            populateTokenData();
        }).catch(error => {
            console.error(error);
        });
    });
}

function populateCandidateVotes() {
    let candidateNames = Object.keys(candidates);
    for (let i = 0; i < candidateNames.length; i++) {
        let name = candidateNames[i];
        Voting.deployed().then(function (contractInstance) {
            contractInstance.totalVotesFor.call(name).then(function (v) {
                $('#' + candidates[name]).html(v.toString());
            })
        });
    }
}

function setupCandidateRows() {
    Object.keys(candidates).forEach(function (candidate) {
        $('#candidate-rows').append('<tr><td>' + candidate + '</td><td id="' + candidates[candidate] + '"></td></tr>');
    })
}

/*
 * Fetch the total tokens, tokens available for sale and the price of each token and display in the UI.
 */
function populateTokenData() {
    Voting.deployed().then(function (contractInstance) {
        contractInstance.totalTokens().then(function (v) {
            $('#tokens-total').html(v.toString());
        });
        contractInstance.tokensSold.call().then(function (v) {
            $('#tokens-sold').html(v.toString());
        });
        contractInstance.tokenPrice().them(function (v) {
            tokenPrice = perseFloat(web3.fromwei(v.toString()));
        })
        web3.eth.getBalance(contractInstance.address, function (error, result) {
            $('#contract-balance').html(web3.fromWei(result.toString()) + ' Ether');
        })
    })
}

$(document).ready(function () {
    if (typeof web3 !== 'undefined') {
        console.warn('Using web3 detected from external source like Metamask');
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
        console.log(web3.eth.accounts.givenProvider);
    } else {
        console.warn('No web3 detected. Falling back to http://localhost:8545.'
            + ' You should remove this fallback when you deploy live, as it\'s'
            + ' inherently insecure. Consider switching to Metamask for development.'
            + ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask');
        window.web3 = new Web3(new Web3.providers.HttpProvider(rpc_url[1]));
    }

    web3.eth.getAccounts(function (error, access) {
        if (error !== null) {
            console.error(error);
            console.error('There was an error fetching your accounts.');
            return null;
        }
        if (access.length === 0) {
            console.error('Couldn\'t get any accounts! Make sure your'
                + ' Ethereum client is configured correctly.');
            return null;
        }
        account = access[0];
    });

    Voting.setProvider(web3.currentProvider);
    populateCandidates();
});