import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useSelectUser } from "../../../redux/slices/authSlice";
import { createCompany } from "../../../redux/slices/companySlice";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";

export default function GraphClient() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();

  return (
    <div className="graph-client-container">
      <div className="title-container">
        <h1>Graph Client</h1>
        <div className="title-actions">
          <ActionButton
            label={"Create Graph"}
            type="primary"
            onClick={() => router.push("/graph/new-graph-client")}
          />
        </div>
      </div>
    </div>
  );
}
