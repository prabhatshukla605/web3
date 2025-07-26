const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1");
const {
  toHex,
  utf8ToBytes,
  hexToBytes,
} = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "046aaca38e868a77f68d71f85fe363793c0a79a15aae132020809127ad919ba145b30557f8d2ee448c7a0a95865c2b5fdfdd2ea6de7e27ea9d53924efbf08b6951": 100,
  "0482b42327e7d94d339204c05aab2b052db70be98729f041f5dd4bb697bd5cb9d6dc8364d441287d44c17cd50aa75bddff484c28807f93f71c25733164146bf600": 50,
  "041fa683783f6ca44fa93c3eb159e490e0ba5b614962f2768b11adb72458a299b9cab3c7513fb91f68d8a2ca88fde275dbd76f8a95327b91d55df72f742255d088": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { message, signature, recoveryBit } = req.body;
  const { recipient, amount } = message;
  const messageHash = toHex(keccak256(utf8ToBytes(JSON.stringify(message))));
  const publicKey1 = secp.recoverPublicKey(
    messageHash,
    hexToBytes(signature),
    recoveryBit
  );
  const sender = toHex(publicKey1);
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
