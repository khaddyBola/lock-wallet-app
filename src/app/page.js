'use client'
import Wallet from "./components/wallet/Wallet"
import Dashboard from "./pages/dashboard/Dashboard"

export default function Home() {
  return (
    <div>
      <Wallet>
        <Dashboard/>
      </Wallet>
    </div>
  );
}
