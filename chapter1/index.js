// import Web3 from "web3";

web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
let account;
web3.eth.getAccounts().then((f) => {
    account = f[0]
});

abi = JSON.parse('[{"inputs":[{"internalType":"bytes32[]","name":"candidateNames","type":"bytes32[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"candidateList","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]');

contract = new web3.eth.Contract(abi);
contract.options.address = '0x12d3c9b252d010837ecff9fd2898419dcf73a16c';
// update this contract address with your contract address

candidates = {
    Rama: 'candidate-1',
    Nick: 'candidate-2',
    Jose: 'candidate-3'
}

function voteForCandidate(candidate) {
    candidateName = $('#candidate').val();
    console.log(candidateName);

    contract.methods.voteForCandidate(
        web3.utils.asciiToHex(candidateName)
    ).send({from: account}).then((f)=>{
        let div_id = candidates[candidateName];
        contract.methods.totalVotesFor(
            web3.utils.asciiToHex(candidateName)
        ).call().then((f)=>{
            $('#'+div_id).html(f);
        })
    });
}

$(document).ready(function() {
    let candidateNames = Object.keys(candidates);
    for(let i = 0; i < candidateNames.length; i ++) {
        let name = candidateNames[i];
        contract.methods.totalVotesFor(
            web3.utils.asciiToHex(name)
        ).call().then((f)=>{
            $('#'+candidates[name]).html(f);
        });
    }
})