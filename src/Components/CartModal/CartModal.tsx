import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Carving } from "../../interfaces";
import { useCarvingContext } from "../../providers/carvings.provider";
import { CartItemHolder } from "../CartItemsHolder/CartItemsHolder";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import "./CartModal.css";
import { Link } from "react-router-dom";

export const CartModal = ({ openModal, openCartModal }: any) => {
  const { cartItems } = useCarvingContext();
  const [subtotal, setSubtotal] = useState<number | string>(0);

  const findSubtotal = () => {
    let total = 0;
    cartItems.map((carving: Carving) => {
      carving.price !== null ? (total = total + carving.price) : null;
    });
    setSubtotal(total.toFixed(2));
  };

  useEffect(() => {
    findSubtotal();
  }, [cartItems.length]);

  return (
    <div className={`cart-wrapper ${openModal === true ? "open" : null}`}>
      <FontAwesomeIcon icon={faRectangleXmark} onClick={openCartModal} />
      <CartItemHolder />
      <div className="subtotal-wrapper">
        <h4>Subtotal</h4>
        <p>{`$${subtotal}`}</p>
      </div>
      <Link
        to="CheckoutPage"
        state={{
          subtotal,
          cartItems,
        }}
      >
        <button disabled={cartItems.length === 0} className="button">
          Checkout
        </button>
      </Link>
    </div>
  );
};