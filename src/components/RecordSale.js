import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const RecordSale = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saleData, setSaleData] = useState({
    customerName: "",
    totalAmount: "",
    amountPaid: "",
  });
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [currentPhoneId, setCurrentPhoneId] = useState("");

  // useEffect(() => {
  //   const unsub = onSnapshot(collection(db, "inventory"), (snap) => {
  //     setInventory(
  //       snap.docs
  //         .map((d) => ({ id: d.id, ...d.data() }))
  //         .filter((p) => p.status === "available");
  //         setLoading(false);
  //     );
  //   });
  //   return unsub;
  // }, []);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory"), (snap) => {
      setInventory(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => p.status === "available"),
      );
      setLoading(false); // Turn off loading when data is ready
    });
    return unsub;
  }, []);

  const addPhoneToCart = () => {
    if (!currentPhoneId) return;
    const phoneToAdd = inventory.find((p) => p.id === currentPhoneId);
    if (phoneToAdd) {
      setSelectedPhones([...selectedPhones, phoneToAdd]);
      setCurrentPhoneId("");
    }
  };

  const removePhoneFromCart = (idToRemove) => {
    setSelectedPhones(selectedPhones.filter((p) => p.id !== idToRemove));
  };

  const handleSale = async (e) => {
    e.preventDefault();

    // Check if we are doing a bulk sale or a single direct sale
    let finalCheckoutList = [...selectedPhones];

    if (finalCheckoutList.length === 0) {
      // If cart is empty, grab the single phone currently sitting in the dropdown
      if (currentPhoneId) {
        const singlePhone = inventory.find((p) => p.id === currentPhoneId);
        if (singlePhone) finalCheckoutList.push(singlePhone);
      } else {
        return alert("Please select a phone from available stock.");
      }
    }

    if (!saleData.customerName) return alert("Customer Name is required.");

    const total = Number(saleData.totalAmount);
    const paid = Number(saleData.amountPaid);
    const debt = total - paid;

    try {
      await addDoc(collection(db, "sales"), {
        customerName: saleData.customerName,
        totalAmount: total,
        amountPaid: paid,
        debt: debt,
        phones: finalCheckoutList.map((p) => ({
          id: p.id,
          brand: p.phoneBrand,
          model: p.phoneModel,
          imei: p.imei,
        })),
        date: serverTimestamp(),
      });

      for (const phone of finalCheckoutList) {
        await updateDoc(doc(db, "inventory", phone.id), { status: "sold" });
      }

      alert(
        debt > 0
          ? `Sale saved! ₦${debt.toLocaleString()} balance tracked in Debtors list.`
          : "Sale completed and checked out!",
      );

      // Reset form
      setSaleData({ customerName: "", totalAmount: "", amountPaid: "" });
      setSelectedPhones([]);
      setCurrentPhoneId("");
    } catch (err) {
      console.error(err);
      alert("Error saving the transaction.");
    }
  };

  const availableOptions = inventory.filter(
    (p) => !selectedPhones.find((sp) => sp.id === p.id),
  );

  return (
    <div className="card">
      <h2 style={{ color: "var(--primary)", marginBottom: "20px" }}>
        Record a New Sale
      </h2>

      {loading ? (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "var(--primary)",
            fontWeight: "bold",
          }}
        >
          Fetching live Stocks...
        </div>
      ) : (
        <form onSubmit={handleSale}>
          {/* SECTION 1: CUSTOMER & PAYMENT */}
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
              Customer & Payment Info
            </h3>
            <input
              style={{
                width: "100%",
                marginBottom: "10px",
                boxSizing: "border-box",
              }}
              placeholder="Customer Name"
              value={saleData.customerName}
              onChange={(e) =>
                setSaleData({ ...saleData, customerName: e.target.value })
              }
              required
            />

            <div className="input-group">
              <input
                style={{ flex: 1 }}
                type="number"
                placeholder="Total Charge (₦)"
                value={saleData.totalAmount}
                onChange={(e) =>
                  setSaleData({ ...saleData, totalAmount: e.target.value })
                }
                required
              />
              <input
                style={{ flex: 1 }}
                type="number"
                placeholder="Deposit Made (₦)"
                value={saleData.amountPaid}
                onChange={(e) =>
                  setSaleData({ ...saleData, amountPaid: e.target.value })
                }
                required
              />
            </div>

            {saleData.totalAmount && saleData.amountPaid && (
              <div
                style={{
                  padding: "12px",
                  background: "white",
                  color: "var(--danger)",
                  fontWeight: "bold",
                  borderRadius: "6px",
                  marginTop: "10px",
                  border: "1px solid #fce8e6",
                }}
              >
                Unpaid Balance: ₦
                {(
                  Number(saleData.totalAmount) - Number(saleData.amountPaid)
                ).toLocaleString()}
              </div>
            )}
          </div>

          {/* SECTION 2: DEVICE SELECTION */}
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
              Select Device(s)
            </h3>
            <div className="input-group">
              <select
                className="input-group"
                value={currentPhoneId}
                onChange={(e) => setCurrentPhoneId(e.target.value)}
              >
                <option value="">
                  Please select a phone from available stock
                </option>
                {availableOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.phoneBrand} {p.phoneModel} (IMEI: {p.imei})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addPhoneToCart}
                style={{
                  background: "var(--secondary)",
                  padding: "10px 20px",
                  border: "none",
                  color: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Sell Multiple Device
              </button>
            </div>
          </div>

          {/* SECTION 3: CHECKOUT CART (Only shows if you clicked + Add) */}
          {selectedPhones.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "var(--success)" }}>
                Checkout List ({selectedPhones.length} Items)
              </h3>
              <div
                style={{
                  background: "var(--background)",
                  padding: "12px",
                  borderRadius: "6px",
                }}
              >
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {selectedPhones.map((p) => (
                    <li
                      key={p.id}
                      style={{
                        marginBottom: "8px",
                        fontSize: "0.95rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        <strong>
                          {p.phoneBrand} {p.phoneModel}
                        </strong>{" "}
                        — IMEI: {p.imei}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePhoneFromCart(p.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--danger)",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          padding: "0 5px",
                        }}
                      >
                        ✕
                      </button>
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
            }}
          >
            Comfirm Sale
          </button>
        </form>
      )}
    </div>
  );
};

export default RecordSale;
