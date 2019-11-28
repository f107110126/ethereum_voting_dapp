module.exports = {
    // to verify if Metamask is installed or not.
    isInstalled() {
        if (typeof web3 !== 'undefined') {
            console.log('Metamask is installed.');
            return true;
        } else {
            console.log('Metamask is not installed.');
            return false;
        }
    },

    // to verify if metamask is locked or not
    isLocked() {
        return web3.eth.getAccounts(function (error, accounts) {
            if (error !== null) {
                console.log(error);
            } else {
                if (accounts.length === 0) console.log('Metamask is locked.');
                else {
                    console.log('Metamask is unlocked.');
                    return false;
                }
            }
            return true;
        });
    },

    // to verify if Metamask has balance or not
    checkBalance(balanceNeeded = 0) {
        return tokenInst.balanceOf(
            web3.eth.accounts[0],
            function (error, result) {
                if (!error && result) {
                    let balance = result.c[0];
                    if (balance < balanceNeeded * (100000000)) {
                        console.log('Metamask shows insufficient balance.');
                        return false;
                    } else {
                        console.log('Metamask show sufficient balance.');
                    }
                } else {
                    console.error(error);
                }
                return false;
            }
        );
    }
}