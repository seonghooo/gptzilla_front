import React, { useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import { GPTZillaABI } from "./abi";      // abi 임포트

const CONTRACT_ADDRESS = "0x07FA6D501DA5688f4b7c10766192Dc53FA15c07d" ;
// GPTZilla 스마트 컨트랙트 주소

function App() {
  const [account, setAccount] = useState(null);     // 연결된 지갑 주소 상태
  const [balance, setBalance] = useState(null);     // 잔액 상태

  const connectWallet = async () => {
    const provider = await detectEthereumProvider(); 

    if (provider) {
      try {
        await provider.request({ method: "eth_requestAccounts" }); // 사용자 지갑 연결 요청
        const ethersProvider = new ethers.BrowserProvider(provider); // ethers v6 기준
        const signer = await ethersProvider.getSigner();
        const userAddress = await signer.getAddress(); // 지갑 주소 가져오기
        setAccount(userAddress); // 상태 저장

        // 스마트 컨트랙트 연결
        console.log("사용자 주소:", userAddress);

        const gptz = new ethers.Contract(CONTRACT_ADDRESS, GPTZillaABI, ethersProvider);
        console.log("컨트랙트 연결 완료:", gptz);

        const rawBalance = await gptz.balanceOf(userAddress);
        console.log("잔액(raw):", rawBalance);

        const formattedBalance = ethers.formatUnits(rawBalance, 18);
        console.log("잔액(formatted):", formattedBalance);

        setBalance(formattedBalance); // 잔액 상태 저장
      } catch (err) {
        console.error("지갑 연결 실패:", err);
      }
    } else {
      alert("Metamask를 설치해주세요!");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>GPTZ DApp</h1>
      <button onClick={connectWallet}>
        {account ? `🦊 연결된 지갑: ${account}` : "지갑 연결하기"}
      </button>

      {balance != null && (
        <p> 💰내 GPTZ 잔액 : {balance} GPTZ </p>
      )}
    </div>
  );
}

export default App;


