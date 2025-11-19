import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useSelectUser } from "../../../redux/slices/authSlice";
import { createCompany } from "../../../redux/slices/companySlice";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";

export default function CreateCompanyPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();

  const [formData, setFormData] = useState({
    company_name: "",
    company_email: "",
    phone_no: "",
    address: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const company_details = {
      ...formData,
      company_id: v4(),
      is_owner: true,
      user_id: user?.uid,
    };

    dispatch(
      createCompany({
        ...company_details,
      })
    );
  };

  const handleCancel = (e) => {
    e.preventDefault();
    router.back(); // Or navigate to companies list
  };

  return (
    <div className="create-company-container">
      <div className="form-card">
        <div className="form-header">
          <h1>Create New Company</h1>
          <p>Enter the company details below</p>
        </div>

        <form onSubmit={handleSubmit} className="company-form">
          <div className="form-section">
            <div className="input-group">
              <label htmlFor="company_name">Company Name</label>
              <PlainTextField
                id="company_name"
                type="text"
                value={formData.company_name}
                placeholder="Enter company name"
                onChange={(value) => handleInputChange("company_name", value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="company_email">Company Email</label>
              <PlainTextField
                id="company_email"
                type="email"
                value={formData.company_email}
                placeholder="Enter company email"
                onChange={(value) => handleInputChange("company_email", value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="phone_no">Phone Number</label>
              <PlainTextField
                id="phone_no"
                type="tel"
                value={formData.phone_no}
                placeholder="Enter phone number"
                onChange={(value) => handleInputChange("phone_no", value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="address">Address</label>
              <PlainTextField
                id="address"
                type="text"
                value={formData.address}
                placeholder="Enter company address"
                onChange={(value) => handleInputChange("address", value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <ActionButton
              type="outlined"
              label="Cancel"
              onClick={handleCancel}
            />
            <ActionButton
              type="primary"
              label="Create Company"
              onClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
