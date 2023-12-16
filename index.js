const readline = require('readline');
const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey = "privateKey";
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

const blackHole = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"; //black hole address

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function countdown(seconds) {
    for (let i = seconds; i >= 0; i--) {
        process.stdout.write(`Menunggu ${i} detik...\r`);
        await delay(1000);
    }
}

async function main(memo) {
    const unSignedTxn = await tronWeb.transactionBuilder.sendTrx(blackHole, 1);
    const unSignedTxnWithNote = await tronWeb.transactionBuilder.addUpdateData(unSignedTxn, memo, 'utf8');
    const signedTxn = await tronWeb.trx.sign(unSignedTxnWithNote);
    console.log("signed =>", signedTxn);
    const ret = await tronWeb.trx.sendRawTransaction(signedTxn);
    console.log("broadcast =>", ret);
    return ret.result; // Mengembalikan status hasil
}

rl.question('Masukkan data memo: ', (memoInput) => {
    const memo = `${memoInput}`;

    rl.question('Berapa kali Anda ingin menjalankan transaksi? :', async (jumlah) => {
        let sukses = 0;
        let gagal = 0;

        for (let i = 0; i < parseInt(jumlah); i++) {
            const hasil = await main(memo).catch((err) => {
                console.log("error:", err);
                return false; // Gagal karena error
            });

            if (hasil) {
                sukses++; // Transaksi berhasil
            } else {
                gagal++; // Transaksi gagal
            }

            if (i < parseInt(jumlah) - 1) {
                await countdown(5); // Hitungan mundur
            }
        }

        console.log(`Transaksi sukses: ${sukses}`);
        console.log(`Transaksi gagal: ${gagal}`);
        rl.close();
    });
});