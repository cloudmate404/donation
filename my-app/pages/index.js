import { useRef, useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { BigNumber, Contract, providers, utils } from "ethers";
import { DONATION_CONTRACT_ADDRESS, abi } from "../constants";

import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  // 1. WE WANT USERS TO CONNECT THEIR WALLETS;
  // 2. ALLOW USERS TO DONATE
  // 3. ALLOW USERS TO SEE TOTAL DONATIONS // TOTAL DONORS AND TOKENS MINTED
  // 4. ALLOW ONLY OWNER TO SEE AND CALL WITHDRAW AND TRANSFER OWNERSHIP FUNCTIONS

  // 1. state keep track of if user is connected to the wallet and
  const [walletConnected, setWalletConnected] = useState(false);

  // 1. set loading state
  const [loading, setLoading] = useState(false);

  const zero = BigNumber.from("0");

  // 2. Keep track of amount users donate
  const [amount, setAmount] = useState("");

  const [totalDonated, setTotalDonated] = useState("");
  const [totalDonors, setTotalDonors] = useState("");
  const [totalTokensMinted, setTotalTokensMinted] = useState("");

  // 4 - Keep track of if user is owner
  const [isOwner, setIsOwner] = useState(false);

  // 1. create a reference
  const web3ModalRef = useRef();

  // function to get owner
  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const donationContract = new Contract(
        DONATION_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const owner = await donationContract.owner();
      const userAddress = await signer.getAddress();
      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 4. Withdraw function
  const withdrawFunds = async (money) => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const donationContract = new Contract(
        DONATION_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await donationContract.withdrawFunds();
      await tx.wait();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // 5 - Transfer Ownership function
  const transferOwnership = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const donationContract = new Contract(
        DONATION_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await donationContract.transferOwnership();
    } catch (error) {
      console.error(error);
    }
  };
  // 3. Display total donations and other infos
  const displayInfo = async () => {
    try {
      const provider = await getProviderOrSigner();

      const donationContract = new Contract(
        DONATION_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const getDonation = await donationContract.getDonation();
      // await getDonation.wait();
      const getDonors = await donationContract.totalDonors();
      const getTokensMinted = await donationContract.tokenIds();

      const toEther = utils.formatEther(getDonation);
      setTotalDonated(toEther.toString());
      setTotalDonors(getDonors.toString());
      setTotalTokensMinted(getTokensMinted.toString());
    } catch (error) {
      console.error(error);
    }
  };

  // 2. function to donate
  const donate = async (cost) => {
    try {
      const signer = await getProviderOrSigner(true);

      const donationContract = new Contract(
        DONATION_CONTRACT_ADDRESS,
        abi,
        signer
      );
      setLoading(true);
      // const donatedAmount = utils.parseEther(amount);

      const tx = await donationContract.donate({
        value: utils.parseEther(cost),
      });
      await tx.wait();

      setLoading(false);
      //
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // 1. function to connect to the wallet
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();

      // Update walletConnected state to true
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  // 1. Helper function to getProviderOrSigner to connect to the wallet
  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();

    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Please switch to the Rinkeby test network");

      throw new Error("Please switch to the Rinkeby test network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();

    await displayInfo();
    setInterval(async () => {
      await displayInfo();
    }, 5 * 1000);
  };

  // 1. To initialize the web3ModalRef when the website loads
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
    onPageLoad();
  }, []);

  // const handleChange = (value) => {
  //   setAmount(value.toString());
  // };

  function renderButton() {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your Wallet
        </button>
      );
    }

    if (loading) {
      return <h1 className={styles.description}>Loading...</h1>;
    }

    if (isOwner && walletConnected) {
      return (
        <div>
          <div className={styles.donationMain}>
            <input
              type="number"
              className={styles.input}
              // value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              className={styles.button}
              onClick={() => {
                donate(amount);
              }}
            >
              Donate
            </button>
          </div>
          <button
            className={styles.button}
            onClick={() => {
              withdrawFunds(amount);
            }}
          >
            Withdraw Funds
          </button>
        </div>
      );
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Ukraine Relief</title>
        <meta name="description" content="Donation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.nav}>
        <h1 className={styles.logo}>Ukraine Relief Funds</h1>
      </nav>

      <div className={styles.main}>
        <img className={styles.image} src="/ukr1.jpg" alt="" />
        <div className={styles.title}>Join in helping Ukraine</div>
        <div>
          <div className={styles.description}>
            <span>{totalDonated}</span>
            <span>{totalDonors}</span>
            <span>{totalTokensMinted}</span>
          </div>
          <div>{renderButton()}</div>
        </div>
      </div>
    </div>
  );
}
