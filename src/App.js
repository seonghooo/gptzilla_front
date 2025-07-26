import React, { useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import { GPTZillaABI } from "./abi";      // abi 임포트

const CONTRACT_ADDRESS = "0x07FA6D501DA5688f4b7c10766192Dc53FA15c07d" ;
// GPTZilla 스마트 컨트랙트 주소

function App() {
  const [account, setAccount] = useState(null);     // 연결된 지갑 주소 상태
  const [balance, setBalance] = useState(null);     // 잔액 상태
  const [recipient, setRecipient] = useState(""); // 수신자 주소 상태
  const [amount, setAmount] = useState(""); // 전송할 금액 상태

  // signer 가져오는 헬퍼 함수
  const getSigner = async () => {
    const provider = await detectEthereumProvider();
    if (!provider) {
      throw new Error("Metamask가 필요합니다");
    }

    await provider.request({ method : "eth_requestAccounts" }); // 사용자 지갑 연결 요청
    const ethersProvider = new ethers.BrowserProvider(provider); // ethers v6 기준
    return ethersProvider.getSigner();
  }


  // 지갑 연결 + 잔액 조회
  const connectWallet = async () => {
    try {
      const signer = await getSigner(); // signer 객체 가져오기
      const userAddress = await signer.getAddress(); // 지갑 주소 가져오기
      setAccount(userAddress); // 상태 저장

        // 스마트 컨트랙트 연결
      const gptz = new ethers.Contract(CONTRACT_ADDRESS, GPTZillaABI, signer.provider);  // 스마트 컨트랙트 인스턴스 생성
      const rawBalance = await gptz.balanceOf(userAddress);   // 지갑의 GPTZ 잔액 조회
      const formattedBalance = ethers.formatUnits(rawBalance, 18);    // 18자리 소수점으로 포맷팅
      setBalance(formattedBalance); // 잔액 상태 저장
    } catch (err) {
      console.error("지갑 연결 실패:", err);
    }
  };

  // 토큰 전송 함수
  const sendToken = async () => {
    if (!recipient || !amount){
      alert("받는 주소와 수량을 입력하세요.");
      return;
    }
    try {
      const signer = await getSigner();
      const gptz = new ethers.Contract(CONTRACT_ADDRESS, GPTZillaABI, signer);

      const tx = await gptz.transfer(recipient, ethers.parseUnits(amount, 18));
      await tx.wait() ; // 트랜잭션 완료 대기

      alert('전송 완료! 트랜잭션 해시: ${tx.hash}');

      // 전송 후 잔액 업데이트
      const rawBalance = await gptz.balanceOf(await signer.getAddress());
      const formattedBalance = ethers.formatUnits(rawBalance, 18);
      setBalance(formattedBalance); // 잔액 상태 업데이트
    } catch (err) {
      console.error("전송 실패:", err);
      alert("전송 실패: " + err.message);
    }
  }



  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>GPTZ DApp</h1>
      <button onClick={connectWallet}>
        {account ? `🦊 연결된 지갑: ${account}` : "지갑 연결하기"}
      </button>

      {balance != null && (
        <p> 💰내 GPTZ 잔액 : {balance} GPTZ </p>
      )}

      <hr />

      <h2> 📤 GPTZ 전송 </h2>
      <input
        type= "text"
        placeholder = "받는 지갑 주소"
        value = {recipient}
        onChange = {(e) => setRecipient(e.target.value)}
        style = {{ width: "100%" , marginBottom : "10px"}}
      />
      <input
        type = "text"
        placeholder = "보낼 수량 (예: 10)"
        value = {amount}
        onChange= {(e) => setAmount(e.target.value)}
        style = {{ widh: "100%", marginBotton: "10px"}}
      />
      <button onClick={sendToken}>전송하기</button>
    </div>
  );
}

export default App;

