import React from "react";
import ContractForm from "../components/contracts/ContractForm";
import ContractList from "../components/contracts/ContractList";

export default function ContractsPage() {
  return (
    <div>
      <h1>Gestion des contrats</h1>
      <ContractForm />
      <hr style={{ margin: "40px 0" }} />
      <ContractList />
    </div>
  );
} 