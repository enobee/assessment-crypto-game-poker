import React, { useState, useEffect, useContext, useRef } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import globalContext from "../../context/global/globalContext";
import { useNavigate } from "react-router-dom";
import loadingImage from "../../assets/game/loading-background.jpg";
import {
  FiChevronDown,
  FiChevronUp,
  FiPower,
  FiChevronRight,
} from "react-icons/fi";
import useWalletProviders from "./useWalletProvider";

const FullScreen = styled.div`
  width: 100%;
  height: 100vh;
  background: url(${loadingImage}) center center / cover no-repeat black;
  position: relative;
`;

const ConnectContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  width: max-content;

  @media (max-width: 480px) {
    top: 0.5rem;
    right: 0.5rem;
  }
`;

const HeaderButton = styled.button`
  width: 220px;
  padding: 0.75rem 1rem;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 180px;
    padding: 0.6rem 0.8rem;
    font-size: 0.875rem;
  }
`;

const ButtonList = styled.ul`
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0.5rem 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  width: 220px;

  @media (max-width: 480px) {
    width: 180px;
  }
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  color: white;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  & + & {
    margin-top: 0.25rem;
  }

  @media (max-width: 480px) {
    padding: 0.4rem 0.75rem;
  }
`;

const Badge = styled.span`
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background: ${({ installed }) => (installed ? "#10b981" : "#f59e0b")};

  @media (max-width: 480px) {
    font-size: 0.65rem;
  }
`;

export default function ConnectWallet() {
  const { setWalletAddress } = useContext(globalContext);
  const installed = useWalletProviders();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [account, setAccount] = useState(null);
  const [mainOpen, setMainOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const walletList = [
    { id: "isMetaMask", name: "MetaMask", url: "https://metamask.io/download" },
    {
      id: "isCoinbaseWallet",
      name: "Coinbase Wallet",
      url: "https://www.coinbase.com/wallet",
    },
    { id: "isTrust", name: "Trust Wallet", url: "https://trustwallet.com" },
    { id: "isFrame", name: "Frame", url: "https://frame.sh" },
    {
      id: "isOpera",
      name: "Opera",
      url: "https://www.opera.com/features/opera-wallet",
    },
  ];

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setMainOpen(false);
        setSwitchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getProvider = (id) => installed.find((provider) => provider[id]);

  const connect = async (provider) => {
    setProcessing(true);
    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      if (!accounts.length) throw new Error("No account selected");
      const address = accounts[0];
      const web3 = new ethers.providers.Web3Provider(provider);
      const signer = web3.getSigner();
      const signedHash = await signer.signMessage("This is a test");
      console.log("Test Signature Hash:", signedHash);
      if (isMountedRef.current) {
        setAccount(address);
        setWalletAddress(address);
        setMainOpen(false);
        setSwitchOpen(false);
        navigate("/play");
      }
    } catch (error) {
      if (isMountedRef.current) {
        Swal.fire("Error", error.message || "Connection failed", "error");
      }
    } finally {
      if (isMountedRef.current) {
        setProcessing(false);
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWalletAddress(null);
    setMainOpen(false);
    setSwitchOpen(false);
  };

  return (
    <FullScreen>
      <ConnectContainer ref={containerRef}>
        <HeaderButton
          disabled={processing}
          onClick={() => {
            if (processing) return;
            if (account && switchOpen) {
              setSwitchOpen(false);
              setMainOpen(true);
            } else {
              setMainOpen(!mainOpen);
              setSwitchOpen(false);
            }
          }}
        >
          {!account ? (
            <>Connect Wallet {mainOpen ? <FiChevronUp /> : <FiChevronDown />}</>
          ) : !switchOpen ? (
            <>
              {account.slice(0, 6)}…{account.slice(-4)}{" "}
              {mainOpen ? <FiChevronUp /> : <FiChevronDown />}
            </>
          ) : (
            <>Switch Wallet</>
          )}
        </HeaderButton>

        {!account && mainOpen && (
          <ButtonList>
            {walletList.map((wallet, index) => {
              const walletProvider = getProvider(wallet.id);
              const installedWallet = !!walletProvider;
              return (
                <ListItem
                  key={index}
                  onClick={() =>
                    installedWallet
                      ? connect(walletProvider)
                      : window.open(wallet.url, "_blank")
                  }
                >
                  <span>{wallet.name}</span>
                  <Badge installed={installedWallet}>
                    {installedWallet ? "Installed" : "Install"}
                  </Badge>
                </ListItem>
              );
            })}
          </ButtonList>
        )}

        {account && mainOpen && !switchOpen && (
          <ButtonList>
            <ListItem
              onClick={() => {
                setSwitchOpen(true);
                setMainOpen(false);
              }}
            >
              <span>Switch Wallet</span>
              <FiChevronRight />
            </ListItem>
            <ListItem onClick={disconnectWallet}>
              <span>Disconnect Wallet</span>
              <FiPower />
            </ListItem>
          </ButtonList>
        )}

        {switchOpen && (
          <ButtonList>
            {walletList.map((wallet, index) => {
              const walletProvider = getProvider(wallet.id);
              const installedWallet = !!walletProvider;
              return (
                <ListItem
                  key={index}
                  onClick={() =>
                    installedWallet
                      ? connect(walletProvider)
                      : window.open(wallet.url, "_blank")
                  }
                >
                  <span>{wallet.name}</span>
                  <Badge installed={installedWallet}>
                    {installedWallet ? "Installed" : "Install"}
                  </Badge>
                </ListItem>
              );
            })}
          </ButtonList>
        )}
      </ConnectContainer>
    </FullScreen>
  );
}
