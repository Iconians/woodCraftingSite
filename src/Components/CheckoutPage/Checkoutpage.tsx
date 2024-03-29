import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { AMERICAN_EXPRESS, OTHER_CARDS } from "../../constants";
import { listOfMonths } from "../../listOfMonths";
import { listOfStates } from "../../ListOfStates";
import { listOfYears } from "../../listOfYears";
import { useCarvingContext } from "../../providers/carvings.provider";
import { useFavoriteContext } from "../../providers/favorites.provider";
import {
  cardNumberValidation,
  onlyNumberValidation,
  onlyTextValidation,
  securityCodeValidation,
} from "../../validations";
import { NavBar } from "../NavBar/NavBar";
import "./CheckoutPage.css";
import { useAuthContext } from "../../providers/auth.provider";
import { purchaseItems } from "../../fetches/purchaseItems";

export const CheckoutPage = () => {
  const location = useLocation();
  const [total, setTotal] = useState(0);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("AL : Alabama");
  const [zip, setZip] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expireMonth, setExpireMonth] = useState("Jan");
  const [expireYear, setExpireYear] = useState("2023");
  const [securityCode, setSecurityCode] = useState("");
  const [cardLength, setCardLength] = useState(19);
  const [cardType, setCardType] = useState("");
  const [inputError, setInputError] = useState(true);
  const { cartItems, deleteItemsFromCartAfterPurchase, fetchAllCarvings } =
    useCarvingContext();
  const { getUserId } = useFavoriteContext();

  const findTotal = () => {
    setTotal(parseInt(location.state.subtotal) + 12.99);
  };

  const findDebitCardType = (cardNumber: string) => {
    const regexPattern = {
      MASTERCARD: /^5[1-5][0-9]{1,}|^2[2-7][0-9]{1,}$/,
      VISA: /^4[0-9]{2,}$/,
      AMERICAN_EXPRESS: /^3[47][0-9]{5,}$/,
      DISCOVER: /^6(?:011|5[0-9]{2})[0-9]{3,}$/,
    };
    for (const card in regexPattern) {
      if (
        cardNumber
          .replace(/[^\d]/g, "")
          .match(new RegExp(regexPattern[card as keyof typeof regexPattern]))
      )
        return card;
    }
    return "";
  };

  const findCardLength = (cardType: string) => {
    if (cardType === "AMERICAN_EXPRESS") {
      return AMERICAN_EXPRESS.length;
    } else {
      return OTHER_CARDS.length;
    }
  };

  const handleValidations = (name: string, value: string) => {
    const validations = {
      name: (value: string) => {
        const checkName = onlyTextValidation(value);
        if (!checkName && value.length > 0) {
          toast.error("Fill name field out with Alpabetical letters only");
          setInputError(true);
        } else {
          setInputError(false);
        }
      },
      address: () => "",
      city: (value: string) => {
        const checkAddress = onlyTextValidation(value);
        if (!checkAddress && value.length > 0) {
          toast.error("Fill out with Alpabetical letters only");
          setInputError(true);
        } else {
          setInputError(false);
        }
      },
      zip: (value: string) => {
        const checkZip = onlyNumberValidation(value);
        if (!checkZip && value.length > 0) {
          toast.error("fill out with Numbers Only");
          setInputError(true);
        } else {
          setInputError(false);
        }
      },
      cardnumber: (value: string) => {
        const checkCardNumber = cardNumberValidation(value);
        if (!checkCardNumber && value.length > 0) {
          toast.error("fill in a Valid Card");
          setInputError(true);
        } else {
          setInputError(false);
        }
      },
      securityCode: (value: string) => {
        const checkSecurityCodeLenth = securityCodeValidation(3, value);
        const checkSecurityCodeIsNumber = onlyNumberValidation(value);
        if (!checkSecurityCodeLenth && value.length > 0) {
          toast.error("fill out with 3 digits");
          setInputError(true);
        }
        if (!checkSecurityCodeIsNumber) {
          toast.error("Numbers Only");
          setInputError(true);
        }
        if (checkSecurityCodeLenth && checkSecurityCodeIsNumber) {
          setInputError(false);
        }
      },
    };
    if (name === "cardnumber") {
      const card = findDebitCardType(value);
      const length = findCardLength(card);
      setCardLength(length);
      setCardType(card);
    }
    validations[name as keyof typeof validations](value);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    handleValidations(name, value);
  };

  const updateValue = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "address":
        setAddress(value);
        break;
      case "city":
        setCity(value);
        break;
      case "state":
        setState(value);
        break;
      case "zip":
        setZip(value);
        break;
      case "cardnumber":
        if (value === "") setCardNumber("");
        let mask = value.split(" ").join("");
        mask = mask.match(new RegExp(".{1,4}", "g")).join(" ");
        setCardNumber(mask);
        break;
      case "card-month-expire":
        setExpireMonth(value);
        break;
      case "card-year-expire":
        setExpireYear(value);
        break;
      case "securityCode":
        setSecurityCode(value);
    }
  };

  const inputData = [
    {
      label: "Full Name (First and Last)",
      name: "name",
      value: name,
      onChange: updateValue,
    },
    {
      label: "Address",
      name: "address",
      value: address,
      onChange: updateValue,
    },
    {
      label: "City",
      name: "city",
      value: city,
      onChange: updateValue,
    },
  ];

  const navigate = useNavigate();

  const recordPurchase = () => {
    const formData = {
      userId: getUserId(),
      carvingId: cartItems.map((item) => item.id),
      name: name,
      address: address,
      city: city,
      state: state,
      zip: zip,
      cardType: cardType,
      cardNumbers: cardNumber,
      expMonthDate: expireMonth,
      expYearDate: expireYear,
      total: total,
    };

    if (inputError) toast.error("Please fill out all fields");

    if (!inputError) {
      const token = sessionStorage.getItem("token");
      purchaseItems(formData, token || "").then((res) => {
        if (res.ok) {
          navigate("/ConfirmationPage");
          fetchAllCarvings();
          deleteItemsFromCartAfterPurchase();
        } else if (res.status === 401) {
          res.json().then((data) => {
            toast.error(data.message);
          });
        } else {
          res.json().then((data) => {
            console.log(data.message);
            toast.error(data.message);
          });
        }
      });
    }
  };

  useEffect(() => {
    findTotal();
  }, []);

  return (
    <div className="checkout-page-wrapper">
      <NavBar />
      <div className="form-info-wrapper">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            recordPurchase();
          }}
        >
          <h2>Shipping Information</h2>
          {inputData.map((input) => (
            <div key={input.name} className="shipping-info">
              <label htmlFor={input.name}>{input.label}</label>
              <input
                type="text"
                name={input.name}
                placeholder={input.label}
                onChange={input.onChange}
                onBlur={handleBlur}
              />
            </div>
          ))}

          <label htmlFor="state">State</label>
          <select
            value={state}
            name="state"
            id="stateId"
            onChange={updateValue}
          >
            {listOfStates.map((state) => (
              <option value={state} key={state}>
                {state}
              </option>
            ))}
          </select>
          <label htmlFor="zip">Zip</label>
          <input
            type="text"
            name="zip"
            placeholder="Zip"
            value={zip}
            onChange={updateValue}
            onBlur={handleBlur}
            maxLength={5}
            id="shipping-inputs"
          />
          <h2>Payment</h2>
          <label htmlFor="card-number">Card Numbers</label>
          <input
            name="cardnumber"
            type="text"
            value={cardNumber}
            onChange={updateValue}
            onBlur={handleBlur}
            maxLength={cardLength}
            id="shipping-inputs"
            placeholder="Card Number"
          />
          <div className="expire-wrapper">
            <label htmlFor="card-month-expire">Expire Month</label>
            <select
              name="card-month-expire"
              id=""
              value={expireMonth}
              onChange={updateValue}
            >
              {listOfMonths.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
            <label htmlFor="card-year-expire">Expire Year</label>
            <select
              name="card-year-expire"
              id=""
              value={expireYear}
              onChange={updateValue}
            >
              {listOfYears.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </div>
          <label htmlFor="cvs">cvs</label>
          <input
            type="text"
            placeholder="cvs"
            name="securityCode"
            value={securityCode}
            onChange={updateValue}
            onBlur={handleBlur}
            maxLength={3}
            id="shipping-inputs"
          />
          <input type="submit" />
        </form>
      </div>
      <div className="total-wrapper">
        <div>
          <h3>subtotal</h3>
          <p>{location.state.subtotal}</p>
        </div>
        <div>
          <h3>shipping</h3>
          <p>12.99</p>
        </div>
        <div>
          <h3>Total</h3>
          <p>{total}</p>
        </div>
      </div>
    </div>
  );
};
