import React, { useState } from "react";
import { db } from "../services/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const PurchaseForm = () => {
  const [sellerData, setSellerData] = useState({
    sellerName: "",
    sellerAddress: "",
    guarantorName: "",
    guarantorPhone: "",
  });
  const [currentPhone, setCurrentPhone] = useState({
    phoneBrand: "",
    phoneModel: "",
    imei: "",
    costPrice: "",
  });
  const [phoneBatch, setPhoneBatch] = useState([]);
  const [showGuarantor, setShowGuarantor] = useState(false);

  const addPhoneToBatch = () => {
    if (
      !currentPhone.phoneBrand ||
      !currentPhone.imei ||
      !currentPhone.costPrice
    ) {
      return alert("Please enter at least the Brand, IMEI, and Cost Price.");
    }
    setPhoneBatch([...phoneBatch, currentPhone]);
    setCurrentPhone({
      phoneBrand: "",
      phoneModel: "",
      imei: "",
      costPrice: "",
    });
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    // This Check if we are saving a batch, or just a single direct phone
    let finalBatch = [...phoneBatch];

    if (finalBatch.length === 0) {
      // This Check If the batch list is empty, grab the data currently in the input fields
      if (
        !currentPhone.phoneBrand ||
        !currentPhone.imei ||
        !currentPhone.costPrice
      ) {
        return alert(
          "Please enter the device details or add devices to the batch list.",
        );
      }
      finalBatch.push(currentPhone);
    }

    if (!sellerData.sellerName)
      return alert("Seller Name is required to bind records.");

    try {
      for (const phone of finalBatch) {
        await addDoc(collection(db, "inventory"), {
          ...sellerData,
          ...phone,
          status: "available",
          dateAdded: serverTimestamp(),
        });
      }
      alert(`Success! ${finalBatch.length} device records secured safely.`);

      // This reset Reset the entire form
      setPhoneBatch([]);
      setCurrentPhone({
        phoneBrand: "",
        phoneModel: "",
        imei: "",
        costPrice: "",
      });
      setSellerData({
        sellerName: "",
        sellerAddress: "",
        guarantorName: "",
        guarantorPhone: "",
      });
      setShowGuarantor(false);
    } catch (error) {
      console.error(error);
      alert("Database error encountered while saving batch.");
    }
  };

  return (
    <div className="card">
      <h2 style={{ color: "var(--primary)", marginBottom: "20px" }}>
        New Phone Record
      </h2>

      {/* This Wrap everything in a form so the submit button is always active */}
      <form onSubmit={handleBulkSubmit}>
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            background: "var(--background)",
            borderRadius: "8px",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              fontSize: "1.1rem",
              color: "var(--primary)",
            }}
          >
            Source Identity
          </h3>
          <input
            style={{
              width: "100%",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
            placeholder="Seller Full Name"
            value={sellerData.sellerName}
            onChange={(e) =>
              setSellerData({ ...sellerData, sellerName: e.target.value })
            }
            required
          />
          <textarea
            style={{
              width: "100%",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
            placeholder="Seller Address Trace"
            value={sellerData.sellerAddress}
            onChange={(e) =>
              setSellerData({ ...sellerData, sellerAddress: e.target.value })
            }
          />

          <button
            type="button"
            onClick={() => setShowGuarantor(!showGuarantor)}
            style={{
              background: "transparent",
              border: "1px solid var(--secondary)",
              color: "var(--secondary)",
              padding: "8px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {showGuarantor ? "Remove Guarantor" : "+ Bind Guarantor"}
          </button>

          {showGuarantor && (
            <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
              <input
                style={{ flex: 1 }}
                placeholder="Guarantor Name"
                value={sellerData.guarantorName}
                onChange={(e) =>
                  setSellerData({
                    ...sellerData,
                    guarantorName: e.target.value,
                  })
                }
              />
              <input
                style={{ flex: 1 }}
                placeholder="Guarantor Contact Phone"
                value={sellerData.guarantorPhone}
                onChange={(e) =>
                  setSellerData({
                    ...sellerData,
                    guarantorPhone: e.target.value,
                  })
                }
              />
            </div>
          )}
        </div>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "2px dashed var(--secondary)",
            borderRadius: "8px",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              fontSize: "1.1rem",
              color: "var(--secondary)",
            }}
          >
            Device Details
          </h3>
          <div className="input-group">
            <input
              style={{ flex: 1 }}
              placeholder="Brand (e.g., iPhone, Tecno)"
              value={currentPhone.phoneBrand}
              onChange={(e) =>
                setCurrentPhone({ ...currentPhone, phoneBrand: e.target.value })
              }
            />
            <input
              style={{ flex: 1 }}
              placeholder="Model (e.g., 15 Pro, Camon 30)"
              value={currentPhone.phoneModel}
              onChange={(e) =>
                setCurrentPhone({ ...currentPhone, phoneModel: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <input
              style={{ flex: 1 }}
              placeholder="IMEI Security Tracking Code"
              value={currentPhone.imei}
              onChange={(e) =>
                setCurrentPhone({ ...currentPhone, imei: e.target.value })
              }
            />
            <input
              style={{ flex: 1 }}
              type="number"
              placeholder="Cost Price Paid (₦)"
              value={currentPhone.costPrice}
              onChange={(e) =>
                setCurrentPhone({ ...currentPhone, costPrice: e.target.value })
              }
            />
          </div>
          <button
            type="button"
            style={{
              background: "var(--secondary)",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={addPhoneToBatch}
          >
            Add Multiple devices
          </button>
        </div>

        {/* SECTION 3: BATCH MANIFEST (Only shows if you clicked + Place Device) */}
        {phoneBatch.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--success)" }}>
              Staged Batch Manifest ({phoneBatch.length} Items)
            </h3>
            <div
              style={{
                background: "var(--background)",
                padding: "12px",
                borderRadius: "6px",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {phoneBatch.map((p, i) => (
                  <li
                    key={i}
                    style={{ marginBottom: "5px", fontSize: "0.95rem" }}
                  >
                    <strong>
                      {p.phoneBrand} {p.phoneModel}
                    </strong>{" "}
                    — IMEI: {p.imei} | Value: ₦
                    {Number(p.costPrice).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* CONSTANT SUBMIT BUTTON */}
        <button
          type="submit"
          style={{
            background: "var(--success)",
            width: "100%",
            padding: "12px",
            fontSize: "1.1rem",
            cursor: "pointer",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          Save All Added Phones to Stock
        </button>
      </form>
    </div>
  );
};

export default PurchaseForm;
