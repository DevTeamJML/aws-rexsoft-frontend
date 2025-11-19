import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useSelectUser } from "../../../redux/slices/authSlice";
import { createCompany } from "../../../redux/slices/companySlice";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";

export default function NewGraphClient() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();

    return (
    <div className="new-graph-client-container">
      <div className="title-container">
        <h1>New Graph Client</h1>
      </div>
      <div className="graph-content">
        
      </div>
    </div>
  );
}
