import { useRef, useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import { DONATION_CONTRACT_ADDRESS, abi } from "../constants";

import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  // 1. WE WANT USERS TO CONNECT THEIR WALLETS;
  // 2. ALLOW USERS TO DONATE
  // 3. ALLOW USERS TO SEE TOTAL DONATIONS // TOTAL DONORS AND TOKENS MINTED

  // 1. state keep track of if user is connected to the wallet and
  const [walletConnected, setWalletConnected] = useState(false);

  // 1. set loading state
  const [loading, setLoading] = useState(false);

  const zero = BigNumber.from("0");

  // 2. Keep track of amount users donate
  const [amount, setAmount] = useState("0");

  // 1. create a reference
  const web3ModalRef = useRef();

  // 3. Display total donations and other infos
  const displayInfo = async () => {
    try {
      const provider = await getProviderOrSigner();

      const donationContract = new Contract(
        DONATION_CONTRACT_ADDRESS,
        abi,
        provider
      );

      setLoading(true);

      const getDonations = await donationContract.totalDonated();
      await getDonations.wait();
      // const getDonors = await donationContract.totalDonors();
      // const getTokensMinted = await donationContract.tokensIds();

      setTotalDonated(getDonations.toString());
      // setTotalDonors(getDonors.toString());
      // setTotalTokensMinted(getTokensMinted.toString());
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

      const tx = await donationContract.donate(cost);
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

  // 1. To initialize the web3ModalRef when the website loads
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();
      // displayInfo();
    }
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
      return <button className={styles.description}>Loading...</button>;
    }

    if (walletConnected) {
      return (
        <div>
          <div className={styles.donationMain}>
            <input
              type="number"
              className={styles.input}
              // value={amount}
              onChange={(e) =>
                setAmount(
                  BigNumber.from(utils.parseEther(e.target.value || "0"))
                )
              }
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
          <div>{renderButton()}</div>
        </div>
      </div>
    </div>
  );
}